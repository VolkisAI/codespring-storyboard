'use server';

import { RunwayML } from '@runwayml/sdk';
import { ActionResult } from '@/types/actions/actions-types';
import { getStorylineById, updateStorylineSegmentInJson } from '@/db/queries/storyline-queries';
import { StorylineSegment } from '@/db/schema/storyline-schema';
import { revalidatePath } from 'next/cache';

/**
 * Generate a video from a single image segment using Runway.
 */
export async function generateVideoForSegmentAction(
  storylineId: string,
  segmentId: string
): Promise<ActionResult<{ taskId: string }>> {
  try {
    console.log(`[generateVideoForSegmentAction] Starting for Storyline: ${storylineId}, Segment: ${segmentId}`);

    const storyline = await getStorylineById(storylineId);
    if (!storyline || !storyline.segments) {
      return { isSuccess: false, message: 'Storyline not found.' };
    }

    const segments = storyline.segments as StorylineSegment[];
    const segment = segments.find(s => s.id === segmentId);

    if (!segment || !segment.imageUrl || !segment.prompt) {
      return { isSuccess: false, message: `Segment ${segmentId} not found or missing required data (imageUrl, prompt).` };
    }
    
    if (segment.imageUrl.startsWith('data:image')) {
        console.error(`[generateVideoForSegmentAction] Image for segment ${segmentId} is a data URI, not a public URL. Runway requires a public URL.`);
        return { isSuccess: false, message: 'Image must be a public URL to be processed by Runway.' };
    }

    const runway = new RunwayML({ apiKey: process.env.RUNWAY_API_KEY });

    console.log(`[generateVideoForSegmentAction] Submitting task to Runway for segment ${segmentId}`);
    const taskSubmission = await runway.imageToVideo.create({
        model: 'gen4_turbo',
        promptImage: segment.imageUrl,
        ratio: '720:1280',
        seed: 0,
        duration: 5,
        promptText: segment.prompt
    });
    
    const taskId = taskSubmission.id;
    console.log(`[generateVideoForSegmentAction] Runway task submitted. Task ID: ${taskId}`);
    
    await updateStorylineSegmentInJson(storylineId, segmentId, {
      runwayTaskId: taskId,
      status: 'video_processing',
    });

    revalidatePath(`/dashboard/storyline`);

    return {
      isSuccess: true,
      message: 'Successfully submitted video generation task.',
      data: { taskId },
    };

  } catch (error: any) {
    console.error(`[generateVideoForSegmentAction] Error for segment ${segmentId}:`, error);
    
    // Update segment status to 'failed' to prevent retries
    await updateStorylineSegmentInJson(storylineId, segmentId, {
        status: 'failed',
    }).catch(e => console.error(`[generateVideoForSegmentAction] Additionally failed to update segment ${segmentId} to failed status`, e));

    return { isSuccess: false, message: error.message || 'An unexpected error occurred during video generation.' };
  }
} 