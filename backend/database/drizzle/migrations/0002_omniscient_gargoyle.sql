ALTER TABLE "Card" DROP CONSTRAINT "Card_locked_unique";--> statement-breakpoint
ALTER TABLE "Card" DROP COLUMN IF EXISTS "locked";