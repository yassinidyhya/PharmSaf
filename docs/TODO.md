# Pharmacie Provinciale Essaouira - Implementation TODO

> Track your progress. Check boxes as you complete each task.

**Note:** All pages should be created inside `app/(dashboard)/` to inherit the dashboard layout (sidebar, header, auth protection).

---

## Phase 1: Project Initialization

### Step 1.1: Create Project with shadcn/ui
- [ x] Run: `echo "pharmacy" | npx shadcn@latest init --yes --template next --base-color slate`
- [x ] Navigate to project folder: `cd my-app`
- [x ] Verify project structure is created

### Step 1.2: Install shadcn Components
- [ x] Run: `npx shadcn add button card input label table dialog dropdown-menu select tabs badge alert separator skeleton`

### Step 1.3: Install Core Dependencies
- [ x] Run: `npm install @clerk/nextjs@latest`
- [ x] Run: `npm install @prisma/client@latest prisma@latest`
- [ x] Run: `npm install react-hook-form @hookform/resolvers zod date-fns lucide-react`

### Step 1.4: Install Feature Dependencies
- [x] Run: `npm install @tremor/react@latest @tanstack/react-table@latest`
- [x] Run: `npm install xlsx exceljs @react-pdf/renderer@latest`
  > **Note**: The `xlsx` package has a high severity vulnerability (no fix available). This is a known issue with SheetJS. For production, consider using `exceljs` (already installed) for Excel imports instead.

---

## Phase 2: Environment Setup

### Step 2.1: Clerk Account Setup
- [x] Go to https://dashboard.clerk.com
- [x] Create new application named "pharmcy"
- [x] Copy Publishable key
- [x] Copy Secret key

### Step 2.2: Create Environment File
- [x] Create `.env.local` file in project root
- [x] Add Clerk keys:
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
  CLERK_SECRET_KEY=sk_test_...
  NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
  ```
- [x] Add database URL:
  ```
  DATABASE_URL="mysql://root:password@localhost:3306/pharmacy_db"
  ```
- [x] Add app config:
  ```
  NEXT_PUBLIC_APP_NAME="Pharmacie Provinciale Essaouira"
  NEXT_PUBLIC_APP_LOCALE="fr"
  ```

### Step 2.3: MySQL Database Setup
- [x] Start MySQL server (via XAMPP)
- [x] Connect to MySQL: `mysql -u root`
- [x] Create database:
  ```sql
  CREATE DATABASE pharmacy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- [x] Create database:
  ```sql
  CREATE DATABASE pharmacy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- [x] (Optional) Create dedicated user:
  ```sql
  CREATE USER 'pharmacy_user'@'localhost' IDENTIFIED BY 'your_password';
  GRANT ALL PRIVILEGES ON pharmacy_db.* TO 'pharmacy_user'@'localhost';
  FLUSH PRIVILEGES;
  EXIT;
  ```

---

## Phase 3: Database Schema & Configuration

### Step 3.1: Create Prisma Schema
- [x] Create folder: `mkdir prisma`
- [x] Create file: `prisma/schema.prisma`
- [x] Add generator config:
  ```prisma
  generator client {
    provider = "prisma-client-js"
  }
  datasource db {
    provider = "mysql"
    url      = env("DATABASE_URL")
  }
  ```

### Step 3.2: Define Database Models
- [x] Add User model
- [x] Add Hospital model
- [x] Add Product model with Category enum
- [x] Add Batch model
- [x] Add StockEntry model
- [x] Add StockExit model
- [x] Add AnnualAllocation model
- [x] Add DeliveryNote model with NoteStatus enum
- [x] Add BirthKit and KitComponent models
- [x] Add ActivityLog model

### Step 3.3: Run Migrations
- [x] Run: `npx prisma migrate dev --name init`
- [x] Run: `npx prisma generate`
- [x] Verify database tables created

### Step 3.4: Create Database Client
- [x] Create file: `lib/db.ts`
- [x] Add Prisma singleton pattern
- [x] Verify import works

---

## Phase 4: Authentication Setup

### Step 4.1: Configure Clerk Middleware
- [x] Create file: `middleware.ts` (project root)
- [x] Add route protection config
- [x] Add protected routes matcher

### Step 4.2: Setup Root Layout
- [x] Update `app/layout.tsx`
- [x] Import ClerkProvider
- [x] Add frFR localization
- [x] Wrap children with ClerkProvider

### Step 4.3: Create Sign-in Page
- [x] Create folder: `app/(auth)/sign-in/[[...sign-in]]`
- [x] Create file: `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- [x] Add SignIn component from Clerk
- [x] Add styling with centered layout

---

## Phase 5: Dashboard Layout

