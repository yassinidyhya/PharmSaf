# Guide d'Installation
## Pharmacie Provinciale Essaouira - Dashboard

---

## Prérequis

- Node.js 20+
- MySQL 8+
- Git

---

## Étape 1: Cloner et Initialiser le Projet

```bash
# Créer le projet avec shadcn
echo "my-app" | npx shadcn@latest init --yes --template next --base-color slate

# Entrer dans le dossier
cd my-app

# Installer shadcn components
npx shadcn add button card input label table dialog dropdown-menu select tabs badge alert separator skeleton
```

---

## Étape 2: Installer les Dépendances

```bash
# Auth
npm install @clerk/nextjs

# Database
npm install @prisma/client prisma

# Excel
npm install xlsx exceljs

# PDF
npm install @react-pdf/renderer

# Charts & Tables
npm install @tremor/react @tanstack/react-table

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Utilities
npm install date-fns lucide-react clsx tailwind-merge
```

---

## Étape 3: Configuration Environment

Créer fichier `.env.local`:

```bash
# Clerk - Récupérer sur https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_votre_cle
CLERK_SECRET_KEY=sk_test_votre_cle
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/

# MySQL
DATABASE_URL="mysql://root:password@localhost:3306/pharmacy_db"

# App
NEXT_PUBLIC_APP_NAME="Pharmacie Provinciale Essaouira"
NEXT_PUBLIC_APP_LOCALE="fr"
```

---

## Étape 4: Configuration MySQL

```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE pharmacy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Créer utilisateur (optionnel)
CREATE USER 'pharmacy_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON pharmacy_db.* TO 'pharmacy_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Étape 5: Configuration Prisma

Créer `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id
  email       String   @unique
  name        String
  phone       String?
  createdAt   DateTime @default(now())
  activities  ActivityLog[]
  entries     StockEntry[]
  exits       StockExit[]
  notes       DeliveryNote[]
}

model Hospital {
  id            String    @id @default(cuid())
  code          String    @unique
  name          String
  type          String
  address       String?
  phone         String?
  email         String?
  bedCapacity   Int?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  allocations   AnnualAllocation[]
  exits         StockExit[]
  notes         DeliveryNote[]
}

model Product {
  id            String   @id @default(cuid())
  code          String   @unique
  name          String
  category      Category
  description   String?
  unit          String
  packaging     String?
  price         Decimal? @db.Decimal(10, 2)
  isActive      Boolean  @default(true)
  entries       StockEntry[]
  exits         StockExit[]
  batches       Batch[]
}

enum Category {
  MEDICAMENT
  DISPOSITIF
  INSULINE
  KIT_NAISSANCE
}

model Batch {
  id            String    @id @default(cuid())
  productId     String
  batchNumber   String
  expiryDate    DateTime?
  receivedAt    DateTime  @default(now())
  initialQty    Int
  remainingQty  Int
  temperature   Float?
  product       Product   @relation(fields: [productId], references: [id])
  exits         StockExit[]
  @@unique([productId, batchNumber])
}

model StockEntry {
  id            String   @id @default(cuid())
  entryDate     DateTime
  productId     String
  batchId       String?
  quantity      Int
  referenceDoc  String?
  notes         String?
  createdById   String
  createdAt     DateTime @default(now())
  product       Product  @relation(fields: [productId], references: [id])
  batch         Batch?   @relation(fields: [batchId], references: [id])
  createdBy     User     @relation(fields: [createdById], references: [id])
}

model StockExit {
  id            String   @id @default(cuid())
  exitDate      DateTime
  productId     String
  batchId       String?
  quantity      Int
  hospitalId    String
  noteId        String?
  notes         String?
  createdById   String
  createdAt     DateTime @default(now())
  product       Product      @relation(fields: [productId], references: [id])
  batch         Batch?       @relation(fields: [batchId], references: [id])
  hospital      Hospital     @relation(fields: [hospitalId], references: [id])
  note          DeliveryNote? @relation(fields: [noteId], references: [id])
  createdBy     User         @relation(fields: [createdById], references: [id])
}

model AnnualAllocation {
  id            String   @id @default(cuid())
  year          Int
  hospitalId    String
  category      Category
  annualBudget  Int
  q1Consumed    Int      @default(0)
  q2Consumed    Int      @default(0)
  q3Consumed    Int      @default(0)
  q4Consumed    Int      @default(0)
  hospital      Hospital @relation(fields: [hospitalId], references: [id])
  @@unique([year, hospitalId, category])
}

