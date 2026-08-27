# PharmSaf 💊

> **Pharmacy operations, built for Moroccan public healthcare.**
>
> PharmSaf is a full-stack pharmacy management system designed to help provincial healthcare facilities manage medical stock, track distributions, generate delivery notes, and maintain complete operational visibility.
>
> ⚠️ **Status: Work in Progress**
> PharmSaf is actively under development. Some features, modules, and integrations are still being refined.

---

## Overview

Managing pharmaceutical stock across multiple healthcare facilities requires more than spreadsheets and manual records.

**PharmSaf** brings inventory management, hospital distributions, delivery documentation, annual allocations, and activity tracking into one centralized platform.

The project is designed around the operational workflows of the **Pharmacie Provinciale d'Essaouira** and the needs of Moroccan public healthcare facilities.

**Manage stock. Track distributions. Stay in control.**

---

## Features

| Module                       | Description                                                              |
| ---------------------------- | ------------------------------------------------------------------------ |
| 📦 **Stock Management**      | Track medical inventory, batch numbers, quantities, and expiry dates     |
| 🏥 **Hospital Distribution** | Manage and track stock distributions to hospitals and healthcare centers |
| 📄 **Delivery Notes**        | Automatically generate and print official delivery documents             |
| 💉 **Insulin On-Demand**     | Dedicated distribution workflow for insulin with per-unit tracking       |
| 🎁 **Birth Kits**            | Assemble and distribute birth kits to healthcare facilities              |
| 📊 **Annual Allocations**    | Manage yearly allocations by hospital and product category               |
| 📈 **Dashboard & Reports**   | Monitor stock consumption, movements, and operational trends             |
| 📥 **Excel Import**          | Bulk import products and stock data from Excel files                     |
| 🔍 **Audit Trail**           | Maintain a complete record of CRUD and print operations                  |
| 🌐 **French Interface**      | Fully localized interface for day-to-day operations                      |

---

## Built for Pharmacy Operations

PharmSaf provides a centralized view of the main workflows involved in provincial pharmacy management.

From incoming stock to hospital distribution, every major movement can be recorded and tracked in one place.

* Keep inventory organized by product, batch, and expiry date
* Record incoming and outgoing stock movements
* Track distributions across healthcare facilities
* Generate official delivery documentation
* Monitor annual allocations
* Review activity through a complete audit trail

---

## Tech Stack

