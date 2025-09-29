DO $$ BEGIN
 CREATE TYPE "public"."issue_type" AS ENUM('forgot-cancel', 'no-product', 'unacceptable', 'not-described', 'unauthorized', 'subscription-cancel');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ticket_status" AS ENUM('pending', 'in-review', 'resolved', 'refunded', 'canceled', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"user_email" text NOT NULL,
	"issue_type" "issue_type" NOT NULL,
	"purchase_emails" json NOT NULL,
	"transaction_date" date,
	"transaction_amount" text,
	"details" text NOT NULL,
	"status" "ticket_status" DEFAULT 'pending' NOT NULL,
	"resolution_notes" text,
	"resolved_by" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
