-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('CRIADA', 'EM_VENDA', 'AGUARDANDO_CONFERENCIA', 'EM_SORTEIO', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "RoundType" AS ENUM ('binguinho', 'roda_da_fortuna', 'bingao');

-- CreateEnum
CREATE TYPE "EventOperationalRole" AS ENUM ('admin_evento', 'bingueiro', 'mesario', 'vendedor');

-- CreateEnum
CREATE TYPE "DomainEventType" AS ENUM (
  'VENDA_REGISTRADA',
  'VENDA_ESTORNADA',
  'NUMERO_SORTEADO',
  'NUMERO_INVALIDADO',
  'VENDEDOR_CONFERIDO',
  'VENDEDOR_DIVERGENTE',
  'RODADA_FINALIZADA'
);

-- CreateEnum
CREATE TYPE "DrawCallStatus" AS ENUM ('active', 'invalidated');

-- AlterTable
ALTER TABLE "Sale" ALTER COLUMN "participant_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DrawCall"
ADD COLUMN "status" "DrawCallStatus" NOT NULL DEFAULT 'active',
ADD COLUMN "invalidated_at" TIMESTAMP(3),
ADD COLUMN "invalidation_reason" TEXT;

-- DropIndex
DROP INDEX "DrawCall_draw_session_id_ball_number_key";

-- CreateTable
CREATE TABLE "Round" (
  "id" TEXT NOT NULL,
  "event_id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "type" "RoundType" NOT NULL,
  "status" "RoundStatus" NOT NULL DEFAULT 'CRIADA',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "finished_at" TIMESTAMP(3),
  CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRoleAssignment" (
  "id" TEXT NOT NULL,
  "event_id" TEXT NOT NULL,
  "organizer_id" TEXT NOT NULL,
  "role" "EventOperationalRole" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainEventLog" (
  "id" TEXT NOT NULL,
  "event_id" TEXT NOT NULL,
  "round_id" TEXT,
  "actor_id" TEXT,
  "actor_role" TEXT,
  "event_type" "DomainEventType" NOT NULL,
  "payload_json" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DomainEventLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Round_event_id_code_key" ON "Round"("event_id", "code");

-- CreateIndex
CREATE INDEX "Round_event_id_idx" ON "Round"("event_id");

-- CreateIndex
CREATE INDEX "Round_event_id_status_idx" ON "Round"("event_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "round_single_active_per_event_idx"
  ON "Round"("event_id")
  WHERE "status" IN ('CRIADA', 'EM_VENDA', 'AGUARDANDO_CONFERENCIA', 'EM_SORTEIO');

-- CreateIndex
CREATE UNIQUE INDEX "EventRoleAssignment_event_id_organizer_id_role_key"
  ON "EventRoleAssignment"("event_id", "organizer_id", "role");

-- CreateIndex
CREATE INDEX "EventRoleAssignment_event_id_role_idx"
  ON "EventRoleAssignment"("event_id", "role");

-- CreateIndex
CREATE INDEX "EventRoleAssignment_organizer_id_idx"
  ON "EventRoleAssignment"("organizer_id");

-- CreateIndex
CREATE INDEX "DomainEventLog_event_id_created_at_idx"
  ON "DomainEventLog"("event_id", "created_at");

-- CreateIndex
CREATE INDEX "DomainEventLog_round_id_created_at_idx"
  ON "DomainEventLog"("round_id", "created_at");

-- CreateIndex
CREATE INDEX "DomainEventLog_event_type_created_at_idx"
  ON "DomainEventLog"("event_type", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "DrawCall_draw_session_id_ball_number_status_key"
  ON "DrawCall"("draw_session_id", "ball_number", "status");

-- AddForeignKey
ALTER TABLE "Round"
ADD CONSTRAINT "Round_event_id_fkey"
FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRoleAssignment"
ADD CONSTRAINT "EventRoleAssignment_event_id_fkey"
FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRoleAssignment"
ADD CONSTRAINT "EventRoleAssignment_organizer_id_fkey"
FOREIGN KEY ("organizer_id") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainEventLog"
ADD CONSTRAINT "DomainEventLog_event_id_fkey"
FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainEventLog"
ADD CONSTRAINT "DomainEventLog_round_id_fkey"
FOREIGN KEY ("round_id") REFERENCES "Round"("id") ON DELETE SET NULL ON UPDATE CASCADE;
