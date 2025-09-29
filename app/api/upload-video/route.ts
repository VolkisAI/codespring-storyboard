import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate a presigned upload URL for direct browser uploads
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get('fileName');
    const bucketName = searchParams.get('bucketName') || 'storyline-originals';

    if (!fileName) {
      return NextResponse.json({ error: 'Missing fileName' }, { status: 400 });
    }

    // Generate a unique file path
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop() || 'mp4';
    const filePath = `${userId}/${timestamp}-original.${fileExtension}`;

    console.log(`[API] Creating signed upload URL for: ${filePath}`);

    // Create a signed upload URL
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error('[API] Error creating signed URL:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get the public URL for the file (it will be accessible after upload)
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      uploadUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      publicUrl: urlData.publicUrl
    });

  } catch (error) {
    console.error('[API] Error in upload URL handler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create upload URL' },
      { status: 500 }
    );
  }
} 