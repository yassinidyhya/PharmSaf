import { config } from 'dotenv';
config();

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

console.log('Connecting to Hostinger MySQL...');
console.log('Host:', new URL(connectionString).hostname);
console.log('Your IP should be whitelisted: 105.158.226.156\n');

try {
  const url = new URL(connectionString);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    connectionLimit: 1,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    idleTimeout: 60000,
  });

  const prisma = new PrismaClient({ 
    adapter,
    log: ['query', 'info', 'warn', 'error'],
  });

  console.log('Testing connection (this may take up to 60 seconds)...');
  const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as time, DATABASE() as db`;
  console.log('\n✅ SUCCESS! Connected to database:', result[0].db);
  console.log('   Server time:', result[0].time);

  console.log('\nCounting records...');
  const products = await prisma.product.count();
  console.log('✅ Products:', products);

  const hospitals = await prisma.hospital.count();
  console.log('✅ Hospitals:', hospitals);

  const users = await prisma.user.count();
  console.log('✅ Users:', users);

  console.log('\n✅ Remote MySQL connection is working!');
  await prisma.$disconnect();
} catch (error) {
  console.error('\n❌ Connection failed:');
  console.error('Error:', error.message);
  if (error.cause) {
    console.error('Cause:', error.cause.message || error.cause);
  }
  process.exit(1);
}
