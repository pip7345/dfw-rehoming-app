-- CreateEnum
CREATE TYPE "PetType" AS ENUM ('dog', 'cat', 'other');

-- AlterTable
ALTER TABLE "Pets" ADD COLUMN     "animal_type" "PetType" NOT NULL DEFAULT 'dog';
