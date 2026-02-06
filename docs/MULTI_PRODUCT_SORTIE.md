# Multi-Product Stock Exit Implementation

**Date:** February 6, 2026  
**Status:** ✅ Complete

---

## Overview

Converted the Stock Exit (Sortie) page from single-product to **multi-product** workflow.

---

## Changes Made

### Server Actions
**File:** `app/(dashboard)/inventaire/sorties/actions.ts`

- ✅ Added `createMultiStockExit()` - Creates multiple stock exits in a single transaction
- ✅ Added `getHospitals()` - Fetch hospitals for selection
- ✅ Updated `getProductsWithStock()` - Returns products with available batches
- ✅ Kept backward compatibility with existing `getStockExits()` and `getStockExitsStats()`

**New Schema:**
```typescript
const createMultiStockExitSchema = z.object({
  hospitalId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    batchId: z.string(),
    quantity: z.number(),
  })).min(1),
  quarter: z.number(),
  year: z.number(),
  notes: z.string().optional(),
  exitDate: z.string().optional(),
});
```

### New Form Component
**File:** `components/forms/multi-stock-exit-form.tsx`

**Features:**
- ✅ **2-Step Wizard:**
  - Step 1: Select hospital, quarter, year, date, notes
  - Step 2: Add multiple products with FEFO compliance
- ✅ **Dynamic Product Addition:**
  - Select product → Select batch → Set quantity → Add to list
  - Shows FEFO warning if not using oldest batch
- ✅ **Product List Management:**
  - View all selected products
  - Edit quantities inline
  - Remove items
  - Shows total count and total quantity
- ✅ **Transaction Safety:**
  - All products created in single database transaction
  - Atomic: all succeed or all fail

### Updated Page
**File:** `app/(dashboard)/inventaire/sorties/nouveau/page.tsx`

- Uses new `MultiStockExitForm` component
- Fetches products and hospitals server-side

---

## User Workflow

```
1. Click "Nouvelle Sortie"
   │
   ▼
2. Step 1: Select Hospital & Details
   ├─ Choose hospital
   ├─ Set quarter (T1, T2, T3, T4)
   ├─ Set year
   ├─ Set exit date
   └─ Add optional notes
   │
   ▼
3. Step 2: Add Products
   ├─ Select product from dropdown
   ├─ Select batch (sorted by expiry - FEFO)
   ├─ Set quantity
   ├─ Click "Ajouter"
   ├─ (Optional) Add more products
   │
   ▼
4. Review & Submit
   ├─ See list of all selected products
   ├─ Edit quantities if needed
   ├─ Remove items if needed
   └─ Click "Enregistrer les sorties"
   │
   ▼
5. Success → Redirect to list page
```

---

## FEFO Compliance

The form enforces **FEFO (First Expired First Out)**:

1. Batches are sorted by expiry date (oldest first)
2. First batch in list is marked with "FEFO" badge
3. If user selects a newer batch, warning alert appears
4. Warning shows which batch should be used first

---

## Database Transaction

All stock exits are created atomically:

```typescript
await prisma.$transaction(async (tx) => {
  for (const item of items) {
    // 1. Check batch stock
    // 2. Decrement batch quantity
    // 3. Create stock exit record
  }
});
```

**Benefits:**
- No partial updates
- Stock consistency guaranteed
- If one item fails, none are created

---

## Audit Trail

Each stock exit is logged individually:
```typescript
for (const result of results) {
  await logStockExitCreate(
    userId,
    result.exit.id,
    result.product.name,
    result.exit.quantity,
    hospital.name
  );
}
```

---

## Comparison: Old vs New

| Feature | Old (Single) | New (Multi) |
|---------|--------------|-------------|
| Products per exit | 1 | Multiple |
| Form submissions | Multiple | Single |
| Transaction | Per product | All products atomic |
| FEFO check | ✅ Yes | ✅ Yes |
| Audit log | 1 per submit | 1 per product |
| UX | Tedious for many items | Efficient |

---

## Files Modified

| File | Change |
|------|--------|
| `app/(dashboard)/inventaire/sorties/actions.ts` | Added multi-product support |
| `app/(dashboard)/inventaire/sorties/nouveau/page.tsx` | Updated to use new form |
| `components/forms/multi-stock-exit-form.tsx` | **NEW** - Multi-product form |

---

## Backward Compatibility

✅ **Fully backward compatible:**
- Existing `StockExit` records unchanged
- List view (`/inventaire/sorties`) works same as before
- Excel/PDF exports work same as before

---

## Next Steps

1. Test the new multi-product workflow
2. Consider adding:
   - Duplicate detection across different products
   - Bulk quantity editing
   - Save as draft functionality