### Step 5.1: Create Dashboard Layout
- [x] Create folder: `app/(dashboard)`
- [x] Create file: `app/(dashboard)/layout.tsx`
- [x] Import UserButton from Clerk
- [x] Create sidebar navigation component
- [x] Add navigation items:
  - [x] Dashboard
  - [x] Inventaire
  - [x] Produits
  - [x] Hôpitaux
  - [x] Distributions
  - [x] Bons Livraison
  - [x] Rapports
  - [x] Import

### Step 5.2: Create Dashboard Home Page
- [x] Create file: `app/(dashboard)/page.tsx`
- [x] Add basic dashboard structure
- [x] Add placeholder stats cards

### Step 5.3: Create Utility Functions
- [x] Create/update `lib/utils.ts`
- [x] Add `cn()` helper (tailwind-merge + clsx)
- [x] Add `formatDate()` helper
- [x] Add `formatNumber()` helper

---

## Phase 6: Product Management

### Step 6.1: Products List Page
- [x] Create folder: `app/(dashboard)/produits`
- [x] Create file: `app/(dashboard)/produits/page.tsx`
- [x] Add TanStack Table for product listing
- [x] Add search/filter functionality
- [x] Add "New Product" button

### Step 6.2: Create Product Page
- [x] Create folder: `app/(dashboard)/produits/nouveau`
- [x] Create file: `app/(dashboard)/produits/nouveau/page.tsx`
- [x] Add React Hook Form with Zod validation
- [x] Add form fields: code, name, category, unit, packaging, price
- [x] Add submit handler

### Step 6.3: Product Detail Page
- [x] Create folder: `app/(dashboard)/produits/[id]`
- [x] Create file: `app/(dashboard)/produits/[id]/page.tsx`
- [x] Add product information display
- [x] Add stock history section
- [x] Add edit functionality

---

## Phase 7: Inventory Management (Stock)

### Step 7.1: Inventory Overview Page
- [x] Create folder: `app/(dashboard)/inventaire`
- [x] Create file: `app/(dashboard)/inventaire/page.tsx`
- [x] Add stock summary by category
- [x] Add low stock alerts section

### Step 7.2: Stock Entry (Incoming)
- [x] Create folder: `app/(dashboard)/inventaire/entrees`
- [x] Create file: `app/(dashboard)/inventaire/entrees/page.tsx`
- [x] List all stock entries
- [x] Create folder: `app/(dashboard)/inventaire/entrees/nouveau`
- [x] Create file: `app/(dashboard)/inventaire/entrees/nouveau/page.tsx`
- [x] Add form: product, quantity, batch, expiry, reference doc, temperature
- [x] Create Server Action: `createStockEntry`

### Step 7.3: Stock Exit (Outgoing/Distributions)
- [x] Create folder: `app/(dashboard)/inventaire/sorties`
- [x] Create file: `app/(dashboard)/inventaire/sorties/page.tsx`
- [x] List all stock exits
- [x] Create folder: `app/(dashboard)/inventaire/sorties/nouveau`
- [x] Create file: `app/(dashboard)/inventaire/sorties/nouveau/page.tsx`
- [x] Add form: hospital, product, quantity, batch selection
- [x] Create Server Action: `createStockExit`

### Step 7.4: Expiry Alerts Page
- [x] Create file: `app/(dashboard)/inventaire/peremption/page.tsx`
- [x] Show products expiring within 30/60/90 days
- [x] Add filtering by category

---

## Phase 8: Hospital Management

### Step 8.1: Hospitals List Page
- [x] Create folder: `app/(dashboard)/hopitaux`
- [x] Create file: `app/(dashboard)/hopitaux/page.tsx`
- [x] Add hospitals table
- [x] Add search/filter

### Step 8.2: Create Hospital Page
- [x] Create folder: `app/(dashboard)/hopitaux/nouveau`
- [x] Create file: `app/(dashboard)/hopitaux/nouveau/page.tsx`
- [x] Add form: code, name, type, address, phone, email, bed capacity

### Step 8.3: Hospital Detail Page
- [x] Create folder: `app/(dashboard)/hopitaux/[id]`
- [x] Create file: `app/(dashboard)/hopitaux/[id]/page.tsx`
- [x] Show hospital info
- [x] Show distribution history

### Step 8.4: Hospital Allocations Page
- [x] Create folder: `app/(dashboard)/hopitaux/[id]/allocations`
- [x] Create file: `app/(dashboard)/hopitaux/[id]/allocations/page.tsx`
- [x] Show annual budget by category
- [x] Show quarterly consumption (Q1, Q2, Q3, Q4)
- [x] Add budget allocation form

---

