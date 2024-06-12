ALTER TABLE "Card" ALTER COLUMN "created" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "CardVersion" ALTER COLUMN "created" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "CardVersion" ALTER COLUMN "landingPageViewed" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Invoice" ALTER COLUMN "created" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Invoice" ALTER COLUMN "paid" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Invoice" ALTER COLUMN "expiresAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "LnurlP" ALTER COLUMN "created" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "LnurlP" ALTER COLUMN "expiresAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "LnurlP" ALTER COLUMN "finished" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "LnurlW" ALTER COLUMN "created" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "LnurlW" ALTER COLUMN "expiresAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "LnurlW" ALTER COLUMN "withdrawn" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "created" SET DATA TYPE timestamp with time zone;