* **Framework** — [Next.js 16](https://nextjs.org) (App Router, Server Actions)
* **Language** — TypeScript
* **Database** — MySQL / MariaDB via [Prisma ORM](https://prisma.io)
* **Authentication** — [Clerk](https://clerk.com) (with optional demo/mock mode)
* **UI** — [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
* **Icons** — [Tabler Icons](https://tabler-icons.io) + [Lucide React](https://lucide.dev)
* **Charts** — [Recharts](https://recharts.org) + [Tremor](https://tremor.so)
* **PDF Generation** — [@react-pdf/renderer](https://react-pdf.org)
* **Excel Processing** — [ExcelJS](https://github.com/exceljs/exceljs)
* **Package Manager** — Bun / npm

---

## Getting Started

### Prerequisites

Before running PharmSaf, make sure you have:

* Node.js ≥ 18 or [Bun](https://bun.sh) ≥ 1.x
* MySQL 8+ or MariaDB 10.6+
* A [Clerk](https://clerk.com) account for production authentication

### 1. Clone the repository

```bash
git clone https://github.com/yassinidyhya/PharmSaf.git
cd PharmSaf
```

### 2. Install dependencies

```bash
npm install

# or

bun install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values.

See [Environment Variables](#environment-variables) below.

---

## Run with Mock Data

You can explore PharmSaf without configuring a database.

Set the following value in `.env.local`:

```env
USE_MOCK_DATA="true"
```

Then start the development server:

```bash
npm run dev
```

Sign in at `http://localhost:3000` using the demo credentials defined in your `.env.local`.

---

## Run with a Real Database

To connect PharmSaf to MySQL or MariaDB:

1. Set `USE_MOCK_DATA="false"`
2. Add your `DATABASE_URL` to `.env.local`
3. Run Prisma migrations:

```bash
npx prisma migrate dev
```

4. Optionally seed the database:

```bash
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and configure the required values.

| Variable                            | Required            | Description                                             |
| ----------------------------------- | ------------------- | ------------------------------------------------------- |
| `USE_MOCK_DATA`                     | ✅                   | `"true"` for demo mode or `"false"` for a real database |
| `DATABASE_URL`                      | Database mode       | MySQL/MariaDB connection string used by Prisma          |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Authentication mode | Clerk publishable key                                   |
| `CLERK_SECRET_KEY`                  | Authentication mode | Clerk secret key                                        |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`     | Authentication mode | Sign-in route (default `/sign-in`)                      |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`     | Authentication mode | Sign-up route (default `/sign-up`)                      |
| `CLERK_WEBHOOK_SIGNING_SECRET`      | Authentication mode | Clerk webhook signing secret                            |
| `CLERK_WEBHOOK_SECRET`              | Authentication mode | Clerk webhook secret                                    |
| `DEMO_EMAIL`                        | Mock mode           | Demo login email                                        |
| `DEMO_PASSWORD`                     | Mock mode           | Demo login password                                     |
| `DEMO_SESSION_SECRET`               | Mock mode           | Secret used to sign the demo session cookie             |
| `NEXT_PUBLIC_APP_NAME`              | Optional            | Pharmacy name displayed in the application              |
| `NEXT_PUBLIC_APP_LOCALE`            | Optional            | Interface locale (default `fr`)                         |

---

## Database Schema

The Prisma schema is located at [`prisma/schema.prisma`](prisma/schema.prisma).

The core data model covers the main parts of provincial pharmacy operations:

```text
User             — Clerk-synced user accounts
Hospital         — Healthcare facilities
Product          — Medical products and packaging information
Batch            — Product batches, quantities, and expiry dates
StockEntry       — Incoming stock records
StockExit        — Outgoing distributions to healthcare facilities
AnnualAllocation — Yearly allocations by hospital and category
DeliveryNote     — Official delivery documents
BirthKit         — Birth kit assemblies and distributions
ActivityLog      — Complete operational audit trail
```

---

## Available Scripts

| Command            | Description                                    |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Start the development server                   |
| `npm run build`    | Generate Prisma files and build for production |
| `npm run start`    | Start the production server                    |
| `npm run lint`     | Run ESLint                                     |
| `npm run db:seed`  | Seed the database with sample data             |
| `npm run db:reset` | Reset and re-seed the database                 |

---

## Project Structure

```text
PharmSaf/
├── app/
│   ├── (auth)/             # Authentication pages
│   ├── (dashboard)/        # Main application modules
│   │   ├── actions.ts      # Server actions
│   │   ├── page.tsx        # Dashboard
│   │   ├── produits/       # Product management
│   │   ├── distributions/  # Stock distribution
│   │   ├── bons-livraison/ # Delivery notes
│   │   ├── hopitaux/       # Healthcare facilities
│   │   ├── insuline/       # Insulin distribution
│   │   ├── kits/           # Birth kits
│   │   ├── inventaire/     # Inventory
│   │   ├── import/         # Excel imports
│   │   └── rapports/       # Reports
│   ├── api/                # API routes and webhooks
│   ├── globals.css
│   └── layout.tsx
├── components/             # Reusable interface components
├── lib/
│   ├── db.ts               # Prisma client
│   ├── auth.ts             # Authentication helpers
│   └── mock-data.ts        # In-memory demo data
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeding
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
├── .env.local.example      # Environment variable template
└── package.json
```

---

## Project Status

PharmSaf is an active work in progress.

The project is being developed around real provincial pharmacy workflows, with ongoing work on features, operational processes, integrations, and production readiness.

---

## Contributing

Contributions, issues, and suggestions are welcome.

If you'd like to contribute to PharmSaf, feel free to open an issue or submit a pull request.

---

## License

This project is publicly available on GitHub.

Please refer to the repository's `LICENSE` file for licensing information.
