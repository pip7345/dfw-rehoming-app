import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.listingViews.deleteMany();
  await prisma.pets.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.packs.deleteMany();
  await prisma.listers.deleteMany();
  await prisma.users.deleteMany();
  await prisma.location.deleteMany();

  // Create default location
  console.log('📍 Creating location...');
  const location = await prisma.location.create({
    data: {
      id: 'dfw-default-location',
      landing_page_url: 'dfw',
      city: 'Dallas-Fort Worth',
      state: 'TX',
      timezone: 'America/Chicago',
    },
  });

  // Create 3 listers
  console.log('👤 Creating 3 listers...');
  const listers = [];
  for (let i = 1; i <= 3; i++) {
    const hashedPassword = await bcrypt.hash(`password${i}`, 10);
    const user = await prisma.users.create({
      data: {
        email: `lister${i}@example.com`,
        password_hash: hashedPassword,
        display_name: `Lister ${i}`,
        role: 'lister',
        account_status: 'active',
        email_verified: true,
      },
    });

    const lister = await prisma.listers.create({
      data: {
        user_id: user.id,
        location_id: location.id,
        is_published: true,
        contact_preferences: {
          email: true,
          phone: false,
        },
      },
    });

    listers.push(lister);
    console.log(`  ✓ Created lister: ${user.email}`);
  }

  // Create 20 packs (distribute among listers)
  console.log('📦 Creating 20 packs...');
  const packs = [];
  for (let i = 1; i <= 20; i++) {
    const lister = listers[(i - 1) % 3]; // Distribute evenly
    const pack = await prisma.packs.create({
      data: {
        lister_id: lister.id,
        name: `Pack ${i}`,
        description: `This is pack number ${i} from ${lister.id}`,
      },
    });
    packs.push(pack);
  }
  console.log(`  ✓ Created ${packs.length} packs`);

  // Create receipts for 20 paid pets
  console.log('🧾 Creating receipts for paid pets...');
  const receipts = [];
  for (let i = 1; i <= 20; i++) {
    const lister = listers[(i - 1) % 3];
    const receipt = await prisma.receipt.create({
      data: {
        user_id: lister.user_id,
        paypal_order_id: `PAYPAL_ORDER_${i}_${Date.now()}`,
        amount: 25.00,
        currency: 'USD',
        status: 'COMPLETED',
        paid_at: new Date(),
      },
    });
    receipts.push(receipt);
  }
  console.log(`  ✓ Created ${receipts.length} receipts`);

  // Pet configuration
  const breeds = ['Labrador', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund', 'Boxer'];
  const catBreeds = ['Persian', 'Maine Coon', 'Siamese', 'British Shorthair', 'Ragdoll', 'Bengal', 'Abyssinian', 'Scottish Fold'];
  const ages = ['less_than_8_months', 'eight_to_12_months', 'one_to_3_years', 'four_to_7_years', 'eight_plus_years'];
  const sizes = ['small', 'medium', 'large', 'extra_large'];
  const animalTypes = ['dog', 'cat', 'other'] as const;
  const imagePublicIds = ['pets/xgcx5uiisk7yrevd7zs8'];

  // Create 30 pets
  console.log('🐾 Creating 30 pets (dogs, cats, and other)...');
  let paidCount = 0;
  let unpaidCount = 0;
  let hiddenCount = 0;
  let pendingCount = 0;
  let soldCount = 0;
  let dogCount = 0;
  let catCount = 0;
  let otherCount = 0;

  for (let i = 1; i <= 30; i++) {
    const pack = packs[(i - 1) % 20]; // Distribute among packs
    const isPaid = i <= 20; // First 20 are paid
    const isHidden = isPaid && hiddenCount < 3 && i >= 18 && i <= 20; // 3 paid pets are hidden
    const isPending = isPaid && !isHidden && pendingCount < 3 && i >= 14 && i <= 16; // 3 paid pets are pending
    const isSold = isPaid && !isHidden && !isPending && soldCount < 3 && i >= 11 && i <= 13; // 3 paid pets are sold

    let status: 'available' | 'reserved' | 'sold' | 'hidden' = 'available';
    if (isHidden) {
      status = 'hidden';
      hiddenCount++;
    } else if (isPending) {
      status = 'reserved';
      pendingCount++;
    } else if (isSold) {
      status = 'sold';
      soldCount++;
    }

    // Distribute animal types: 70% dogs, 20% cats, 10% other
    let animalType: 'dog' | 'cat' | 'other';
    const typeRandom = Math.random();
    if (typeRandom < 0.7) {
      animalType = 'dog';
      dogCount++;
    } else if (typeRandom < 0.9) {
      animalType = 'cat';
      catCount++;
    } else {
      animalType = 'other';
      otherCount++;
    }

    const petName = animalType === 'dog' ? `Dog ${i}` : animalType === 'cat' ? `Cat ${i}` : `Pet ${i}`;
    const petBreed = animalType === 'dog' 
      ? breeds[Math.floor(Math.random() * breeds.length)]
      : animalType === 'cat'
        ? catBreeds[Math.floor(Math.random() * catBreeds.length)]
        : 'Mixed/Unknown';

    const paymentStatus = isPaid ? '✅ PAID' : '❌ UNPAID';
    const statusText = isHidden ? '(Hidden)' : isPending ? '(Reserved/Pending)' : isSold ? '(Sold)' : '(Available)';
    const typeEmoji = animalType === 'dog' ? '🐕' : animalType === 'cat' ? '🐱' : '🐾';

    const pet = await prisma.pets.create({
      data: {
        pack_id: pack.id,
        Receipt_id: isPaid ? receipts[paidCount].id : null,
        name: petName,
        animal_type: animalType,
        age: ages[Math.floor(Math.random() * ages.length)] as any,
        breed: petBreed,
        size: sizes[Math.floor(Math.random() * sizes.length)] as any,
        status: status,
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        description: `${paymentStatus} - ${typeEmoji} This is ${petName}. Status: ${statusText}. A friendly and energetic companion looking for a loving home!`,
        cloudinary_public_ids: imagePublicIds,
      },
    });

    if (isPaid) paidCount++;
    else unpaidCount++;
  }

  console.log(`  ✓ Created 30 pets`);
  console.log(`    • Dogs: ${dogCount}`);
  console.log(`    • Cats: ${catCount}`);
  console.log(`    • Other: ${otherCount}`);
  console.log(`    • Paid: 20`);
  console.log(`    • Unpaid: 10`);
  console.log(`    • Hidden (paid): ${hiddenCount}`);
  console.log(`    • Pending (paid): ${pendingCount}`);
  console.log(`    • Sold (paid): ${soldCount}`);
  console.log(`    • Available: ${20 - hiddenCount - pendingCount - soldCount + 10}`);

  console.log('\n✅ Seed completed!');
  console.log('\n📊 Summary:');
  console.log('  • 3 Listers');
  console.log('  • 20 Packs');
  console.log('  • 30 Pets (20 paid, 10 unpaid)');
  console.log('  • 20 Receipts');
  console.log('\n🔐 Test credentials:');
  console.log('  • lister1@example.com / password1');
  console.log('  • lister2@example.com / password2');
  console.log('  • lister3@example.com / password3');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
