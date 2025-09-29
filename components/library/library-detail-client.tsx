/**
 * LibraryDetailClient Component
 * 
 * This is a client-side component that manages the state and interactivity
 * of the storyline detail view. It handles segment selection from the StorylineBar
 * and displays the corresponding media in the MediaPreview component.
 * 
 * Located in: /components/library/library-detail-client.tsx
 */
'use client';

import React, { useState, useMemo } from 'react';
import { SelectStoryline, StorylineSegment } from '@/db/schema/storyline-schema';
import { StorylineBar, StorylineItemStatus } from '@/components/storyline/StorylineBar';
import { MediaPreview } from '@/components/library/media-preview';

interface LibraryDetailClientProps {
  storyline: SelectStoryline & {
    segments: StorylineSegment[];
  };
}

export function LibraryDetailClient({ storyline }: LibraryDetailClientProps) {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    storyline.segments?.[0]?.id || null
  );

  const mapSegmentStatusToItemStatus = (status: StorylineSegment['status']): StorylineItemStatus => {
    switch (status) {
      case 'completed':
        return 'done';
      case 'failed':
        return 'failed';
      case 'image_generated':
      case 'video_processing':
        return 'processing';
      case 'pending':
      default:
        return 'queued';
    }
  };

  const storylineItems = useMemo(() => {
    return (storyline.segments || [])
      .filter(segment => !!segment.imageUrl) // Only show segments with generated images
      .map(segment => ({
      id: segment.id,
      segmentId: `Segment ${segment.order}`,
      thumbnailUrl: segment.imageUrl || '',
      videoUrl: segment.videoUrl, // Pass videoUrl through
      status: mapSegmentStatusToItemStatus(segment.status),
      isSelected: segment.id === selectedSegmentId,
    }));
  }, [storyline.segments, selectedSegmentId]);

  const selectedSegment = useMemo(() => {
    return storyline.segments.find(s => s.id === selectedSegmentId) || null;
  }, [storyline.segments, selectedSegmentId]);

  const handleItemSelect = (segmentId: string) => {
    setSelectedSegmentId(segmentId);
  };
  
  const showVideoInBar = storylineItems.some(item => item.status === 'done');

  return (
    <div className="flex h-full flex-col">
      <main className="flex-grow p-4 md:p-6">
        <MediaPreview segment={selectedSegment} />
      </main>
      
      <StorylineBar 
        items={storylineItems} 
        onItemSelect={handleItemSelect}
        showVideo={showVideoInBar}
        segments={storyline.segments}
        storylineName={storyline.name}
      />
    </div>
  );
} 