-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('lister', 'admin');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'suspended', 'deleted');

-- CreateEnum
CREATE TYPE "PetStatus" AS ENUM ('available', 'reserved', 'sold', 'custom_date', 'hidden');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "account_status" "AccountStatus" NOT NULL DEFAULT 'active',
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "profile_photo_url" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'lister';

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "landing_page_url" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "contact_preferences" JSONB,
    "location_id" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Packs" (
    "id" TEXT NOT NULL,
    "lister_id" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pets" (
    "id" TEXT NOT NULL,
    "pack_id" TEXT,
    "status" "PetStatus" NOT NULL DEFAULT 'available',
    "custom_availability_date" DATE,
    "expiry_date" DATE NOT NULL,
    "description" TEXT,
    "cloudinary_public_ids" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingViews" (
    "id" TEXT NOT NULL,
    "pet_id" TEXT,
    "pack_id" TEXT,
    "viewer_ip" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingViews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_landing_page_url_key" ON "Location"("landing_page_url");

-- CreateIndex
CREATE UNIQUE INDEX "Listers_user_id_key" ON "Listers"("user_id");

-- CreateIndex
CREATE INDEX "ListingViews_pet_id_idx" ON "ListingViews"("pet_id");

-- CreateIndex
CREATE INDEX "ListingViews_pack_id_idx" ON "ListingViews"("pack_id");

-- CreateIndex
CREATE INDEX "ListingViews_viewed_at_idx" ON "ListingViews"("viewed_at");

-- AddForeignKey
ALTER TABLE "Listers" ADD CONSTRAINT "Listers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listers" ADD CONSTRAINT "Listers_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packs" ADD CONSTRAINT "Packs_lister_id_fkey" FOREIGN KEY ("lister_id") REFERENCES "Listers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pets" ADD CONSTRAINT "Pets_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "Packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingViews" ADD CONSTRAINT "ListingViews_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "Pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingViews" ADD CONSTRAINT "ListingViews_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "Packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
