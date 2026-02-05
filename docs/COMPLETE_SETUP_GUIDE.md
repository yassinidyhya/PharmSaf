# Provincial Pharmacy System - Complete Setup Guide

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **MySQL 8.0+** installed and running locally
- **Git** installed
- A code editor (VS Code recommended)
- A **Clerk account** ([Sign up free](https://clerk.com/))

---

## 🚀 Step-by-Step Installation

### Step 1: Create Next.js Project

Open your terminal and run:

```bash
npx create-next-app@latest pharmacy-system
```

When prompted, select:
```
✅ TypeScript - Yes
✅ ESLint - Yes
✅ Tailwind CSS - Yes
✅ src/ directory - Yes
✅ App Router - Yes
❌ Turbopack - No
✅ Import alias (@/*) - Yes
```

Navigate to project:
```bash
cd pharmacy-system
```

---

### Step 2: Install Core Dependencies

```bash
# Authentication
npm install @clerk/nextjs

# Database & ORM
npm install drizzle-orm mysql2
npm install -D drizzle-kit

# UI Components
npm install class-variance-authority clsx tailwind-merge lucide-react

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Data Management
npm install @tanstack/react-query @tanstack/react-table

# Date Handling
npm install date-fns

# Excel Export
npm install xlsx

# PDF Generation
npm install jspdf jspdf-autotable

# Charts
npm install recharts

# Notifications
npm install sonner

# Types
npm install -D @types/jspdf @types/node tsx
```

---

### Step 3: Install shadcn/ui

Initialize shadcn/ui:
```bash
npx shadcn-ui@latest init
```

When prompted, select:
```
✅ Style: Default
✅ Base color: Slate
✅ CSS variables: Yes
```

Install required components:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add card
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add skeleton
```

---

### Step 4: Setup Clerk Authentication

1. **Create Clerk Application**:
   - Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
   - Click "Add application"
   - Name it "Pharmacy System"
   - Select "Email" as authentication method
   - Click "Create application"

2. **Get API Keys**:
   - In your Clerk dashboard, go to "API Keys"
   - Copy the "Publishable key" and "Secret key"

3. **Create Environment File**:

Create `.env.local` in your project root:

```bash
# Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
DATABASE_URL=mysql://root:password@localhost:3306/pharmacy_db
```

**Important**: Replace `password` with your actual MySQL root password.

---

### Step 5: Create MySQL Database

Open MySQL and create the database:

```sql
CREATE DATABASE pharmacy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or via command line:

```bash
mysql -u root -p -e "CREATE DATABASE pharmacy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

### Step 6: Setup Database Schema

Create `drizzle.config.ts` in the root:

```typescript
import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

Create `src/db/schema.ts`:

```typescript
import { 
  mysqlTable, 
  varchar, 
  int, 
  decimal, 
  datetime, 
  json, 
  text, 
  boolean, 
  timestamp,
  index,
  uniqueIndex
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Users (synced from Clerk)
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  clerkIdIdx: uniqueIndex('clerk_id_idx').on(table.clerkId),
}));

// Categories
export const categories = mysqlTable('categories', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  requiresExpiry: boolean('requires_expiry').default(false),
  requiresBatch: boolean('requires_batch').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Products
export const products = mysqlTable('products', {
  id: int('id').primaryKey().autoincrement(),
  categoryId: int('category_id').notNull().references(() => categories.id),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 100 }).unique(),
  unit: varchar('unit', { length: 50 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  categoryIdx: index('category_idx').on(table.categoryId),
  nameIdx: index('name_idx').on(table.name),
}));

// Hospitals
export const hospitals = mysqlTable('hospitals', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  type: varchar('type', { length: 100 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  contactPerson: varchar('contact_person', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  codeIdx: uniqueIndex('hospital_code_idx').on(table.code),
}));

// Annual Allocations
export const allocations = mysqlTable('allocations', {
  id: int('id').primaryKey().autoincrement(),
  hospitalId: int('hospital_id').notNull().references(() => hospitals.id),
  categoryId: int('category_id').notNull().references(() => categories.id),
  year: int('year').notNull(),
  totalUnits: int('total_units').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueAllocation: uniqueIndex('unique_allocation').on(table.hospitalId, table.categoryId, table.year),
}));

// Stock Entries
export const stockEntries = mysqlTable('stock_entries', {
  id: int('id').primaryKey().autoincrement(),
  productId: int('product_id').notNull().references(() => products.id),
  quantity: int('quantity').notNull(),
  batchNumber: varchar('batch_number', { length: 255 }),
  expiryDate: datetime('expiry_date'),
  receptionDate: datetime('reception_date').notNull(),
  temperature: decimal('temperature', { precision: 4, scale: 2 }),
  referenceDoc: varchar('reference_doc', { length: 255 }),
  notes: text('notes'),
  createdBy: int('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  productIdx: index('product_idx').on(table.productId),
  expiryIdx: index('expiry_idx').on(table.expiryDate),
}));

// Delivery Notes
export const deliveryNotes = mysqlTable('delivery_notes', {
  id: int('id').primaryKey().autoincrement(),
  noteNumber: varchar('note_number', { length: 50 }).notNull().unique(),
  year: int('year').notNull(),
  quarter: int('quarter').notNull(),
  hospitalId: int('hospital_id').notNull().references(() => hospitals.id),
  deliveryDate: datetime('delivery_date').notNull(),
  status: varchar('status', { length: 50 }).default('draft'),
  receivedBy: varchar('received_by', { length: 255 }),
  notes: text('notes'),
  createdBy: int('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  noteNumberIdx: uniqueIndex('note_number_idx').on(table.noteNumber),
  hospitalIdx: index('hospital_idx').on(table.hospitalId),
}));

// Delivery Note Items
export const deliveryNoteItems = mysqlTable('delivery_note_items', {
  id: int('id').primaryKey().autoincrement(),
  deliveryNoteId: int('delivery_note_id').notNull().references(() => deliveryNotes.id, { onDelete: 'cascade' }),
  productId: int('product_id').notNull().references(() => products.id),
  quantity: int('quantity').notNull(),
  batchNumber: varchar('batch_number', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Activity Logs
export const activityLogs = mysqlTable('activity_logs', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entity: varchar('entity', { length: 100 }).notNull(),
  entityId: int('entity_id'),
  details: json('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('user_idx').on(table.userId),
  createdIdx: index('created_idx').on(table.createdAt),
}));

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  stockEntries: many(stockEntries),
  deliveryNoteItems: many(deliveryNoteItems),
}));

export const hospitalsRelations = relations(hospitals, ({ many }) => ({
  allocations: many(allocations),
  deliveryNotes: many(deliveryNotes),
}));

export const deliveryNotesRelations = relations(deliveryNotes, ({ one, many }) => ({
  hospital: one(hospitals, {
    fields: [deliveryNotes.hospitalId],
    references: [hospitals.id],
  }),
  items: many(deliveryNoteItems),
  createdByUser: one(users, {
    fields: [deliveryNotes.createdBy],
    references: [users.id],
  }),
}));
```

Create `src/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const connection = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

export const db = drizzle(connection, { schema, mode: 'default' });
```

---

### Step 7: Generate Database Tables

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx src/db/seed.ts"
  }
}
```

Push schema to database:

```bash
npm run db:push
```

---

### Step 8: Create Seed Data

Create `src/db/seed.ts`:

```typescript
import { db } from './index';
import { categories, products, hospitals } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  // Categories
  await db.insert(categories).values([
    { name: 'Médicaments', code: 'MEDICINES', requiresExpiry: true, requiresBatch: true },
    { name: 'Dispositifs Médicaux', code: 'DEVICES', requiresExpiry: false, requiresBatch: false },
    { name: 'Insuline', code: 'INSULIN', requiresExpiry: true, requiresBatch: true },
    { name: 'Kits de Naissance', code: 'KITS', requiresExpiry: false, requiresBatch: false },
  ]);

  // Sample Products
  const categoriesData = await db.select().from(categories);
  const medicinesCat = categoriesData.find(c => c.code === 'MEDICINES');
  const devicesCat = categoriesData.find(c => c.code === 'DEVICES');
  const insulinCat = categoriesData.find(c => c.code === 'INSULIN');

  if (medicinesCat && devicesCat && insulinCat) {
    await db.insert(products).values([
      {
        categoryId: medicinesCat.id,
        name: 'Amoxicilline 1g',
        code: 'MED-001',
        unit: 'Boîte',
        description: 'Boîte de 24 comprimés'
      },
      {
        categoryId: medicinesCat.id,
        name: 'Paracétamol 500mg',
        code: 'MED-002',
        unit: 'Boîte',
        description: 'Boîte de 20 comprimés'
      },
      {
        categoryId: devicesCat.id,
        name: 'Seringue 5ml',
        code: 'DEV-001',
        unit: 'Boîte',
        description: 'Boîte de 100 unités'
      },
      {
        categoryId: devicesCat.id,
        name: 'Gants Latex Taille M',
        code: 'DEV-002',
        unit: 'Boîte',
        description: 'Boîte de 100 unités'
      },
      {
        categoryId: insulinCat.id,
        name: 'Insuline 30/70',
        code: 'INS-001',
        unit: 'Flacon',
        description: 'Flacon 10ml'
      },
    ]);
  }

  // Sample Hospitals
  await db.insert(hospitals).values([
    {
      name: 'Hôpital Ibn Sina',
      code: 'H-001',
      type: 'Hôpital Public',
      address: 'Essaouira',
      phone: '0524-123456',
      contactPerson: 'Dr. Ahmed Alami'
    },
    {
      name: 'Centre de Santé Ville',
      code: 'CS-001',
      type: 'Centre de Santé',
      address: 'Centre Ville, Essaouira',
      phone: '0524-654321',
      contactPerson: 'Fatima Benani'
    },
  ]);

  console.log('✅ Database seeded successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
```

Run seed:

```bash
npm run db:seed
```

---

### Step 9: Setup Clerk Middleware

Create `src/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

---

### Step 10: Setup Clerk in Layout

Update `src/app/layout.tsx`:

```typescript
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pharmacie Provinciale - Essaouira',
  description: 'Système de gestion de la pharmacie provinciale',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

---

### Step 11: Create Authentication Pages

Create `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`:

```typescript
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignIn />
    </div>
  );
}
```

Create `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`:

```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignUp />
    </div>
  );
}
```

---

### Step 12: Create User Sync Webhook

Create `src/app/api/webhooks/clerk/route.ts`:

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Verification error', { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    await db.insert(users).values({
      clerkId: id,
      email: email_addresses[0].email_address,
      name: `${first_name || ''} ${last_name || ''}`.trim(),
    });
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    await db.update(users)
      .set({
        email: email_addresses[0].email_address,
        name: `${first_name || ''} ${last_name || ''}`.trim(),
      })
      .where(eq(users.clerkId, id));
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    if (id) {
      await db.delete(users).where(eq(users.clerkId, id));
    }
  }

  return new Response('', { status: 200 });
}
```

