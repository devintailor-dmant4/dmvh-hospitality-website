import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { seedDatabase } from "./seed";
import { db } from "./db";
import { products } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import path from "path";
import fs from "fs";

const app = express();
const httpServer = createServer(app);

app.use(compression());

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method !== "GET") return next();
  const match = req.path.match(/^\/images\/(.+)\.(png|jpe?g)$/i);
  if (!match) return next();
  const acceptsWebP = req.headers.accept?.includes("image/webp");
  if (!acceptsWebP) return next();
  const baseName = match[1];
  const imagesRoot =
    process.env.NODE_ENV === "production"
      ? path.join(process.cwd(), "dist", "public", "images")
      : path.join(process.cwd(), "client", "public", "images");
  const webpFile = path.join(imagesRoot, `${baseName}.webp`);
  if (fs.existsSync(webpFile)) {
    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Vary", "Accept");
    return res.sendFile(webpFile);
  }
  next();
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "fallback-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir, {
  setHeaders(res) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  },
}));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

async function migrateProductImages() {
  try {
    const check = await db.select({ images: products.images }).from(products).where(eq(products.id, 1)).limit(1);
    if (check[0]?.images?.[0] === "/images/prod-1.png") return;

    const ids = [
      1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,
      72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,
      87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,
      102,103,104,105,106,107,108,109,110,111,112,113,
      114,115,116,117,118,119,120,121,122,123,124,125,
      126,127,128,129,130,131,132,133,134,135,136,137,
      138,139,140,
    ];
    for (const id of ids) {
      await db.update(products).set({ images: [`/images/prod-${id}.png`] }).where(eq(products.id, id));
    }
    log("Product images migrated to unique paths", "migrate");
  } catch (err) {
    log(`Image migration skipped: ${err}`, "migrate");
  }
}

(async () => {
  await seedDatabase();
  await migrateProductImages();
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
