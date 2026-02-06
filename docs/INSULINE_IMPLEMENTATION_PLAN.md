# Plan d'Implémentation Complète - Gestion de l'Insuline

**Date:** February 6, 2026  
**Status:** En cours d'implémentation  
**Responsable:** Équipe de développement

---

## 📋 Résumé Exécutif

L'insuline nécessite une **gestion spéciale** dans le système car elle ne suit pas les règles classiques de distribution trimestrielle. Ce document définit l'architecture complète pour gérer l'insuline de manière adéquate.

### Spécificités de l'Insuline

| Aspect | Médicaments Standards | Insuline |
|--------|----------------------|----------|
| Distribution | Trimestrielle planifiée | On-demand (immédiate) |
| Budget | Allocation annuelle | Aucune allocation |
| Livraison | Bon de livraison officiel | Distribution directe |
| Fréquence | 4x par an | Tout au long de l'année |
| Demande | Pharmacie planifie | Centre de santé vient chercher |

---

## 🎯 Objectifs

1. **Traçabilité complète** de chaque distribution d'insuline
2. **Pas de blocage** par le système de budget trimestriel
3. **Alertes spécifiques** pour les péremptions d'insuline
4. **Reporting dédié** pour le suivi des stocks et distributions
5. **Workflow simplifié** pour les distributions immédiates

---

## 🏗️ Architecture Proposée

### Option 1: Utiliser le Système de Sortie de Stock (Recommandée)

**Philosophie:** L'insuline est une "sortie de stock" on-demand, pas une "distribution planifiée".

```
┌─────────────────────────────────────────────────────────────┐
│  CENTRE DE SANTÉ                                            │
│  (Besoin urgent d'insuline)                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼ Se déplace à
┌─────────────────────────────────────────────────────────────┐
│  PHARMACIE PROVINCIALE                                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  STOCK → Distribution Insuline                      │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Formulaire simplifié:                      │   │   │
│  │  │  • Centre de santé (sélection)              │   │   │
│  │  │  • Date de distribution                     │   │   │
│  │  │  • Produits insuline uniquement             │   │   │
│  │  │  • Quantités                                │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  RÉSULTAT:                                  │   │   │
│  │  │  • Stock décrémenté immédiatement           │   │   │
│  │  │  • Pas de bon de livraison                  │   │   │
│  │  │  • Pas d'impact budget trimestriel          │   │   │
│  │  │  • Traçabilité complète dans les logs       │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Avantages:**
- ✅ Déjà implémenté (branche `feat/insulin-on-demand`)
- ✅ Simple et rapide
- ✅ Pas de duplication de code
- ✅ Stock géré correctement

**Inconvénients:**
- ❌ Pas de suivi spécifique insuline (mélangé avec autres sorties)
- ❌ Pas de rapport dédié insuline

---

### Option 2: Système Dédié Insuline (Alternative)

Créer un module complet dédié à l'insuline:

```
/insuline
├── page.tsx              # Dashboard insuline
├── distribution/
│   └── page.tsx          # Formulaire distribution
├── historique/
│   └── page.tsx          # Historique distributions
└── rapport/
    └── page.tsx          # Rapports spécifiques
