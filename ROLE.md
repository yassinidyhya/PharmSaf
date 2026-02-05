# AI Agent Role: Full Stack Developer
## Pharmacie Provinciale Dashboard - Development Guide

---

## Overview

This document defines the role and responsibilities of the **Full Stack AI Agent** when building the Pharmacy Dashboard. The agent handles everything from database design to UI implementation, ensuring consistency and quality across the entire stack.

```
┌─────────────────────────────────────────────────────────────────┐
│                     FULL STACK AI AGENT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    COMPLETE OWNERSHIP                    │    │
│  │                                                          │    │
│  │  DATABASE          API             UI                    │    │
│  │  ─────────        ─────           ───                    │    │
│  │  • Prisma         • Routes        • Pages                │    │
│  │  • MySQL          • Actions       • Components           │    │
│  │  • Schema         • Validation    • Forms                │    │
│  │  • Migrations     • Auth          • Styling              │    │
│  │                                                          │    │
│  │  EXPORTS           STATE           DEPLOY                │    │
│  │  ─────────        ───────          ─────                 │    │
│  │  • Excel          • Hooks          • Build               │    │
│  │  • PDF            • Context        • Config              │    │
│  │  • Reports        • Zustand        • Docker              │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2026 Tech Stack (Latest Best Practices)

### Core Stack
| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | Next.js | 16.x | App Router, Server Components, Turbopack |
| **React** | React | 19.x | UI Library |
| **Language** | TypeScript | 5.8+ | Type safety |
| **Auth** | Clerk | 6.37+ | User management |
| **Database** | MySQL | 8.x | Primary database |
| **ORM** | Prisma | 7.3+ | Rust-free, type-safe queries |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS (CSS-first config) |
| **UI** | shadcn/ui | Latest | Accessible components |
| **Forms** | React Hook Form + Zod | Latest | Validation |
| **Tables** | TanStack Table | 8.21+ | Data tables |
| **Charts** | Tremor | 3.18+ | Dashboard charts |
| **Excel** | ExcelJS | 4.4+ | Export reports |
| **PDF** | @react-pdf/renderer | 4.3+ | Delivery notes |

---

## Project Structure

```
my-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group
│   │   └── sign-in/[[...sign-in]]/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/              # Protected routes group
│   │   ├── layout.tsx            # Sidebar + navigation
│   │   ├── page.tsx              # Dashboard home
│   │   │
│   │   ├── inventaire/
│   │   │   ├── page.tsx          # Stock overview
│   │   │   ├── entrees/
│   │   │   │   ├── page.tsx
│   │   │   │   └── nouveau/
│   │   │   │       └── page.tsx
│   │   │   ├── sorties/
│   │   │   │   └── page.tsx
│   │   │   └── peremption/
│   │   │       └── page.tsx
│   │   │
│   │   ├── produits/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── nouveau/
│   │   │       └── page.tsx
│   │   │
│   │   ├── hopitaux/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── allocations/
│   │   │   │       └── page.tsx
│   │   │   └── nouveau/
│   │   │       └── page.tsx
│   │   │
│   │   ├── distributions/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── nouveau/
│   │   │       └── page.tsx
│   │   │
│   │   ├── bons-livraison/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── pdf/
│   │   │           └── page.tsx
│   │   │
│   │   ├── rapports/
│   │   │   ├── page.tsx
│   │   │   ├── trimestriel/
│   │   │   │   └── page.tsx
│   │   │   └── annuel/
│   │   │       └── page.tsx
│   │   │
│   │   └── import/
│   │       └── page.tsx
│   │
│   ├── api/                      # API routes
│   │   ├── products/
│   │   │   └── route.ts
│   │   ├── stock/
│   │   │   └── route.ts
│   │   ├── hospitals/
│   │   │   └── route.ts
│   │   ├── distributions/
│   │   │   └── route.ts
│   │   └── export/
│   │       ├── excel/
│   │       │   └── route.ts
│   │       └── pdf/
│   │           └── route.ts
│   │
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── loading.tsx               # Global loading
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   └── skeleton.tsx
│   │
│   ├── forms/                    # Form components
│   │   ├── product-form.tsx
│   │   ├── entry-form.tsx
│   │   ├── exit-form.tsx
│   │   ├── hospital-form.tsx
│   │   └── distribution-form.tsx
│   │
│   ├── tables/                   # Data table components
│   │   ├── products-table.tsx
│   │   ├── stock-table.tsx
│   │   ├── hospitals-table.tsx
│   │   └── distributions-table.tsx
│   │
│   ├── cards/                    # Dashboard cards
│   │   ├── stock-card.tsx
│   │   ├── alert-card.tsx
│   │   └── stat-card.tsx
│   │
│   ├── charts/                   # Chart components
│   │   └── consumption-chart.tsx
│   │
│   └── layout/                   # Layout components
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── nav-items.tsx
│
├── hooks/                        # Custom React hooks
│   ├── use-products.ts
│   ├── use-stock.ts
│   ├── use-hospitals.ts
│   ├── use-distributions.ts
│   └── use-user-role.ts
│
├── lib/                          # Utilities & configs
│   ├── db.ts                     # Prisma client
│   ├── utils.ts                  # Helper functions
│   ├── validation.ts             # Zod schemas
│   ├── constants.ts              # App constants
│   ├── roles.ts                  # Role definitions
│   ├── auth-guard.ts             # Auth helpers
│   │
│   └── export/                   # Export utilities
│       ├── excel.ts
│       └── pdf.tsx
│
├── types/                        # TypeScript types
│   └── index.ts
│
├── prisma/                       # Database
│   └── schema.prisma
│
├── public/                       # Static assets
│   └── logo.png
│
├── middleware.ts                 # Clerk middleware
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── package.json
└── .env.local                    # Environment variables
```

---

## Development Patterns

### 1. Database First (Prisma 7)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

```typescript
// lib/db.ts - Prisma 7 Singleton Pattern
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

