-- AlterEnum
ALTER TYPE "Fiqah" ADD VALUE 'Indipendent';

-- AlterTable
ALTER TABLE "scholars" ADD COLUMN     "popularityScore" INTEGER NOT NULL DEFAULT 0;
