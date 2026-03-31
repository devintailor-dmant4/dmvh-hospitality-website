import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

const BASE_URL = "https://dmvhhospitality.com";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(
    express.static(distPath, {
      setHeaders(res, filePath) {
        const ext = path.extname(filePath).toLowerCase();
        if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico"].includes(ext)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if ([".js", ".css", ".woff", ".woff2"].includes(ext)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (ext === ".html") {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      },
    }),
  );

  const indexPath = path.resolve(distPath, "index.html");
  const baseHtml = fs.readFileSync(indexPath, "utf8");

  app.use("/{*path}", (req: Request, res: Response) => {
    const urlPath = req.path === "/" ? "/" : req.path.replace(/\/$/, "");
    const canonical = `${BASE_URL}${urlPath}`;

    const html = baseHtml.replace(
      "</head>",
      `  <link rel="canonical" href="${canonical}" />\n  <meta property="og:url" content="${canonical}" />\n  </head>`,
    );

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(html);
  });
}
