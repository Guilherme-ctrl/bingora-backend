-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "BingoCardStatus" AS ENUM ('available', 'assigned', 'voided');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'paid');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('active', 'voided');

-- CreateEnum
CREATE TYPE "DrawSessionStatus" AS ENUM ('open', 'closed');

-- CreateTable
CREATE TABLE "Organizer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organizer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "venue_notes" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prize" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BingoCard" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "serial_number" INTEGER NOT NULL,
    "grid" JSONB NOT NULL,
    "grid_fingerprint" TEXT NOT NULL,
    "status" "BingoCardStatus" NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BingoCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL,
    "unit_price_cents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "status" "SaleStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleCard" (
    "id" TEXT NOT NULL,
    "sale_id" TEXT NOT NULL,
    "bingo_card_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaleCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawSession" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "status" "DrawSessionStatus" NOT NULL DEFAULT 'open',

    CONSTRAINT "DrawSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawCall" (
    "id" TEXT NOT NULL,
    "draw_session_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "ball_number" INTEGER NOT NULL,
    "called_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "DrawCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Winner" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "prize_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "bingo_card_id" TEXT,
    "notes" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "Winner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organizer_email_key" ON "Organizer"("email");

-- CreateIndex
CREATE INDEX "Event_organizer_id_idx" ON "Event"("organizer_id");

-- CreateIndex
CREATE INDEX "Prize_event_id_idx" ON "Prize"("event_id");

-- CreateIndex
CREATE INDEX "BingoCard_event_id_idx" ON "BingoCard"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "BingoCard_event_id_serial_number_key" ON "BingoCard"("event_id", "serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "BingoCard_event_id_grid_fingerprint_key" ON "BingoCard"("event_id", "grid_fingerprint");

-- CreateIndex
CREATE INDEX "Participant_event_id_idx" ON "Participant"("event_id");

-- CreateIndex
CREATE INDEX "Sale_event_id_idx" ON "Sale"("event_id");

-- CreateIndex
CREATE INDEX "Sale_participant_id_idx" ON "Sale"("participant_id");

-- CreateIndex
CREATE INDEX "SaleCard_sale_id_idx" ON "SaleCard"("sale_id");

-- CreateIndex
CREATE UNIQUE INDEX "SaleCard_bingo_card_id_key" ON "SaleCard"("bingo_card_id");

-- CreateIndex
CREATE UNIQUE INDEX "DrawSession_event_id_key" ON "DrawSession"("event_id");

-- CreateIndex
CREATE INDEX "DrawCall_draw_session_id_idx" ON "DrawCall"("draw_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "DrawCall_draw_session_id_sequence_key" ON "DrawCall"("draw_session_id", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "DrawCall_draw_session_id_ball_number_key" ON "DrawCall"("draw_session_id", "ball_number");

-- CreateIndex
CREATE INDEX "Winner_event_id_idx" ON "Winner"("event_id");

-- CreateIndex
CREATE INDEX "Winner_prize_id_idx" ON "Winner"("prize_id");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BingoCard" ADD CONSTRAINT "BingoCard_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleCard" ADD CONSTRAINT "SaleCard_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleCard" ADD CONSTRAINT "SaleCard_bingo_card_id_fkey" FOREIGN KEY ("bingo_card_id") REFERENCES "BingoCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawSession" ADD CONSTRAINT "DrawSession_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawCall" ADD CONSTRAINT "DrawCall_draw_session_id_fkey" FOREIGN KEY ("draw_session_id") REFERENCES "DrawSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_prize_id_fkey" FOREIGN KEY ("prize_id") REFERENCES "Prize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_bingo_card_id_fkey" FOREIGN KEY ("bingo_card_id") REFERENCES "BingoCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

