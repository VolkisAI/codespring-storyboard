ALTER TABLE "storylines" ADD COLUMN "generated_image_urls" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "storylines" ADD COLUMN "generated_video_urls" jsonb DEFAULT '[]'::jsonb;