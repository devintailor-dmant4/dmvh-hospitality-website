import { Router } from "express";
import { ReplitConnectors } from "@replit/connectors-sdk";
import fs from "fs";
import path from "path";

const router = Router();

const EXCLUDE_DIRS = new Set([
  "node_modules", ".git", "uploads", "dist", ".cache",
  ".upm", ".config", ".local", ".agents",
]);

// Only exclude true binary archives — images, SVGs, and all source files are included
const EXCLUDE_EXTENSIONS = new Set([
  ".zip", ".tar", ".gz", ".rar", ".7z",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file

function collectFiles(dir: string, base: string, results: { path: string; absPath: string }[] = []) {
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.isDirectory()) continue;
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) {
      collectFiles(abs, rel, results);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (EXCLUDE_EXTENSIONS.has(ext)) continue;
      try {
        const stat = fs.statSync(abs);
        if (stat.size > MAX_FILE_SIZE) continue;
      } catch {
        continue;
      }
      results.push({ path: rel, absPath: abs });
    }
  }
  return results;
}

async function githubApi(method: string, endpoint: string, body?: object) {
  const connectors = new ReplitConnectors();
  const opts: RequestInit = { method };
  if (body) {
    (opts as any).body = JSON.stringify(body);
  }
  const response = await connectors.proxy("github", endpoint, opts as any);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${method} ${endpoint} failed: ${response.status} ${text}`);
  }
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

// GET /api/github/user — get authenticated GitHub user
router.get("/user", async (_req, res) => {
  try {
    const user = await githubApi("GET", "/user");
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/github/repos — list user repos
router.get("/repos", async (_req, res) => {
  try {
    const repos = await githubApi("GET", "/user/repos?sort=updated&per_page=100&affiliation=owner");
    res.json(repos);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/github/files — preview files that would be pushed
router.get("/files", (_req, res) => {
  const cwd = process.cwd();
  const files = collectFiles(cwd, "");
  const filePaths = files.map(f => f.path);

  // Report excluded dirs that actually exist
  const excludedDirs = Array.from(EXCLUDE_DIRS).filter(d =>
    fs.existsSync(path.join(cwd, d))
  );

  // Check for any files skipped due to size
  const oversized: string[] = [];
  const collectAll = (dir: string, base: string) => {
    let entries: fs.Dirent[] = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.isDirectory()) continue;
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      const abs = path.join(dir, entry.name);
      const rel = path.join(base, entry.name).replace(/\\/g, "/");
      if (entry.isDirectory()) { collectAll(abs, rel); continue; }
      const ext = path.extname(entry.name).toLowerCase();
      if (EXCLUDE_EXTENSIONS.has(ext)) continue;
      try {
        const stat = fs.statSync(abs);
        if (stat.size > MAX_FILE_SIZE) oversized.push(`${rel} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
      } catch {}
    }
  };
  collectAll(cwd, "");

  res.json({
    count: files.length,
    files: filePaths,
    excludedDirs,
    oversizedFiles: oversized,
  });
});

// POST /api/github/push — push project files to a GitHub repo
router.post("/push", async (req, res) => {
  const { owner, repo, message, createRepo, isPrivate } = req.body;
  if (!owner || !repo || !message) {
    return res.status(400).json({ message: "owner, repo, and message are required" });
  }

  try {
    // Create repo if requested
    if (createRepo) {
      try {
        await githubApi("POST", "/user/repos", {
          name: repo,
          private: isPrivate ?? false,
          auto_init: false,
        });
      } catch (err: any) {
        if (!err.message.includes("422")) throw err; // 422 = already exists, that's ok
      }
    }

    // Get current HEAD sha (if repo already has commits)
    let parentSha: string | null = null;
    let baseTreeSha: string | null = null;
    try {
      const repoInfo = await githubApi("GET", `/repos/${owner}/${repo}`);
      const defaultBranch = repoInfo?.default_branch || "main";
      const ref = await githubApi("GET", `/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`);
      if (ref?.object?.sha) {
        parentSha = ref.object.sha;
        const existingCommit = await githubApi("GET", `/repos/${owner}/${repo}/git/commits/${parentSha}`);
        baseTreeSha = existingCommit?.tree?.sha ?? null;
      }
    } catch {
      // No commits yet — will initialize below
    }

    // If the repo has no commits, the git database isn't initialized and blob
    // creation will return 409. Seed it with a minimal README first.
    if (!parentSha) {
      const seedContent = Buffer.from(`# ${repo}\n\nPushed from Replit.\n`).toString("base64");
      const initResult = await githubApi("PUT", `/repos/${owner}/${repo}/contents/README.md`, {
        message: "Initialize repository",
        content: seedContent,
      });
      parentSha = initResult.commit.sha;
      baseTreeSha = initResult.commit.tree.sha;
    }

    const cwd = process.cwd();
    const files = collectFiles(cwd, "");

    // GitHub's blob API has a ~5 MB per-request limit through the proxy.
    // Pre-filter files that would exceed it before even attempting upload.
    const BLOB_LIMIT = 4 * 1024 * 1024; // 4 MB raw → ~5.3 MB base64
    const skippedFiles: string[] = [];

    // Create blobs for all files, skipping any that fail individually
    const treeItems: { path: string; mode: string; type: string; sha: string }[] = [];
    for (const file of files) {
      const relPath = file.path.replace(/\\/g, "/");
      let stat: fs.Stats;
      try { stat = fs.statSync(file.absPath); } catch { continue; }

      if (stat.size > BLOB_LIMIT) {
        skippedFiles.push(`${relPath} (${(stat.size / 1024 / 1024).toFixed(1)} MB — too large for API)`);
        continue;
      }

      try {
        const content = fs.readFileSync(file.absPath);
        const blob = await githubApi("POST", `/repos/${owner}/${repo}/git/blobs`, {
          content: content.toString("base64"),
          encoding: "base64",
        });
        treeItems.push({ path: relPath, mode: "100644", type: "blob", sha: blob.sha });
      } catch (blobErr: any) {
        // 413 = request too large, skip gracefully
        skippedFiles.push(`${relPath} (upload rejected: ${blobErr.message.includes("413") ? "too large" : blobErr.message.slice(0, 60)})`);
      }
    }

    if (treeItems.length === 0) {
      return res.status(400).json({ message: "No files could be uploaded. All files were either too large or failed." });
    }

    // Create tree
    const treePayload: any = { tree: treeItems };
    if (baseTreeSha) treePayload.base_tree = baseTreeSha;
    const tree = await githubApi("POST", `/repos/${owner}/${repo}/git/trees`, treePayload);

    // Create commit
    const commitPayload: any = {
      message,
      tree: tree.sha,
      author: {
        name: "Replit Agent",
        email: "agent@replit.com",
        date: new Date().toISOString(),
      },
    };
    if (parentSha) commitPayload.parents = [parentSha];
    const commit = await githubApi("POST", `/repos/${owner}/${repo}/git/commits`, commitPayload);

    // Update or create ref
    try {
      await githubApi("PATCH", `/repos/${owner}/${repo}/git/refs/heads/main`, {
        sha: commit.sha,
        force: true,
      });
    } catch {
      await githubApi("POST", `/repos/${owner}/${repo}/git/refs`, {
        ref: "refs/heads/main",
        sha: commit.sha,
      });
    }

    res.json({
      success: true,
      commitSha: commit.sha,
      repoUrl: `https://github.com/${owner}/${repo}`,
      filesCount: treeItems.length,
      skippedFiles,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
