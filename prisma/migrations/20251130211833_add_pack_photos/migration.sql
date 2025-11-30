-- AlterTable
ALTER TABLE "Packs" ADD COLUMN     "cloudinary_public_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];
