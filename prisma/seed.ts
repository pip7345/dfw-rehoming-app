import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting production seed...');

  // Create default location (only if it doesn't exist)
  console.log('📍 Creating default location...');
  const existingLocation = await prisma.location.findUnique({
    where: { id: 'dfw-default-location' }
  });

  if (!existingLocation) {
    await prisma.location.create({
      data: {
        id: 'dfw-default-location',
        landing_page_url: 'dfw',
        city: 'Dallas-Fort Worth',
        state: 'TX',
        timezone: 'America/Chicago',
      },
    });
    console.log('  ✓ Created default DFW location');
  } else {
    console.log('  ℹ️ Default location already exists');
  }

  console.log('\n✅ Production seed completed!');
  console.log('📊 Summary:');
  console.log('  • Default DFW location ready for user registrations');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

