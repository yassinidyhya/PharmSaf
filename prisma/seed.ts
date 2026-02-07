/**
 * Database Seed Script - Pharmacie Provinciale Essaouira
 * 
 * This script populates the database with realistic demo data for:
 * - Products (medications, vaccines, consumables, etc.)
 * - Hospitals (CH, CS, HP)
 * - Batches with expiry dates
 * - Stock entries
 * - Distributions
 * - Birth kits
 * - Annual allocations
 */

import { PrismaClient, Category, HospitalType, NoteStatus, ActionType } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== DEMO DATA CONFIGURATION ====================

const DEMO_CONFIG = {
  products: { count: 60 },
  hospitals: { count: 10 },
  batchesPerProduct: { min: 1, max: 4 },
  entriesPerBatch: { min: 1, max: 3 },
  distributions: { count: 30 },
  birthKits: { count: 15 },
  year: new Date().getFullYear(), // Use current year
};

// ==================== PRODUCT DATA ====================

const PRODUCTS_DATA = [
  // Médicaments
  { name: "Paracétamol 500mg", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 100", price: 25.50, minStock: 1000 },
  { name: "Paracétamol 1000mg", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 50", price: 35.00, minStock: 500 },
  { name: "Ibuprofène 400mg", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 30", price: 28.75, minStock: 800 },
  { name: "Ibuprofène 600mg", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 30", price: 32.00, minStock: 600 },
  { name: "Amoxicilline 500mg", category: Category.MEDICAMENT, unit: "gélule", packaging: "BOITE DE 24", price: 45.50, minStock: 400 },
  { name: "Amoxicilline 1g", category: Category.MEDICAMENT, unit: "gélule", packaging: "BOITE DE 14", price: 55.00, minStock: 300 },
  { name: "Oméprazole 20mg", category: Category.MEDICAMENT, unit: "gélule", packaging: "BOITE DE 28", price: 42.00, minStock: 350 },
  { name: "Métronidazole 250mg", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 20", price: 38.50, minStock: 400 },
  { name: "Diclofénac 50mg", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 30", price: 29.00, minStock: 500 },
  { name: "Artéméther-Luméfantrine 20/120mg", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 24", price: 85.00, minStock: 600 },
  { name: "Artésunate 60mg", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 12", price: 120.00, minStock: 200 },
  { name: "Quinine 300mg", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 100", price: 95.00, minStock: 150 },
  { name: "Fer + Acide Folique", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 90", price: 35.50, minStock: 800 },
  { name: "Sulfadoxine-Pyriméthamine 500/25mg", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 3", price: 15.00, minStock: 1000 },
  { name: "Vitamine A 200000 UI", category: Category.MEDICAMENT, unit: "gélule", packaging: "BOITE DE 50", price: 42.00, minStock: 400 },
  { name: "Zinc 20mg", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 100", price: 55.00, minStock: 500 },
  { name: "ORS (Sels de réhydratation)", category: Category.MEDICAMENT, unit: "sachet", packaging: "BOITE DE 50", price: 28.00, minStock: 1000 },
  { name: "Glucoses 5% 500ml", category: Category.MEDICAMENT, unit: "flacon", packaging: "CARTON DE 20", price: 450.00, minStock: 100 },
  { name: "NaCl 0.9% 500ml", category: Category.MEDICAMENT, unit: "flacon", packaging: "CARTON DE 20", price: 380.00, minStock: 120 },
  { name: "Ringer Lactate 500ml", category: Category.MEDICAMENT, unit: "flacon", packaging: "CARTON DE 20", price: 520.00, minStock: 80 },
  { name: "Gentamicine 80mg/2ml", category: Category.MEDICAMENT, unit: "ampoule", packaging: "BOITE DE 50", price: 125.00, minStock: 200 },
  { name: "Lidocaïne 2%", category: Category.MEDICAMENT, unit: "ampoule", packaging: "BOITE DE 50", price: 85.00, minStock: 150 },
  { name: "Adrénaline 1mg/ml", category: Category.MEDICAMENT, unit: "ampoule", packaging: "BOITE DE 10", price: 95.00, minStock: 100 },
  { name: "Diazépam 10mg/2ml", category: Category.MEDICAMENT, unit: "ampoule", packaging: "BOITE DE 10", price: 78.00, minStock: 80 },
  { name: "Insuline Glargine 100UI/ml", category: Category.MEDICAMENT, unit: "stylo", packaging: "BOITE DE 5", price: 850.00, minStock: 50 },
  { name: "Insuline Lispro 100UI/ml", category: Category.MEDICAMENT, unit: "stylo", packaging: "BOITE DE 5", price: 920.00, minStock: 40 },
  { name: "Insuline NPH 100UI/ml", category: Category.MEDICAMENT, unit: "flacon", packaging: "BOITE DE 1", price: 180.00, minStock: 60 },
  { name: "Métformine 850mg", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 30", price: 32.00, minStock: 400 },
  { name: "Glibenclamide 5mg", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 30", price: 28.00, minStock: 300 },
  { name: "Salbutamol 4mg", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 100", price: 45.00, minStock: 400 },
  { name: "Prednisone 5mg", category: Category.MEDICAMENT, unit: "comprimé", packaging: "BOITE DE 100", price: 55.00, minStock: 300 },
  
  // Vaccins
  { name: "BCG", category: Category.VACCIN, unit: "dose", packaging: "FLACON DE 20", price: 1250.00, minStock: 50 },
  { name: "Pentavalent (DTC-HepB-Hib)", category: Category.VACCIN, unit: "dose", packaging: "FLACON DE 10", price: 1850.00, minStock: 40 },
  { name: "Polio IPV", category: Category.VACCIN, unit: "dose", packaging: "FLACON DE 10", price: 2100.00, minStock: 30 },
  { name: "Polio bOPV", category: Category.VACCIN, unit: "dose", packaging: "FLACON DE 20", price: 950.00, minStock: 60 },
  { name: "ROR (Rougeole-Oreillons-Rubéole)", category: Category.VACCIN, unit: "dose", packaging: "FLACON DE 10", price: 1650.00, minStock: 35 },
  { name: "Pneumocoque", category: Category.VACCIN, unit: "dose", packaging: "FLACON DE 1", price: 4500.00, minStock: 20 },
  { name: "Rotavirus", category: Category.VACCIN, unit: "dose", packaging: "FLACON DE 1", price: 3200.00, minStock: 25 },
  { name: "Tétanos", category: Category.VACCIN, unit: "dose", packaging: "FLACON DE 10", price: 850.00, minStock: 50 },
  { name: "Fièvre Jaune", category: Category.VACCIN, unit: "dose", packaging: "FLACON DE 10", price: 1450.00, minStock: 30 },
  { name: "Méningite A", category: Category.VACCIN, unit: "dose", packaging: "FLACON DE 10", price: 1200.00, minStock: 40 },
  { name: "COVID-19", category: Category.VACCIN, unit: "dose", packaging: "FLACON DE 10", price: 2800.00, minStock: 25 },
  
  // Réactifs
  { name: "Test Paludisme (TDR)", category: Category.REACTIF, unit: "test", packaging: "BOITE DE 25", price: 350.00, minStock: 200 },
  { name: "Test VIH (Determine)", category: Category.REACTIF, unit: "test", packaging: "BOITE DE 100", price: 1850.00, minStock: 50 },
  { name: "Test Grossesse", category: Category.REACTIF, unit: "test", packaging: "BOITE DE 50", price: 280.00, minStock: 100 },
  { name: "Test Groupe Sanguin", category: Category.REACTIF, unit: "test", packaging: "BOITE DE 100", price: 450.00, minStock: 60 },
  { name: "Bandelettes urinaires", category: Category.REACTIF, unit: "bandelette", packaging: "FLACON DE 100", price: 220.00, minStock: 150 },
  { name: "Glycémie (bandelettes)", category: Category.REACTIF, unit: "bandelette", packaging: "BOITE DE 50", price: 180.00, minStock: 200 },
  { name: "Hémoglobine (HemoCue)", category: Category.REACTIF, unit: "microcuvette", packaging: "BOITE DE 100", price: 650.00, minStock: 80 },
  
  // Consommables
  { name: "Seringue 5ml", category: Category.CONSOMMABLE, unit: "unité", packaging: "BOITE DE 100", price: 120.00, minStock: 500 },
  { name: "Seringue 10ml", category: Category.CONSOMMABLE, unit: "unité", packaging: "BOITE DE 100", price: 150.00, minStock: 400 },
  { name: "Seringue 20ml", category: Category.CONSOMMABLE, unit: "unité", packaging: "BOITE DE 50", price: 180.00, minStock: 200 },
  { name: "Aiguille 21G", category: Category.CONSOMMABLE, unit: "unité", packaging: "BOITE DE 100", price: 85.00, minStock: 600 },
  { name: "Aiguille 23G", category: Category.CONSOMMABLE, unit: "unité", packaging: "BOITE DE 100", price: 85.00, minStock: 600 },
  { name: "Gants chirurgicaux (L)", category: Category.CONSOMMABLE, unit: "paire", packaging: "BOITE DE 50", price: 280.00, minStock: 300 },
  { name: "Gants examen (M)", category: Category.CONSOMMABLE, unit: "unité", packaging: "BOITE DE 100", price: 95.00, minStock: 500 },
  { name: "Masque chirurgical", category: Category.CONSOMMABLE, unit: "unité", packaging: "BOITE DE 50", price: 75.00, minStock: 1000 },
  { name: "Coton hydrophile", category: Category.CONSOMMABLE, unit: "kg", packaging: "SAC DE 1", price: 450.00, minStock: 20 },
  { name: "Compresse stérile 10x10", category: Category.CONSOMMABLE, unit: "unité", packaging: "BOITE DE 100", price: 125.00, minStock: 400 },
  { name: "Spatule en bois", category: Category.CONSOMMABLE, unit: "unité", packaging: "BOITE DE 100", price: 45.00, minStock: 500 },
  { name: "Suture Nylon 3/0", category: Category.CONSOMMABLE, unit: "fil", packaging: "BOITE DE 36", price: 380.00, minStock: 100 },
  { name: "Suture Vicryl 2/0", category: Category.CONSOMMABLE, unit: "fil", packaging: "BOITE DE 36", price: 420.00, minStock: 80 },
  { name: "Catheter IV 18G", category: Category.CONSOMMABLE, unit: "unité", packaging: "BOITE DE 50", price: 280.00, minStock: 200 },
  { name: "Catheter IV 20G", category: Category.CONSOMMABLE, unit: "unité", packaging: "BOITE DE 50", price: 280.00, minStock: 200 },
  
  // Insuline (on-demand, not quarterly planned)
  { name: "Insuline humaine semi lente mélange 30/70 fl 100UI/ml", category: Category.INSULINE, unit: "flacon", packaging: "BOITE DE 1", price: 18.75, minStock: 100 },
  { name: "Insuline humaine semi lente simple fl 100UI/ml", category: Category.INSULINE, unit: "flacon", packaging: "BOITE DE 1", price: 19.00, minStock: 80 },
  { name: "Insuline rapide fl 100 ui humaine", category: Category.INSULINE, unit: "flacon", packaging: "BOITE DE 1", price: 19.60, minStock: 80 },
  
  // Petit matériel
  { name: "Tensiomètre manuel", category: Category.PETIT_MATERIEL, unit: "unité", packaging: "BOITE DE 1", price: 850.00, minStock: 20 },
  { name: "Stéthoscope", category: Category.PETIT_MATERIEL, unit: "unité", packaging: "BOITE DE 1", price: 650.00, minStock: 25 },
  { name: "Thermomètre digital", category: Category.PETIT_MATERIEL, unit: "unité", packaging: "BOITE DE 1", price: 120.00, minStock: 50 },
  { name: "Otoscope", category: Category.PETIT_MATERIEL, unit: "unité", packaging: "BOITE DE 1", price: 1850.00, minStock: 10 },
  { name: "Oxymètre de pouls", category: Category.PETIT_MATERIEL, unit: "unité", packaging: "BOITE DE 1", price: 950.00, minStock: 15 },
  { name: "Glucomètre", category: Category.PETIT_MATERIEL, unit: "unité", packaging: "BOITE DE 1", price: 650.00, minStock: 20 },
  { name: "Défibrillateur", category: Category.PETIT_MATERIEL, unit: "unité", packaging: "CARTON DE 1", price: 45000.00, minStock: 2 },
  { name: "Aspirateur de mucus", category: Category.PETIT_MATERIEL, unit: "unité", packaging: "BOITE DE 1", price: 2850.00, minStock: 5 },
  
  // Matériel de bureau
  { name: "Registre médical", category: Category.MATERIEL_BUREAU, unit: "unité", packaging: "CARTON DE 10", price: 280.00, minStock: 30 },
  { name: "Fiche patient", category: Category.MATERIEL_BUREAU, unit: "unité", packaging: "RAMETTE DE 500", price: 85.00, minStock: 50 },
  { name: "Dossier médical", category: Category.MATERIEL_BUREAU, unit: "unité", packaging: "CARTON DE 50", price: 120.00, minStock: 40 },
  { name: "Stylo", category: Category.MATERIEL_BUREAU, unit: "unité", packaging: "BOITE DE 50", price: 45.00, minStock: 100 },
  { name: "Carnet de vaccination", category: Category.MATERIEL_BUREAU, unit: "unité", packaging: "CARTON DE 100", price: 450.00, minStock: 25 },
];

// ==================== HOSPITAL DATA ====================

const HOSPITALS_DATA = [
  { code: "CH-ESS", name: "Centre Hospitalier Provincial Essaouira", type: HospitalType.CENTRE_HOSPITALIER, address: "Route de Marrakech, Essaouira", phone: "0524-XX-XX-XX", bedCapacity: 150 },
  { code: "HP-ESS", name: "Hôpital Provincial Essaouira", type: HospitalType.HOPITAL_PROVINCIAL, address: "Avenue Mohammed V, Essaouira", phone: "0524-XX-XX-XX", bedCapacity: 200 },
  { code: "CS-TAM", name: "Centre de Santé Tamanar", type: HospitalType.CENTRE_SANTE, address: "Tamanar, Province Essaouira", phone: "0524-XX-XX-XX", bedCapacity: 20 },
  { code: "CS-SID", name: "Centre de Santé Sidi Kaouki", type: HospitalType.CENTRE_SANTE, address: "Sidi Kaouki, Province Essaouira", phone: "0524-XX-XX-XX", bedCapacity: 10 },
  { code: "CS-HAD", name: "Centre de Santé Had Draa", type: HospitalType.CENTRE_SANTE, address: "Had Draa, Province Essaouira", phone: "0524-XX-XX-XX", bedCapacity: 15 },
  { code: "CS-OUA", name: "Centre de Santé Ounagha", type: HospitalType.CENTRE_SANTE, address: "Ounagha, Province Essaouira", phone: "0524-XX-XX-XX", bedCapacity: 12 },
  { code: "CS-SMO", name: "Centre de Santé Smimou", type: HospitalType.CENTRE_SANTE, address: "Smimou, Province Essaouira", phone: "0524-XX-XX-XX", bedCapacity: 10 },
  { code: "CS-AIT", name: "Centre de Santé Ait Daoud", type: HospitalType.CENTRE_SANTE, address: "Ait Daoud, Province Essaouira", phone: "0524-XX-XX-XX", bedCapacity: 8 },
  { code: "CS-ALL", name: "Centre de Santé Allougoum", type: HospitalType.CENTRE_SANTE, address: "Allougoum, Province Essaouira", phone: "0524-XX-XX-XX", bedCapacity: 6 },
  { code: "CS-TAL", name: "Centre de Santé Talmest", type: HospitalType.CENTRE_SANTE, address: "Talmest, Province Essaouira", phone: "0524-XX-XX-XX", bedCapacity: 8 },
];

// ==================== UTILITY FUNCTIONS ====================

function generateCode(prefix: string, index: number): string {
  return `${prefix}-${String(index + 1).padStart(4, '0')}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// ==================== SEED FUNCTIONS ====================

async function seedProducts() {
  console.log('📝 Seeding products...');
  
  const products = [];
  for (let i = 0; i < PRODUCTS_DATA.length; i++) {
    const data = PRODUCTS_DATA[i];
    const product = await prisma.product.create({
      data: {
        code: generateCode('PRD', i),
        ...data,
      },
    });
    products.push(product);
  }
  
  console.log(`✅ Created ${products.length} products`);
  return products;
}

async function seedHospitals() {
  console.log('🏥 Seeding hospitals...');
  
  const hospitals = [];
  for (let i = 0; i < HOSPITALS_DATA.length; i++) {
    const data = HOSPITALS_DATA[i];
    const hospital = await prisma.hospital.create({
      data: data,
    });
    hospitals.push(hospital);
  }
  
  console.log(`✅ Created ${hospitals.length} hospitals`);
  return hospitals;
}

async function seedBatches(products: any[]) {
  console.log('📦 Seeding batches...');
  
  const batches = [];
  const now = new Date();
  
  for (const product of products) {
    const numBatches = randomInt(
      DEMO_CONFIG.batchesPerProduct.min,
      DEMO_CONFIG.batchesPerProduct.max
    );
    
    for (let i = 0; i < numBatches; i++) {
      // Generate expiry dates: 20% critical (< 3 months), 30% warning (3-6 months), 50% good (> 6 months)
      const rand = Math.random();
      let monthsUntilExpiry: number;
      
      if (rand < 0.2) {
        monthsUntilExpiry = randomInt(1, 3); // Critical
      } else if (rand < 0.5) {
        monthsUntilExpiry = randomInt(3, 6); // Warning
      } else {
        monthsUntilExpiry = randomInt(6, 24); // Good
      }
      
      const expiryDate = addMonths(now, monthsUntilExpiry);
      const batchNumber = `LOT-${product.code.split('-')[1]}-${String(i + 1).padStart(2, '0')}`;
      
      const batch = await prisma.batch.create({
        data: {
          batchNumber,
          productId: product.id,
          quantity: randomInt(50, 1000),
          expiryDate,
          temperature: product.category === Category.VACCIN || product.name.toLowerCase().includes('insuline') 
            ? `${randomInt(2, 8)}°C` 
            : null,
        },
      });
      batches.push(batch);
    }
  }
  
  console.log(`✅ Created ${batches.length} batches`);
  return batches;
}

async function seedStockEntries(products: any[], batches: any[]) {
  console.log('📥 Seeding stock entries...');
  
  const entries = [];
  const now = new Date();
  const startDate = addMonths(now, -6); // Last 6 months
  
  for (const batch of batches) {
    const numEntries = randomInt(
      DEMO_CONFIG.entriesPerBatch.min,
      DEMO_CONFIG.entriesPerBatch.max
    );
    
    for (let i = 0; i < numEntries; i++) {
      const entryDate = randomDate(startDate, now);
      
      const entry = await prisma.stockEntry.create({
        data: {
          productId: batch.productId,
          batchId: batch.id,
          quantity: randomInt(50, 500),
          referenceDoc: `CMD-${randomInt(1000, 9999)}/${DEMO_CONFIG.year}`,
          notes: i === 0 ? 'Entrée initiale' : 'Réapprovisionnement',
          entryDate,
        },
      });
      entries.push(entry);
    }
  }
  
  console.log(`✅ Created ${entries.length} stock entries`);
  return entries;
}

async function seedAnnualAllocations(hospitals: any[]) {
  console.log('💰 Seeding annual allocations...');
  
  const allocations = [];
  const categories = Object.values(Category);
  
  for (const hospital of hospitals) {
    for (const category of categories) {
      // Budget based on hospital type
      let baseBudget = 50000;
      if (hospital.type === HospitalType.CENTRE_HOSPITALIER) {
        baseBudget = 200000;
      } else if (hospital.type === HospitalType.HOPITAL_PROVINCIAL) {
        baseBudget = 150000;
      }
      
      // Category weight
      const weights: Record<Category, number> = {
        [Category.MEDICAMENT]: 0.35,
        [Category.VACCIN]: 0.20,
        [Category.INSULINE]: 0.10,
        [Category.REACTIF]: 0.10,
        [Category.CONSOMMABLE]: 0.15,
        [Category.PETIT_MATERIEL]: 0.05,
        [Category.MATERIEL_BUREAU]: 0.05,
      };
      
      const budget = Math.round(baseBudget * weights[category]);
      
      // Simulate quarterly consumption (random consumption pattern)
      const q1Consumed = Math.round(budget * randomInt(15, 25) / 100);
      const q2Consumed = Math.round(budget * randomInt(15, 25) / 100);
      const q3Consumed = Math.round(budget * randomInt(15, 25) / 100);
      const q4Consumed = Math.round(budget * randomInt(15, 25) / 100);
      
      const allocation = await prisma.annualAllocation.create({
        data: {
          hospitalId: hospital.id,
          category,
          year: DEMO_CONFIG.year,
          budget,
          q1Consumed,
          q2Consumed,
          q3Consumed,
          q4Consumed,
        },
      });
      allocations.push(allocation);
    }
  }
  
  console.log(`✅ Created ${allocations.length} annual allocations`);
  return allocations;
}

async function seedDistributions(hospitals: any[], products: any[], batches: any[]) {
  console.log('📤 Seeding distributions...');
  
  const now = new Date();
  const startDate = addMonths(now, -6);
  const distributions = [];
  
  for (let i = 0; i < DEMO_CONFIG.distributions.count; i++) {
    const hospital = hospitals[randomInt(0, hospitals.length - 1)];
    const quarter = randomInt(1, 4);
    const exitDate = randomDate(startDate, now);
    
    // Generate note number
    const noteNumber = `${DEMO_CONFIG.year}-${String(i + 1).padStart(3, '0')}`;
    
    // Create delivery note
    const deliveryNote = await prisma.deliveryNote.create({
      data: {
        noteNumber,
        hospitalId: hospital.id,
        quarter,
        year: DEMO_CONFIG.year,
        status: Math.random() > 0.3 ? NoteStatus.LIVRE : NoteStatus.VALIDE,
        deliveredAt: Math.random() > 0.3 ? exitDate : null,
      },
    });
    
    // Create 1-5 stock exits per distribution
    const numItems = randomInt(1, 5);
    const usedBatches = new Set();
    let totalAmount = 0;
    
    for (let j = 0; j < numItems; j++) {
      // Find a batch with stock that hasn't been used in this distribution
      const availableBatches = batches.filter(b => b.quantity > 0 && !usedBatches.has(b.id));
      if (availableBatches.length === 0) continue;
      
      const batch = availableBatches[randomInt(0, availableBatches.length - 1)];
      usedBatches.add(batch.id);
      
      const quantity = randomInt(10, Math.min(100, batch.quantity));
      const product = products.find(p => p.id === batch.productId);
      const unitPrice = product?.price?.toNumber() || 0;
      const totalPrice = unitPrice * quantity;
      totalAmount += totalPrice;
      
      // Create stock exit
      await prisma.stockExit.create({
        data: {
          productId: batch.productId,
          batchId: batch.id,
          hospitalId: hospital.id,
          quantity,
          quarter,
          year: DEMO_CONFIG.year,
          deliveryNoteId: deliveryNote.id,
          exitDate,
        },
      });
      
      // Create delivery note item
      await prisma.deliveryNoteItem.create({
        data: {
          deliveryNoteId: deliveryNote.id,
          batchId: batch.id,
          quantity,
          unitPrice,
          totalPrice,
        },
      });
      
      // Decrement batch quantity
      await prisma.batch.update({
        where: { id: batch.id },
        data: { quantity: { decrement: quantity } },
      });
    }
    
    // Update delivery note total
    await prisma.deliveryNote.update({
      where: { id: deliveryNote.id },
      data: { totalAmount },
    });
    
    distributions.push(deliveryNote);
  }
  
  console.log(`✅ Created ${distributions.length} distributions`);
  return distributions;
}

async function seedBirthKits(products: any[]) {
  console.log('👶 Seeding birth kits...');
  
  const kits = [];
  const kitTypes = ['NORMAL', 'EPISIOTOMIE'];
  
  // Find relevant products for birth kits
  const kitProducts = products.filter(p => 
    p.name.toLowerCase().includes('gant') ||
    p.name.toLowerCase().includes('compresse') ||
    p.name.toLowerCase().includes('seringue') ||
    p.name.toLowerCase().includes('aiguille') ||
    p.name.toLowerCase().includes('suture') ||
    p.name.toLowerCase().includes('catheter')
  ).slice(0, 8);
  
  for (let i = 0; i < DEMO_CONFIG.birthKits.count; i++) {
    const kitType = kitTypes[randomInt(0, kitTypes.length - 1)];
    const isComplete = Math.random() > 0.2;
    const isDistributed = isComplete && Math.random() > 0.5;
    
    const kit = await prisma.birthKit.create({
      data: {
        kitNumber: `KIT-${DEMO_CONFIG.year}-${String(i + 1).padStart(4, '0')}`,
        kitType,
        isComplete,
        isDistributed,
        distributedAt: isDistributed ? addDays(new Date(), -randomInt(1, 30)) : null,
      },
    });
    
    // Add components
    for (const product of kitProducts) {
      await prisma.kitComponent.create({
        data: {
          kitId: kit.id,
          productId: product.id,
          quantity: randomInt(1, 5),
          isPresent: isComplete || Math.random() > 0.3,
        },
      });
    }
    
    kits.push(kit);
  }
  
  console.log(`✅ Created ${kits.length} birth kits`);
  return kits;
}

async function seedActivityLogs(hospitals: any[], products: any[], deliveryNotes: any[]) {
  console.log('📋 Seeding activity logs...');
  
  const logs = [];
  const actions = [ActionType.CREATE, ActionType.UPDATE, ActionType.PRINT];
  const now = new Date();
  
  // Create some activity logs
  for (let i = 0; i < 50; i++) {
    const action = actions[randomInt(0, actions.length - 1)];
    const entityTypes = ['Product', 'Hospital', 'DeliveryNote', 'StockEntry'];
    const entityType = entityTypes[randomInt(0, entityTypes.length - 1)];
    
    let entityId: string | undefined;
    let description: string;
    
    switch (entityType) {
      case 'Product':
        entityId = products[randomInt(0, products.length - 1)]?.id;
        description = `Produit ${action === ActionType.CREATE ? 'créé' : 'modifié'}`;
        break;
      case 'Hospital':
        entityId = hospitals[randomInt(0, hospitals.length - 1)]?.id;
        description = `Hôpital ${action === ActionType.CREATE ? 'créé' : 'modifié'}`;
        break;
      case 'DeliveryNote':
        entityId = deliveryNotes[randomInt(0, deliveryNotes.length - 1)]?.id;
        description = action === ActionType.PRINT ? 'Bon de livraison imprimé' : 'Bon créé';
        break;
      default:
        description = 'Action système';
    }
    
    const log = await prisma.activityLog.create({
      data: {
        action,
        entityType,
        entityId,
        description,
        metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
        createdAt: addDays(now, -randomInt(0, 90)),
      },
    });
    logs.push(log);
  }
  
  console.log(`✅ Created ${logs.length} activity logs`);
  return logs;
}

// ==================== MAIN SEED FUNCTION ====================

async function main() {
  console.log('🚀 Starting database seed...\n');
  
  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await prisma.deliveryNoteItem.deleteMany();
    await prisma.deliveryNote.deleteMany();
    await prisma.stockExit.deleteMany();
    await prisma.stockEntry.deleteMany();
    await prisma.kitComponent.deleteMany();
    await prisma.birthKit.deleteMany();
    await prisma.annualAllocation.deleteMany();
    await prisma.batch.deleteMany();
    await prisma.product.deleteMany();
    await prisma.hospital.deleteMany();
    await prisma.activityLog.deleteMany();
    console.log('✅ Data cleared\n');
    
    // Seed in correct order (respecting foreign key constraints)
    const products = await seedProducts();
    const hospitals = await seedHospitals();
    const batches = await seedBatches(products);
    await seedStockEntries(products, batches);
    await seedAnnualAllocations(hospitals);
    const deliveryNotes = await seedDistributions(hospitals, products, batches);
    await seedBirthKits(products);
    await seedActivityLogs(hospitals, products, deliveryNotes);
    
    console.log('\n✨ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${products.length} products`);
    console.log(`   - ${hospitals.length} hospitals`);
    console.log(`   - ${batches.length} batches`);
    console.log(`   - ${deliveryNotes.length} distributions`);
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
