/**
 * Insulin-only Seed Script
 * Run: npx tsx prisma/seed-insulin-only.ts
 */

import { PrismaClient, Category } from '@prisma/client';

const prisma = new PrismaClient();

const INSULIN_PRODUCTS = [
  {
    code: "INS-MIXTE-3070",
    name: "Insuline humaine semi lente mélange 30/70 fl 100UI/ml",
    shortName: "Mixte 30/70",
    unit: "flacon",
    price: 18.75,
  },
  {
    code: "INS-SIMPLE",
    name: "Insuline humaine semi lente simple fl 100UI/ml",
    shortName: "Simple",
    unit: "flacon",
    price: 19.00,
  },
  {
    code: "INS-RAPIDE",
    name: "Insuline rapide fl 100 ui humaine",
    shortName: "Rapide",
    unit: "flacon",
    price: 19.60,
  },
];

async function main() {
  console.log('🩸 Seeding insulin products...\n');

  for (const insulin of INSULIN_PRODUCTS) {
    // Check if exists
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { code: insulin.code },
          { name: insulin.name },
        ],
      },
    });

    if (existing) {
      console.log(`✓ ${insulin.shortName}: already exists`);
      continue;
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        code: insulin.code,
        name: insulin.name,
        category: Category.INSULINE,
        unit: insulin.unit,
        price: insulin.price,
        minStock: 50,
        isActive: true,
      },
    });

    console.log(`✓ ${insulin.shortName}: product created`);

    // Create 2 batches with stock
    const batches = [
      {
        batchNumber: `LOT-${insulin.code}-2025-A`,
        quantity: 200,
        expiryDate: new Date("2026-06-15"),
      },
      {
        batchNumber: `LOT-${insulin.code}-2025-B`,
        quantity: 150,
        expiryDate: new Date("2026-09-20"),
      },
    ];

    for (const batchData of batches) {
      const batch = await prisma.batch.create({
        data: {
          batchNumber: batchData.batchNumber,
          productId: product.id,
          quantity: batchData.quantity,
          expiryDate: batchData.expiryDate,
          temperature: "4°C",
        },
      });

      // Create stock entry
      await prisma.stockEntry.create({
        data: {
          productId: product.id,
          batchId: batch.id,
          quantity: batchData.quantity,
          referenceDoc: `Commande Gov #2025-${Math.floor(Math.random() * 900) + 100}`,
          entryDate: new Date(),
        },
      });

      console.log(`  - ${batchData.batchNumber}: ${batchData.quantity} units`);
    }
  }

  console.log('\n✅ Insulin seed completed!');
  console.log('Refresh the /insuline page to see the data.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
