ALTER TABLE "Card" ADD COLUMN "locked" varchar(36);--> statement-breakpoint
ALTER TABLE "Card" ADD CONSTRAINT "Card_locked_unique" UNIQUE("locked");