```

**Avantages:**
- ✅ Suivi complet et dédié
- ✅ Rapports spécifiques insuline
- ✅ UI optimisée pour le workflow insuline

**Inconvénients:**
- ❌ Plus complexe à maintenir
- ❌ Duplication de code possible
- ❌ Temps de développement plus long

---

## ✅ Recommandation Finale

**Option 1 (Sortie de Stock)** est recommandée pour:
1. **Simplicité** - Déjà fonctionnel
2. **Maintenabilité** - Un seul système de stock
3. **Rapidité** - Peut être déployé immédiatement

**Améliorations à apporter à l'Option 1:**
1. Ajouter un filtre "Insuline uniquement" dans l'historique des sorties
2. Créer un rapport spécifique insuline
3. Ajouter des statistiques insuline sur le dashboard

---

## 📊 Schéma de Données

### Aucune Modification Requise

Le schéma actuel supporte déjà l'insuline:

```prisma
model StockExit {
  id             String
  productId      String        // Référence au produit insuline
  batchId        String        // Lot spécifique
  hospitalId     String        // Centre de santé
  quantity       Int
  quarter        Int?          // NULL pour insuline (on-demand)
  year           Int?          // NULL pour insuline (on-demand)
  exitDate       DateTime      // Date réelle de distribution
  notes          String?       // Observations
  createdAt      DateTime
}
```

**Note:** `quarter` et `year` peuvent être NULL pour l'insuline.

---

## 🔧 Implémentation Technique

### Étape 1: Mode Insuline dans Sortie de Stock (✅ FAIT)

**Branche:** `feat/insulin-on-demand`

**Modifications:**
- [x] Bouton "Distribution Insuline" sur la page Sortie
- [x] Pré-filtrage des produits (insuline uniquement)
- [x] Masquage des champs Trimestre/Année
- [x] Affichage "Distribution immédiate" dans le résumé

**Fichiers modifiés:**
- `app/(dashboard)/inventaire/sorties/page.tsx`
- `app/(dashboard)/inventaire/sorties/nouveau/page.tsx`
- `components/forms/multi-stock-exit-form.tsx`

---

### Étape 2: Rapport Spécifique Insuline (À FAIRE)

**Objectif:** Créer un rapport dédié pour le suivi des distributions d'insuline.

**Page:** `/rapports/insuline`

**Fonctionnalités:**
- [ ] Liste des distributions d'insuline par période
- [ ] Total distribué par centre de santé
- [ ] Tendance des distributions (graphique)
- [ ] Export Excel/PDF

**Données à afficher:**
```typescript
interface InsulinReport {
  period: string;
  totalDistributions: number;
  totalQuantity: number;
  byHospital: {
    hospitalName: string;
    quantity: number;
    lastDistribution: Date;
  }[];
  byProduct: {
    productName: string;
    quantity: number;
  }[];
}
```

---

### Étape 3: Filtre dans l'Historique des Sorties (À FAIRE)

**Page:** `/inventaire/sorties`

**Ajouter:**
- [ ] Filtre par catégorie (Insuline, Médicaments, etc.)
- [ ] Badge "Insuline" visuel dans la liste
- [ ] Export filtré

---

### Étape 4: Widget Dashboard Insuline (À FAIRE)

**Page:** `/` (Dashboard)

**Ajouter:**
- [ ] Carte "Distributions Insuline ce mois"
- [ ] Alerte "Stock insuline faible"
- [ ] Dernières distributions insuline

---

### Étape 5: Validation Spécifique (OPTIONNEL)

**Règles métier à implémenter:**

1. **Pas de distribution insuline via le workflow Distribution classique**
   - Bloquer l'ajout d'insuline dans les distributions trimestrielles
   - Message: "L'insuline se distribue via le mode 'Distribution Insuline'"

2. **Alerte de péremption spéciale**
   - Actuellement: 3 mois minimum
   - À décider: Garder ou retirer cette règle pour les sorties de stock?

---

## 📱 Interface Utilisateur

### Workflow Utilisateur Final

```
1. Centre de santé arrive à la pharmacie
   │
   ▼
2. Pharmacien ouvre: Stock → Distribution Insuline
   │
   ▼
3. Sélectionne le centre de santé
   │
   ▼
4. Sélectionne le(s) produit(s) insuline
   │
   ▼
5. Valide la distribution
   │
   ▼
6. Stock décrémenté + Enregistrement créé
   │
   ▼
