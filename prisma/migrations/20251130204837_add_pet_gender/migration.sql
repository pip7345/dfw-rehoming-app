-- CreateEnum
CREATE TYPE "PetGender" AS ENUM ('male', 'female', 'unspecified');

-- AlterTable
ALTER TABLE "Pets" ADD COLUMN     "gender" "PetGender" NOT NULL DEFAULT 'male';
