# Database Audit Report - Pharmacie Provinciale

**Date:** 2026-02-06  
**Auditor:** AI Full Stack Developer  
**Database:** MySQL 8.x  
**ORM:** Prisma  

---

## Executive Summary

The database implementation is **well-structured** with proper relational design, but has several **optimization opportunities** and **critical fixes needed** for production readiness.

| Category | Status | Score |
|----------|--------|-------|
| Schema Design | ✅ Good | 8/10 |
| Indexing | ⚠️ Needs Improvement | 5/10 |
| Query Patterns | ✅ Good | 7/10 |
| Transaction Safety | ✅ Excellent | 9/10 |
| Connection Management | ⚠️ Needs Configuration | 4/10 |

---

## 1. Schema Analysis

### 1.1 Entity Relationship Diagram

```
User 1:N ActivityLog
User 1:N StockEntry (conceptual, not directly linked)
User 1:N StockExit (conceptual, not directly linked)

Hospital 1:N AnnualAllocation
Hospital 1:N StockExit
Hospital 1:N DeliveryNote

Product 1:N Batch
Product 1:N StockEntry
Product 1:N StockExit
Product 1:N KitComponent

Batch 1:N StockEntry
Batch 1:N StockExit
Batch 1:N DeliveryNoteItem

DeliveryNote 1:N StockExit
DeliveryNote 1:N DeliveryNoteItem

BirthKit 1:N KitComponent
```

### 1.2 Schema Strengths ✅

1. **Proper Relations**: All foreign keys are correctly defined with relations
2. **Cascading Deletes**: Appropriate `onDelete: Cascade` and `onDelete: SetNull` usage
3. **Composite Unique Constraints**: Good use of `@@unique` (e.g., `batchNumber_productId`)
4. **Audit Trail**: ActivityLog model captures all actions
5. **Soft Deletes**: Using `isActive` flags instead of hard deletes
6. **Decimal Precision**: Using `@db.Decimal` for monetary values

### 1.3 Schema Issues ⚠️

| Issue | Severity | Location | Recommendation |
|-------|----------|----------|----------------|
| Missing `@@map` attributes | Low | All models | Add for consistent table naming |
| No indexes on foreign keys | **High** | All FK fields | Add `@@index` for performance |
| `stockEntries` not linked to User | Medium | StockEntry model | Add `createdBy` relation |
| `metadata` as String | Low | ActivityLog | Consider using Json type |
| Missing `updatedAt` on ActivityLog | Low | ActivityLog model | Add for audit completeness |

---

## 2. Index Analysis

### 2.1 Current Indexes

| Table | Index | Type | Status |
|-------|-------|------|--------|
| User | clerkId | Unique | ✅ Good |
| User | email | Unique | ✅ Good |
| Hospital | code | Unique | ✅ Good |
| Product | code | Unique | ✅ Good |
| Batch | batchNumber_productId | Unique | ✅ Good |
| AnnualAllocation | hospitalId_category_year | Unique | ✅ Good |
| DeliveryNote | noteNumber | Unique | ✅ Good |
| BirthKit | kitNumber | Unique | ✅ Good |

### 2.2 Missing Indexes (Critical for Performance)

```prisma
// HIGH PRIORITY - Add these indexes:

model StockEntry {
  // ... fields ...
  @@index([productId])          // Filtering by product
  @@index([batchId])            // Joining with batch
  @@index([entryDate])          // Date range queries
  @@index([createdAt])          // Recent entries
}

model StockExit {
  // ... fields ...
  @@index([productId])          // Filtering by product
  @@index([hospitalId])         // Filtering by hospital
  @@index([batchId])            // Joining with batch
  @@index([exitDate])           // Date range queries
  @@index([year, quarter])      // Quarterly reports
  @@index([deliveryNoteId])     // Joining with delivery note
}

model Batch {
  // ... fields ...
  @@index([productId])          // Joining with product
  @@index([expiryDate])         // Expiry alerts (CRITICAL)
  @@index([quantity])           // Stock availability
}

model DeliveryNote {
  // ... fields ...
  @@index([hospitalId])         // Filtering by hospital
  @@index([year, quarter])      // Quarterly filtering
  @@index([status])             // Status filtering
  @@index([createdAt])          // Recent notes
}

model DeliveryNoteItem {
  // ... fields ...
  @@index([deliveryNoteId])     // Joining with note
  @@index([batchId])            // Joining with batch
}

model ActivityLog {
  // ... fields ...
  @@index([userId])             // User activity lookup
  @@index([createdAt])          // Recent activity
  @@index([action])             // Action type filtering
  @@index([entityType, entityId]) // Entity lookup
}

model AnnualAllocation {
  // ... fields ...
  @@index([hospitalId])         // Hospital budget lookup
  @@index([year])               // Year filtering
}

model KitComponent {
  // ... fields ...
  @@index([kitId])              // Kit lookup
  @@index([productId])          // Product lookup
}
```

---

## 3. Query Pattern Analysis

### 3.1 Strengths ✅

