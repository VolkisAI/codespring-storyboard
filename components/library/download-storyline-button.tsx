/**
 * DownloadStorylineButton Component
 * 
 * This component provides a dropdown menu to download all generated images or videos
 * for a storyline as a single zip file.
 * 
 * Located in: /components/library/download-storyline-button.tsx
 */
'use client';

import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from '../storyline/Toast';
import { StorylineSegment } from '@/db/schema/storyline-schema';

interface DownloadStorylineButtonProps {
  segments: StorylineSegment[];
  storylineName: string;
  className?: string;
}

export function DownloadStorylineButton({
  segments,
  storylineName,
  className,
}: DownloadStorylineButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const videosToDownload = segments.filter(
      (segment) => segment.status === 'completed' && segment.videoUrl
    );

    if (videosToDownload.length === 0) {
      toast.error('No completed videos to download.');
      return;
    }

    setIsDownloading(true);
    toast.info(`Starting download for ${videosToDownload.length} videos...`);

    try {
      const zip = new JSZip();

      const downloadPromises = videosToDownload.map(async (segment) => {
        try {
          const response = await fetch(segment.videoUrl!);
          if (!response.ok) {
            throw new Error(`Failed to fetch video for segment ${segment.order}`);
          }
          const blob = await response.blob();
          zip.file(`segment_${segment.order}.mp4`, blob);
        } catch (error) {
          console.error(`Failed to download or add video ${segment.order} to zip:`, error);
          toast.error(`Could not download video for segment ${segment.order}.`);
        }
      });

      await Promise.all(downloadPromises);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${storylineName.replace(/ /g, '_')}_videos.zip`);

      toast.success('Download complete!');
    } catch (error) {
      console.error('Error creating zip file:', error);
      toast.error('An unexpected error occurred while creating the zip file.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      className={className}
      variant="outline"
    >
      {isDownloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download Videos
        </>
      )}
    </Button>
  );
} 