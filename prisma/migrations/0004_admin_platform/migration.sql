-- CreateEnum
CREATE TYPE "EventModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable Organization
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "suspended" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "rejected" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable Event
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "moderationStatus" "EventModerationStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "flagged" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

-- AlterTable FraudReport
ALTER TABLE "FraudReport" ADD COLUMN IF NOT EXISTS "adminNotes" TEXT;
ALTER TABLE "FraudReport" ADD COLUMN IF NOT EXISTS "assignedToId" TEXT;
ALTER TABLE "FraudReport" ADD COLUMN IF NOT EXISTS "eventId" TEXT;
ALTER TABLE "FraudReport" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable AdminAction
CREATE TABLE IF NOT EXISTS "AdminAction" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey FraudReport event
DO $$ BEGIN
  ALTER TABLE "FraudReport" ADD CONSTRAINT "FraudReport_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "FraudReport" ADD CONSTRAINT "FraudReport_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "AdminAction" ADD CONSTRAINT "AdminAction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS "Event_moderationStatus_idx" ON "Event"("moderationStatus");
CREATE INDEX IF NOT EXISTS "Event_flagged_idx" ON "Event"("flagged");
CREATE INDEX IF NOT EXISTS "Application_status_idx" ON "Application"("status");
CREATE INDEX IF NOT EXISTS "FraudReport_status_idx" ON "FraudReport"("status");
CREATE INDEX IF NOT EXISTS "FraudReport_assignedToId_idx" ON "FraudReport"("assignedToId");
CREATE INDEX IF NOT EXISTS "AdminAction_adminId_idx" ON "AdminAction"("adminId");
CREATE INDEX IF NOT EXISTS "AdminAction_createdAt_idx" ON "AdminAction"("createdAt");

-- Approve existing events for backward compatibility
UPDATE "Event" SET "moderationStatus" = 'APPROVED' WHERE "moderationStatus" = 'PENDING';
