# Pharmacie Provinciale Essaouira
## Plan Technique Simplifié — Dashboard de Gestion

---

## Vue d'Ensemble

Dashboard de gestion des stocks et distributions pour la Pharmacie Provinciale d'Essaouira. Conçu pour être simple, rapide à développer et facile à maintenir.

---

## Stack Technique

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND                                                   │
│  ├── Next.js 15 (App Router)                               │
│  ├── React 19 + TypeScript                                 │
│  ├── Tailwind CSS 4 + shadcn/ui                            │
│  ├── Tremor (dashboard charts)                             │
│  └── TanStack Table (data tables)                          │
├─────────────────────────────────────────────────────────────┤
│  AUTHENTIFICATION                                           │
│  └── Clerk (gestion utilisateurs via dashboard)            │
├─────────────────────────────────────────────────────────────┤
│  BACKEND / API                                              │
│  ├── Next.js API Routes                                    │
│  └── Server Actions                                        │
├─────────────────────────────────────────────────────────────┤
│  BASE DE DONNÉES                                            │
│  ├── MySQL 8                                               │
│  └── Prisma ORM                                            │
├─────────────────────────────────────────────────────────────┤
│  EXCEL                                                      │
│  ├── xlsx (import/export)                                  │
│  └── ExcelJS (génération rapports)                         │
├─────────────────────────────────────────────────────────────┤
│  PDF                                                        │
│  └── @react-pdf/renderer                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Structure de la Base de Données (MySQL + Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ==================== UTILISATEURS ====================
// Gérés par Clerk - on stocke juste le lien
model User {
  id          String   @id // Clerk user ID
  email       String   @unique
  name        String
  phone       String?
  createdAt   DateTime @default(now())
  
  activities  ActivityLog[]
  entries     StockEntry[]
  exits       StockExit[]
  notes       DeliveryNote[]
}

// ==================== HÔPITAUX ====================
model Hospital {
  id            String    @id @default(cuid())
  code          String    @unique // H-001, H-002...
  name          String
  type          String    // HOPITAL, CENTRE_SANTE, UNITE_MOBILE
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

// ==================== PRODUITS ====================
model Product {
  id            String   @id @default(cuid())
  code          String   @unique // Code gouvernemental
  name          String
  category      Category // MEDICAMENT, DISPOSITIF, INSULINE, KIT_NAISSANCE
  description   String?
  unit          String   // boite, flacon, unité...
  packaging     String?  // ex: "BOITE DE 100"
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

// ==================== LOTS ====================
model Batch {
  id            String    @id @default(cuid())
  productId     String
  batchNumber   String
  expiryDate    DateTime?
  receivedAt    DateTime  @default(now())
  initialQty    Int
  remainingQty  Int
  temperature   Float?    // Pour insuline
  
  product       Product   @relation(fields: [productId], references: [id])
  exits         StockExit[]
  
  @@unique([productId, batchNumber])
}

// ==================== ENTRÉES STOCK ====================
model StockEntry {
  id            String   @id @default(cuid())
  entryDate     DateTime
  productId     String
  batchId       String?
  quantity      Int
  referenceDoc  String?  // N° commande gouvernement
  notes         String?
  createdById   String
  createdAt     DateTime @default(now())
  
  product       Product  @relation(fields: [productId], references: [id])
  batch         Batch?   @relation(fields: [batchId], references: [id])
  createdBy     User     @relation(fields: [createdById], references: [id])
}

// ==================== SORTIES STOCK ====================
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

// ==================== ALLOCATION ANNUELLE ====================
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

// ==================== BONS DE LIVRAISON ====================
model DeliveryNote {
  id            String    @id @default(cuid())
  noteNumber    String    @unique // 2025-001, 2025-002...
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

// ==================== KITS NAISSANCE ====================
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

// ==================== LOGS ACTIVITÉ ====================
model ActivityLog {
  id          String   @id @default(cuid())
  timestamp   DateTime @default(now())
  userId      String?
  action      String   // CREER, MODIFIER, SUPPRIMER, IMPRIMER...
  entity      String   // PRODUIT, ENTREE, SORTIE, BON...
  entityId    String?
  details     Json?
  
  user        User?    @relation(fields: [userId], references: [id])
  
  @@index([timestamp])
}
```

---

## Structure des Pages

```
/app
├── layout.tsx                 # Layout principal + ClerkProvider
├── page.tsx                   # Dashboard principal
├── globals.css
│
├── (auth)/
│   └── sign-in/[[...sign-in]]/page.tsx
│
├── dashboard/
│   └── page.tsx               # Redirection vers /
│
├── inventaire/
│   ├── page.tsx               # Vue d'ensemble stock
│   ├── entrees/
│   │   ├── page.tsx           # Liste entrées
│   │   └── nouveau/page.tsx   # Nouvelle entrée
│   ├── sorties/
│   │   ├── page.tsx           # Liste sorties
│   │   └── nouveau/page.tsx   # Nouvelle sortie
│   └── peremption/page.tsx    # Alertes péremption
│
├── produits/
│   ├── page.tsx               # Catalogue produits
│   └── [id]/page.tsx          # Détail produit
│
├── hopitaux/
│   ├── page.tsx               # Liste hôpitaux
│   ├── [id]/
│   │   ├── page.tsx           # Profil hôpital
│   │   └── allocations/page.tsx
│   └── nouveau/page.tsx
│
├── distributions/
│   ├── page.tsx               # Liste distributions
│   ├── nouveau/page.tsx       # Créer distribution
│   └── [id]/page.tsx          # Détail + Bon livraison
│
├── bons-livraison/
│   ├── page.tsx               # Registre des bons
│   └── [id]/
│       ├── page.tsx           # Détail bon
│       └── pdf/page.tsx       # Génération PDF
│
├── rapports/
│   ├── page.tsx               # Dashboard rapports
│   ├── trimestriel/page.tsx
│   ├── annuel/page.tsx
│   └── activite/page.tsx
│
├── import/
│   └── page.tsx               # Import Excel
│
└── api/
    ├── products/route.ts
    ├── stock/route.ts
    ├── hospitals/route.ts
    ├── distributions/route.ts
    └── export/
        ├── excel/route.ts
        └── pdf/route.ts
```

---

## Fonctionnalités Principales

### 1. Dashboard Principal

```
┌─────────────────────────────────────────────────────────────────┐
│  PHARMACIE PROVINCIALE D'ESSAOUIRA                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────┐ │
│  │ Médicaments │  │ Dispositifs │  │  Insuline   │  │  Kits  │ │
│  │             │  │             │  │             │  │        │ │
│  │  45,200     │  │  12,500     │  │    850      │  │  320   │ │
│  │  unités     │  │  unités     │  │   flacons   │  │  kits  │ │
│  │             │  │             │  │             │  │        │ │
│  │ 8 mois      │  │ 5 mois      │  │ 10 mois     │  │ 2 mois │ │
│  │ stock       │  │ stock       │  │ stock       │  │ stock  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────┘ │
│                                                                  │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐│
│  │  ALERTES                    │  │  ACTIVITÉ RÉCENTE           ││
│  │                             │  │                             ││
│  │  ⚠️ Insuline lot EXP-2025   │  │  • Entrée stock - Paracétamol││
│  │     expire dans 30 jours    │  │    il y a 10 min            ││
│  │                             │  │  • Bon livraison #2025-042  ││
│  │  ⚠️ Stock kits critique     │  │    validé - Hôpital Ibn Sina││
│  │     (2 mois restants)       │  │    il y a 1 heure           ││
│  │                             │  │  • Nouveau produit ajouté   ││
│  │  ℹ️ Hôpital X dépassement   │  │    il y a 2 heures          ││
│  │     quota T1                │  │                             ││
│  └─────────────────────────────┘  └─────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  CALENDRIER DISTRIBUTIONS - TRIMESTRE 2 2025               ││
│  │  ┌────────┬────────┬────────┬────────┬────────┐            ││
│  │  │ Avr 15 │ Avr 22 │ Mai 05 │ Mai 12 │ Mai 19 │            ││
│  │  │ ✓ H-A  │ ○ H-B  │ ○ H-C  │ ○ H-D  │ ○ H-E  │            ││
│  │  └────────┴────────┴────────┴────────┴────────┘            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Gestion des Entrées Stock

- Formulaire avec sélection produit (autocomplete)
- Saisie quantité, numéro lot, date péremption
- Vérification température pour insuline
- Upload document référence (optionnel)

### 3. Distribution aux Hôpitaux

- Sélection hôpital
- Affichage budget restant par catégorie
- Ajout produits avec vérification stock
- Alertes si dépassement quota
- Génération automatique bon de livraison

### 4. Bon de Livraison (PDF)

Format officiel avec:
- En-tête Royaume du Maroc / Ministère Santé
- Numérotation 2025-001, 2025-002...
- Liste produits avec lots
- Récapitulatif budget
- Espaces signatures

### 5. Import/Export Excel

**Import:**
- Produits (code, nom, catégorie, prix)
- Entrées stock (produit, quantité, lot, péremption)
- Hôpitaux (code, nom, type, adresse)

**Export:**
- Stock actuel
- Historique entrées/sorties
- Bons de livraison
- Rapport trimestriel
- Rapport annuel

---

## Règles Métier Critiques

| Règle | Implémentation |
|-------|----------------|
| **Bon de livraison obligatoire** | Blocage validation sans bon |
| **Budget annuel respecté** | Vérification avant distribution |
| **Insuline - pas de péremption < 3 mois** | Blocage distribution |
| **Kits complets uniquement** | Checklist validation |
| **FEFO** (First Expired First Out) | Tri lots par date péremption |
| **Tout action loggée** | ActivityLog sur chaque action |

---

## Configuration Environnement

```bash
# .env.local

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/

# Database MySQL
DATABASE_URL="mysql://user:password@localhost:3306/pharmacy_db"

# App
NEXT_PUBLIC_APP_NAME="Pharmacie Provinciale Essaouira"
NEXT_PUBLIC_APP_LOCALE="fr"
```

---

## Dépendances NPM

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@clerk/nextjs": "^6.0.0",
    "@prisma/client": "^6.0.0",
    "prisma": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "@tremor/react": "^4.0.0",
    "@tanstack/react-table": "^8.0.0",
    "xlsx": "^0.18.0",
    "exceljs": "^4.4.0",
    "@react-pdf/renderer": "^4.0.0",
    "date-fns": "^4.0.0",
    "lucide-react": "latest",
    "zod": "^3.0.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "latest"
  }
}
```

---

## Roadmap de Développement (6 Semaines)

### Semaine 1: Setup & Foundation
- [ ] Initialiser projet Next.js + Tailwind + shadcn
- [ ] Configurer Clerk auth
- [ ] Setup MySQL + Prisma schema
- [ ] Créer layout principal + navigation
- [ ] Page login

### Semaine 2: Catalogue & Stock
- [ ] CRUD produits
- [ ] Page entrées stock
- [ ] Page sorties stock
- [ ] Vue stock actuel
- [ ] Alertes péremption

### Semaine 3: Hôpitaux & Allocations
- [ ] CRUD hôpitaux
- [ ] Gestion allocations annuelles
- [ ] Profil hôpital avec historique
- [ ] Budget tracker

### Semaine 4: Distributions
- [ ] Créer distribution workflow
- [ ] Sélection hôpital + produits
- [ ] Vérification budgets
- [ ] Génération bon livraison

### Semaine 5: PDF, Excel & Rapports
- [ ] Template PDF bon livraison
- [ ] Export Excel stock
- [ ] Export Excel historique
- [ ] Import Excel produits
- [ ] Rapports trimestriel/annuel

### Semaine 6: Dashboard & Polish
- [ ] Dashboard avec stats
- [ ] Graphiques consommation
- [ ] Activité logs
- [ ] Tests & corrections
- [ ] Déploiement

---

## Notes de Développement

### Clerk - Gestion Utilisateurs
```typescript
// Les utilisateurs sont créés dans le dashboard Clerk
// Pas besoin de page "créer utilisateur" dans l'app
// Juste récupérer les infos avec useUser()

import { useUser } from "@clerk/nextjs";

export default function Profile() {
  const { user } = useUser();
  return <div>{user?.fullName}</div>;
}
```

### Excel Import Pattern
```typescript
// lib/excel/import.ts
import * as XLSX from 'xlsx';

export function parseProductsExcel(file: File): Promise<ProductImport[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      resolve(json as ProductImport[]);
    };
    reader.readAsBinaryString(file);
  });
}
```

### Excel Export Pattern
```typescript
// app/api/export/excel/route.ts
import ExcelJS from 'exceljs';

