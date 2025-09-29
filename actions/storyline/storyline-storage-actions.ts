'use server';

import { createClient } from '@supabase/supabase-js';
import { ActionResult } from '@/types/actions/actions-types';
import { 
  createStoryline,
  updateStoryline,
  getStorylineById,
  updateStorylineSegmentInJson,
  addGeneratedImageUrl,
  addGeneratedVideoUrl,
  addMultipleGeneratedImageUrls
} from '@/db/queries/storyline-queries';
import { InsertStoryline, SelectStoryline, StorylineSegment } from '@/db/schema/storyline-schema';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { RunwayML } from '@runwayml/sdk';

// Initialize Supabase client for storage operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Storage bucket names
const IMAGE_BUCKET = 'storyline-images';
const VIDEO_BUCKET = 'storyline-videos';
const ORIGINAL_VIDEO_BUCKET = 'storyline-originals';

/**
 * Convert base64 image to buffer and upload to Supabase storage
 */
async function uploadBase64ImageToStorage(
  base64Data: string,
  storylineId: string,
  segmentId: string
): Promise<string | null> {
  try {
    const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64String, 'base64');
    const filename = `${storylineId}/${segmentId}.jpg`;
    
    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(filename);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadBase64ImageToStorage:', error);
    return null;
  }
}

/**
 * Download video from URL and upload to Supabase storage using streaming
 * This avoids memory issues with large files
 */
async function downloadAndUploadVideo(
  videoUrl: string,
  storylineId: string,
  segmentId: string
): Promise<string | null> {
  try {
    console.log(`[downloadAndUploadVideo] Starting download from Runway: ${videoUrl}`);
    
    const response = await fetch(videoUrl);
    if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);
    
    // Check content length
    const contentLength = response.headers.get('content-length');
    const fileSizeMB = contentLength ? parseInt(contentLength) / (1024 * 1024) : 0;
    console.log(`[downloadAndUploadVideo] Video size: ${fileSizeMB.toFixed(2)} MB`);
    
    // For Runway videos, we need to download first then upload
    // because Supabase doesn't support streaming uploads yet
    const chunks: Uint8Array[] = [];
    const reader = response.body?.getReader();
    
    if (!reader) {
      throw new Error('Failed to get response reader');
    }
    
    let downloadedSize = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      chunks.push(value);
      downloadedSize += value.length;
      
      // Log progress every 5MB
      if (downloadedSize % (5 * 1024 * 1024) < value.length) {
        console.log(`[downloadAndUploadVideo] Downloaded ${(downloadedSize / (1024*1024)).toFixed(2)} MB...`);
      }
    }
    
    // Combine chunks into a single buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const buffer = new Uint8Array(totalLength);
    let position = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, position);
      position += chunk.length;
    }
    
    console.log(`[downloadAndUploadVideo] Download complete, uploading to Supabase...`);
    
    const filename = `${storylineId}/${segmentId}.mp4`;
    
    const { error } = await supabase.storage
      .from(VIDEO_BUCKET)
      .upload(filename, buffer, {
        contentType: 'video/mp4',
        upsert: true
      });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from(VIDEO_BUCKET)
      .getPublicUrl(filename);
    
    console.log(`[downloadAndUploadVideo] Upload complete: ${urlData.publicUrl}`);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in downloadAndUploadVideo:', error);
    return null;
  }
}

/**
 * Upload video file from FormData to storage
 */
