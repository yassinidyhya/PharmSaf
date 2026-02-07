# Comprehensive File-by-File Security & Code Quality Scan

**Scan Date:** February 7, 2026  
**Scanner:** AI Code Review  
**Project:** Pharmacie Provinciale Essaouira (Next.js 16 + Prisma + Clerk)

---

## Executive Summary

| Category | Findings |
|----------|----------|
| **🔴 Critical Issues** | 4 |
| **🟡 High Priority** | 6 |
| **🟢 Medium Priority** | 8 |
| **📋 Code Quality** | 12 |
| **✅ Validated Patterns** | 6 |

**Total Files Scanned:** 85+ files  
**Server Action Files:** 14 files  
**Total Server Functions:** 66 functions

---

## 🔴 CRITICAL ISSUES (File-by-File)

### 1. ALL Server Actions Missing Authentication Guards

**Files Affected:** 14 files, 66 functions

| File | Functions | Lines | Issue |
|------|-----------|-------|-------|
| `app/(dashboard)/actions.ts` | 12 functions | 89-973 | ❌ No `requireAuth()` call |
| `app/(dashboard)/produits/actions.ts` | 5 functions | 17-235 | ❌ No `requireAuth()` call |
| `app/(dashboard)/inventaire/entrees/actions.ts` | 6 functions | 32-397 | ❌ No `requireAuth()` call |
| `app/(dashboard)/inventaire/sorties/actions.ts` | 7 functions | 41-456 | ❌ No `requireAuth()` call |
| `app/(dashboard)/inventaire/peremption/actions.ts` | 1 function | 11-96 | ❌ No `requireAuth()` call |
| `app/(dashboard)/hopitaux/actions.ts` | 5 functions | 30-192 | ❌ No `requireAuth()` call |
| `app/(dashboard)/hopitaux/[id]/allocations/actions.ts` | 4 functions | 22-157 | ❌ No `requireAuth()` call |
| `app/(dashboard)/kits/actions.ts` | 7 functions | 24-378 | ❌ No `requireAuth()` call |
| `app/(dashboard)/distributions/actions.ts` | 3 functions | 13-136 | ❌ No `requireAuth()` call |
| `app/(dashboard)/distributions/nouveau/actions.ts` | 4 functions | 38-545 | ⚠️ Partial auth check |
| `app/(dashboard)/distributions/[id]/actions.ts` | 2 functions | 5-104 | ❌ No `requireAuth()` call |
| `app/(dashboard)/bons-livraison/actions.ts` | 6 functions | 17-208 | ❌ No `requireAuth()` call |
| `app/(dashboard)/import/actions.ts` | 4 functions | 23-328 | ❌ Uses `auth()` directly, inconsistent |
| `app/(dashboard)/rapports/actions.ts` | 5 functions | 5-279 | ❌ No `requireAuth()` call |
| `app/(dashboard)/insuline/actions.ts` | 5 functions | 97-475 | ❌ No `requireAuth()` call |

**Detailed Analysis:**

**ONLY ONE** function has proper authentication check:
- `createDistribution()` in `app/(dashboard)/distributions/nouveau/actions.ts` (lines 324-327) checks for userId

**ALL OTHER** 65 functions execute database operations without verifying the user is authenticated.

**Security Impact:** CRITICAL - Any unauthenticated user can:
- Create/modify/delete products
- Create stock entries and exits
- Modify hospital data
- Create distributions
- Delete kits
- Import data
- View all reports

---

### 2. Webhook Handler Runtime Error

**File:** `app/api/webhooks/clerk/route.ts`  
**Line:** 126  
**Severity:** CRITICAL

```typescript
create: {
  clerkId: id,
  email: primaryEmail || "",
  firstName: first_name || "",
  lastName: last_name || "",
  role: "USER",  // ❌ FIELD DOES NOT EXIST IN PRISMA SCHEMA!
  isActive: true,
},
```

**Issue:** The webhook handler tries to create a user with a `role` field, but the Prisma schema doesn't have this field.

**Impact:** User creation via webhook will **fail at runtime** with a Prisma validation error.

