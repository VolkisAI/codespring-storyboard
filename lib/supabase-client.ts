/**
 * Upload a video file using a presigned URL approach
 * This bypasses ALL server-side upload limits by uploading directly to Supabase storage
 */
export async function uploadVideoToSupabase(
  file: File,
  userId: string
): Promise<{ url: string; path: string } | null> {
  try {
    console.log('[Client] Preparing to upload video:', file.name);
    
    // Step 1: Get a presigned upload URL from our API
    const urlResponse = await fetch(`/api/upload-video?fileName=${encodeURIComponent(file.name)}&bucketName=storyline-originals`);
    
    if (!urlResponse.ok) {
      const error = await urlResponse.text();
      console.error('[Client] Failed to get upload URL:', error);
      return null;
    }
    
    const { uploadUrl, token, path, publicUrl } = await urlResponse.json();
    console.log('[Client] Got upload URL, uploading directly to Supabase...');
    
    // Step 2: Upload directly to Supabase using the presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'video/mp4',
      },
    });
    
    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error('[Client] Direct upload failed:', error);
      return null;
    }
    
    console.log('[Client] Upload successful:', publicUrl);
    
    return {
      url: publicUrl,
      path: path
    };
  } catch (error) {
    console.error('[Client] Error uploading video:', error);
    return null;
  }
} 