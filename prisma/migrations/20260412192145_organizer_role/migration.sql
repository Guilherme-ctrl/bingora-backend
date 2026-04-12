-- CreateEnum
CREATE TYPE "OrganizerRole" AS ENUM ('admin', 'member');

-- AlterTable
ALTER TABLE "Organizer" ADD COLUMN     "role" "OrganizerRole" NOT NULL DEFAULT 'member';
