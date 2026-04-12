-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "default_currency" TEXT NOT NULL DEFAULT 'BRL',
ADD COLUMN     "default_unit_price_cents" INTEGER;
