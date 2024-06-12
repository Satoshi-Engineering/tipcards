DO $$ BEGIN
 CREATE TYPE "public"."imageType" AS ENUM('svg', 'png');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."landingPageType" AS ENUM('core', 'external');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."permission" AS ENUM('statistics', 'support');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AllowedRefreshTokens" (
	"hash" varchar(64) PRIMARY KEY NOT NULL,
	"user" varchar(64) NOT NULL,
	"current" text NOT NULL,
	"previous" text,
	CONSTRAINT "AllowedRefreshTokens_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Card" (
	"hash" varchar(64) PRIMARY KEY NOT NULL,
	"created" timestamp with time zone NOT NULL,
	"set" varchar(36),
	"locked" varchar(36),
	CONSTRAINT "Card_hash_unique" UNIQUE("hash"),
	CONSTRAINT "Card_locked_unique" UNIQUE("locked")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CardVersion" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"card" varchar(64) NOT NULL,
	"created" timestamp with time zone NOT NULL,
	"lnurlP" varchar(36),
	"lnurlW" varchar(36),
	"textForWithdraw" text NOT NULL,
	"noteForStatusPage" text NOT NULL,
	"sharedFunding" boolean NOT NULL,
	"landingPageViewed" timestamp with time zone,
	CONSTRAINT "CardVersion_id_unique" UNIQUE("id"),
	CONSTRAINT "CardVersion_lnurlP_unique" UNIQUE("lnurlP")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CardVersionHasInvoice" (
	"cardVersion" varchar(36) NOT NULL,
	"invoice" varchar(64) NOT NULL,
	CONSTRAINT "CardVersionHasInvoice_cardVersion_invoice_pk" PRIMARY KEY("cardVersion","invoice")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Image" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"type" "imageType" NOT NULL,
	"name" text NOT NULL,
	"data" text NOT NULL,
	CONSTRAINT "Image_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Invoice" (
	"amount" integer NOT NULL,
	"paymentHash" varchar(64) PRIMARY KEY NOT NULL,
	"paymentRequest" text NOT NULL,
	"created" timestamp with time zone NOT NULL,
	"paid" timestamp with time zone,
	"expiresAt" timestamp with time zone NOT NULL,
	"extra" text NOT NULL,
	CONSTRAINT "Invoice_paymentHash_unique" UNIQUE("paymentHash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "LandingPage" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"type" "landingPageType" NOT NULL,
	"name" text NOT NULL,
	"url" text,
	CONSTRAINT "LandingPage_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "LnurlP" (
	"lnbitsId" varchar(36) PRIMARY KEY NOT NULL,
	"created" timestamp with time zone NOT NULL,
	"expiresAt" timestamp with time zone,
	"finished" timestamp with time zone,
	CONSTRAINT "LnurlP_lnbitsId_unique" UNIQUE("lnbitsId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "LnurlW" (
	"lnbitsId" varchar(36) PRIMARY KEY NOT NULL,
	"created" timestamp with time zone NOT NULL,
	"expiresAt" timestamp with time zone,
	"withdrawn" timestamp with time zone,
	"bulkWithdrawId" varchar(64),
	CONSTRAINT "LnurlW_lnbitsId_unique" UNIQUE("lnbitsId"),
	CONSTRAINT "LnurlW_bulkWithdrawId_unique" UNIQUE("bulkWithdrawId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Profile" (
	"user" varchar(64) PRIMARY KEY NOT NULL,
	"accountName" text NOT NULL,
	"displayName" text NOT NULL,
	"email" text NOT NULL,
	CONSTRAINT "Profile_user_unique" UNIQUE("user")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Set" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created" timestamp with time zone NOT NULL,
	"changed" timestamp with time zone NOT NULL,
	CONSTRAINT "Set_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SetSettings" (
	"set" varchar(36) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"numberOfCards" integer NOT NULL,
	"cardHeadline" text NOT NULL,
	"cardCopytext" text NOT NULL,
	"image" varchar(36),
	"landingPage" varchar(36) NOT NULL,
	CONSTRAINT "SetSettings_set_unique" UNIQUE("set")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"lnurlAuthKey" varchar(128) NOT NULL,
	"created" timestamp with time zone NOT NULL,
	"permissions" json NOT NULL,
	CONSTRAINT "User_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserCanUseImage" (
	"user" varchar(64) NOT NULL,
	"image" varchar(36) NOT NULL,
	"canEdit" boolean DEFAULT false NOT NULL,
	CONSTRAINT "UserCanUseImage_user_image_pk" PRIMARY KEY("user","image")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserCanUseLandingPage" (
	"user" varchar(64) NOT NULL,
	"landingPage" varchar(36) NOT NULL,
	"canEdit" boolean DEFAULT false NOT NULL,
	CONSTRAINT "UserCanUseLandingPage_user_landingPage_pk" PRIMARY KEY("user","landingPage")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserCanUseSet" (
	"user" varchar(64) NOT NULL,
	"set" varchar(36) NOT NULL,
	"canEdit" boolean DEFAULT false NOT NULL,
	CONSTRAINT "UserCanUseSet_user_set_pk" PRIMARY KEY("user","set")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AllowedRefreshTokens" ADD CONSTRAINT "AllowedRefreshTokens_user_User_id_fk" FOREIGN KEY ("user") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Card" ADD CONSTRAINT "Card_set_Set_id_fk" FOREIGN KEY ("set") REFERENCES "public"."Set"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CardVersion" ADD CONSTRAINT "CardVersion_card_Card_hash_fk" FOREIGN KEY ("card") REFERENCES "public"."Card"("hash") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CardVersion" ADD CONSTRAINT "CardVersion_lnurlP_LnurlP_lnbitsId_fk" FOREIGN KEY ("lnurlP") REFERENCES "public"."LnurlP"("lnbitsId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CardVersion" ADD CONSTRAINT "CardVersion_lnurlW_LnurlW_lnbitsId_fk" FOREIGN KEY ("lnurlW") REFERENCES "public"."LnurlW"("lnbitsId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CardVersionHasInvoice" ADD CONSTRAINT "CardVersionHasInvoice_cardVersion_CardVersion_id_fk" FOREIGN KEY ("cardVersion") REFERENCES "public"."CardVersion"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CardVersionHasInvoice" ADD CONSTRAINT "CardVersionHasInvoice_invoice_Invoice_paymentHash_fk" FOREIGN KEY ("invoice") REFERENCES "public"."Invoice"("paymentHash") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Profile" ADD CONSTRAINT "Profile_user_User_id_fk" FOREIGN KEY ("user") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SetSettings" ADD CONSTRAINT "SetSettings_set_Set_id_fk" FOREIGN KEY ("set") REFERENCES "public"."Set"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SetSettings" ADD CONSTRAINT "SetSettings_image_Image_id_fk" FOREIGN KEY ("image") REFERENCES "public"."Image"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SetSettings" ADD CONSTRAINT "SetSettings_landingPage_LandingPage_id_fk" FOREIGN KEY ("landingPage") REFERENCES "public"."LandingPage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserCanUseImage" ADD CONSTRAINT "UserCanUseImage_user_User_id_fk" FOREIGN KEY ("user") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserCanUseImage" ADD CONSTRAINT "UserCanUseImage_image_Image_id_fk" FOREIGN KEY ("image") REFERENCES "public"."Image"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserCanUseLandingPage" ADD CONSTRAINT "UserCanUseLandingPage_user_User_id_fk" FOREIGN KEY ("user") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserCanUseLandingPage" ADD CONSTRAINT "UserCanUseLandingPage_landingPage_LandingPage_id_fk" FOREIGN KEY ("landingPage") REFERENCES "public"."LandingPage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserCanUseSet" ADD CONSTRAINT "UserCanUseSet_user_User_id_fk" FOREIGN KEY ("user") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserCanUseSet" ADD CONSTRAINT "UserCanUseSet_set_Set_id_fk" FOREIGN KEY ("set") REFERENCES "public"."Set"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "userIndex" ON "AllowedRefreshTokens" USING btree ("user");