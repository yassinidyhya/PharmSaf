/**
 * Stateful In-Memory Mock Data Store for Pharmacie Provinciale Essaouira
 */

export interface ProductMock {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  packaging?: string | null;
  price?: number | null;
  minStock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HospitalMock {
  id: string;
  code: string;
  name: string;
  type: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  bedCapacity?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchMock {
  id: string;
  batchNumber: string;
  productId: string;
  quantity: number;
  expiryDate: Date;
  temperature?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockEntryMock {
  id: string;
  productId: string;
  batchId?: string | null;
  quantity: number;
  referenceDoc?: string | null;
  notes?: string | null;
  entryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockExitMock {
  id: string;
  productId: string;
  batchId?: string | null;
  hospitalId: string;
  quantity: number;
  quarter: number;
  year: number;
  notes?: string | null;
  exitDate: Date;
  deliveryNoteId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnualAllocationMock {
  id: string;
  hospitalId: string;
  category: string;
  year: number;
  budget: number;
  q1Consumed: number;
  q2Consumed: number;
  q3Consumed: number;
  q4Consumed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryNoteMock {
  id: string;
  noteNumber: string;
  hospitalId: string;
  quarter: number;
  year: number;
  status: string;
  totalAmount?: number | null;
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryNoteItemMock {
  id: string;
  deliveryNoteId: string;
  batchId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

export interface BirthKitMock {
  id: string;
  kitNumber: string;
  kitType: string;
  isComplete: boolean;
  isDistributed: boolean;
  distributedAt?: Date | null;
  hospitalId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface KitComponentMock {
  id: string;
  kitId: string;
  productId: string;
  quantity: number;
  isPresent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLogMock {
  id: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  description?: string | null;
  metadata?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMock {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Initial Data Generator
function generateInitialMockStore() {
  const now = new Date();
  
  const products: ProductMock[] = [
    { id: "prd-1", code: "PRD-0001", name: "Paracétamol 500mg", category: "MEDICAMENT", unit: "comprimé", packaging: "BOITE DE 100", price: 25.50, minStock: 1000, isActive: true, createdAt: now, updatedAt: now },
    { id: "prd-2", code: "PRD-0002", name: "Paracétamol 1000mg", category: "MEDICAMENT", unit: "comprimé", packaging: "BOITE DE 50", price: 35.00, minStock: 500, isActive: true, createdAt: now, updatedAt: now },
    { id: "prd-3", code: "PRD-0003", name: "Ibuprofène 400mg", category: "MEDICAMENT", unit: "comprimé", packaging: "BOITE DE 30", price: 28.75, minStock: 800, isActive: true, createdAt: now, updatedAt: now },
    { id: "prd-4", code: "PRD-0004", name: "Amoxicilline 500mg", category: "MEDICAMENT", unit: "gélule", packaging: "BOITE DE 24", price: 45.50, minStock: 400, isActive: true, createdAt: now, updatedAt: now },
    { id: "prd-5", code: "PRD-0005", name: "Oméprazole 20mg", category: "MEDICAMENT", unit: "gélule", packaging: "BOITE DE 28", price: 42.00, minStock: 350, isActive: true, createdAt: now, updatedAt: now },
    { id: "prd-6", code: "PRD-0006", name: "BCG", category: "VACCIN", unit: "dose", packaging: "FLACON DE 20", price: 1250.00, minStock: 50, isActive: true, createdAt: now, updatedAt: now },
    { id: "prd-7", code: "PRD-0007", name: "Pentavalent (DTC-HepB-Hib)", category: "VACCIN", unit: "dose", packaging: "FLACON DE 10", price: 1850.00, minStock: 40, isActive: true, createdAt: now, updatedAt: now },
    { id: "prd-8", code: "PRD-0008", name: "Insuline humaine semi lente mélange 30/70 fl 100UI/ml", category: "INSULINE", unit: "flacon", packaging: "BOITE DE 1", price: 18.75, minStock: 100, isActive: true, createdAt: now, updatedAt: now },
    { id: "prd-9", code: "PRD-0009", name: "Insuline humaine semi lente simple fl 100UI/ml", category: "INSULINE", unit: "flacon", packaging: "BOITE DE 1", price: 19.00, minStock: 80, isActive: true, createdAt: now, updatedAt: now },
    { id: "prd-10", code: "PRD-0010", name: "Insuline rapide fl 100 ui humaine", category: "INSULINE", unit: "flacon", packaging: "BOITE DE 1", price: 19.60, minStock: 80, isActive: true, createdAt: now, updatedAt: now },
    { id: "prd-11", code: "PRD-0011", name: "Test Paludisme (TDR)", category: "REACTIF", unit: "test", packaging: "BOITE DE 25", price: 350.00, minStock: 200, isActive: true, createdAt: now, updatedAt: now },
    { id: "prd-12", code: "PRD-0012", name: "Test VIH (Determine)", category: "REACTIF", unit: "test", packaging: "BOITE DE 100", price: 1850.00, minStock: 50, isActive: true, createdAt: now, updatedAt: now },
    { id: "prd-13", code: "PRD-0013", name: "Seringue 5ml", category: "CONSOMMABLE", unit: "unité", packaging: "BOITE DE 100", price: 120.00, minStock: 500, isActive: true, createdAt: now, updatedAt: now },
    { id: "prd-14", code: "PRD-0014", name: "Gants chirurgicaux (L)", category: "CONSOMMABLE", unit: "paire", packaging: "BOITE DE 50", price: 280.00, minStock: 300, isActive: true, createdAt: now, updatedAt: now },
    { id: "prd-15", code: "PRD-0015", name: "Tensiomètre manuel", category: "PETIT_MATERIEL", unit: "unité", packaging: "BOITE DE 1", price: 850.00, minStock: 20, isActive: true, createdAt: now, updatedAt: now },
  ];

  const hospitals: HospitalMock[] = [
    { id: "hosp-1", code: "CH-ESS", name: "Centre Hospitalier Provincial Essaouira", type: "CENTRE_HOSPITALIER", address: "Route de Marrakech, Essaouira", phone: "0524-47-12-34", email: "ch.essaouira@sante.gov.ma", bedCapacity: 150, isActive: true, createdAt: now, updatedAt: now },
    { id: "hosp-2", code: "HP-ESS", name: "Hôpital Provincial Essaouira", type: "HOPITAL_PROVINCIAL", address: "Avenue Mohammed V, Essaouira", phone: "0524-47-56-78", email: "hp.essaouira@sante.gov.ma", bedCapacity: 200, isActive: true, createdAt: now, updatedAt: now },
    { id: "hosp-3", code: "CS-TAM", name: "Centre de Santé Tamanar", type: "CENTRE_SANTE", address: "Tamanar, Province Essaouira", phone: "0524-47-90-12", email: "cs.tamanar@sante.gov.ma", bedCapacity: 20, isActive: true, createdAt: now, updatedAt: now },
    { id: "hosp-4", code: "CS-SID", name: "Centre de Santé Sidi Kaouki", type: "CENTRE_SANTE", address: "Sidi Kaouki, Province Essaouira", phone: "0524-47-34-56", email: "cs.sidikaouki@sante.gov.ma", bedCapacity: 10, isActive: true, createdAt: now, updatedAt: now },
    { id: "hosp-5", code: "CS-HAD", name: "Centre de Santé Had Draa", type: "CENTRE_SANTE", address: "Had Draa, Province Essaouira", phone: "0524-47-78-90", email: "cs.haddraa@sante.gov.ma", bedCapacity: 15, isActive: true, createdAt: now, updatedAt: now },
  ];

  const batches: BatchMock[] = [
    { id: "batch-1", batchNumber: "LOT-0001-01", productId: "prd-1", quantity: 850, expiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000), temperature: null, createdAt: now, updatedAt: now },
    { id: "batch-2", batchNumber: "LOT-0001-02", productId: "prd-1", quantity: 400, expiryDate: new Date(Date.now() + 45 * 24 * 3600 * 1000), temperature: null, createdAt: now, updatedAt: now },
    { id: "batch-3", batchNumber: "LOT-0002-01", productId: "prd-2", quantity: 600, expiryDate: new Date(Date.now() + 300 * 24 * 3600 * 1000), temperature: null, createdAt: now, updatedAt: now },
    { id: "batch-4", batchNumber: "LOT-0006-01", productId: "prd-6", quantity: 150, expiryDate: new Date(Date.now() + 90 * 24 * 3600 * 1000), temperature: "2-8°C", createdAt: now, updatedAt: now },
    { id: "batch-5", batchNumber: "LOT-0008-01", productId: "prd-8", quantity: 250, expiryDate: new Date(Date.now() + 60 * 24 * 3600 * 1000), temperature: "2-8°C", createdAt: now, updatedAt: now },
    { id: "batch-6", batchNumber: "LOT-0009-01", productId: "prd-9", quantity: 180, expiryDate: new Date(Date.now() + 25 * 24 * 3600 * 1000), temperature: "2-8°C", createdAt: now, updatedAt: now },
    { id: "batch-7", batchNumber: "LOT-0010-01", productId: "prd-10", quantity: 120, expiryDate: new Date(Date.now() + 120 * 24 * 3600 * 1000), temperature: "2-8°C", createdAt: now, updatedAt: now },
  ];

  const stockEntries: StockEntryMock[] = [
    { id: "entry-1", productId: "prd-1", batchId: "batch-1", quantity: 1000, referenceDoc: "CMD-2026/001", notes: "Entrée initiale stock central", entryDate: new Date(Date.now() - 30 * 24 * 3600 * 1000), createdAt: now, updatedAt: now },
    { id: "entry-2", productId: "prd-8", batchId: "batch-5", quantity: 300, referenceDoc: "CMD-2026/004", notes: "Réception Programme National Diabète", entryDate: new Date(Date.now() - 15 * 24 * 3600 * 1000), createdAt: now, updatedAt: now },
  ];

  const stockExits: StockExitMock[] = [
    { id: "exit-1", productId: "prd-1", batchId: "batch-1", hospitalId: "hosp-1", quantity: 150, quarter: 1, year: 2026, notes: "Dotation T1", exitDate: new Date(Date.now() - 10 * 24 * 3600 * 1000), deliveryNoteId: "note-1", createdAt: now, updatedAt: now },
    { id: "exit-2", productId: "prd-8", batchId: "batch-5", hospitalId: "hosp-2", quantity: 50, quarter: 1, year: 2026, notes: "Distribution Insuline T1", exitDate: new Date(Date.now() - 5 * 24 * 3600 * 1000), deliveryNoteId: "note-2", createdAt: now, updatedAt: now },
  ];

  const deliveryNotes: DeliveryNoteMock[] = [
    { id: "note-1", noteNumber: "BL-2026-001", hospitalId: "hosp-1", quarter: 1, year: 2026, status: "LIVRE", totalAmount: 3825.00, deliveredAt: new Date(Date.now() - 10 * 24 * 3600 * 1000), createdAt: now, updatedAt: now },
    { id: "note-2", noteNumber: "BL-2026-002", hospitalId: "hosp-2", quarter: 1, year: 2026, status: "VALIDE", totalAmount: 937.50, deliveredAt: null, createdAt: now, updatedAt: now },
  ];

  const deliveryNoteItems: DeliveryNoteItemMock[] = [
    { id: "item-1", deliveryNoteId: "note-1", batchId: "batch-1", quantity: 150, unitPrice: 25.50, totalPrice: 3825.00, createdAt: now },
    { id: "item-2", deliveryNoteId: "note-2", batchId: "batch-5", quantity: 50, unitPrice: 18.75, totalPrice: 937.50, createdAt: now },
  ];

  const annualAllocations: AnnualAllocationMock[] = [
    { id: "alloc-1", hospitalId: "hosp-1", category: "MEDICAMENT", year: 2026, budget: 70000, q1Consumed: 18000, q2Consumed: 0, q3Consumed: 0, q4Consumed: 0, createdAt: now, updatedAt: now },
    { id: "alloc-2", hospitalId: "hosp-1", category: "VACCIN", year: 2026, budget: 40000, q1Consumed: 10000, q2Consumed: 0, q3Consumed: 0, q4Consumed: 0, createdAt: now, updatedAt: now },
    { id: "alloc-3", hospitalId: "hosp-1", category: "INSULINE", year: 2026, budget: 20000, q1Consumed: 4500, q2Consumed: 0, q3Consumed: 0, q4Consumed: 0, createdAt: now, updatedAt: now },
    { id: "alloc-4", hospitalId: "hosp-2", category: "MEDICAMENT", year: 2026, budget: 52500, q1Consumed: 12000, q2Consumed: 0, q3Consumed: 0, q4Consumed: 0, createdAt: now, updatedAt: now },
  ];

  const birthKits: BirthKitMock[] = [
    { id: "kit-1", kitNumber: "KIT-2026-0001", kitType: "NORMAL", isComplete: true, isDistributed: false, distributedAt: null, hospitalId: null, createdAt: now, updatedAt: now },
    { id: "kit-2", kitNumber: "KIT-2026-0002", kitType: "EPISIOTOMIE", isComplete: true, isDistributed: true, distributedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000), hospitalId: "hosp-1", createdAt: now, updatedAt: now },
  ];

  const kitComponents: KitComponentMock[] = [
    { id: "comp-1", kitId: "kit-1", productId: "prd-13", quantity: 2, isPresent: true, createdAt: now, updatedAt: now },
    { id: "comp-2", kitId: "kit-1", productId: "prd-14", quantity: 1, isPresent: true, createdAt: now, updatedAt: now },
  ];

  const activityLogs: ActivityLogMock[] = [
    { id: "log-1", userId: "user-demo", action: "CREATE", entityType: "DeliveryNote", entityId: "note-1", description: "Création du bon de livraison BL-2026-001", metadata: JSON.stringify({ hospital: "Centre Hospitalier Provincial Essaouira" }), createdAt: now, updatedAt: now },
  ];

  const users: UserMock[] = [
    { id: "user-demo", clerkId: "user_demo_clerk_id", email: "demo@pharmasaf.ma", firstName: "Pharmacien", lastName: "Essaouira", isActive: true, createdAt: now, updatedAt: now },
  ];

  return {
    product: products,
    hospital: hospitals,
    batch: batches,
    stockEntry: stockEntries,
    stockExit: stockExits,
    annualAllocation: annualAllocations,
    deliveryNote: deliveryNotes,
    deliveryNoteItem: deliveryNoteItems,
    birthKit: birthKits,
    kitComponent: kitComponents,
    activityLog: activityLogs,
    user: users,
  };
}

export const mockStore = generateInitialMockStore();