```prisma
// Complete schema.prisma example

model User {
  id          String   @id
  email       String   @unique
  name        String
  phone       String?
  role        Role     @default(ASSISTANT)
  createdAt   DateTime @default(now()) @map("created_at")
  
  activities  ActivityLog[]
  entries     StockEntry[]
  exits       StockExit[]
  notes       DeliveryNote[]
  
  @@map("users")
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
  isActive      Boolean  @default(true) @map("is_active")
  
  entries       StockEntry[]
  exits         StockExit[]
  batches       Batch[]
  
  @@map("products")
}

// ... more models

enum Role {
  ADMIN
  PHARMACIEN
  ASSISTANT
  GUEST
}

enum Category {
  MEDICAMENT
  DISPOSITIF
  INSULINE
  KIT_NAISSANCE
}
```

### 2. Server Actions Pattern

```typescript
// app/produits/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-guard';
import { createProductSchema } from '@/lib/validation';
import { ROLES } from '@/lib/roles';

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createProduct(
  formData: FormData
): Promise<ActionResult<Product>> {
  try {
    // 1. Check auth
    const user = await requireAuth(ROLES.PHARMACIEN);
    
    // 2. Validate input
    const rawData = Object.fromEntries(formData);
    const validated = createProductSchema.parse(rawData);
    
    // 3. Create in database
    const product = await prisma.product.create({
      data: validated,
    });
    
    // 4. Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.userId,
        action: 'CREER',
        entity: 'PRODUIT',
        entityId: product.id,
        details: { name: product.name },
      },
    });
    
    // 5. Revalidate cache
    revalidatePath('/produits');
    
    return { success: true, data: product };
  } catch (error) {
    console.error('Create product error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<ActionResult<Product>> {
  // Similar pattern...
}

export async function deleteProduct(
  id: string
): Promise<ActionResult<void>> {
  try {
    await requireAuth(ROLES.ADMIN);
    
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    
    revalidatePath('/produits');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
```

### 3. API Routes Pattern

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-guard';

// GET /api/products?search=&category=&page=
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category }),
    };
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);
    
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }
}
```

### 4. Page Component Pattern

```typescript
// app/produits/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { ProductsTable } from '@/components/tables/products-table';
import { ProductForm } from '@/components/forms/product-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Produits | Pharmacie Provinciale',
  description: 'Catalogue des produits pharmaceutiques',
};

async function getProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

function ProductsTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default async function ProductsPage() {
  const products = await getProducts();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground">
            {products.length} produits dans le catalogue
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Ajouter un produit</DialogTitle>
            </DialogHeader>
            <ProductForm />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Table */}
      <Suspense fallback={<ProductsTableSkeleton />}>
        <ProductsTable products={products} />
      </Suspense>
    </div>
  );
}
```

### 5. Form Component Pattern

```typescript
// components/forms/product-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createProduct } from '@/app/produits/actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const formSchema = z.object({
  code: z.string().min(1, 'Code requis'),
  name: z.string().min(1, 'Nom requis'),
  category: z.enum(['MEDICAMENT', 'DISPOSITIF', 'INSULINE', 'KIT_NAISSANCE']),
  unit: z.string().min(1, 'Unité requise'),
  packaging: z.string().optional(),
  price: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function ProductForm() {
  const [isPending, setIsPending] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      category: 'MEDICAMENT',
      unit: '',
      packaging: '',
      price: '',
    },
  });
  
  async function onSubmit(data: FormData) {
    setIsPending(true);
    
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    
    const result = await createProduct(formData);
    
    if (result.success) {
      toast.success('Produit créé avec succès');
      form.reset();
    } else {
      toast.error(result.error || 'Erreur lors de la création');
    }
    
    setIsPending(false);
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input placeholder="PRD-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Paracétamol 500mg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MEDICAMENT">Médicament</SelectItem>
                  <SelectItem value="DISPOSITIF">Dispositif médical</SelectItem>
                  <SelectItem value="INSULINE">Insuline</SelectItem>
                  <SelectItem value="KIT_NAISSANCE">Kit naissance</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unité</FormLabel>
              <FormControl>
                <Input placeholder="boîte, flacon, unité..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="packaging"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conditionnement (optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="BOITE DE 100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix estimé (optionnel)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Création...' : 'Créer le produit'}
        </Button>
      </form>
    </Form>
  );
}
```

### 6. Data Table Pattern

```typescript
// components/tables/products-table.tsx
'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Product } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ProductsTableProps {
  products: Product[];
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
  },
  {
    accessorKey: 'name',
    header: 'Nom',
  },
  {
    accessorKey: 'category',
    header: 'Catégorie',
    cell: ({ row }) => {
      const category = row.getValue('category') as string;
      const labels: Record<string, string> = {
        MEDICAMENT: 'Médicament',
        DISPOSITIF: 'Dispositif',
        INSULINE: 'Insuline',
        KIT_NAISSANCE: 'Kit naissance',
      };
      return <Badge variant="outline">{labels[category]}</Badge>;
    },
  },
  {
    accessorKey: 'unit',
    header: 'Unité',
  },
  {
    accessorKey: 'price',
    header: 'Prix',
    cell: ({ row }) => {
      const price = row.getValue('price') as number | null;
      return price ? `${price.toFixed(2)} DH` : '-';
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/produits/${product.id}`}>
              <Pencil className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="text-red-600">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    },
  },
];

export function ProductsTable({ products }: ProductsTableProps) {
  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Aucun produit trouvé
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

### 7. Excel Export Pattern

```typescript
// lib/export/excel.ts
import ExcelJS from 'exceljs';
import { Product } from '@prisma/client';

export async function generateProductsExcel(products: Product[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Produits');
  
  // Header
  worksheet.columns = [
    { header: 'Code', key: 'code', width: 15 },
    { header: 'Nom', key: 'name', width: 40 },
    { header: 'Catégorie', key: 'category', width: 20 },
    { header: 'Unité', key: 'unit', width: 15 },
    { header: 'Conditionnement', key: 'packaging', width: 20 },
    { header: 'Prix', key: 'price', width: 12 },
  ];
  
  // Style header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  
  // Data
  products.forEach((product) => {
    worksheet.addRow({
      code: product.code,
      name: product.name,
      category: product.category,
      unit: product.unit,
      packaging: product.packaging || '',
      price: product.price?.toNumber() || '',
    });
  });
  
  return workbook.xlsx.writeBuffer() as Promise<Buffer>;
}
```

### 8. PDF Generation Pattern

```typescript
// lib/export/pdf.tsx
'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontSize: 10,
    color: '#666',
  },
  value: {
    fontSize: 11,
  },
  table: {
    marginTop: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    fontSize: 10,
  },
  colProduct: { width: '50%' },
  colQty: { width: '20%', textAlign: 'center' },
  colLot: { width: '30%' },
  signatures: {
    flexDirection: 'row',
    marginTop: 40,
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    marginTop: 30,
    paddingTop: 5,
    fontSize: 10,
  },
});