**Configure Webhook in Clerk:**
1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Copy signing secret and add to `.env.local` as `CLERK_WEBHOOK_SECRET`

---

### Step 13: Create Dashboard Layout

Create `src/app/(dashboard)/layout.tsx`:

```typescript
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">Pharmacie Provinciale</h1>
        </div>
        <nav className="mt-8">
          <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-800">
            Tableau de bord
          </Link>
          <Link href="/inventory" className="block px-4 py-2 hover:bg-gray-800">
            Inventaire
          </Link>
          <Link href="/distributions" className="block px-4 py-2 hover:bg-gray-800">
            Distributions
          </Link>
          <Link href="/hospitals" className="block px-4 py-2 hover:bg-gray-800">
            Hôpitaux
          </Link>
          <Link href="/allocations" className="block px-4 py-2 hover:bg-gray-800">
            Allocations
          </Link>
          <Link href="/reports" className="block px-4 py-2 hover:bg-gray-800">
            Rapports
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <UserButton afterSignOutUrl="/" />
        </header>
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

### Step 14: Create Dashboard Home Page

Create `src/app/(dashboard)/dashboard/page.tsx`:

```typescript
import { db } from '@/db';
import { products, hospitals, deliveryNotes } from '@/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const [productCount, hospitalCount, deliveryCount] = await Promise.all([
    db.select().from(products).then(r => r.length),
    db.select().from(hospitals).then(r => r.length),
    db.select().from(deliveryNotes).then(r => r.length),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{productCount}</p>
            <p className="text-sm text-gray-600">Produits enregistrés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hôpitaux</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{hospitalCount}</p>
            <p className="text-sm text-gray-600">Établissements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distributions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{deliveryCount}</p>
            <p className="text-sm text-gray-600">Bons de livraison</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