**Evidence:**
- `prisma/schema.prisma` lines 45-58: User model has NO `role` field
- `lib/types.ts` line 89: Type definition incorrectly includes `role: string`

---

### 3. Type Definition / Schema Mismatch - User Role

**File:** `lib/types.ts`  
**Line:** 89  
**Severity:** CRITICAL

```typescript
export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;  // ❌ This field doesn't exist in Prisma!
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Impact:** TypeScript allows accessing `user.role` which will be `undefined` at runtime, causing potential logic errors.

---

### 4. Webhook Security Bypass

**File:** `app/api/webhooks/clerk/route.ts`  
**Lines:** 44-47  
**Severity:** CRITICAL

```typescript
// For development/testing without actual signature verification
// In production, implement proper HMAC-SHA256 verification
// See: https://docs.svix.com/receiving/verifying-payloads/how
return { valid: true };
```

**Issue:** Webhook signature verification is bypassed. In production, this allows unverified webhook calls.

---

## 🟡 HIGH PRIORITY ISSUES

### 5. Enum Mismatch - NoteStatus

**Files:** 
- `lib/constants.ts` lines 19-24
- `prisma/schema.prisma` lines 28-32

| Source | Values |
|--------|--------|
| `lib/constants.ts` | BROUILLON, **IMPRIME**, LIVRE, VALIDE |
| `prisma/schema.prisma` | BROUILLON, VALIDE, LIVRE |

**Issue:** `IMPRIME` value exists in constants but not in Prisma schema. Using it will cause runtime errors.

---

### 6. Enum Mismatch - ActionType

**Files:**
- `lib/constants.ts` lines 31-39
- `lib/types.ts` lines 27-34
- `prisma/schema.prisma` lines 34-41

| Source | Values |
|--------|--------|
| `lib/constants.ts` | CREER, MODIFIER, SUPPRIMER, IMPRIMER, CONSULTER, LOGIN, LOGOUT (French) |
| `lib/types.ts` | CREATE, UPDATE, DELETE, PRINT, LOGIN, LOGOUT (English) |
| `prisma/schema.prisma` | CREATE, UPDATE, DELETE, PRINT, LOGIN, LOGOUT (English) |

**Issue:** Inconsistent naming between French and English versions causes type confusion.

---

### 7. Duplicate User Type Definitions

**Files:**
- `lib/types.ts` lines 83-93
- `lib/constants.ts` lines 81-87

**Issue:** Two different User interfaces with different structures exist in the codebase.

---

### 8. Missing Database Indexes

**File:** `prisma/schema.prisma`  
**Issue:** No `@@index` declarations found in any model.

**Missing Indexes (Performance Critical):**
```prisma
model Batch {
  @@index([productId])
  @@index([expiryDate])
  @@index([quantity])
}

model StockEntry {
  @@index([productId])
  @@index([entryDate])
  @@index([batchId])
}

model StockExit {
  @@index([productId])
  @@index([hospitalId])
  @@index([exitDate])
  @@index([quarter, year])
  @@index([deliveryNoteId])
}

model AnnualAllocation {
  @@index([hospitalId])
  @@index([year])
}

