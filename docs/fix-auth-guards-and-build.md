# Fix Auth Guards and Build Guide

> **Objective:** Add authentication guards to all server actions and prepare for production build  
> **RBAC Status:** ❌ REMOVED - All authenticated users have equal permissions

---

## 🔐 Part 1: Fix Authentication Guards (Simplified)

### Current State
- `requireAuth()` helper exists in `lib/auth.ts` ✅
- **Zero** server actions currently use it ❌
- ~~RBAC removed~~ - Simple auth only (any logged-in user can do anything)

### Auth Pattern (Simplified)

All server actions should follow this simple pattern:

```typescript
"use server";

import { requireAuth } from "@/lib/auth";

export async function anyServerAction(...) {
  await requireAuth(); // Just checks if user is logged in
  // ... rest of function
}
```

---

### Step 1: Add Guards to Server Actions

#### Pattern to Apply

```typescript
"use server";

import { requireAuth } from "@/lib/auth";

// ALL operations - any authenticated user
export async function getProducts() {
  await requireAuth();
  // ...
}

export async function createProduct(formData: FormData) {
  await requireAuth();
  // ...
}

export async function deleteProduct(id: string) {
  await requireAuth();
  // ...
}
```

---

### Step 2: File-by-File Updates

#### 1. `app/(dashboard)/actions.ts` (Dashboard Stats)

Add to ALL functions:
```typescript
import { requireAuth } from "@/lib/auth";

export async function getDashboardStats(...) {
  try {
    await requireAuth(); // Add this
    // ... rest
  }
}

// Apply to ALL functions:
// - getDashboardStats
// - getStockByCategory
// - getStockMovementTrends
// - getTopHospitals
// - getCriticalAlerts
// - getRecentActivity
// - getDistributionEvents
// - getCategoryStats
// - getBudgetConsumption
// - getProductsForSearch
// - getHospitalsForSearch
// - getCriticalProducts
```

---

#### 2. `app/(dashboard)/produits/actions.ts`

```typescript
import { requireAuth } from "@/lib/auth";

export async function getProducts(...) {
  await requireAuth();
  // ...
}

export async function getProductById(id: string) {
  await requireAuth();
  // ...
}

export async function createProduct(formData: FormData) {
  await requireAuth();
  // ...
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAuth();
  // ...
}

export async function deleteProduct(id: string) {
  await requireAuth();
  // ...
}
```

---

#### 3. `app/(dashboard)/inventaire/entrees/actions.ts`

```typescript
import { requireAuth } from "@/lib/auth";

export async function getStockEntries(...) {
  await requireAuth();
  // ...
}

export async function getStockEntriesStats() {
  await requireAuth();
  // ...
}

export async function createStockEntry(formData: FormData) {
  await requireAuth();
  // ...
}

export async function exportStockEntriesToExcel(...) {
  await requireAuth();
  // ...
}

export async function exportStockEntriesToPDF(...) {
  await requireAuth();
  // ...
}
```

---

#### 4. `app/(dashboard)/inventaire/sorties/actions.ts`

```typescript
import { requireAuth } from "@/lib/auth";

// All functions
export async function getStockExits(...) {
  await requireAuth();
  // ...
}

export async function createStockExit(formData: FormData) {
  await requireAuth();
  // ...
}
```

---

#### 5. `app/(dashboard)/distributions/actions.ts`

```typescript
import { requireAuth } from "@/lib/auth";

export async function getDistributions(...) {
  await requireAuth();
  // ...
}

export async function getDistributionStats() {
  await requireAuth();
  // ...
}

export async function updateDistributionStatus(...) {
  await requireAuth();
  // ...
}
```

---

#### 6. `app/(dashboard)/distributions/nouveau/actions.ts`

```typescript
import { requireAuth } from "@/lib/auth";

export async function getHospitalsWithBudget(...) {
  await requireAuth();
  // ...
}

export async function createDistribution(formData: FormData) {
  await requireAuth();
  // ...
}
```

---

#### 7. `app/(dashboard)/hopitaux/actions.ts`

```typescript
import { requireAuth } from "@/lib/auth";

export async function getHospitals(...) {
  await requireAuth();
  // ...
}

export async function getHospitalById(id: string) {
  await requireAuth();
  // ...
}

export async function createHospital(formData: FormData) {
  await requireAuth();
  // ...
}

export async function updateHospital(id: string, formData: FormData) {
  await requireAuth();
  // ...
}

export async function deleteHospital(id: string) {
  await requireAuth();
  // ...
}
```

---

#### 8. `app/(dashboard)/bons-livraison/actions.ts`

```typescript
import { requireAuth } from "@/lib/auth";

export async function getDeliveryNotes(...) {
  await requireAuth();
  // ...
}

export async function getDeliveryNoteById(id: string) {
  await requireAuth();
  // ...
}

export async function updateDeliveryNoteStatus(...) {
  await requireAuth();
  // ...
}

export async function printDeliveryNote(id: string) {
  await requireAuth();
  // ...
}
```

---

#### 9. `app/(dashboard)/kits/actions.ts`

```typescript
import { requireAuth } from "@/lib/auth";

export async function getBirthKits(...) {
  await requireAuth();
  // ...
}

export async function getKitById(id: string) {
  await requireAuth();
  // ...
}

export async function createBirthKit(formData: FormData) {
  await requireAuth();
  // ...
}

export async function distributeKit(kitId: string, hospitalId: string) {
  await requireAuth();
  // ...
}
```

---

#### 10. `app/(dashboard)/import/actions.ts`

