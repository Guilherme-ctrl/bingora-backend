-- CreateEnum
CREATE TYPE "SellerReconciliationStatus" AS ENUM ('CONFERIDO', 'DIVERGENTE');

-- AlterTable
ALTER TABLE "Sale"
ADD COLUMN "round_id" TEXT,
ADD COLUMN "seller_organizer_id" TEXT;

-- CreateTable
CREATE TABLE "SellerReconciliation" (
  "id" TEXT NOT NULL,
  "round_id" TEXT NOT NULL,
  "seller_organizer_id" TEXT NOT NULL,
  "status" "SellerReconciliationStatus" NOT NULL,
  "justification" TEXT,
  "checked_by_organizer_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SellerReconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sale_round_id_idx" ON "Sale"("round_id");

-- CreateIndex
CREATE INDEX "Sale_seller_organizer_id_idx" ON "Sale"("seller_organizer_id");

-- CreateIndex
CREATE UNIQUE INDEX "SellerReconciliation_round_id_seller_organizer_id_key"
  ON "SellerReconciliation"("round_id", "seller_organizer_id");

-- CreateIndex
CREATE INDEX "SellerReconciliation_round_id_status_idx"
  ON "SellerReconciliation"("round_id", "status");

-- AddForeignKey
ALTER TABLE "Sale"
ADD CONSTRAINT "Sale_round_id_fkey"
FOREIGN KEY ("round_id") REFERENCES "Round"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerReconciliation"
ADD CONSTRAINT "SellerReconciliation_round_id_fkey"
FOREIGN KEY ("round_id") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;
