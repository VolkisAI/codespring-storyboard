CREATE TABLE IF NOT EXISTS "storylines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"original_video_url" text,
	"status" text DEFAULT 'processing' NOT NULL,
	"segments" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