export async function uploadVideoFromFormDataAction(
  formData: FormData,
  userId: string,
  fileName: string
): Promise<ActionResult<string>> {
  try {
    console.log('[uploadVideoFromFormDataAction] Starting video upload for:', fileName);
    
    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
      console.error('[uploadVideoFromFormDataAction] No file provided');
      return { isSuccess: false, message: 'No file provided' };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${userId}/${timestamp}-${fileName}`;
    
    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('[uploadVideoFromFormDataAction] Uploading to bucket:', ORIGINAL_VIDEO_BUCKET);
    console.log('[uploadVideoFromFormDataAction] File size:', buffer.length, 'bytes');
    
    const { error: uploadError } = await supabase.storage
      .from(ORIGINAL_VIDEO_BUCKET)
      .upload(filename, buffer, {
        contentType: file.type || 'video/mp4',
        upsert: false
      });
    
    if (uploadError) {
      console.error('[uploadVideoFromFormDataAction] Upload error:', uploadError);
      return { isSuccess: false, message: `Upload failed: ${uploadError.message}` };
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(ORIGINAL_VIDEO_BUCKET)
      .getPublicUrl(filename);
    
    console.log('[uploadVideoFromFormDataAction] Video uploaded successfully:', urlData.publicUrl);
    
    return {
      isSuccess: true,
      message: 'Video uploaded successfully',
      data: urlData.publicUrl
    };
  } catch (error) {
    console.error('[uploadVideoFromFormDataAction] Error uploading video:', error);
    return { isSuccess: false, message: 'Failed to upload video' };
  }
}

/**
 * Create a new storyline with initial segments
 */
export async function createStorylineAction(
  name: string,
  initialSegments: Omit<StorylineSegment, 'status'>[],
  originalVideoUrl?: string
): Promise<ActionResult<SelectStoryline>> {
  try {
    console.log('[createStorylineAction] Starting storyline creation for:', name);
    
    const { userId } = await auth();
    if (!userId) {
      console.error('[createStorylineAction] User not authenticated');
      return { isSuccess: false, message: 'User not authenticated' };
    }

    const segments: StorylineSegment[] = initialSegments.map(s => ({ ...s, status: 'pending' }));

    console.log('[createStorylineAction] Creating storyline record in database');
    const storyline = await createStoryline({
      name,
      userId,
      originalVideoUrl,
      status: 'processing',
      segments
    });

    console.log('[createStorylineAction] Storyline created successfully:', storyline.id);
    revalidatePath('/dashboard/storyline');
    
    return {
      isSuccess: true,
      message: 'Storyline created successfully',
      data: storyline
    };
  } catch (error) {
    console.error('[createStorylineAction] Error creating storyline:', error);
    return { isSuccess: false, message: 'Failed to create storyline' };
  }
}

/**
 * Update segment with generated image
 */
export async function updateSegmentWithImageAction(
  storylineId: string,
  segmentId: string,
  base64Image: string
): Promise<ActionResult<SelectStoryline>> {
  try {
    const imageUrl = await uploadBase64ImageToStorage(base64Image, storylineId, segmentId);
    if (!imageUrl) {
      return { isSuccess: false, message: 'Failed to upload image' };
    }

    const updatedStoryline = await updateStorylineSegmentInJson(
      storylineId,
      segmentId,
      { 
        imageUrl,
        status: 'image_generated' 
      }
    );

    // Also add the image URL to the storyline's image array
    await addGeneratedImageUrl(storylineId, imageUrl);

    revalidatePath('/dashboard/storyline');
    
    return {
      isSuccess: true,
      message: 'Image uploaded successfully',
      data: updatedStoryline!
    };
  } catch (error) {
    console.error('Error updating segment with image:', error);
    return { isSuccess: false, message: 'Failed to update segment with image' };
  }
}

/**
 * Update segment with generated video from Runway
 */
export async function updateSegmentWithVideoAction(
  storylineId: string,
  segmentId: string,
  videoUrl: string,
  runwayTaskId?: string
): Promise<ActionResult<SelectStoryline>> {
  try {
    const hostedVideoUrl = await downloadAndUploadVideo(videoUrl, storylineId, segmentId);
    if (!hostedVideoUrl) {
      return { isSuccess: false, message: 'Failed to upload video' };
    }

    const updatedStorylineWithVideo = await updateStorylineSegmentInJson(
      storylineId,
      segmentId,
      { 
        videoUrl: hostedVideoUrl,
        runwayTaskId,
        status: 'completed'
      }
    );

    // Also add the video URL to the storyline's video array
    await addGeneratedVideoUrl(storylineId, hostedVideoUrl);

    // Check if all segments are completed
    const allSegments = updatedStorylineWithVideo?.segments as StorylineSegment[];
    const allCompleted = allSegments?.every(seg => seg.status === 'completed');
    
    let finalStoryline = updatedStorylineWithVideo;
    if (allCompleted) {
      finalStoryline = await updateStoryline(storylineId, { status: 'completed' });
    }

    revalidatePath('/dashboard/storyline');
    
    return {
      isSuccess: true,
      message: 'Video uploaded successfully',
      data: finalStoryline!
    };
  } catch (error) {
    console.error('Error updating segment with video:', error);
    return { isSuccess: false, message: 'Failed to update segment with video' };
  }
}

/**
 * Batch update multiple segments with generated images
 */
export async function batchUpdateSegmentsWithImagesAction(
  storylineId: string,
  images: Array<{ segmentId: string; base64Image: string }>
): Promise<ActionResult<SelectStoryline>> {
  try {
    console.log(`[batchUpdateSegmentsWithImages] Processing ${images.length} images for storyline ${storylineId}`);
    
    const uploadedImageUrls: string[] = [];
    
    // Upload all images and update segments
    for (const { segmentId, base64Image } of images) {
      const imageUrl = await uploadBase64ImageToStorage(base64Image, storylineId, segmentId);
      if (imageUrl) {
        await updateStorylineSegmentInJson(
          storylineId,
          segmentId,
          { 
            imageUrl,
            status: 'image_generated' 
          }
        );
        uploadedImageUrls.push(imageUrl);
      }
    }

    // Update the storyline with all image URLs at once
    const finalStoryline = await addMultipleGeneratedImageUrls(storylineId, uploadedImageUrls);

    revalidatePath('/dashboard/storyline');
    
    return {
      isSuccess: true,
      message: `Successfully uploaded ${uploadedImageUrls.length} images`,
      data: finalStoryline
    };
  } catch (error) {
    console.error('Error in batch update segments with images:', error);
    return { isSuccess: false, message: 'Failed to batch update segments with images' };
  }
}

/**
 * Get storyline with all segments
 */
export async function getStorylineWithSegmentsAction(
  storylineId: string
): Promise<ActionResult<{ storyline: SelectStoryline; segments: StorylineSegment[] }>> {
  try {
    const storyline = await getStorylineById(storylineId);
    
    if (!storyline) {
      return { isSuccess: false, message: 'Storyline not found' };
    }

    const segments = storyline.segments as StorylineSegment[];

    return {
      isSuccess: true,
      message: 'Storyline retrieved successfully',
      data: { storyline, segments }
    };
  } catch (error) {
    console.error('Error getting storyline with segments:', error);
    return { isSuccess: false, message: 'Failed to get storyline' };
  }
}

/**
 * Initialize storage buckets (run once)
 */
export async function initializeStorageBucketsAction(): Promise<ActionResult<void>> {
  try {
    // Create buckets if they don't exist
    const buckets = [IMAGE_BUCKET, VIDEO_BUCKET, ORIGINAL_VIDEO_BUCKET];
    
    for (const bucketName of buckets) {
      const { data: existingBucket } = await supabase.storage.getBucket(bucketName);
      
      if (!existingBucket) {
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: bucketName === ORIGINAL_VIDEO_BUCKET ? 104857600 : 52428800 // 100MB for originals, 50MB for others
        });
        
        if (error && !error.message.includes('already exists')) {
          throw error;
        }
      }
    }

    return { isSuccess: true, message: 'Storage buckets initialized successfully' };
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
    return { isSuccess: false, message: 'Failed to initialize storage buckets' };
  }
} 

/**
 * Deletes a storyline, including all associated images and videos from storage.
 */
export async function deleteStorylineAction(
  storylineId: string
): Promise<ActionResult<void>> {
  try {
    const { userId } = auth();
    if (!userId) {
      return { isSuccess: false, message: 'User not authenticated' };
    }

    // 1. Get storyline to verify ownership and get file paths
    const storyline = await getStorylineById(storylineId);
    if (!storyline || storyline.userId !== userId) {
      return { isSuccess: false, message: 'Storyline not found or you do not have permission to delete it.' };
    }

    // 2. Delete all generated images from storage
    const { data: imageFiles } = await supabase.storage.from(IMAGE_BUCKET).list(storylineId);
    if (imageFiles && imageFiles.length > 0) {
      const imagePaths = imageFiles.map(file => `${storylineId}/${file.name}`);
      await supabase.storage.from(IMAGE_BUCKET).remove(imagePaths);
    }

    // 3. Delete all generated videos from storage
    const { data: videoFiles } = await supabase.storage.from(VIDEO_BUCKET).list(storylineId);
    if (videoFiles && videoFiles.length > 0) {
      const videoPaths = videoFiles.map(file => `${storylineId}/${file.name}`);
      await supabase.storage.from(VIDEO_BUCKET).remove(videoPaths);
    }
    
    // 4. Delete the original uploaded video
    if (storyline.originalVideoUrl) {
      try {
        const url = new URL(storyline.originalVideoUrl);
        const path = decodeURIComponent(url.pathname.split(`/public/${ORIGINAL_VIDEO_BUCKET}/`)[1]);
        await supabase.storage.from(ORIGINAL_VIDEO_BUCKET).remove([path]);
      } catch (e) {
        console.error("Failed to parse or delete original video, continuing deletion process.", e);
      }
    }

    // 5. Delete storyline from the database
    // This should be in storyline-queries.ts, assuming it exists
    const { deleteStoryline } = await import('@/db/queries/storyline-queries');
    await deleteStoryline(storylineId);

    revalidatePath('/dashboard/library');
    return { isSuccess: true, message: 'Storyline deleted successfully.' };

  } catch (error) {
    console.error('Error deleting storyline:', error);
    return { isSuccess: false, message: 'Failed to delete storyline.' };
  }
} 