```typescript
import { requireAuth } from "@/lib/auth";

export async function importProducts(fileBuffer: Buffer) {
  await requireAuth();
  // ...
}

export async function importStockEntries(fileBuffer: Buffer) {
  await requireAuth();
  // ...
}

export async function importHospitals(fileBuffer: Buffer) {
  await requireAuth();
  // ...
}
```

---

#### 11. `app/(dashboard)/rapports/actions.ts`

```typescript
import { requireAuth } from "@/lib/auth";

export async function generateQuarterlyReport(...) {
  await requireAuth();
  // ...
}

export async function generateAnnualReport(...) {
  await requireAuth();
  // ...
}

export async function getActivityLogs(...) {
  await requireAuth();
  // ...
}

export async function exportReportToExcel(...) {
  await requireAuth();
  // ...
}
```

---

## 🔧 Part 2: Fix Other Issues

### Step 1: Fix Insulin Check

**File:** `app/(dashboard)/actions.ts:433`

**Current:**
```typescript
type: batch.product.category === "VACCIN" ? "INSULIN_EXPIRY" : "EXPIRY",
```

**Fixed (using keyword detection):**
```typescript
// Add at top of file with other imports
const INSULIN_KEYWORDS = ["insuline", "insulin", "glargine", "lispro", "aspart", "détemir", "nph"];

// In getCriticalAlerts function:
const isInsulin = INSULIN_KEYWORDS.some(keyword => 
  batch.product.name.toLowerCase().includes(keyword)
);

alerts.push({
  type: isInsulin ? "INSULIN_EXPIRY" : "EXPIRY",
  // ... rest
});
```

---

### Step 3: Fix TypeScript Error

**File:** `components/forms/product-form.tsx:47`

**Check if needs null check:**
```typescript
// If result.data might be undefined:
if (result.data) {
  setCategories(result.data);
}
```

---

## 🏗️ Part 3: Run Build

### Step 1: Clean and Install

```bash
# Clean Prisma client
rm -rf node_modules/.prisma

# Regenerate
npx prisma generate
```

### Step 2: Run Build

```bash
npm run build
```

### Step 3: Fix Any Errors

If errors appear, fix them one by one.

---

## ✅ Verification Checklist

### Auth Guards
- [ ] `app/(dashboard)/actions.ts` - 12 functions have requireAuth
- [ ] `app/(dashboard)/produits/actions.ts` - all functions have requireAuth
- [ ] `app/(dashboard)/inventaire/entrees/actions.ts` - all functions have requireAuth
- [ ] `app/(dashboard)/inventaire/sorties/actions.ts` - all functions have requireAuth
- [ ] `app/(dashboard)/distributions/actions.ts` - all functions have requireAuth
- [ ] `app/(dashboard)/distributions/nouveau/actions.ts` - all functions have requireAuth
- [ ] `app/(dashboard)/hopitaux/actions.ts` - all functions have requireAuth
- [ ] `app/(dashboard)/bons-livraison/actions.ts` - all functions have requireAuth
- [ ] `app/(dashboard)/kits/actions.ts` - all functions have requireAuth
- [ ] `app/(dashboard)/import/actions.ts` - all functions have requireAuth
- [ ] `app/(dashboard)/rapports/actions.ts` - all functions have requireAuth

### Build
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Build completes successfully
- [ ] All routes work

### Configuration
- [ ] ~~middleware.ts exists~~ ✅ `proxy.ts` is correct for Next.js 16
- [ ] Insulin check uses keyword detection

---

## 🚀 Quick Commands

```bash
# Check TypeScript only
npx tsc --noEmit

# Run build
npm run build 2>&1 | head -100

# Check specific file
npx tsc --noEmit components/forms/product-form.tsx
```

---

## 📝 Summary of Changes Needed

| File | Changes |
|------|---------|
| `app/(dashboard)/actions.ts` | Add requireAuth to 12 functions, fix insulin check at line 433 |
| `app/(dashboard)/produits/actions.ts` | Add requireAuth to all functions |
| `app/(dashboard)/inventaire/entrees/actions.ts` | Add requireAuth to all functions |
| `app/(dashboard)/inventaire/sorties/actions.ts` | Add requireAuth to all functions |
| `app/(dashboard)/distributions/actions.ts` | Add requireAuth to all functions |
| `app/(dashboard)/distributions/nouveau/actions.ts` | Add requireAuth to all functions |
| `app/(dashboard)/hopitaux/actions.ts` | Add requireAuth to all functions |
| `app/(dashboard)/bons-livraison/actions.ts` | Add requireAuth to all functions |
| `app/(dashboard)/kits/actions.ts` | Add requireAuth to all functions |
| `app/(dashboard)/import/actions.ts` | Add requireAuth to all functions |
| `app/(dashboard)/rapports/actions.ts` | Add requireAuth to all functions |
| `components/forms/product-form.tsx` | Fix TS error at line 47 |

**Estimated Time:** 30-35 minutes  
**Difficulty:** Low  
**Risk:** Low (simple additive changes)

---

## ⚠️ Important Notes

### Next.js 16 `proxy.ts`
Your `proxy.ts` file is correctly named for Next.js 16. The old `middleware.ts` filename is deprecated in v16.

**Current setup (CORRECT):**
```typescript
// proxy.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, req) => {
  // ...
});

export const config = {
  matcher: [...]
};
```

### RBAC Note

Role-Based Access Control has been removed. All authenticated users have equal permissions:
- View all data
- Create/Edit/Delete products
- Manage inventory
- Create distributions
- Generate reports
- Import data

**To re-enable RBAC later:**
1. Add `role` field back to User model in schema.prisma
2. Add Role enum back to lib/constants.ts
3. Create role checking helpers in lib/auth.ts
4. Update server actions to check roles