1. **Parallel Queries**: Good use of `Promise.all()` for independent queries
2. **Pagination**: Proper `skip` and `take` usage
3. **Selective Fields**: Using `select` to reduce data transfer
4. **Aggregation**: Proper use of `_sum`, `_count`, `groupBy`
5. **Transactions**: Critical operations use `$transaction`

### 3.2 Issues Found ⚠️

#### Issue 1: N+1 Query Risk (Medium)

**Location**: `app/(dashboard)/actions.ts` - `getCriticalAlerts()`

```typescript
// CURRENT - Inefficient
const products = await prisma.product.findMany({
  where: { isActive: true },
  include: { batches: true },  // Loads ALL batches
});

for (const product of products) {
  // Processing in JavaScript instead of DB
  const totalStock = product.batches.reduce(...)
}
```

**Recommendation**: Use aggregation query instead

```typescript
// OPTIMIZED
const lowStockProducts = await prisma.batch.groupBy({
  by: ['productId'],
  where: {
    product: { isActive: true },
  },
  _sum: { quantity: true },
  having: {
    quantity: {
      _sum: { lte: prisma.product.fields.minStock } // This needs raw query
    }
  }
});
```

#### Issue 2: In-Memory Calculations (Medium)

**Location**: Multiple dashboard queries

Calculating stock values in JavaScript instead of letting the database do it:

```typescript
// CURRENT
const totalStockValue = products.reduce((sum, product) => {
  return sum + product.batches.reduce((batchSum, batch) => 
    batchSum + batch.quantity * product.price, 0);
}, 0);
```

**Recommendation**: Use raw query or calculate incrementally

#### Issue 3: Missing Connection Pool Configuration (HIGH)

**Location**: `lib/db.ts`

```typescript
// CURRENT - No connection pool config
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

**Recommendation**: Add connection pooling for MySQL

```typescript
// OPTIMIZED
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Connection pool configuration
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// In .env - Add connection parameters:
// DATABASE_URL="mysql://root@localhost:3306/pharmacy_db?connection_limit=10&pool_timeout=30"
```

---

## 4. Transaction Safety Analysis

### 4.1 Excellent Transaction Usage ✅

**Location**: `app/(dashboard)/distributions/nouveau/actions.ts`

```typescript
const results = await prisma.$transaction(async (tx) => {
  // 1. Validate FEFO
  // 2. Validate insulin expiry
  // 3. Atomic stock decrement
  // 4. Create delivery note
  // 5. Create stock exits
  // 6. Update allocations
});
```

This is a **gold standard** implementation with:
- Atomic operations
- Validation inside transaction
- Proper error handling
- Stock consistency guaranteed

### 4.2 Missing Transaction Boundaries ⚠️

**Location**: `app/(dashboard)/inventaire/entrees/actions.ts` - `createStockEntry()`

```typescript
// CURRENT - Not atomic
const batch = await prisma.batch.upsert({...});
const entry = await prisma.stockEntry.create({...});
// If entry fails, batch is already updated!
```

**Recommendation**:
```typescript
// Wrap in transaction
const result = await prisma.$transaction(async (tx) => {
  const batch = await tx.batch.upsert({...});
  const entry = await tx.stockEntry.create({...});
  return { batch, entry };
});
```

---

## 5. Security Analysis

### 5.1 SQL Injection Prevention ✅

All queries use Prisma's query builder - no raw SQL injection vulnerabilities found.

### 5.2 Authorization ✅

Good use of `getCurrentUserId()` for audit logging.

### 5.3 Data Exposure ⚠️

Some queries return all fields when only a subset is needed. Use `select` more consistently.

---

## 6. Recommendations Summary

### Critical (Fix Immediately)

1. **Add Database Indexes** - See section 2.2
2. **Configure Connection Pool** - Add to DATABASE_URL: `?connection_limit=10&pool_timeout=30`
3. **Wrap Stock Entry Creation in Transaction**

### High Priority (Fix This Week)

4. **Optimize Dashboard Queries** - Use aggregation instead of loading all data
5. **Add Caching** - Use `revalidatePath` consistently or add React cache()
6. **Add Database Constraints** - Consider adding CHECK constraints for quantities > 0

### Medium Priority (Fix This Month)

7. **Add Missing Relations** - Link StockEntry/StockExit to User
8. **Optimize Batch Expiry Queries** - Add covering index for expiry alerts
9. **Add @@map attributes** - For consistent naming

### Low Priority (Nice to Have)

10. **Use Json type** for ActivityLog metadata
11. **Add soft delete timestamps** for audit trail
12. **Consider read replicas** for reporting queries

---

## 7. Optimized Schema

See `prisma/schema_optimized.prisma` for the complete optimized schema with all indexes and improvements.

---

## 8. Demo Data Strategy

The demo data seed script (`prisma/seed.ts`) will populate:

- 50+ Products across 6 categories
- 10 Hospitals of different types
- 100+ Batches with realistic expiry dates
- 200+ Stock entries
- 50+ Distributions
- 10 Birth kits
- Annual allocations for 2025

All data respects business rules:
- FEFO compliance
- Budget constraints
- Insulin expiry rules
- Stock consistency

---

*End of Audit Report*