model ActivityLog {
  @@index([userId])
  @@index([createdAt])
  @@index([action])
}
```

---

### 9. Excel Import Missing INSULINE Category

**File:** `lib/excel/import.ts`  
**Lines:** 96-112

```typescript
function normalizeCategory(value: string): Category | null {
  const mapping: Record<string, Category> = {
    MEDICAMENT: Category.MEDICAMENT,
    MEDICAMENTS: Category.MEDICAMENT,
    MED: Category.MEDICAMENT,
    VACCIN: Category.VACCIN,
    VACCINS: Category.VACCIN,
    REACTIF: Category.REACTIF,
    REACTIFS: Category.REACTIF,
    CONSOMMABLE: Category.CONSOMMABLE,
    CONSOMMABLES: Category.CONSOMMABLE,
    PETIT_MATERIEL: Category.PETIT_MATERIEL,
    MATERIEL_BUREAU: Category.MATERIEL_BUREAU,
    // ❌ INSULINE is missing!
  };
}
```

---

### 10. Inconsistent Authentication Pattern

**File:** `app/(dashboard)/import/actions.ts`  
**Line:** 14

```typescript
import { auth } from "@clerk/nextjs/server";
// Uses auth() directly instead of project's requireAuth() wrapper
const { userId } = await auth();
```

**Issue:** This file uses Clerk's `auth()` directly while other files use `getCurrentUserId()`. Inconsistent pattern bypasses project authentication abstraction.

---

## 🟢 MEDIUM PRIORITY ISSUES

### 11. Missing Error Boundaries

**Files:** No `error.tsx` found in route segments

**Missing in:**
- `app/(dashboard)/distributions/`
- `app/(dashboard)/distributions/nouveau/`
- `app/(dashboard)/bons-livraison/`
- `app/(dashboard)/import/`
- `app/(dashboard)/rapports/`
- `app/(dashboard)/insuline/`

---

### 12. Missing Loading States

**Files:** No `loading.tsx` found in:
- `app/(dashboard)/distributions/`
- `app/(dashboard)/distributions/nouveau/`
- `app/(dashboard)/bons-livraison/`
- `app/(dashboard)/import/`

---

### 13. Date Parsing Edge Cases

**File:** `lib/excel/import.ts`  
**Lines:** 130-162

**Missing formats:**
- DD.MM.YYYY (European dot notation)
- Dates with time components
- Invalid Excel date handling

---

### 14. Race Condition in User Creation

**File:** `lib/auth.ts`  
**Lines:** 13-49

```typescript
// Current pattern (race condition possible):
let user = await prisma.user.findUnique({ where: { clerkId } });
if (!user) {
  user = await prisma.user.create({...}); // Race condition here
}
```

**Issue:** Multiple simultaneous requests could create duplicate users.

---

### 15. Decimal Serialization Duplication

**Pattern Found Throughout Codebase:**
```typescript
price: product.price ? Number(product.price) : null
```

**Files with duplication:**
- `app/(dashboard)/actions.ts` (multiple locations)
- `app/(dashboard)/produits/actions.ts`
- `app/(dashboard)/inventaire/entrees/actions.ts`
- `app/(dashboard)/inventaire/sorties/actions.ts`
- `app/(dashboard)/distributions/nouveau/actions.ts`

**Issue:** Repetitive code, should use a utility function.

---

### 16. Magic Numbers

**File:** `app/(dashboard)/actions.ts`
- Line 125: `30 * 24 * 60 * 60 * 1000` (30 days in ms)
- Line 281: Date calculation logic

**File:** `app/(dashboard)/insuline/actions.ts`
- Line 303: `threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)`

---

### 17. Unused Parameters

**File:** `app/(dashboard)/actions.ts`
```typescript
export async function getTopHospitals(
  limit: number = 5,
  fromDate?: Date,
  toDate?: Date
)
```
- `totalValue` is always 0 (line 381)

---

### 18. Hardcoded Strings

**File:** `app/(dashboard)/produits/actions.ts`
- Line 50: `"INIT-001"` (default batch number)
- Line 63: `"Stock initial"` (initial stock notes)

---

## 📋 CODE QUALITY OBSERVATIONS

### Positive Patterns Found ✅

1. **Transaction Safety**
   - Good use of `prisma.$transaction` in critical paths
   - Found in: kit distribution, stock entries, distribution creation

2. **FEFO Implementation**
   - Correct First Expired First Out logic in `distributeKit()` and `createDistribution()`

3. **Audit Logging**
   - Comprehensive activity logging in `lib/audit-log.ts`

4. **Input Validation**
   - Zod schemas used consistently for form validation

5. **Revalidation**
   - Proper use of `revalidatePath()` after mutations

6. **Error Handling**
   - Try-catch blocks in all server actions

### Areas for Improvement ⚠️

1. **Type Safety**
   - Multiple `any` types used (e.g., `where: any` in queries)
   - Type assertions without validation

2. **Code Duplication**
   - Decimal serialization repeated across files
   - Category labels defined multiple times

3. **Error Messages**
   - Some error messages are generic
   - Inconsistent error response formats

---

## 📊 FILE-BY-FILE BREAKDOWN

### Server Action Files Analysis

| File | Functions | Auth Check | Transaction | Logging | Quality |
|------|-----------|------------|-------------|---------|---------|
| `actions.ts` | 12 | ❌ None | ✅ Yes | ✅ Yes | 🟡 Medium |
| `produits/actions.ts` | 5 | ❌ None | ✅ Yes | ✅ Yes | 🟢 Good |
| `inventaire/entrees/actions.ts` | 6 | ❌ None | ✅ Yes | ✅ Yes | 🟢 Good |
| `inventaire/sorties/actions.ts` | 7 | ❌ None | ✅ Yes | ✅ Yes | 🟢 Good |
| `inventaire/peremption/actions.ts` | 1 | ❌ None | ❌ No | ❌ No | 🟡 Medium |
| `hopitaux/actions.ts` | 5 | ❌ None | ❌ No | ✅ Yes | 🟡 Medium |
| `hopitaux/[id]/allocations/actions.ts` | 4 | ❌ None | ❌ No | ✅ Yes | 🟡 Medium |
| `kits/actions.ts` | 7 | ❌ None | ✅ Yes | ✅ Yes | 🟢 Good |
| `distributions/actions.ts` | 3 | ❌ None | ❌ No | ❌ No | 🟡 Medium |
| `distributions/nouveau/actions.ts` | 4 | ⚠️ Partial | ✅ Yes | ✅ Yes | 🟢 Good |
| `distributions/[id]/actions.ts` | 2 | ❌ None | ✅ Yes | ❌ No | 🟡 Medium |
| `bons-livraison/actions.ts` | 6 | ❌ None | ❌ No | ✅ Yes | 🟡 Medium |
| `import/actions.ts` | 4 | ⚠️ Inconsistent | ❌ No | ✅ Yes | 🟡 Medium |
| `rapports/actions.ts` | 5 | ❌ None | ❌ No | ❌ No | 🟢 Good (read-only) |
| `insuline/actions.ts` | 5 | ❌ None | ⚠️ Partial | ✅ Yes | 🟢 Good |

---

## 🎯 PRIORITY FIXES

### Immediate (Before Production)

1. **Add authentication guards to ALL 66 server functions**
   ```typescript
   export async function functionName(...) {
     await requireAuth(); // Add this line
     // ... rest of function
   }
   ```

2. **Fix webhook role field issue**
   - Option A: Remove `role` from webhook user creation
   - Option B: Add `role` field to Prisma schema

3. **Fix webhook signature verification**
   - Implement proper HMAC-SHA256 verification

4. **Fix enum mismatches**
   - Remove `IMPRIME` from constants OR add to schema
   - Align ActionType enums across files

### High Priority (Post-Launch)

5. Add database indexes for performance
6. Add error boundaries
7. Add missing loading states
8. Standardize authentication pattern

### Medium Priority

9. Create utility function for Decimal serialization
10. Extract magic numbers to constants
11. Add INSULINE to Excel import mapping
12. Improve date parsing robustness

---

## 📈 ESTIMATED FIX EFFORT

| Category | Hours | Files |
|----------|-------|-------|
| Critical (auth guards) | 2-4 | 14 |
| Critical (webhook) | 0.5 | 1 |
| High (enums/types) | 1-2 | 3 |
| High (indexes) | 0.5 | 1 |
| Medium (boundaries) | 2-3 | 4 |
| Medium (quality) | 3-4 | 10+ |
| **Total** | **9-14 hours** | **30+** |

---

## ✅ VERIFICATION CHECKLIST

- [ ] All server actions call `requireAuth()`
- [ ] Webhook creates users without `role` field
- [ ] Webhook signature verification implemented
- [ ] Enums aligned between constants and schema
- [ ] Database indexes added
- [ ] Error boundaries implemented
- [ ] Loading states added
- [ ] Authentication pattern standardized

---

*Report generated from comprehensive file-by-file analysis of 85+ project files.*
