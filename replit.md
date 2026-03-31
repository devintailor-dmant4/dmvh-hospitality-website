# DMVH Hospitality - Hotel & Apartment Furniture Website

## Overview
Website for DMVH Hospitality, a US-Vietnam hotel and apartment furniture manufacturing company (3 partners). Offices in Chicago, Dallas, and Ho Chi Minh City. The site serves as a product catalog organized by hotel brand groups, with additional apartment and bathroom product lines. Target audience: distributors and wholesalers.

## Company Info
- **Name**: DMVH Hospitality
- **Phone**: (620) 287-0248
- **Offices**: Chicago, IL | Dallas, TX | Ho Chi Minh City, Vietnam
- **Inquiry Email**: sales@dmvhhospitality.com (contact form submissions)

## Architecture
- **Frontend**: React + TypeScript + Vite, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: Wouter (frontend), Express (backend API)
- **State**: TanStack React Query

## Navigation Structure
Brand Group → Brand Property → Products
- Hotel brands: IHG, Hilton, Marriott, Wyndham, Choice, Other Brands
- Each brand group contains brand properties (e.g., IHG → Holiday Inn Express, Avid, Candlewood)
- Each property has product types: Guestroom Casegoods, Softgoods, Lighting, Public Area
- Plus: Apartment Furniture (Living, Bedroom, Kitchen/Dining) and Bathroom Products (Vanity, Toilets, Shower Panels, LED Mirrors, Bathtubs, Shower Doors & Enclosures)

## Authentication & Customer Portal
- **users** table: id, email, passwordHash, name, company, phone, resetToken, resetTokenExpiry, createdAt
- **inquiries** table: added `userId` (FK to users) and `status` fields
- Auth: bcrypt password hashing, express-session + connect-pg-simple for sessions (SESSION_SECRET env var)
- Password reset: crypto random token, 1-hour expiry, sent via Resend email
- Auth routes: POST /api/auth/register|login|logout|forgot-password|reset-password, GET /api/auth/me
- Portal routes: GET /api/portal/inquiries, PATCH /api/portal/profile|password
- Header shows user avatar/dropdown when logged in, "Client Login" link when logged out

## Pages
- **Home** (`/`) - Hero, brand groups, stats, compact testimonials (3 per page with pagination, "read full review" dialog), CTA. WhyDMVH section removed. No featured products. Top bar has "Contact Us" link.
- **Brand Catalog** (`/brands`) - Hotel brand groups only (IHG, Hilton, Marriott, Wyndham, Choice, Other)
- **Brand Group Detail** (`/brands/:slug`) - Properties within a brand group. Premium card design with hover animations.
- **Property Detail** (`/property/:slug`) - Products for a specific brand property; uses tabs when multiple products share types, flat 3-column grid when each product has unique type (bathroom/apartment categories)
- **Product Detail** (`/product/:slug`) - Breadcrumb navigation, specifications table, features with checkmark icons, related products, pill-shaped CTA buttons
- **About** (`/about`) - Company story, manufacturing, process
- **Contact** (`/contact`) - Inquiry form with validation. Shows Chicago, Dallas, and Vietnam offices.

## Data Model
- **brand_groups** - Hotel chain groups + Apartment + Bathroom (8 total)
- **brand_properties** - Specific hotel brands within groups (~43 total)
- **product_lines** - Product type categories (Casegoods, Softgoods, Lighting, etc.)
- **products** - Individual products with specs, features, images (~70 total; 6 per bathroom/apartment category)
- **inquiries** - Contact form submissions

## Key Files
- `shared/schema.ts` - Drizzle schema definitions
- `server/routes.ts` - API endpoints
- `server/storage.ts` - Database storage layer
- `server/seed.ts` - Seed data (core products; additional products added via DB scripts)
- `server/db.ts` - Database connection
- `client/src/App.tsx` - Main app with routing + ScrollToTop component
- `client/src/pages/BrandCatalog.tsx` - Brand catalog overview
- `client/src/pages/BrandGroupDetail.tsx` - Brand group detail with properties
- `client/src/pages/PropertyDetail.tsx` - Property detail with product tabs or grid
- `client/src/pages/ProductDetail.tsx` - Individual product with specs table
- `client/src/components/Header.tsx` - Navigation header with top bar contact link
- `client/src/components/Footer.tsx` - Site footer

## Theme
- Warm earth tones (brown/amber primary color)
- Fonts: Montserrat (sans), Playfair Display (serif)
- Professional hospitality branding
- Light/dark mode support via CSS variables
- All images are AI-generated (no external/copyright images)
- Premium card design: rounded-xl, shadow-md, hover animations with image zoom and overlays

## API Endpoints
- `GET /api/brand-groups` - All brand groups
- `GET /api/brand-groups/:slug` - Single brand group
- `GET /api/brand-properties` - All brand properties
- `GET /api/brand-properties/group/:groupId` - Properties by group
- `GET /api/brand-properties/:slug` - Single property
- `GET /api/product-lines` - All product lines
- `GET /api/product-lines/type/:type` - Product lines by type
- `GET /api/products` - All products
- `GET /api/products/featured` - Featured products
- `GET /api/products/brand/:brandPropertyId` - Products by brand property
- `GET /api/products/brand/:id/type/:type` - Products by brand and type
- `GET /api/products/line/:productLineId` - Products by product line
- `GET /api/products/:slug` - Single product
- `POST /api/inquiries` - Submit inquiry

## Product Specifications
Products display spec tables with: Base Material, Headboard, Casegoods Finish, Countertop Selection, Soft Seating Fabrics, Application, Delivery Time (45-50 days), Payment Terms (T/T, 50% deposit), Delivery (FOB/CIF/DDP)