export async function GET() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Stock');
  
  worksheet.columns = [
    { header: 'Code', key: 'code' },
    { header: 'Produit', key: 'name' },
    { header: 'Catégorie', key: 'category' },
    { header: 'Stock', key: 'stock' },
  ];
  
  // Add data...
  
  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=stock.xlsx',
    },
  });
}
```

### Server Action Pattern
```typescript
// app/inventaire/entrees/actions.ts
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createStockEntry(data: EntryFormData) {
  const entry = await prisma.stockEntry.create({
    data: {
      entryDate: new Date(data.entryDate),
      productId: data.productId,
      quantity: data.quantity,
      referenceDoc: data.referenceDoc,
      createdById: data.userId,
      // ... batch if provided
    },
  });
  
  // Log activity
  await prisma.activityLog.create({
    data: {
      action: 'CREER',
      entity: 'ENTREE',
      entityId: entry.id,
      userId: data.userId,
      details: { quantity: data.quantity },
    },
  });
  
  revalidatePath('/inventaire/entrees');
  return entry;
}
```

---

## Livrables

1. **Application web** fonctionnelle
2. **Base de données** MySQL avec données initiales
3. **Guide d'utilisation** (PDF)
4. **Fichier setup** (voir SETUP.md)

---

*Version: 1.0*  
*Date: Février 2026*  
*Langue: Français uniquement*
