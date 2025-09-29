"use server";

import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/db/db";
import { 
  InsertStoryline, 
  SelectStoryline,
  storylinesTable,
  StorylineSegment
} from "../schema/storyline-schema";

// Storyline queries
export const createStoryline = async (data: InsertStoryline): Promise<SelectStoryline> => {
  try {
    const [newStoryline] = await db.insert(storylinesTable).values(data).returning();
    return newStoryline;
  } catch (error) {
    console.error("Error creating storyline:", error);
    throw new Error("Failed to create storyline");
  }
};

export const getStorylineById = async (id: string): Promise<SelectStoryline | null> => {
  try {
    const storyline = await db.query.storylines.findFirst({
      where: eq(storylinesTable.id, id)
    });
    return storyline || null;
  } catch (error) {
    console.error("Error getting storyline by ID:", error);
    throw new Error("Failed to get storyline");
  }
};

export const getStorylinesByUserId = async (userId: string): Promise<SelectStoryline[]> => {
  try {
    return await db.query.storylines.findMany({
      where: eq(storylinesTable.userId, userId),
      orderBy: [desc(storylinesTable.createdAt)]
    });
  } catch (error) {
    console.error("Error getting storylines by user ID:", error);
    throw new Error("Failed to get storylines");
  }
};

export const updateStoryline = async (
  id: string, 
  data: Partial<InsertStoryline>
): Promise<SelectStoryline> => {
  try {
    const [updatedStoryline] = await db
      .update(storylinesTable)
      .set(data)
      .where(eq(storylinesTable.id, id))
      .returning();
    return updatedStoryline;
  } catch (error) {
    console.error("Error updating storyline:", error);
    throw new Error("Failed to update storyline");
  }
};

export const deleteStoryline = async (id: string): Promise<void> => {
  try {
    await db.delete(storylinesTable).where(eq(storylinesTable.id, id));
  } catch (error) {
    console.error("Error deleting storyline:", error);
    throw new Error("Failed to delete storyline");
  }
};

/**
 * Updates a specific segment within a storyline's JSONB field.
 * This uses a read-modify-write approach for simplicity with Drizzle.
 */
export const updateStorylineSegmentInJson = async (
  storylineId: string,
  segmentId: string,
  segmentData: Partial<StorylineSegment>
): Promise<SelectStoryline | null> => {
  try {
    const storyline = await getStorylineById(storylineId);
    if (!storyline || !Array.isArray(storyline.segments)) {
      throw new Error("Storyline or its segments not found.");
    }

    const segments = storyline.segments as StorylineSegment[];
    const segmentIndex = segments.findIndex(s => s.id === segmentId);

    if (segmentIndex === -1) {
      throw new Error(`Segment with ID ${segmentId} not found in storyline ${storylineId}.`);
    }

    // Update the specific segment
    segments[segmentIndex] = { ...segments[segmentIndex], ...segmentData };

    // Save the updated segments array back to the storyline
    return await updateStoryline(storylineId, { segments });

  } catch (error) {
    console.error("Error updating storyline segment in JSON:", error);
    throw new Error("Failed to update storyline segment");
  }
};

/**
 * Add a generated image URL to the storyline's image array
 */
export const addGeneratedImageUrl = async (
  storylineId: string,
  imageUrl: string
): Promise<SelectStoryline> => {
  try {
    const storyline = await getStorylineById(storylineId);
    if (!storyline) {
      throw new Error("Storyline not found");
    }

    const currentImageUrls = (storyline.generatedImageUrls as string[]) || [];
    const updatedImageUrls = [...currentImageUrls, imageUrl];

    return await updateStoryline(storylineId, { 
      generatedImageUrls: updatedImageUrls 
    });
  } catch (error) {
    console.error("Error adding generated image URL:", error);
    throw new Error("Failed to add generated image URL");
  }
};

/**
 * Add multiple generated image URLs to the storyline's image array
 */
export const addMultipleGeneratedImageUrls = async (
  storylineId: string,
  imageUrls: string[]
): Promise<SelectStoryline> => {
  try {
    const storyline = await getStorylineById(storylineId);
    if (!storyline) {
      throw new Error("Storyline not found");
    }

    const currentImageUrls = (storyline.generatedImageUrls as string[]) || [];
    const updatedImageUrls = [...currentImageUrls, ...imageUrls];

    return await updateStoryline(storylineId, { 
      generatedImageUrls: updatedImageUrls 
    });
  } catch (error) {
    console.error("Error adding multiple generated image URLs:", error);
    throw new Error("Failed to add generated image URLs");
  }
};

/**
 * Add a generated video URL to the storyline's video array
 */
export const addGeneratedVideoUrl = async (
  storylineId: string,
  videoUrl: string
): Promise<SelectStoryline> => {
  try {
    const storyline = await getStorylineById(storylineId);
    if (!storyline) {
      throw new Error("Storyline not found");
    }

    const currentVideoUrls = (storyline.generatedVideoUrls as string[]) || [];
    const updatedVideoUrls = [...currentVideoUrls, videoUrl];

    return await updateStoryline(storylineId, { 
      generatedVideoUrls: updatedVideoUrls 
    });
  } catch (error) {
    console.error("Error adding generated video URL:", error);
    throw new Error("Failed to add generated video URL");
  }
};

/**
 * Replace all generated image URLs for a storyline
 */
export const setGeneratedImageUrls = async (
  storylineId: string,
  imageUrls: string[]
): Promise<SelectStoryline> => {
  try {
    return await updateStoryline(storylineId, { 
      generatedImageUrls: imageUrls 
    });
  } catch (error) {
    console.error("Error setting generated image URLs:", error);
    throw new Error("Failed to set generated image URLs");
  }
};

/**
 * Replace all generated video URLs for a storyline
 */
export const setGeneratedVideoUrls = async (
  storylineId: string,
  videoUrls: string[]
): Promise<SelectStoryline> => {
  try {
    return await updateStoryline(storylineId, { 
      generatedVideoUrls: videoUrls 
    });
  } catch (error) {
    console.error("Error setting generated video URLs:", error);
    throw new Error("Failed to set generated video URLs");
  }
};

/**
 * Finds a storyline and segment ID by the Runway task ID stored within the segments JSONB.
 */
export const findSegmentByRunwayTaskId = async (
  taskId: string
): Promise<{ storylineId: string; segmentId: string } | null> => {
  try {
    // We use a raw SQL query here because Drizzle ORM doesn't have a native
    // way to query inside a JSONB array of objects efficiently for this case.
    const result: Array<{ storylineId: string; segmentId: string }> = await db.execute(sql`
      SELECT
        id AS "storylineId",
        elem ->> 'id' AS "segmentId"
      FROM
        storylines,
        jsonb_array_elements(segments) AS elem
      WHERE
        elem ->> 'runwayTaskId' = ${taskId}
      LIMIT 1;
    `);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(`Error finding segment by Runway task ID ${taskId}:`, error);
    throw new Error("Failed to find segment by Runway task ID");
  }
}; 