## Phase 9: Distribution System ✅ COMPLETE

### Step 9.1: Distributions List Page
- [x] Create folder: `app/(dashboard)/distributions`
- [x] Create file: `app/(dashboard)/distributions/page.tsx`
- [x] List all distributions
- [x] Filter by quarter, year, hospital

### Step 9.2: Create Distribution Page
- [x] Create folder: `app/(dashboard)/distributions/nouveau`
- [x] Create file: `app/(dashboard)/distributions/nouveau/page.tsx`
- [x] Step 1: Select hospital
- [x] Step 2: Show budget remaining by category
- [x] Step 3: Add products with quantity
- [x] Step 4: Validate against budget and stock
- [x] Step 5: Generate delivery note (auto-generated on distribution creation)

### Step 9.3: Distribution Detail Page
- [x] Create folder: `app/(dashboard)/distributions/[id]`
- [x] Create file: `app/(dashboard)/distributions/[id]/page.tsx`
- [x] Show distribution details
- [x] Show associated delivery note
- [x] Add print PDF button

---

## Phase 10: Delivery Notes (Bons de Livraison)

### Step 10.1: Delivery Notes Registry
- [x] Create folder: `app/(dashboard)/bons-livraison`
- [x] Create file: `app/(dashboard)/bons-livraison/page.tsx`
- [x] List all delivery notes
- [x] Filter by year, quarter, status
- [x] Search by note number

### Step 10.2: Delivery Note Detail
- [x] Create folder: `app/(dashboard)/bons-livraison/[id]`
- [x] Create file: `app/(dashboard)/bons-livraison/[id]/page.tsx`
- [x] Display official format with Morocco govt header
- [x] Show products list with batches
- [x] Show signatures section

### Step 10.3: PDF Generation
- [x] Create file: `app/(dashboard)/bons-livraison/[id]/pdf/page.tsx`
- [x] Add official header: "Royaume du Maroc / Ministère Santé"
- [x] Add note number, date, hospital info
- [x] Add products table
- [x] Add signature fields
- [x] Add print functionality

---

## Phase 11: Reports & Exports ✅ COMPLETE

### Step 11.1: Reports Dashboard
- [x] Create folder: `app/(dashboard)/rapports`
- [x] Create file: `app/(dashboard)/rapports/page.tsx`
- [x] Add report type cards
- [x] Quick stats overview

### Step 11.2: Quarterly Report
- [x] Create folder: `app/(dashboard)/rapports/trimestriel`
- [x] Create file: `app/(dashboard)/rapports/trimestriel/page.tsx`
- [x] Select quarter (Q1, Q2, Q3, Q4)
- [x] Select year
- [x] Generate report with distributions, hospitals, categories
- [x] Export to Excel

### Step 11.3: Annual Report
- [x] Create folder: `app/(dashboard)/rapports/annuel`
- [x] Create file: `app/(dashboard)/rapports/annuel/page.tsx`
- [x] Select year
- [x] Generate comprehensive annual report
- [x] Export to Excel

### Step 11.4: Activity Report
- [x] Create folder: `app/(dashboard)/rapports/activite`
- [x] Create file: `app/(dashboard)/rapports/activite/page.tsx`
- [x] Show activity logs
- [x] Filter by user, date, action type
- [x] Export to Excel

### Step 11.5: Excel Export Functions
- [x] Create file: `lib/excel-export.ts`
- [x] Add `exportStockReport()` function
- [x] Add `exportQuarterlyReport()` function
- [x] Add `exportActivityLogs()` function
- [x] Add `exportAnnualReport()` function
- [x] Add `exportStockInventory()` function

---

## Phase 12: Excel Import ✅ COMPLETE

### Step 12.1: Import Page
- [x] Create folder: `app/(dashboard)/import`
- [x] Create file: `app/(dashboard)/import/page.tsx`
- [x] Add file upload component
- [x] Support file types: .xlsx, .xls

### Step 12.2: Import Functions
- [x] Create file: `lib/excel/import.ts`
- [x] Add `parseProductsExcel()` function
- [x] Add `parseStockEntriesExcel()` function
- [x] Add `parseHospitalsExcel()` function
- [x] Add validation for imported data
- [x] Add preview before import
- [x] Create file: `app/(dashboard)/import/actions.ts`

---

## Phase 13: Dashboard Polish ✅ COMPLETE

### Step 13.1: Main Dashboard Stats
- [x] Update `app/(dashboard)/page.tsx`
- [x] Add stats cards for each category
- [x] Show current stock levels
- [x] Show month-of-stock remaining

### Step 13.2: Alerts Widget
- [x] Add alerts section to dashboard
- [x] Show expiring products (red alert < 30 days)
- [x] Show low stock warnings
- [x] Show budget overruns

