import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInquirySchema } from "@shared/schema";
import { sendInquiryNotification, sendClientConfirmation, sendPasswordResetEmail } from "./email";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { z } from "zod";
import githubPushRouter from "./github-push";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 20 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip/;
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error("File type not allowed"));
  },
});

function requireAuth(req: Request, res: Response, next: () => void) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use("/api/github", githubPushRouter);

  const BASE_URL = "https://dmvhhospitality.com";

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const [groups, properties, allProducts] = await Promise.all([
        storage.getBrandGroups(),
        storage.getBrandProperties(),
        storage.getProducts(),
      ]);

      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "weekly" },
        { url: "/brands", priority: "0.9", changefreq: "weekly" },
        { url: "/brands/apartment", priority: "0.8", changefreq: "weekly" },
        { url: "/brands/bathroom", priority: "0.8", changefreq: "weekly" },
        { url: "/about", priority: "0.7", changefreq: "monthly" },
        { url: "/contact", priority: "0.7", changefreq: "monthly" },
        { url: "/bom", priority: "0.6", changefreq: "monthly" },
      ];

      const groupPages = groups.map(g => ({
        url: `/brands/${g.slug}`,
        priority: "0.8",
        changefreq: "weekly",
      }));

      const propertyPages = properties.map(p => ({
        url: `/property/${p.slug}`,
        priority: "0.7",
        changefreq: "weekly",
      }));

      const productPages = allProducts.map(p => ({
        url: `/product/${p.slug}`,
        priority: "0.6",
        changefreq: "monthly",
      }));

      const today = new Date().toISOString().split("T")[0];
      const allPages = [...staticPages, ...groupPages, ...propertyPages, ...productPages];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch {
      res.status(500).send("Error generating sitemap");
    }
  });

  app.use("/uploads", (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });

  // ─── Brand Groups ───────────────────────────────────────────────
  app.get("/api/brand-groups", async (_req, res) => {
    const groups = await storage.getBrandGroups();
    res.json(groups);
  });

  app.get("/api/brand-groups/:slug", async (req, res) => {
    const group = await storage.getBrandGroupBySlug(req.params.slug);
    if (!group) return res.status(404).json({ message: "Brand group not found" });
    res.json(group);
  });

  // ─── Brand Properties ───────────────────────────────────────────
  app.get("/api/brand-properties", async (_req, res) => {
    const properties = await storage.getBrandProperties();
    res.json(properties);
  });

  app.get("/api/brand-properties/group/:groupId", async (req, res) => {
    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) return res.status(400).json({ message: "Invalid group ID" });
    const properties = await storage.getBrandPropertiesByGroup(groupId);
    res.json(properties);
  });

  app.get("/api/brand-properties/:slug", async (req, res) => {
    const property = await storage.getBrandPropertyBySlug(req.params.slug);
    if (!property) return res.status(404).json({ message: "Brand property not found" });
    res.json(property);
  });

  // ─── Product Lines ──────────────────────────────────────────────
  app.get("/api/product-lines", async (_req, res) => {
    const lines = await storage.getProductLines();
    res.json(lines);
  });

  app.get("/api/product-lines/type/:type", async (req, res) => {
    const lines = await storage.getProductLinesByType(req.params.type);
    res.json(lines);
  });

  app.get("/api/product-lines/:slug", async (req, res) => {
    const line = await storage.getProductLineBySlug(req.params.slug);
    if (!line) return res.status(404).json({ message: "Product line not found" });
    res.json(line);
  });

  // ─── Products ───────────────────────────────────────────────────
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/featured", async (_req, res) => {
    const products = await storage.getFeaturedProducts();
    res.json(products);
  });

  app.get("/api/products/brand/:brandPropertyId", async (req, res) => {
    const id = parseInt(req.params.brandPropertyId);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const products = await storage.getProductsByBrandProperty(id);
    res.json(products);
  });

  app.get("/api/products/brand/:brandPropertyId/type/:productType", async (req, res) => {
    const id = parseInt(req.params.brandPropertyId);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const products = await storage.getProductsByBrandAndType(id, req.params.productType);
    res.json(products);
  });

  app.get("/api/products/line/:productLineId", async (req, res) => {
    const id = parseInt(req.params.productLineId);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const products = await storage.getProductsByProductLine(id);
    res.json(products);
  });

  app.get("/api/products/:slug", async (req, res) => {
    const product = await storage.getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  // ─── File Upload ────────────────────────────────────────────────
  app.post("/api/upload", upload.array("files", 10), (req: Request & { files?: Express.Multer.File[] }, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      const uploaded = files.map(f => ({
        path: `/uploads/${f.filename}`,
        originalName: f.originalname,
        size: f.size,
        mimetype: f.mimetype,
      }));
      res.json({ files: uploaded });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Upload failed" });
    }
  });

  // ─── Inquiries ──────────────────────────────────────────────────
  app.post("/api/inquiries", async (req, res) => {
    const parsed = insertInquirySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid inquiry data", errors: parsed.error.flatten() });
    const data = parsed.data;
    // Link to logged-in user automatically
    if (req.session?.userId && !data.userId) {
      data.userId = req.session.userId;
    }
    const inquiry = await storage.createInquiry(data);
    res.status(201).json(inquiry);
    sendInquiryNotification(inquiry).catch(() => {});
    sendClientConfirmation(inquiry).catch(() => {});
  });

  // ─── Auth ────────────────────────────────────────────────────────
  const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(1),
    company: z.string().optional(),
    phone: z.string().optional(),
  });

  app.post("/api/auth/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

    const { email, password, name, company, phone } = parsed.data;
    const existing = await storage.getUserByEmail(email);
    if (existing) return res.status(409).json({ message: "An account with this email already exists" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await storage.createUser({ email, passwordHash, name, company, phone });
    req.session.userId = user.id;
    res.status(201).json({ id: user.id, email: user.email, name: user.name, company: user.company, phone: user.phone });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await storage.getUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid email or password" });

    req.session.userId = user.id;
    res.json({ id: user.id, email: user.email, name: user.name, company: user.company, phone: user.phone });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUserById(req.session.userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.json({ id: user.id, email: user.email, name: user.name, company: user.company, phone: user.phone });
  });

  app.post("/api/auth/email-access", async (req, res) => {
    const { email, name, company } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    let user = await storage.getUserByEmail(email);
    if (!user) {
      const randomPass = crypto.randomBytes(16).toString("hex");
      const passwordHash = await bcrypt.hash(randomPass, 8);
      user = await storage.createUser({
        email,
        passwordHash,
        name: name || email.split("@")[0],
        company: company || undefined,
      });
    }

    req.session.userId = user.id;
    res.json({ id: user.id, email: user.email, name: user.name, company: user.company, phone: user.phone });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Always respond OK to prevent user enumeration
    res.json({ message: "If an account exists with that email, a reset link has been sent." });

    const user = await storage.getUserByEmail(email);
    if (!user) return;

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await storage.updateUser(user.id, { resetToken: token, resetTokenExpiry: expiry });

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    sendPasswordResetEmail(user.email, user.name, resetUrl).catch(() => {});
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token and password are required" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

    // Find user with matching token
    const { db } = await import("./db");
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));

    if (!user || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await storage.updateUser(user.id, { passwordHash, resetToken: null, resetTokenExpiry: null });
    res.json({ message: "Password updated successfully" });
  });

  // ─── Portal (authenticated) ──────────────────────────────────────
  app.get("/api/portal/inquiries", requireAuth as any, async (req, res) => {
    const inquiries = await storage.getInquiriesByUser(req.session.userId!);
    res.json(inquiries);
  });

  app.patch("/api/portal/profile", requireAuth as any, async (req, res) => {
    const schema = z.object({
      name: z.string().min(1).optional(),
      company: z.string().optional(),
      phone: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });

    const user = await storage.updateUser(req.session.userId!, parsed.data);
    res.json({ id: user.id, email: user.email, name: user.name, company: user.company, phone: user.phone });
  });

  app.patch("/api/portal/password", requireAuth as any, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Both current and new password are required" });
    if (newPassword.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters" });

    const user = await storage.getUserById(req.session.userId!);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Current password is incorrect" });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await storage.updateUser(user.id, { passwordHash });
    res.json({ message: "Password updated" });
  });

  return httpServer;
}
