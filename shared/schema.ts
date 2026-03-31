import { sql } from "drizzle-orm";
import { pgTable, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const brandGroups = pgTable("brand_groups", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  sortOrder: integer("sort_order").default(0),
});

export const brandProperties = pgTable("brand_properties", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  brandGroupId: integer("brand_group_id").notNull(),
  description: text("description"),
  image: text("image"),
  sortOrder: integer("sort_order").default(0),
});

export const productLines = pgTable("product_lines", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(),
  description: text("description"),
  image: text("image"),
  sortOrder: integer("sort_order").default(0),
});

export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  brandPropertyId: integer("brand_property_id"),
  productLineId: integer("product_line_id"),
  productType: text("product_type"),
  images: text("images").array().default(sql`'{}'::text[]`),
  specifications: jsonb("specifications"),
  features: text("features").array().default(sql`'{}'::text[]`),
  isFeatured: boolean("is_featured").default(false),
  sortOrder: integer("sort_order").default(0),
});

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  company: text("company"),
  phone: text("phone"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  phone: text("phone"),
  message: text("message"),
  projectLocation: text("project_location"),
  details: jsonb("details"),
  attachments: text("attachments").array().default(sql`'{}'::text[]`),
  status: text("status").default("new"),
  userId: integer("user_id"),
  productId: integer("product_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBrandGroupSchema = createInsertSchema(brandGroups).omit({ id: true });
export const insertBrandPropertySchema = createInsertSchema(brandProperties).omit({ id: true });
export const insertProductLineSchema = createInsertSchema(productLines).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, resetToken: true, resetTokenExpiry: true });
export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true, createdAt: true });

export type BrandGroup = typeof brandGroups.$inferSelect;
export type InsertBrandGroup = z.infer<typeof insertBrandGroupSchema>;
export type BrandProperty = typeof brandProperties.$inferSelect;
export type InsertBrandProperty = z.infer<typeof insertBrandPropertySchema>;
export type ProductLine = typeof productLines.$inferSelect;
export type InsertProductLine = z.infer<typeof insertProductLineSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