model DeliveryNote {
  id            String    @id @default(cuid())
  noteNumber    String    @unique
  hospitalId    String
  quarter       Int
  year          Int
  status        NoteStatus @default(BROUILLON)
  pdfUrl        String?
  deliveredAt   DateTime?
  receivedBy    String?
  receivedAt    DateTime?
  createdById   String
  createdAt     DateTime  @default(now())
  hospital      Hospital   @relation(fields: [hospitalId], references: [id])
  exits         StockExit[]
  createdBy     User       @relation(fields: [createdById], references: [id])
}

enum NoteStatus {
  BROUILLON
  IMPRIME
  LIVRE
  VALIDE
}

model BirthKit {
  id            String     @id @default(cuid())
  kitType       KitType
  batchNumber   String
  assembledAt   DateTime   @default(now())
  assembledById String
  isComplete    Boolean    @default(false)
  isDistributed Boolean    @default(false)
  components    KitComponent[]
}

enum KitType {
  NORMAL
  EPISIOTOMIE
}

model KitComponent {
  id          String   @id @default(cuid())
  kitId       String
  productName String
  quantity    Int
  isVerified  Boolean  @default(false)
  kit         BirthKit @relation(fields: [kitId], references: [id])
}

model ActivityLog {
  id          String   @id @default(cuid())
  timestamp   DateTime @default(now())
  userId      String?
  action      String
  entity      String
  entityId    String?
  details     Json?
  user        User?    @relation(fields: [userId], references: [id])
  @@index([timestamp])
}
```

Migrer la base de données:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Étape 6: Fichiers de Configuration

### `lib/db.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### `lib/utils.ts`

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-FR');
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}
```

### `middleware.ts` (à la racine)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/',
  '/inventaire(.*)',
  '/produits(.*)',
  '/hopitaux(.*)',
  '/distributions(.*)',
  '/bons-livraison(.*)',
  '/rapports(.*)',
  '/import(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

---

## Étape 7: Layout Principal

### `app/layout.tsx`

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { frFR } from '@clerk/localizations';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pharmacie Provinciale Essaouira',
  description: 'Système de gestion des stocks et distributions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

---

## Étape 8: Page Login

### `app/(auth)/sign-in/[[...sign-in]]/page.tsx`

```tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <SignIn />
    </div>
  );
}
```

---

## Étape 9: Layout Dashboard avec Navigation

### `app/(dashboard)/layout.tsx`

```tsx
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Building2,
  Truck,
  FileText,
  BarChart3,
  Upload,
} from 'lucide-react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/inventaire', icon: Package, label: 'Inventaire' },
  { href: '/produits', icon: Package, label: 'Produits' },
  { href: '/hopitaux', icon: Building2, label: 'Hôpitaux' },
  { href: '/distributions', icon: Truck, label: 'Distributions' },
  { href: '/bons-livraison', icon: FileText, label: 'Bons Livraison' },
  { href: '/rapports', icon: BarChart3, label: 'Rapports' },
  { href: '/import', icon: Upload, label: 'Import' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-lg font-bold">Pharmacie Provinciale</h1>
          <p className="text-sm text-slate-400">Essaouira</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 bg-slate-50 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

---

## Étape 10: Démarrage

```bash
# Lancer en mode développement
npm run dev

# Ouvrir http://localhost:3000
```

---

## Configuration Clerk

1. Aller sur https://dashboard.clerk.com
2. Créer une application
3. Copier les clés dans `.env.local`
4. Créer les utilisateurs dans le dashboard Clerk

---

## Commandes Utiles

```bash
# Reset database
npx prisma migrate reset

# View database
npx prisma studio

# Generate client after schema change
npx prisma generate

# Create migration
npx prisma migrate dev --name nom_migration

# Build for production
npm run build

# Start production
npm start
```

---

## Structure Finale du Projet

```
my-app/
├── app/
│   ├── (auth)/
│   │   └── sign-in/
│   │       └── [[...sign-in]]/
│   │           └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── inventaire/
│   │   ├── produits/
│   │   ├── hopitaux/
│   │   ├── distributions/
│   │   ├── bons-livraison/
│   │   ├── rapports/
│   │   └── import/
│   ├── api/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── ui/           # shadcn components
├── lib/
│   ├── db.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── public/
├── .env.local
├── middleware.ts
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Dépannage

### Erreur: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Erreur de connexion MySQL
Vérifier que MySQL est démarré:
```bash
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Erreur Clerk
Vérifier les clés dans `.env.local` et redémarrer le serveur.

---

*Guide créé pour Pharmacie Provinciale Essaouira*