### Step 15: Run the Application

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## ✅ Verification Checklist

- [ ] MySQL database created
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Database tables created (`npm run db:push`)
- [ ] Seed data added (`npm run db:seed`)
- [ ] Clerk configured
- [ ] Development server running
- [ ] Can access sign-in page
- [ ] Can create user account
- [ ] Can access dashboard

---

## 🔧 Troubleshooting

### Issue: Database connection failed
**Solution**: Check your DATABASE_URL in `.env.local` and ensure MySQL is running.

### Issue: Clerk authentication not working
**Solution**: Verify your Clerk API keys are correct in `.env.local`.

### Issue: shadcn/ui components not found
**Solution**: Make sure you ran `npx shadcn-ui@latest init` and added components.

### Issue: Module not found errors
**Solution**: Run `npm install` again to ensure all dependencies are installed.

---

## 📚 Next Steps

1. **Add Inventory Management**: Create pages for adding/viewing stock
2. **Build Distribution System**: Create delivery note forms
3. **Implement Reports**: Add Excel export functionality
4. **Add PDF Generation**: Create delivery note PDFs
5. **Setup Alerts**: Add expiry and stock alerts
6. **Add Charts**: Implement dashboard visualizations

---

## 🎯 Production Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

### Environment Variables for Production

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
DATABASE_URL=mysql://user:pass@host:3306/pharmacy_db
```

---

## 📞 Support

If you encounter issues:
1. Check the terminal for error messages
2. Review the `.env.local` file
3. Ensure all dependencies are installed
4. Check MySQL is running

---

*Setup Guide - Provincial Pharmacy System - Essaouira*
