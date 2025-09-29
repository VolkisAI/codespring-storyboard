import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

export const storylinesTable = pgTable("storylines", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(), // Name from the uploaded video file
  userId: text("user_id").notNull(), // From Clerk auth
  originalVideoUrl: text("original_video_url"), // URL to the original uploaded video in storage
  generatedImageUrls: jsonb("generated_image_urls").$type<string[]>().default([]), // Array of generated image URLs
  generatedVideoUrls: jsonb("generated_video_urls").$type<string[]>().default([]), // Array of generated broll video URLs
  status: text("status").notNull().default("processing"), // processing, completed, failed
  segments: jsonb("segments"), // Array of segment objects
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
});

export type StorylineSegment = {
  id: string; // Original segment ID from transcript
  order: number;
  timestamp: string;
  text: string;
  prompt: string;
  style: string;
  imageUrl?: string;
  videoUrl?: string;
  runwayTaskId?: string;
  status: 'pending' | 'image_generated' | 'video_processing' | 'completed' | 'failed';
  metadata?: Record<string, any>;
};

export type InsertStoryline = typeof storylinesTable.$inferInsert;
export type SelectStoryline = typeof storylinesTable.$inferSelect; 