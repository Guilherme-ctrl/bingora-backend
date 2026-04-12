-- AlterEnum
ALTER TYPE "OrganizerRole" ADD VALUE 'seller';

-- CreateTable
CREATE TABLE "EventSeller" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "seller_organizer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventSeller_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventSeller_seller_organizer_id_idx" ON "EventSeller"("seller_organizer_id");

-- CreateIndex
CREATE INDEX "EventSeller_event_id_idx" ON "EventSeller"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "EventSeller_event_id_seller_organizer_id_key" ON "EventSeller"("event_id", "seller_organizer_id");

-- AddForeignKey
ALTER TABLE "EventSeller" ADD CONSTRAINT "EventSeller_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSeller" ADD CONSTRAINT "EventSeller_seller_organizer_id_fkey" FOREIGN KEY ("seller_organizer_id") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
