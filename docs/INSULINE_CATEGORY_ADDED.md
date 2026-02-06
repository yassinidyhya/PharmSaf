# INSULINE Category Added

**Date:** February 6, 2026  
**Status:** ✅ Complete

---

## Summary

Added `INSULINE` as a new category to the Pharmacy Dashboard system. This allows proper tracking and management of insulin products with special handling for expiry dates (3-month minimum rule).

---

## Files Modified

### Database
| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added `INSULINE` to Category enum |

### Type Definitions
| File | Change |
|------|--------|
| `lib/types.ts` | Added `INSULINE` to CategoryEnum and CategoryLabels |
| `lib/constants.ts` | Added `INSULINE` to Category enum |

### Insulin Check Fix
| File | Change |
|------|--------|
| `app/(dashboard)/actions.ts:433` | Changed from `VACCIN` to `INSULINE` for insulin expiry check |

### Category Labels & Colors
| File | Change |
|------|--------|
| `app/(dashboard)/inventaire/actions.ts` | Added INSULINE label and color (#ef4444) |
| `app/(dashboard)/inventaire/entrees/actions.ts` | Added INSULINE label to Excel export |
| `app/(dashboard)/inventaire/sorties/actions.ts` | Added INSULINE label to Excel export |
| `app/(dashboard)/rapports/trimestriel/page.tsx` | Added INSULINE label and color (red) |
| `app/(dashboard)/rapports/annuel/page.tsx` | Added INSULINE label and color (red) |
| `app/(dashboard)/hopitaux/[id]/page.tsx` | Added INSULINE label |
| `app/(dashboard)/hopitaux/[id]/allocations/page.tsx` | Added INSULINE label and color (red) |
| `app/(dashboard)/hopitaux/[id]/allocations/page.tsx` | Added INSULINE label and color (red) |
| `app/(dashboard)/produits/[id]/page.tsx` | Added INSULINE color (red) |
| `app/(dashboard)/distributions/page.tsx` | Added INSULINE label and color (red) |
| `app/(dashboard)/distributions/[id]/page.tsx` | Added INSULINE label |
| `app/(dashboard)/distributions/[id]/pdf/page.tsx` | Added INSULINE label |
| `app/(dashboard)/inventaire/peremption/page.tsx` | Added INSULINE label |
| `app/(dashboard)/import/page.tsx` | Added INSULINE to examples |

---

## Category List (7 Categories)

```typescript
enum Category {
  MEDICAMENT      // Blue
  VACCIN          // Green
  INSULINE        // Red (NEW)
  REACTIF         // Purple
  CONSOMMABLE     // Orange
  PETIT_MATERIEL  // Gray
  MATERIEL_BUREAU // Slate
}
```

---

## Next Steps

1. **Run migration** to update database schema:
   ```bash
   npx prisma migrate dev --name add_insuline_category
   ```

2. **Regenerate Prisma client**:
   ```bash
   npx prisma generate
   ```

3. **Update existing products** (if any should be INSULINE):
   ```sql
   UPDATE products SET category = 'INSULINE' WHERE name LIKE '%insuline%';
   ```

---

## Notes

- The insulin expiry check at `app/(dashboard)/actions.ts:433` now correctly checks for `INSULINE` category
- All UI components now display INSULINE with a **red** color scheme for easy identification
- Excel exports include the INSULINE category label
- Import functionality recognizes INSULINE as a valid category