### Step 13.3: Recent Activity Widget
- [x] Add recent activity section
- [x] Show last 10 actions
- [x] Link to detail pages

### Step 13.4: Charts
- [x] Add Tremor charts to dashboard
- [x] Stock by category (BarChart)
- [x] Quarterly distribution trends (LineChart)
- [x] Hospital consumption (PieChart)

---

## Phase 14: Audit Trail & Security ✅ COMPLETE

### Step 14.1: Activity Logging
- [x] Create file: `lib/audit-log.ts`
- [x] Add `logActivity()` function with helper methods
- [x] Log all CREATE operations
- [x] Log all UPDATE operations
- [x] Log all DELETE operations
- [x] Log all PRINT operations
- [x] Log LOGIN/LOGOUT operations

### Step 14.2: Integrate Logging
- [x] Add logging to stock entries
- [x] Add logging to stock exits (via distributions)
- [x] Add logging to delivery notes (print)
- [x] Add logging to product changes
- [x] Add logging to hospital creation
- [x] Add logging to allocation creation
- [x] Add logging to Excel imports

### Step 14.3: Clerk Webhook Sync ✅ ADDED
- [x] Create webhook handler: `app/api/webhooks/clerk/route.ts`
- [x] Handle `user.created` event
- [x] Handle `user.updated` event
- [x] Handle `user.deleted` event
- [x] Add signature verification
- [x] Create middleware for route protection
- [x] Add `CLERK_WEBHOOK_SIGNING_SECRET` to env

---

## Phase 15: Birth Kits Management ✅ COMPLETE

### Step 15.1: Birth Kits Assembly
- [x] Create page for kit assembly (`/kits/nouveau`)
- [x] Add checklist for kit components
- [x] Track kit type (Normal, Episiotomie)
- [x] Mark kits as complete/incomplete
- [x] Create kits list page with stats (`/kits`)
- [x] Create kit detail page (`/kits/[id]`)

### Step 15.2: Birth Kits Distribution
- [x] Add kit distribution workflow
- [x] Track distributed vs available kits
- [x] Stock reduction on distribution (FEFO)
- [x] Distribution dialog with hospital selection
- [x] Component verification system
- [x] Activity logging for kit operations

---

## Phase 16: Testing & Validation ✅ COMPLETE

### Step 16.1: Manual Testing
- [x] Test user authentication flow
- [x] Test product CRUD operations
- [x] Test stock entry creation
- [x] Test stock exit with budget validation
- [x] Test delivery note PDF generation
- [x] Test Excel import/export

### Step 16.2: Business Rules Validation
- [x] Verify FEFO (First Expired First Out) logic
- [x] Verify budget limit enforcement
- [x] Verify insulin expiry > 3 months rule
- [x] Verify kit completeness check

### Step 16.3: Performance Testing
- [x] Test with 1000+ products
- [x] Test with 100+ hospitals
- [x] Test large Excel imports

### Step 16.4: Database Audit ✅ ADDED
- [x] Comprehensive database audit completed
- [x] 28 performance indexes applied
- [x] Connection pooling configured
- [x] Transaction safety fixed
- [x] Demo data seeded (77 products, 10 hospitals, 186 batches)

---

## Phase 17: Deployment

### Step 17.1: Production Build
- [ ] Run: `npm run build`
- [ ] Fix any build errors
- [ ] Verify bundle size

### Step 17.2: Environment Setup
- [ ] Create production `.env` file
- [ ] Set up production Clerk keys
- [ ] Set up production database URL

### Step 17.3: Deploy
- [ ] Choose platform (Vercel recommended)
- [ ] Push code to GitHub
- [ ] Connect repository to Vercel
- [ ] Add environment variables
- [ ] Deploy

### Step 17.4: Post-Deployment
- [ ] Test deployed application
- [ ] Verify database connection
- [ ] Create first admin user in Clerk
- [ ] Add initial seed data

---

## Quick Reference: Useful Commands

```bash
# Development
npm run dev

# Database
npx prisma studio
npx prisma migrate dev --name <name>
npx prisma generate
npx prisma migrate reset

# Build
npm run build
npm start
```

---

## Notes

- [ ] Keep all code in French (user-facing)
- [ ] Use French date format: dd/MM/yyyy
- [ ] Use French number formatting
- [ ] Test regularly after each phase
- [ ] Backup database before major changes

---

**Estimated Timeline: 6 Weeks**
- Weeks 1-2: Phases 1-5 (Setup & Foundation)
- Weeks 3-4: Phases 6-10 (Core Features)
- Weeks 5-6: Phases 11-17 (Reports, Polish, Deploy)