7. Centre de santé repart avec l'insuline
```

### Maquettes

#### Écran 1: Liste des Sorties avec Bouton Insuline
```
┌─────────────────────────────────────────────────────────────┐
│  Sorties de Stock                                    [+]    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [💉 Distribution Insuline]  [+ Nouvelle Sortie]    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Filtre: [Toutes catégories ▼] [Rechercher...]              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Date       │ Produit        │ Qté │ Destination    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 06/02/2026 │ Insuline 30/70 │ 50  │ CS Essaouira   │   │
│  │ 05/02/2026 │ Paracétamol    │ 100 │ CH Essaouira   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### Écran 2: Formulaire Distribution Insuline
```
┌─────────────────────────────────────────────────────────────┐
│  ←  Distribution Insuline                                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ℹ️ Distribution immédiate - Hors planning          │   │
│  │  trimestriel                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Centre de santé: [Sélectionner ▼]                          │
│                                                             │
│  Date: [06/02/2026]                                         │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Produits insuline:                                         │
│                                                             │
│  [Sélectionner produit ▼] [Lot ▼] [Qté] [+ Ajouter]        │
│                                                             │
│  • Insuline 30/70 - Lot: B123 - 50 unités          [🗑️]   │
│  • Insuline Glargine - Lot: C456 - 30 unités       [🗑️]   │
│                                                             │
│                         [Annuler]  [Valider distribution]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 KPIs et Métriques

### À Suivre

| Métrique | Description | Source |
|----------|-------------|--------|
| Distributions/mois | Nombre de distributions insuline | StockExit (category=INSULINE) |
| Quantité distribuée | Total unités par mois | StockExit sum(quantity) |
| Top centres de santé | Centres les plus demandeurs | Group by hospitalId |
| Stock restant | Quantité disponible en pharmacie | Batch sum(quantity) |
| Péremptions proches | Lots expirant dans < 3 mois | Batch (expiryDate) |

---

## 🚨 Points d'Attention

### 1. Stock Négatif
**Risque:** Double distribution simultanée  
**Solution:** Transaction atomique (déjà implémentée)

### 2. Traçabilité
**Exigence:** Savoir qui a distribué quoi à qui  
**Solution:** Audit logs (déjà implémenté)

### 3. Péremption
**Question:** Faut-il bloquer la distribution d'insuline périmée?  
**Recommandation:** Oui, alerter mais permettre avec confirmation

---

## ✅ Checklist de Validation

### Tests Fonctionnels
- [ ] Distribution insuline complète
- [ ] Stock correctement décrémenté
- [ ] Pas d'impact sur le budget trimestriel
- [ ] Audit log créé
- [ ] Export Excel fonctionnel
- [ ] Filtre insuline dans l'historique

### Tests Interface
- [ ] Bouton visible depuis la liste
- [ ] Formulaire simplifié (pas de trimestre)
- [ ] Message explicatif affiché
- [ ] Résumé correct ("Distribution immédiate")

### Tests de Performance
- [ ] Temps de chargement < 2s
- [ ] Transaction atomique fonctionne
- [ ] Pas de blocage concurrent

---

## 📅 Planning

| Phase | Tâche | Durée | Statut |
|-------|-------|-------|--------|
| 1 | Mode insuline dans Sortie | 2h | ✅ Fait |
| 2 | Rapport insuline | 4h | ⏳ À faire |
| 3 | Filtre historique | 2h | ⏳ À faire |
| 4 | Widget dashboard | 3h | ⏳ À faire |
| 5 | Tests et validation | 2h | ⏳ À faire |
| **Total** | | **13h** | |

---

## 📝 Notes

### Questions en suspens

1. **Péremption:** Garder la règle des 3 mois pour les sorties de stock insuline?
   - Réponse recommandée: **OUI** (sécurité patient)

2. **Quantité maximale:** Limiter la quantité distribuée d'un coup?
   - Réponse recommandée: **NON** (laisser le pharmacien décider)

3. **Fréquence:** Limiter les distributions par centre de santé?
   - Réponse recommandée: **NON** (on-demand = besoin réel)

### Décisions à Valider

- [ ] Approbation du workflow par le pharmacien responsable
- [ ] Validation des règles de péremption
- [ ] Confirmation du besoin de rapports spécifiques

---

*Document créé par AI Agent - À valider avec l'équipe métier*
