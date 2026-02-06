# Sidebar Navigation Updated

**Date:** February 6, 2026  
**Status:** ✅ Complete

---

## Changes Made

### Menu Items Updated

| Old Name | New Name | URL | Icon |
|----------|----------|-----|------|
| Produits | **Médicaments et DM** | `/produits` | IconPill |
| — | **Insuline** (NEW) | `/produits?category=INSULINE` | IconVaccine |
| Kits Naissance | **Kit d'accouchement** | `/kits` | IconBabyCarriage |
| Hôpitaux | **Centres de santé** | `/hopitaux` | IconBuildingHospital |

---

## New Sidebar Structure

```
📊 Tableau de bord
📦 Inventaire
💊 Médicaments et DM
💉 Insuline
👶 Kit d'accouchement
🏥 Centres de santé
📤 Distributions
🚚 Bons Livraison
─────────────────
📈 Rapports
📥 Import
─────────────────
⚙️ Paramètres
```

---

## Navigation Sections

### Main Navigation (navMain)
1. **Tableau de bord** - Dashboard home
2. **Stock** - Stock overview (was "Inventaire")
3. **Médicaments et DM** - Products (Medications and Medical Devices)
4. **Insuline** - Insulin products (filtered view)
5. **Kit d'accouchement** - Birth kits
6. **Centres de santé** - Hospitals/Health centers
7. **Distributions** - Distribution workflow
8. **Bons Livraison** - Delivery notes

### Tools (navTools)
1. **Rapports** - Reports
2. **Import** - Excel import

### Secondary
1. **Paramètres** - Settings

---

## Special Features

### Insuline Quick Link
The "Insuline" menu item links directly to:
```
/produits?category=INSULINE
```

This filters the products page to show only insulin products for quick access.

**Note:** The products page should be updated to handle the `category` query parameter for filtering.

---

## File Modified

| File | Change |
|------|--------|
| `components/app-sidebar.tsx` | Updated menu labels and structure |

---

## Icons Used

| Menu Item | Icon | Library |
|-----------|------|---------|
| Tableau de bord | IconDashboard | @tabler/icons-react |
| Inventaire | IconPackage | @tabler/icons-react |
| Médicaments et DM | IconPill | @tabler/icons-react |
| Insuline | IconVaccine | @tabler/icons-react |
| Kit d'accouchement | IconBabyCarriage | @tabler/icons-react |
| Centres de santé | IconBuildingHospital | @tabler/icons-react |
| Distributions | IconPackageExport | @tabler/icons-react |
| Bons Livraison | IconTruckDelivery | @tabler/icons-react |
| Rapports | IconReport | @tabler/icons-react |
| Import | IconUpload | @tabler/icons-react |
| Paramètres | IconSettings | @tabler/icons-react |
