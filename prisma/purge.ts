import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function purge() {
  console.log('🗑️  Purging database...\n');

  // Delete in order to respect foreign key constraints
  const tables = [
    { name: 'ListingViews', delete: () => prisma.listingViews.deleteMany() },
    { name: 'Pets', delete: () => prisma.pets.deleteMany() },
    { name: 'Packs', delete: () => prisma.packs.deleteMany() },
    { name: 'Receipt', delete: () => prisma.receipt.deleteMany() },
    { name: 'Listers', delete: () => prisma.listers.deleteMany() },
    { name: 'Users', delete: () => prisma.users.deleteMany() },
    { name: 'Location', delete: () => prisma.location.deleteMany() },
  ];

  for (const table of tables) {
    try {
      const result = await table.delete();
      console.log(`  ✓ Deleted ${result.count} rows from ${table.name}`);
    } catch (error: any) {
      console.error(`  ✗ Error deleting from ${table.name}:`, error.message);
    }
  }

  console.log('\n✅ Database purged successfully!');
  console.log('\nRun "npx tsx prisma/seed.ts" to re-seed the database.');
}

purge()
  .catch((e) => {
    console.error('❌ Purge failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
