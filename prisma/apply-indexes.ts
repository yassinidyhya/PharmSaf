/**
 * Apply Performance Indexes to Database
 * Run with: npx tsx prisma/apply-indexes.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INDEXES = [
  // Batch indexes
  { name: 'idx_batch_expiry_date', sql: 'CREATE INDEX idx_batch_expiry_date ON Batch(expiryDate)' },
  { name: 'idx_batch_quantity', sql: 'CREATE INDEX idx_batch_quantity ON Batch(quantity)' },
  { name: 'idx_batch_product_expiry', sql: 'CREATE INDEX idx_batch_product_expiry ON Batch(productId, expiryDate)' },
  { name: 'idx_batch_product', sql: 'CREATE INDEX idx_batch_product ON Batch(productId)' },
  
  // StockEntry indexes
  { name: 'idx_stockentry_product', sql: 'CREATE INDEX idx_stockentry_product ON StockEntry(productId)' },
  { name: 'idx_stockentry_batch', sql: 'CREATE INDEX idx_stockentry_batch ON StockEntry(batchId)' },
  { name: 'idx_stockentry_entrydate', sql: 'CREATE INDEX idx_stockentry_entrydate ON StockEntry(entryDate)' },
  { name: 'idx_stockentry_created', sql: 'CREATE INDEX idx_stockentry_created ON StockEntry(createdAt)' },
  
  // StockExit indexes
  { name: 'idx_stockexit_product', sql: 'CREATE INDEX idx_stockexit_product ON StockExit(productId)' },
  { name: 'idx_stockexit_hospital', sql: 'CREATE INDEX idx_stockexit_hospital ON StockExit(hospitalId)' },
  { name: 'idx_stockexit_batch', sql: 'CREATE INDEX idx_stockexit_batch ON StockExit(batchId)' },
  { name: 'idx_stockexit_exitdate', sql: 'CREATE INDEX idx_stockexit_exitdate ON StockExit(exitDate)' },
  { name: 'idx_stockexit_year_quarter', sql: 'CREATE INDEX idx_stockexit_year_quarter ON StockExit(year, quarter)' },
  { name: 'idx_stockexit_deliverynote', sql: 'CREATE INDEX idx_stockexit_deliverynote ON StockExit(deliveryNoteId)' },
  
  // DeliveryNote indexes
  { name: 'idx_deliverynote_hospital', sql: 'CREATE INDEX idx_deliverynote_hospital ON DeliveryNote(hospitalId)' },
  { name: 'idx_deliverynote_year_quarter', sql: 'CREATE INDEX idx_deliverynote_year_quarter ON DeliveryNote(year, quarter)' },
  { name: 'idx_deliverynote_status', sql: 'CREATE INDEX idx_deliverynote_status ON DeliveryNote(status)' },
  { name: 'idx_deliverynote_created', sql: 'CREATE INDEX idx_deliverynote_created ON DeliveryNote(createdAt)' },
  
  // ActivityLog indexes
  { name: 'idx_activitylog_user', sql: 'CREATE INDEX idx_activitylog_user ON ActivityLog(userId)' },
  { name: 'idx_activitylog_created', sql: 'CREATE INDEX idx_activitylog_created ON ActivityLog(createdAt)' },
  { name: 'idx_activitylog_action', sql: 'CREATE INDEX idx_activitylog_action ON ActivityLog(action)' },
  { name: 'idx_activitylog_entity', sql: 'CREATE INDEX idx_activitylog_entity ON ActivityLog(entityType, entityId)' },
  
  // AnnualAllocation indexes
  { name: 'idx_allocation_hospital', sql: 'CREATE INDEX idx_allocation_hospital ON AnnualAllocation(hospitalId)' },
  { name: 'idx_allocation_year', sql: 'CREATE INDEX idx_allocation_year ON AnnualAllocation(year)' },
  { name: 'idx_allocation_year_hospital', sql: 'CREATE INDEX idx_allocation_year_hospital ON AnnualAllocation(year, hospitalId)' },
  
  // Product indexes
  { name: 'idx_product_category', sql: 'CREATE INDEX idx_product_category ON Product(category)' },
  { name: 'idx_product_active', sql: 'CREATE INDEX idx_product_active ON Product(isActive)' },
  { name: 'idx_product_name', sql: 'CREATE INDEX idx_product_name ON Product(name)' },
];

async function main() {
  console.log('🔧 Applying performance indexes...\n');
  
  let created = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const { name, sql } of INDEXES) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`✅ Created index: ${name}`);
      created++;
    } catch (error: any) {
      if (error.message?.includes('Duplicate key name') || error.message?.includes('already exists')) {
        console.log(`⏭️  Skipped (exists): ${name}`);
        skipped++;
      } else {
        console.error(`❌ Failed: ${name} - ${error.message}`);
        failed++;
      }
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}`);
  console.log(`\n✨ Done!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
