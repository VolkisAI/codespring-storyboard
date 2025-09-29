'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PlayCircle, PauseCircle, Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClipCardProps {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  segmentId: string;
  title?: string;
  onReplace?: (clipId: string) => void;
  onDownload?: (clipId: string) => void;
}

export function ClipCard({ 
  id, 
  videoUrl, 
  thumbnailUrl, 
  segmentId, 
  title,
  onReplace, 
  onDownload 
}: ClipCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDoubleClick = () => {
    setIsModalOpen(true);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(id);
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `clip-${segmentId}.mp4`;
      link.click();
    }
  };

  const handleReplace = () => {
    if (onReplace) {
      onReplace(id);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Main Card */}
      <div 
        className="relative group rounded-2xl overflow-hidden shadow-sm bg-white cursor-pointer"
        onDoubleClick={handleDoubleClick}
      >
        {/* Video */}
        <video
          ref={videoRef}
          src={videoUrl}
          poster={thumbnailUrl}
          className="w-full h-[140px] object-cover"
          muted
          loop
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Play/Pause Overlay */}
        <div 
          className="absolute inset-0 bg-[#1E2424]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200"
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <PauseCircle className="w-12 h-12 text-white" />
          ) : (
            <PlayCircle className="w-12 h-12 text-white" />
          )}
        </div>

        {/* Segment label */}
        <div className="absolute bottom-2 left-2 bg-[#1E2424]/80 text-white text-xs px-2 py-1 rounded-md">
          {segmentId}
        </div>

        {/* Title if provided */}
        {title && (
          <div className="absolute top-2 left-2 bg-[#1E2424]/80 text-white text-xs px-2 py-1 rounded-md max-w-[calc(100%-1rem)] truncate">
            {title}
          </div>
        )}
      </div>

      {/* Modal Inspector */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full p-6">
          <div className="space-y-4">
            {/* Modal Video */}
            <div className="relative rounded-2xl overflow-hidden bg-[#1E2424]">
              <video
                ref={modalVideoRef}
                src={videoUrl}
                poster={thumbnailUrl}
                className="w-full max-h-[60vh] object-contain"
                controls
                autoPlay
                muted
                loop
                playsInline
              />
            </div>

            {/* Video Info */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#1E2424]">
                  {title || `Clip ${segmentId}`}
                </h3>
                <p className="text-sm text-[#1E2424]/60">
                  Segment: {segmentId}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-[#1E2424]/10">
              <Button
                onClick={handleDownload}
                className="bg-[#C5F547] text-[#1E2424] hover:bg-[#C5F547]/90 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              
              <Button
                onClick={handleReplace}
                variant="outline"
                className="border-[#1E2424]/20 hover:border-[#C5F547] rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Replace
              </Button>

              <Button
                onClick={() => setIsModalOpen(false)}
                variant="ghost"
                className="ml-auto hover:bg-[#1E2424]/5 rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 