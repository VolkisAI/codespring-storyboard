import { RunwayML, TaskFailedError } from '@runwayml/sdk';
import { NextResponse } from 'next/server';

// Simple in-memory storage for images (in production, use Redis or a database)
const imageStore = new Map<string, { imageUrl: string; prompt: string; style: string }>();

// Store images endpoint
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { images } = body;

    if (!images || !Array.isArray(images)) {
      return NextResponse.json({ success: false, message: 'Invalid images data' }, { status: 400 });
    }

    // Clear previous images and store new ones
    imageStore.clear();
    
    images.forEach((image: any) => {
      imageStore.set(image.segmentId, {
        imageUrl: image.imageUrl,
        prompt: image.prompt,
        style: image.style,
      });
    });

    console.log(`✅ Stored ${images.length} images in memory`);

    return NextResponse.json({
      success: true,
      message: `Successfully stored ${images.length} images`,
      segmentIds: images.map((img: any) => img.segmentId),
    });

  } catch (error: any) {
    console.error('Error storing images:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to store images',
    }, { status: 500 });
  }
}

// Generate video endpoint
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { segmentId } = body;

    if (!segmentId) {
      return NextResponse.json({ success: false, message: 'Missing segmentId' }, { status: 400 });
    }

    const imageData = imageStore.get(segmentId);
    if (!imageData) {
      return NextResponse.json({ success: false, message: 'Image not found for segmentId' }, { status: 404 });
    }

    console.log(`\n\n--- ✅ VIDEO-MAKER API: [${segmentId}] Starting Video Generation ---`);
    console.log(`--- Original Prompt: "${imageData.prompt}" ---`);
    console.log(`--- Style: "${imageData.style}" ---`);

    const runway = new RunwayML({
      apiKey: process.env.RUNWAY_API_KEY,
    });

    const promptText = `${imageData.prompt} Animate this image in a pixar style`;

    const taskSubmission = await runway.imageToVideo.create({
      model: 'gen4_turbo',
      promptImage: imageData.imageUrl,
      ratio: '720:1280',
      duration: 5,
      promptText,
    });

    console.log(`✅ Task submitted successfully. Task ID: ${taskSubmission.id}`);
    
    return NextResponse.json({
      success: true,
      message: 'Successfully submitted video generation task.',
      taskId: taskSubmission.id,
    });

  } catch (error: any) {
    console.error(`[VIDEO-MAKER API] Error during video generation:`, error);
    if (error instanceof TaskFailedError) {
      return NextResponse.json({
        success: false,
        message: 'Runway task failed to generate.',
        error: error.taskDetails,
      }, { status: 500 });
    }
    return NextResponse.json({
      success: false,
      message: error.message || 'An unexpected error occurred.',
      error: error,
    }, { status: 500 });
  }
}

// Get stored images endpoint
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const segmentId = searchParams.get('segmentId');
  const taskId = searchParams.get('taskId');

  // If taskId provided, fetch status from Runway
  if (taskId) {
    try {
      const apiKey = process.env.RUNWAY_API_KEY;
      const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-11-06',
        },
      });
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[VIDEO-MAKER API] Runway returned ${response.status}:`, errorBody);
        throw new Error(`Runway API responded with status ${response.status}: ${errorBody}`);
      }
      const taskDetails = await response.json();
      return NextResponse.json({ success: true, data: taskDetails });
    } catch (error: any) {
      console.error(`[VIDEO-MAKER API] Failed to fetch task ${taskId}:`, error);
      return NextResponse.json({ success: false, message: 'Failed to fetch task status', error }, { status: 500 });
    }
  }

  if (segmentId) {
    const imageData = imageStore.get(segmentId);
    if (!imageData) {
      return NextResponse.json({ success: false, message: 'Image not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: imageData });
  }

  // Return all segment IDs
  const segmentIds = Array.from(imageStore.keys());
  return NextResponse.json({ 
    success: true, 
    segmentIds,
    count: segmentIds.length 
  });
}

export const maxDuration = 300; 