interface DeliveryNotePDFProps {
  noteNumber: string;
  date: string;
  quarter: number;
  year: number;
  hospitalName: string;
  hospitalAddress?: string;
  products: Array<{
    name: string;
    quantity: number;
    batchNumber?: string;
  }>;
  deliveredBy: string;
}

export function DeliveryNotePDF({
  noteNumber,
  date,
  quarter,
  year,
  hospitalName,
  hospitalAddress,
  products,
  deliveredBy,
}: DeliveryNotePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ROYAUME DU MAROC</Text>
          <Text style={styles.subtitle}>MINISTÈRE DE LA SANTÉ ET DE LA PROTECTION SOCIALE</Text>
          <Text style={styles.subtitle}>DÉLÉGATION PROVINCIALE – ESSAOUIRA</Text>
          <Text style={styles.subtitle}>PHARMACIE PROVINCIALE</Text>
        </View>
        
        {/* Note Title */}
        <Text style={styles.noteTitle}>
          BON DE LIVRAISON N° {noteNumber}
        </Text>
        
        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{date}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Trimestre:</Text>
          <Text style={styles.value}>T{quarter} {year}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Destinataire:</Text>
          <Text style={styles.value}>{hospitalName}</Text>
          {hospitalAddress && <Text style={styles.value}>{hospitalAddress}</Text>}
        </View>
        
        {/* Products Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colProduct}>Produit</Text>
            <Text style={styles.colQty}>Quantité</Text>
            <Text style={styles.colLot}>N° Lot</Text>
          </View>
          
          {products.map((product, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colProduct}>{product.name}</Text>
              <Text style={styles.colQty}>{product.quantity}</Text>
              <Text style={styles.colLot}>{product.batchNumber || 'N/A'}</Text>
            </View>
          ))}
        </View>
        
        {/* Signatures */}
        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Text style={styles.label}>Livré par:</Text>
            <Text style={styles.value}>{deliveredBy}</Text>
            <Text style={styles.signatureLine}>Signature et cachet</Text>
          </View>
          
          <View style={styles.signatureBox}>
            <Text style={styles.label}>Reçu par:</Text>
            <Text style={styles.value}>_________________</Text>
            <Text style={styles.signatureLine}>Nom, qualité, signature et cachet</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
```

---

## Quality Checklist

### Before Committing Code

```
✅ TypeScript - No 'any' types
✅ All forms have validation (Zod)
✅ Error handling in all async operations
✅ Loading states for all data fetching
✅ Toast notifications for user feedback
✅ Revalidation after mutations
✅ Activity logging for important actions
✅ Responsive design (mobile-friendly)
✅ Accessible (proper labels, ARIA)
✅ No console.log in production code
```

### Performance Checklist

```
✅ Use React Server Components where possible
✅ Add 'use client' only when necessary
✅ Use Suspense boundaries for loading states
✅ Implement pagination for large lists
✅ Optimize images with next/image
✅ Minimize client-side JavaScript
```

---

## Development Commands

```bash
# Setup (Next.js 16 + Tailwind 4)
npx shadcn@latest init --yes --template next --base-color slate

# Core Dependencies
npm install @clerk/nextjs@latest @prisma/client@latest prisma@latest
npm install react-hook-form @hookform/resolvers zod date-fns lucide-react

# Feature Dependencies
npm install @tanstack/react-table@latest @tremor/react@latest
npm install exceljs @react-pdf/renderer@latest

# shadcn/ui Components
npx shadcn add button card input label table dialog select tabs badge alert skeleton

# Database (Prisma 7 - Rust-free client)
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio

# Development (Turbopack enabled by default in Next.js 16)
npm run dev

# Production Build
npm run build
npm start
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/

DATABASE_URL="mysql://user:password@localhost:3306/pharmacy_db"

NEXT_PUBLIC_APP_NAME="Pharmacie Provinciale Essaouira"
```

---

## Agent Guidelines

### Phase Transitions
- **NEVER** proceed to a new phase without explicit user permission
- Always ask "Should I proceed to Phase X?" or wait for user instruction
- Complete all checklist items in current phase before asking to proceed

### Communication
- Explain what you're doing before making changes
- Ask for confirmation on significant decisions
- Keep user informed of progress and blockers

---

*Full Stack AI Agent Development Guide - 2026 Edition*
