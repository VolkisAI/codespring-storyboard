import { RunwayML, TaskFailedError } from '@runwayml/sdk';
import { NextResponse } from 'next/server';
import { updateSegmentWithImageAction, updateSegmentWithVideoAction } from '@/actions/storyline/storyline-storage-actions';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import { uploadVideoFromFormDataAction, createStorylineAction } from '@/actions/storyline/storyline-storage-actions';
import { findSegmentByRunwayTaskId } from '@/db/queries/storyline-queries';

// This in-memory store is now simplified as permanent storage is handled by the database via actions.
const inMemoryTaskStore = new Map<string, { storylineId: string; segmentId: string }>();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function PUT(request: Request) {
  // This endpoint is less critical now as image uploads can be handled directly
  // by the action that creates the storyline. It can be kept for polling-based workflows
  // or removed if the client is updated to call the action directly.
  // For now, it's a pass-through to the action.
  try {
    const body = await request.json();
    const { images, storylineId } = body;

    if (!images || !Array.isArray(images) || !storylineId) {
      return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
    }

    const uploadPromises = images.map(async (image: any) => {
      if (image.imageUrl && image.segmentId) {
        await updateSegmentWithImageAction(storylineId, image.segmentId, image.imageUrl);
      }
    });

    await Promise.all(uploadPromises);

    console.log(`✅ Uploaded ${images.length} images to storage for storyline ${storylineId}`);

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${images.length} images`,
    });

  } catch (error: any) {
    console.error('Error storing images:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to store images' }, { status: 500 });
  }
}

// Generate video endpoint
export async function POST(request: NextRequest) {
  try {
    console.log('[video-maker] Starting video processing');
    
    const { userId } = await auth();
    if (!userId) {
      console.error('[video-maker] Unauthorized: No user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const style = formData.get('style') as string;
    const fileName = formData.get('fileName') as string;

    if (!file || file.size === 0) {
      console.error('[video-maker] No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('[video-maker] Processing file:', fileName, 'Style:', style);

    // 1. Upload video to storage first
    console.log('[video-maker] Uploading video to storage');
    const uploadResult = await uploadVideoFromFormDataAction(formData, userId, fileName);
    
    if (!uploadResult.isSuccess || !uploadResult.data) {
      console.error('[video-maker] Video upload failed:', uploadResult.message);
      return NextResponse.json(
        { error: uploadResult.message || 'Failed to upload video' },
        { status: 500 }
      );
    }

    const videoUrl = uploadResult.data;
    console.log('[video-maker] Video uploaded successfully:', videoUrl);

    // 2. Get transcript using Whisper
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const audioFile = new File([buffer], fileName, { type: file.type });

    console.log('[video-maker] Sending to Whisper API for transcription');
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    });

    console.log('[video-maker] Transcription received, segments:', transcription.segments?.length);
    if (!transcription.segments || transcription.segments.length === 0) {
      console.error('[video-maker] No segments in transcription');
      return NextResponse.json(
        { error: 'No segments found in transcription' },
        { status: 400 }
      );
    }

    const segments = transcription.segments.map((segment: any, index: number) => ({
      id: `segment-${index}`,
      timestamp: `${segment.start.toFixed(2)}s - ${segment.end.toFixed(2)}s`,
      text: segment.text.trim(),
      start: segment.start,
      end: segment.end
    }));
    console.log('[video-maker] Processed segments:', segments.length);

    // 3. Create storyline in database with the video URL
    console.log('[video-maker] Creating storyline in database');
    const storylineResult = await createStorylineAction(
      fileName,
      segments.map((seg, index) => ({
        id: seg.id,
        order: index,
        timestamp: seg.timestamp,
        text: seg.text,
        prompt: '',
        style: style
      })),
      videoUrl // Pass the uploaded video URL
    );

    if (!storylineResult.isSuccess || !storylineResult.data) {
      console.error('[video-maker] Failed to create storyline:', storylineResult.message);
      return NextResponse.json(
        { error: storylineResult.message || 'Failed to create storyline' },
        { status: 500 }
      );
    }

    const storylineId = storylineResult.data.id;
    console.log('[video-maker] Storyline created with ID:', storylineId);

    return NextResponse.json({
      success: true,
      segments: segments,
      storylineId: storylineId,
      videoUrl: videoUrl
    });

  } catch (error) {
    console.error('[video-maker] Error processing video:', error);
    // Add more specific error logging if possible
    if (error instanceof Error) {
      console.error(`[video-maker] Details: ${error.message}`);
    }
    return NextResponse.json(
      { error: 'Failed to process video due to an internal error.' },
      { status: 500 }
    );
  }
}

// Poll for video completion
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ success: false, message: 'Missing taskId' }, { status: 400 });
  }
  
  try {
    const apiKey = process.env.RUNWAY_API_KEY;
    if (!apiKey) throw new Error("RUNWAY_API_KEY is not set");

    const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Runway API responded with status ${response.status}: ${errorBody}`);
    }

    const taskDetails = await response.json();
    
    // If task is complete, update our database (support snake_case key as well)
    let completedVideoUrl: string | undefined;
    if (Array.isArray(taskDetails.output)) {
      completedVideoUrl = taskDetails.output[0];
    } else {
      completedVideoUrl = taskDetails.output?.videoUrl || taskDetails.output?.video_url;
    }
    if (taskDetails.status === 'SUCCEEDED' && completedVideoUrl) {
      // The in-memory store is not reliable across different serverless function
      // instances. We fall back to a direct database lookup.
      const taskInfo = inMemoryTaskStore.get(taskId) ?? (await findSegmentByRunwayTaskId(taskId));
      
      if (taskInfo) {
        const { storylineId, segmentId } = taskInfo;
        console.log(`[VIDEO-MAKER API] Found storyline ${storylineId} and segment ${segmentId} for task ${taskId}. Updating database.`);
        await updateSegmentWithVideoAction(storylineId, segmentId, completedVideoUrl, taskId);
        
        // Clean up from in-memory store if it was there
        if (inMemoryTaskStore.has(taskId)) {
            inMemoryTaskStore.delete(taskId);
        }

      } else {
        console.warn(`[VIDEO-MAKER API] Could not find storyline/segment info for completed task ${taskId}. It might have been processed already or is an orphan task.`);
      }
    }
    
    return NextResponse.json({ success: true, data: taskDetails });
  } catch (error: any) {
    console.error(`[VIDEO-MAKER API] Failed to fetch task ${taskId}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to fetch task status', error: { message: error.message } }, { status: 500 });
  }
}

// Set max duration for video processing
export const maxDuration = 300; // 5 minutes 