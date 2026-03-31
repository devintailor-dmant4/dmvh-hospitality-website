import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Github, GitBranch, CheckCircle, Loader2, RefreshCw, FolderGit2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

type Repo = {
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  updated_at: string;
};

type GitHubUser = {
  login: string;
  avatar_url: string;
  name: string;
};

type FilesData = {
  count: number;
  files: string[];
  excludedDirs: string[];
  oversizedFiles: string[];
};

type PushResult = {
  success: boolean;
  commitSha: string;
  repoUrl: string;
  filesCount: number;
  skippedFiles: string[];
};

export default function GitHubPush() {
  const { toast } = useToast();

  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [newRepoName, setNewRepoName] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [commitMessage, setCommitMessage] = useState("Update from Replit");
  const [lastResult, setLastResult] = useState<PushResult | null>(null);
  const [showFiles, setShowFiles] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery<GitHubUser>({
    queryKey: ["/api/github/user"],
  });

  const { data: repoData, isLoading: reposLoading, refetch: refetchRepos } = useQuery<Repo[]>({
    queryKey: ["/api/github/repos"],
    enabled: !!user,
  });

  const { data: filesData, isLoading: filesLoading } = useQuery<FilesData>({
    queryKey: ["/api/github/files"],
  });

  const pushMutation = useMutation({
    mutationFn: async () => {
      const isNew = mode === "new";
      const repoName = isNew ? newRepoName : selectedRepo.split("/")[1];
      const owner = user!.login;
      const res = await apiRequest("POST", "/api/github/push", {
        owner,
        repo: repoName,
        message: commitMessage,
        createRepo: isNew,
        isPrivate: isNew ? isPrivate : undefined,
      });
      return await res.json() as PushResult;
    },
    onSuccess: (data: PushResult) => {
      setLastResult(data);
      toast({
        title: "Pushed to GitHub!",
        description: `${data.filesCount} files pushed successfully.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Push failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const canPush =
    commitMessage.trim() &&
    (mode === "existing" ? !!selectedRepo : !!newRepoName.trim()) &&
    !pushMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-900 dark:bg-white rounded-2xl mb-2">
            <Github className="w-8 h-8 text-white dark:text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Push to GitHub</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Push your project code to a GitHub repository with one click
          </p>
        </div>

        {/* GitHub user info */}
        {userLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : user ? (
          <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <img
              src={user.avatar_url}
              alt={user.login}
              data-testid="img-github-avatar"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white" data-testid="text-github-name">
                {user.name || user.login}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400" data-testid="text-github-login">
                @{user.login}
              </p>
            </div>
            <Badge variant="outline" className="ml-auto text-green-600 border-green-300 bg-green-50">
              Connected
            </Badge>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
            Could not connect to GitHub. Please check the integration.
          </div>
        )}

        {/* Files preview */}
        {filesLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-400 px-1">
            <Loader2 className="w-4 h-4 animate-spin" /> Scanning project files…
          </div>
        )}
        {filesData && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            {/* Included files */}
            <button
              data-testid="button-toggle-files"
              onClick={() => setShowFiles(v => !v)}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <FolderGit2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {filesData.count} files will be pushed
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Includes source code, images, configs — click to preview
                </p>
              </div>
              {showFiles ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {showFiles && (
              <div className="border-t border-gray-100 dark:border-gray-800 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-3">
                <div className="space-y-0.5">
                  {filesData.files.map(f => (
                    <p key={f} className="text-xs font-mono text-gray-600 dark:text-gray-400 truncate">{f}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Skipped info */}
            {((filesData.excludedDirs ?? []).length > 0 || (filesData.oversizedFiles ?? []).length > 0) && (
              <>
                <div className="border-t border-gray-100 dark:border-gray-800" />
                <button
                  data-testid="button-toggle-skipped"
                  onClick={() => setShowSkipped(v => !v)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <p className="flex-1 text-xs text-gray-500 dark:text-gray-400">
                    {(filesData.excludedDirs ?? []).length} folders skipped
                    {(filesData.oversizedFiles ?? []).length > 0 && `, ${filesData.oversizedFiles.length} files over 10 MB skipped`}
                    {" "}— click to see why
                  </p>
                  {showSkipped ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                </button>
                {showSkipped && (
                  <div className="border-t border-gray-100 dark:border-gray-800 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-2 text-xs">
                    {(filesData.excludedDirs ?? []).length > 0 && (
                      <div>
                        <p className="font-medium text-amber-700 dark:text-amber-400 mb-1">Skipped folders (auto-generated / runtime data):</p>
                        {(filesData.excludedDirs ?? []).map(d => (
                          <p key={d} className="font-mono text-amber-600 dark:text-amber-500">• {d}/</p>
                        ))}
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                          These are regenerated automatically (e.g. node_modules via npm install, uploads at runtime) and should not live in GitHub.
                        </p>
                      </div>
                    )}
                    {(filesData.oversizedFiles ?? []).length > 0 && (
                      <div>
                        <p className="font-medium text-amber-700 dark:text-amber-400 mb-1">Files over 10 MB (GitHub API limit):</p>
                        {(filesData.oversizedFiles ?? []).map(f => (
                          <p key={f} className="font-mono text-amber-600 dark:text-amber-500 truncate">• {f}</p>
                        ))}
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                          To push files larger than 10 MB, use Git LFS or reduce the file size first.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Main form */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-6">

          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              data-testid="button-existing-repo"
              onClick={() => setMode("existing")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === "existing"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Existing repo
            </button>
            <button
              data-testid="button-new-repo"
              onClick={() => setMode("new")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === "new"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Create new repo
            </button>
          </div>

          {/* Existing repo select */}
          {mode === "existing" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="repo-select">Repository</Label>
                <button
                  data-testid="button-refresh-repos"
                  onClick={() => refetchRepos()}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
              {reposLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading repos…
                </div>
              ) : (
                <Select
                  value={selectedRepo}
                  onValueChange={setSelectedRepo}
                >
                  <SelectTrigger data-testid="select-repo" id="repo-select">
                    <SelectValue placeholder="Select a repository" />
                  </SelectTrigger>
                  <SelectContent>
                    {(repoData ?? []).map((r) => (
                      <SelectItem key={r.full_name} value={r.full_name}>
                        <span className="flex items-center gap-2">
                          {r.name}
                          {r.private && (
                            <Badge variant="outline" className="text-xs py-0">private</Badge>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* New repo fields */}
          {mode === "new" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-repo-name">Repository name</Label>
                <Input
                  id="new-repo-name"
                  data-testid="input-new-repo-name"
                  placeholder="my-project"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value.replace(/\s+/g, "-"))}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="private-toggle"
                  data-testid="switch-private"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
                <Label htmlFor="private-toggle" className="cursor-pointer">
                  Make repository private
                </Label>
              </div>
            </div>
          )}

          {/* Commit message */}
          <div className="space-y-2">
            <Label htmlFor="commit-msg">
              <span className="flex items-center gap-1.5">
                <GitBranch className="w-4 h-4" /> Commit message
              </span>
            </Label>
            <Input
              id="commit-msg"
              data-testid="input-commit-message"
              placeholder="Update from Replit"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
            />
          </div>

          {/* Push button */}
          <Button
            data-testid="button-push"
            className="w-full bg-gray-900 hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            disabled={!canPush}
            onClick={() => pushMutation.mutate()}
          >
            {pushMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Pushing…
              </>
            ) : (
              <>
                <Github className="w-4 h-4 mr-2" />
                Push to GitHub
              </>
            )}
          </Button>
        </div>

        {/* Success result */}
        {lastResult && (
          <div className="space-y-3">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                <CheckCircle className="w-5 h-5" />
                Push successful!
              </div>
              <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
                <p>{lastResult.filesCount} files pushed to main branch</p>
                <p className="font-mono text-xs truncate">
                  Commit: {lastResult.commitSha.slice(0, 12)}
                </p>
              </div>
              <a
                href={lastResult.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-repo-url"
                className="inline-flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400 underline underline-offset-2 hover:no-underline"
              >
                <Github className="w-4 h-4" />
                View on GitHub →
              </a>
            </div>

            {(lastResult.skippedFiles ?? []).length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {lastResult.skippedFiles.length} file{lastResult.skippedFiles.length !== 1 ? "s" : ""} were too large to push via the API
                </div>
                <div className="max-h-32 overflow-y-auto space-y-0.5">
                  {lastResult.skippedFiles.map(f => (
                    <p key={f} className="text-xs font-mono text-amber-600 dark:text-amber-500 truncate">• {f}</p>
                  ))}
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  To include large files, use Git LFS or compress them below 4 MB first.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
