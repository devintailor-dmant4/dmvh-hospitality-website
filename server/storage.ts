import {
  type BrandGroup, type InsertBrandGroup,
  type BrandProperty, type InsertBrandProperty,
  type ProductLine, type InsertProductLine,
  type Product, type InsertProduct,
  type User, type InsertUser,
  type Inquiry, type InsertInquiry,
  brandGroups, brandProperties, productLines, products, inquiries, users
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, and, desc } from "drizzle-orm";

export interface IStorage {
  getBrandGroups(): Promise<BrandGroup[]>;
  getBrandGroupBySlug(slug: string): Promise<BrandGroup | undefined>;
  createBrandGroup(bg: InsertBrandGroup): Promise<BrandGroup>;

  getBrandProperties(): Promise<BrandProperty[]>;
  getBrandPropertiesByGroup(groupId: number): Promise<BrandProperty[]>;
  getBrandPropertyBySlug(slug: string): Promise<BrandProperty | undefined>;
  createBrandProperty(bp: InsertBrandProperty): Promise<BrandProperty>;

  getProductLines(): Promise<ProductLine[]>;
  getProductLinesByType(type: string): Promise<ProductLine[]>;
  getProductLineBySlug(slug: string): Promise<ProductLine | undefined>;
  createProductLine(pl: InsertProductLine): Promise<ProductLine>;

  getProducts(): Promise<Product[]>;
  getProductsByBrandProperty(brandPropertyId: number): Promise<Product[]>;
  getProductsByProductLine(productLineId: number): Promise<Product[]>;
  getProductsByBrandAndType(brandPropertyId: number, productType: string): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiriesByUser(userId: number): Promise<Inquiry[]>;

  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(data: { email: string; passwordHash: string; name: string; company?: string; phone?: string }): Promise<User>;
  updateUser(id: number, data: Partial<Pick<User, "name" | "company" | "phone" | "passwordHash" | "resetToken" | "resetTokenExpiry">>): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getBrandGroups(): Promise<BrandGroup[]> {
    return db.select().from(brandGroups).orderBy(asc(brandGroups.sortOrder));
  }

  async getBrandGroupBySlug(slug: string): Promise<BrandGroup | undefined> {
    const [bg] = await db.select().from(brandGroups).where(eq(brandGroups.slug, slug));
    return bg;
  }

  async createBrandGroup(bg: InsertBrandGroup): Promise<BrandGroup> {
    const [created] = await db.insert(brandGroups).values(bg).returning();
    return created;
  }

  async getBrandProperties(): Promise<BrandProperty[]> {
    return db.select().from(brandProperties).orderBy(asc(brandProperties.sortOrder));
  }

  async getBrandPropertiesByGroup(groupId: number): Promise<BrandProperty[]> {
    return db.select().from(brandProperties).where(eq(brandProperties.brandGroupId, groupId)).orderBy(asc(brandProperties.sortOrder));
  }

  async getBrandPropertyBySlug(slug: string): Promise<BrandProperty | undefined> {
    const [bp] = await db.select().from(brandProperties).where(eq(brandProperties.slug, slug));
    return bp;
  }

  async createBrandProperty(bp: InsertBrandProperty): Promise<BrandProperty> {
    const [created] = await db.insert(brandProperties).values(bp).returning();
    return created;
  }

  async getProductLines(): Promise<ProductLine[]> {
    return db.select().from(productLines).orderBy(asc(productLines.sortOrder));
  }

  async getProductLinesByType(type: string): Promise<ProductLine[]> {
    return db.select().from(productLines).where(eq(productLines.type, type)).orderBy(asc(productLines.sortOrder));
  }

  async getProductLineBySlug(slug: string): Promise<ProductLine | undefined> {
    const [pl] = await db.select().from(productLines).where(eq(productLines.slug, slug));
    return pl;
  }

  async createProductLine(pl: InsertProductLine): Promise<ProductLine> {
    const [created] = await db.insert(productLines).values(pl).returning();
    return created;
  }

  async getProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(asc(products.sortOrder));
  }

  async getProductsByBrandProperty(brandPropertyId: number): Promise<Product[]> {
    return db.select().from(products).where(eq(products.brandPropertyId, brandPropertyId)).orderBy(asc(products.sortOrder));
  }

  async getProductsByProductLine(productLineId: number): Promise<Product[]> {
    return db.select().from(products).where(eq(products.productLineId, productLineId)).orderBy(asc(products.sortOrder));
  }

  async getProductsByBrandAndType(brandPropertyId: number, productType: string): Promise<Product[]> {
    return db.select().from(products).where(
      and(eq(products.brandPropertyId, brandPropertyId), eq(products.productType, productType))
    ).orderBy(asc(products.sortOrder));
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.isFeatured, true)).orderBy(asc(products.sortOrder));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [created] = await db.insert(inquiries).values(inquiry).returning();
    return created;
  }

  async getInquiriesByUser(userId: number): Promise<Inquiry[]> {
    return db.select().from(inquiries).where(eq(inquiries.userId, userId)).orderBy(desc(inquiries.createdAt));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(data: { email: string; passwordHash: string; name: string; company?: string; phone?: string }): Promise<User> {
    const [created] = await db.insert(users).values({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name,
      company: data.company,
      phone: data.phone,
    }).returning();
    return created;
  }

  async updateUser(id: number, data: Partial<Pick<User, "name" | "company" | "phone" | "passwordHash" | "resetToken" | "resetTokenExpiry">>): Promise<User> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
