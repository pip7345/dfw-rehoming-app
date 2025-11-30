-- CreateEnum
CREATE TYPE "PetAge" AS ENUM ('less_than_8_months', 'eight_to_12_months', 'one_to_3_years', 'four_to_7_years', 'eight_plus_years');

-- CreateEnum
CREATE TYPE "PetSize" AS ENUM ('small', 'medium', 'large', 'extra_large');

-- AlterTable
ALTER TABLE "Pets" ADD COLUMN     "age" "PetAge",
ADD COLUMN     "breed" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "size" "PetSize";
