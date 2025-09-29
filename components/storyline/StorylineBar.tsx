'use client';

import React from 'react';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { DownloadStorylineButton } from '../library/download-storyline-button';
import { StorylineSegment } from '@/db/schema/storyline-schema';

export type StorylineItemStatus = 'queued' | 'processing' | 'done' | 'failed';

interface StorylineItem {
  id: string;
  segmentId: string;
  thumbnailUrl: string; // Keep for image
  videoUrl?: string; // Add for video
  status: StorylineItemStatus;
  isSelected: boolean;
}

interface StorylineBarProps {
  items: StorylineItem[];
  onItemSelect: (id: string) => void;
  showVideo?: boolean;
  segments: StorylineSegment[];
  storylineName: string;
  /**
   * Whether to display the download videos button. Defaults to true.
   */
  showDownloadButton?: boolean;
}

const statusColors = {
  queued: 'bg-[#1E2424]/20 text-[#1E2424]/60',
  processing: 'bg-[#C5F547] text-[#1E2424]',
  done: 'bg-[#C5F547] text-[#1E2424]',
  failed: 'bg-red-500 text-white',
};

const SkeletonItem = () => (
  <div className="flex-shrink-0">
    <div className="w-20 h-20 rounded-xl bg-gray-200 animate-pulse" />
  </div>
);

export function StorylineBar({
  items,
  onItemSelect,
  showVideo = false,
  segments,
  storylineName,
  showDownloadButton = true,
}: StorylineBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#1E2424]/10 z-10 md:left-[220px] left-[60px] flex items-center pr-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 p-4">
          {items.map((item) => (
              <div key={item.id} className="flex-shrink-0">
                <div
                  onClick={() => onItemSelect(item.id)}
                  className={cn(
                    'relative w-20 h-20 rounded-xl border-2 border-transparent hover:border-[#C5F547] transition-all duration-200 cursor-pointer overflow-hidden',
                    item.isSelected && 'border-[#C5F547] scale-105'
                  )}
                >
                  {item.thumbnailUrl ? (
                    showVideo && item.videoUrl ? (
                      <video
                        src={item.videoUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        autoPlay
                        poster={item.thumbnailUrl}
                      />
                    ) : (
                      <Image
                        src={item.thumbnailUrl}
                        alt={`Thumbnail for ${item.segmentId}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                    </div>
                  )}

                  {item.thumbnailUrl && (
                    <>
                      <div className="absolute top-1 right-1">
                        <Badge
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 h-auto font-medium',
                            statusColors[item.status]
                          )}
                        >
                          {item.status === 'processing' && (
                            <Loader2 className="w-3 h-3 text-[#1E2424] mr-1 animate-spin" />
                          )}
                          {item.status}
                        </Badge>
                      </div>

                      <div className="absolute bottom-1 left-1 bg-[#1E2424]/80 text-white text-[10px] px-1.5 py-0.5 rounded-sm">
                        {item.segmentId}
                      </div>
                    </>
                  )}

                  {item.isSelected && (
                    <div className="absolute inset-0 bg-[#C5F547]/20 border-2 border-[#C5F547] rounded-xl" />
                  )}
                </div>
              </div>
            ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {showDownloadButton && (
        <div className="pl-4">
          <DownloadStorylineButton segments={segments} storylineName={storylineName} />
        </div>
      )}
    </div>
  );
} 