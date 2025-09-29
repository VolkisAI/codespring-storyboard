/**
 * MediaPreview Component
 * 
 * This component displays a selected media item (image or video) from a storyline.
 * It features tabs to switch between the image and video views.
 * 
 * Located in: /components/library/media-preview.tsx
 */
'use client';

import React from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, VideoIcon, AlertCircle } from 'lucide-react';
import { StorylineSegment } from '@/db/schema/storyline-schema';

interface MediaPreviewProps {
  segment: StorylineSegment | null;
}

export function MediaPreview({ segment }: MediaPreviewProps) {
  if (!segment) {
    return (
      <Card className="flex h-[50vh] w-full items-center justify-center bg-gray-50">
        <div className="text-center text-muted-foreground">
          <p>Select an item from the timeline below to preview it.</p>
        </div>
      </Card>
    );
  }

  const defaultTab = segment.videoUrl ? 'video' : 'image';

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="flex justify-center mb-4">
          <TabsList>
            <TabsTrigger value="image" disabled={!segment.imageUrl}>
              <ImageIcon className="mr-2 h-4 w-4" /> Image
            </TabsTrigger>
            <TabsTrigger value="video" disabled={!segment.videoUrl}>
              <VideoIcon className="mr-2 h-4 w-4" /> Video
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="image">
          <div className="relative aspect-video w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-xl">
            {segment.imageUrl ? (
              <Image
                src={segment.imageUrl}
                alt={`Image for segment ${segment.order}`}
                fill
                className="object-contain p-2"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="mx-auto h-12 w-12" />
                  <p>No image generated for this segment.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="video">
          <div className="relative aspect-video w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-xl">
            {segment.videoUrl ? (
              <video
                src={segment.videoUrl}
                controls
                autoPlay
                loop
                muted
                className="h-full w-full object-contain rounded-xl"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <VideoIcon className="mx-auto h-12 w-12" />
                  <p>No video generated for this segment yet.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 