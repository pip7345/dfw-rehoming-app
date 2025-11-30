/*
  Warnings:

  - Added the required column `name` to the `Packs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Packs" ADD COLUMN     "name" TEXT NOT NULL;
