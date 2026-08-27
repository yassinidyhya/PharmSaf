PharmSaf 💊

⚠️ Status: Work in Progress (Unfinished / Under Development)

Provincial pharmacy management system — A full-stack pharmacy management system built for Moroccan provincial healthcare facilities.

Note: This project is actively under development and is currently unfinished. Some features, modules, and integrations are experimental or undergoing active refinement.

Overview

PharmSaf is a Next.js web application that helps provincial pharmacies manage medical stock, track distributions to hospitals, generate delivery notes, and audit all activity. It is specifically designed for the Essaouira Provincial Pharmacy and follows Moroccan Ministry of Health workflows.

Features

Module

Description

📦 Stock Management

Track product inventory with batch/lot numbers and expiry dates

🏥 Hospital Distribution

Record quarterly stock exits to hospitals and health centers

📄 Delivery Notes

Automatically generate and print official delivery documents

💉 Insulin On-Demand

Special distribution mode for insulin with per-unit tracking

🎁 Birth Kits

Assemble and distribute birth kits to healthcare facilities

📊 Annual Allocations

Manage yearly budgets per hospital and category

📈 Dashboard & Reports

Charts and statistics for stock consumption and trends

📥 Excel Import

Bulk import products and stock from Excel files

🔍 Audit Trail

Complete activity log for all CRUD and print operations

🌐 French Interface

Fully localized user interface in French

Tech Stack

Framework — Next.js 16 (App Router, Server Actions)

Language — TypeScript

Database — MySQL / MariaDB via Prisma ORM

Authentication — Clerk (with optional demo/mock mode)

UI — Tailwind CSS v4 + shadcn/ui

Icons — Tabler Icons + Lucide React

Charts — Recharts + Tremor

PDF — @react-pdf/renderer

Excel — ExcelJS

Package Manager — Bun / npm

Getting Started

Prerequisites

Node.js ≥ 18 or Bun ≥ 1.x

MySQL 8+ or MariaDB 10.6+

A Clerk account (for production authentication)

1. Clone the repository

git clone https://github.com/yassinidyhya/PharmSaf.git
cd PharmSaf

2. Install dependencies

npm install
# or
bun install

3. Configure environment variables

cp .env.local.example .env.local

Edit .env.local with your values. See Environment Variables below.

4a. Run with mock data (no database required)

Set USE_MOCK_DATA="true" in .env.local, then:

npm run dev

Sign in at http://localhost:3000 using the demo credentials defined in your .env.local.

4b. Run with a real database

Set USE_MOCK_DATA="false" and fill in DATABASE_URL in .env.local

Run Prisma migrations:

npx prisma migrate dev

(Optional) Seed the database:

npm run db:seed

Start the development server:

npm run dev

Open http://localhost:3000 in your browser.

Environment Variables

Copy .env.local.example to .env.local and fill in all required values.

Variable

Required

Description

USE_MOCK_DATA

✅

"true" for in-memory demo mode, "false" for a real database

DATABASE_URL

Database mode

MySQL/MariaDB connection string for Prisma

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

Authentication mode

Clerk publishable key

CLERK_SECRET_KEY

Authentication mode

Clerk secret key

NEXT_PUBLIC_CLERK_SIGN_IN_URL

Authentication mode

Sign-in route (default /sign-in)

NEXT_PUBLIC_CLERK_SIGN_UP_URL

Authentication mode

Sign-up route (default /sign-up)

CLERK_WEBHOOK_SIGNING_SECRET

Authentication mode

Clerk webhook signing secret

CLERK_WEBHOOK_SECRET

Authentication mode

Clerk webhook secret

DEMO_EMAIL

Mock mode

Login email for demo mode

DEMO_PASSWORD

Mock mode

Login password for demo mode

DEMO_SESSION_SECRET

Mock mode

Random secret used to sign the session cookie

NEXT_PUBLIC_APP_NAME

Optional

Pharmacy display name shown in the interface

NEXT_PUBLIC_APP_LOCALE

Optional

User interface locale (default fr)

Database Schema

The Prisma schema is located at prisma/schema.prisma. Key models:

User             — Clerk-synced user accounts
Hospital         — Healthcare facilities (HOSPITAL_CENTER, HEALTH_CENTER, PROVINCIAL_HOSPITAL)
Product          — Medical products with category, unit, and packaging information
Batch            — Lot numbers with quantities and expiry dates
StockEntry       — Incoming stock records
StockExit        — Outgoing distributions linked to hospitals
AnnualAllocation — Yearly budget per hospital and category
DeliveryNote     — Official delivery documents
BirthKit         — Birth kit assemblies and distributions
ActivityLog      — Audit trail for all actions

Available Scripts

Command

Description

npm run dev

Start the Next.js development server

npm run build

Run prisma generate and build for production

npm run start

Start the production server

npm run lint

Run ESLint

npm run db:seed

Seed the database with sample data

npm run db:reset

Reset the database and seed it again

Project Structure

PharmSaf/
├── app/
│   ├── (auth)/             # Sign-in / sign-up pages
│   ├── (dashboard)/        # Main application pages
│   │   ├── actions.ts      # All server actions
│   │   ├── page.tsx        # Dashboard home
│   │   ├── produits/       # Product management
│   │   ├── distributions/  # Stock exit management
│   │   ├── bons-livraison/ # Delivery notes
│   │   ├── hopitaux/       # Hospital management
│   │   ├── insuline/       # Insulin on-demand
│   │   ├── kits/           # Birth kits
│   │   ├── inventaire/     # Inventory view
│   │   ├── import/         # Excel import
│   │   └── rapports/       # Reports
│   ├── api/                # API routes (Clerk webhooks, etc.)
│   ├── globals.css
│   └── layout.tsx
├── components/             # Reusable UI components
├── lib/
│   ├── db.ts               # Prisma client singleton
│   ├── auth.ts             # Clerk authentication helpers
│   └── mock-data.ts        # In-memory mock data store
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeder
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
├── .env.local.example      # Environment variable template
└── package.json

Contributing

This project is maintained internally for the Essaouira Provincial Pharmacy. Pull requests and issues are welcome from authorized contributors.
