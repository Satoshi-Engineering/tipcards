CREATE TABLE IF NOT EXISTS "AllowedSession" (
	"user" varchar(64) NOT NULL,
	"sessionId" varchar(36) PRIMARY KEY NOT NULL,
	CONSTRAINT "AllowedSession_sessionId_unique" UNIQUE("sessionId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AllowedSession" ADD CONSTRAINT "AllowedSession_user_User_id_fk" FOREIGN KEY ("user") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessionIdIndex" ON "AllowedSession" USING btree ("sessionId");