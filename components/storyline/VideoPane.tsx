'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { StorylineBar } from './StorylineBar';
import { toast } from './Toast';
// Removed compile-stepper logic – Stepper no longer needed
import type { TranscriptSegment } from '@/actions/storyline/storyline-transcript-actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getStorylineWithSegmentsAction } from '@/actions/storyline/storyline-storage-actions';
import { generateVideoForSegmentAction } from '@/actions/storyline/storyline-video-actions';
import { StorylineSegment, SelectStoryline } from '@/db/schema/storyline-schema';

// Polling interval in milliseconds. Adjust as needed.
const POLLING_INTERVAL_MS = 5000;

export interface GeneratedVideo {
  segmentId: string;
  videoUrl: string;
  videoPrompt: string;
  style: string;
}

interface VideoPaneProps {
  transcriptSegments?: TranscriptSegment[];
  storylineId?: string | null;
}

type StorylineItemStatus = 'queued' | 'processing' | 'done' | 'failed';

interface StorylineItem {
  id: string;
  segmentId: string;
  thumbnailUrl: string;
  videoUrl?: string;
  status: StorylineItemStatus;
}

interface StoredImage {
  imageUrl: string;
  prompt: string;
  style: string;
}

export function VideoPane({ storylineId }: VideoPaneProps) {
  const [storyline, setStoryline] = useState<SelectStoryline | null>(null);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [taskIds, setTaskIds] = useState<Record<string, string>>({});
  const [storylineItems, setStorylineItems] = useState<StorylineItem[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [storedImages, setStoredImages] = useState<Record<string, StoredImage>>({});
  // Keep a stable reference to storedImages so pollTask doesn't recreate on every update
  const storedImagesRef = useRef<Record<string, StoredImage>>({});
  const [isLoading, setIsLoading] = useState(true);
  const pollingRef = useRef<Record<string, boolean>>({});

  const getStatusFromSegment = (segment: StorylineSegment): StorylineItemStatus => {
    if (segment.status === 'completed' && segment.videoUrl) return 'done';
    if (segment.status === 'video_processing' && segment.runwayTaskId) return 'processing';
    if (segment.status === 'failed') return 'failed';
    if (segment.status === 'image_generated') return 'queued';
    return 'queued';
  };

  const pollTask = useCallback(async (taskId: string, segmentId: string) => {
    if (!pollingRef.current[taskId]) return;

    try {
      const res = await fetch(`/api/video-maker?taskId=${taskId}`);
      if (!res.ok) throw new Error(`API responded with status ${res.status}`);
      
      const result = await res.json();
      if (!result.success || !result.data) throw new Error(result.message || 'Polling failed to return data.');

      const { status, output, failureCode } = result.data;
      
      // Runway returns snake_case keys; support both for safety
      let videoUrl: string | undefined;
      if (Array.isArray(output)) {
        videoUrl = output[0];
      } else {
        videoUrl = output?.video_url || output?.videoUrl;
      }

      if (status === 'SUCCEEDED') {
        if (videoUrl) {
          const newVideo: GeneratedVideo = {
            segmentId: segmentId,
            videoUrl: videoUrl,
            videoPrompt: storedImagesRef.current[segmentId]?.prompt || 'N/A',
            style: storedImagesRef.current[segmentId]?.style || 'N/A',
          };
          setVideos(prev => [...prev, newVideo]);
          setStorylineItems(prev => prev.map(item =>
            item.id === segmentId ? { ...item, videoUrl: videoUrl, status: 'done' } : item
          ));
          toast.success(`Video for segment ${segmentId} is ready!`);
        } else {
          // Video processing finished but URL not yet available. Retry after delay.
          console.warn(`Video for task ${taskId} completed but URL not yet ready. Retrying in ${POLLING_INTERVAL_MS / 1000}s.`);
          setTimeout(() => pollTask(taskId, segmentId), POLLING_INTERVAL_MS);
        }
        // Only delete polling ref if we have the URL; otherwise keep polling.
        if (videoUrl) delete pollingRef.current[taskId];
      } else if (status === 'FAILED') {
        toast.error(`Video generation failed for segment ${segmentId}.`, failureCode || 'Unknown error.');
        setStorylineItems(prev => prev.map(item => item.id === segmentId ? { ...item, status: 'failed' } : item));
        delete pollingRef.current[taskId];
      } else {
        setTimeout(() => pollTask(taskId, segmentId), POLLING_INTERVAL_MS);
      }
    } catch (error: any) {
      console.error(`Failed to poll task ${taskId}:`, error);
      toast.error(`Failed to check video status for segment ${segmentId}.`);
      setStorylineItems(prev => prev.map(item => item.id === segmentId ? { ...item, status: 'failed' } : item));
      delete pollingRef.current[taskId];
    }
  }, []);

  const generateVideo = useCallback(async (storylineId: string, segmentId: string) => {
    if (pollingRef.current[segmentId]) return;
    pollingRef.current[segmentId] = true;

    setStorylineItems(prev => prev.map(item => item.id === segmentId ? { ...item, status: 'processing' } : item));

    const result = await generateVideoForSegmentAction(storylineId, segmentId);

    if (result.isSuccess && result.data?.taskId) {
      const taskId = result.data.taskId;
      setTaskIds(prev => ({ ...prev, [segmentId]: taskId }));
      delete pollingRef.current[segmentId];
      pollingRef.current[taskId] = true;
      pollTask(taskId, segmentId);
    } else {
      toast.error(`Failed to start video generation for ${segmentId}.`, result.message);
      setStorylineItems(prev => prev.map(item => item.id === segmentId ? { ...item, status: 'failed' } : item));
      delete pollingRef.current[segmentId];
    }
  }, [pollTask]);
  
  useEffect(() => {
    if (!storylineId) {
      toast.error('Error', 'No storyline ID provided.');
      setIsLoading(false);
      return;
    }

    const fetchStorylineAndGenerate = async () => {
      setIsLoading(true);
      const result = await getStorylineWithSegmentsAction(storylineId);

      if (!result.isSuccess || !result.data) {
        toast.error('Failed to load storyline data.', result.message);
        setIsLoading(false);
        return;
      }
      
      const { storyline: fetchedStoryline, segments } = result.data;
      setStoryline(fetchedStoryline);
      
      const segmentsWithImages = segments.filter(s => s.imageUrl);
      
      console.log(`[VideoPane] Found ${segmentsWithImages.length} segments with images ready for video generation.`);
      
      const imagesMap: Record<string, StoredImage> = {};
      segmentsWithImages.forEach(segment => {
          if(segment.imageUrl && segment.prompt && segment.style) {
              imagesMap[segment.id] = { imageUrl: segment.imageUrl, prompt: segment.prompt, style: segment.style };
          }
      });
      setStoredImages(imagesMap);
      storedImagesRef.current = imagesMap; // keep ref in sync

      const items: StorylineItem[] = segmentsWithImages.map(segment => ({
        id: segment.id,
        segmentId: segment.id,
        thumbnailUrl: segment.imageUrl || '',
        videoUrl: segment.videoUrl || undefined,
        status: getStatusFromSegment(segment),
      }));
      setStorylineItems(items);

      if (items.length > 0) {
        setSelectedVideoId(items[0].id);
      }
      setIsLoading(false);

      if (segmentsWithImages.length > 0) {
        toast.info(`Found ${segmentsWithImages.length} images to process for video generation.`);
        
        // Process all segments in parallel, but only if not already started
        segmentsWithImages.forEach((segment) => {
          const status = getStatusFromSegment(segment);
          if (status === 'queued') {
            generateVideo(storylineId, segment.id);
          } else if (status === 'processing' && segment.runwayTaskId) {
            // If page was reloaded, restart polling for tasks already in progress
            if (!pollingRef.current[segment.runwayTaskId]) {
              pollingRef.current[segment.runwayTaskId] = true;
              pollTask(segment.runwayTaskId, segment.id);
            }
          }
        });
      } else {
        toast.info('All videos are already generated or in process.');
        // If all videos are already done, check for any that are still processing
         segments.forEach((segment) => {
          if (getStatusFromSegment(segment) === 'processing' && segment.runwayTaskId) {
            pollingRef.current[segment.runwayTaskId] = true;
            pollTask(segment.runwayTaskId, segment.id);
          }
        });
      }
    };

    fetchStorylineAndGenerate();
    
    const currentPollingRef = pollingRef.current;
    return () => {
      Object.keys(currentPollingRef).forEach(key => {
        currentPollingRef[key] = false;
      });
    };
  }, [storylineId, generateVideo, pollTask]);

  const [isDownloadingVideos, setIsDownloadingVideos] = useState(false);
  
  const selectedVideo = videos.find(vid => vid.segmentId === selectedVideoId);
  const selectedStorylineItem = storylineItems.find(item => item.id === selectedVideoId);
  const selectedTranscript = (storyline?.segments as StorylineSegment[])?.find(seg => seg.id === selectedVideoId);
  const selectedImage = storedImages[selectedVideoId || ''];

  const handleStorylineItemSelect = (itemId: string) => {
    setSelectedVideoId(itemId);
  };
  
  const handleDownloadVideos = async () => {
    if (isDownloadingVideos || !allClipsDone) return;

    const videosToDownload = storylineItems.filter(item => item.status === 'done' && item.videoUrl);

    if (videosToDownload.length === 0) {
      toast.error('No completed videos to download.');
      return;
    }

    setIsDownloadingVideos(true);
    toast.info(`Starting download for ${videosToDownload.length} videos...`);

    try {
      const zip = new JSZip();

      const downloadPromises = videosToDownload.map(async (item) => {
        try {
          const response = await fetch(item.videoUrl!);
          if (!response.ok) {
            throw new Error(`Failed to fetch video for segment ${item.segmentId}`);
          }
          const blob = await response.blob();
          zip.file(`segment_${item.segmentId}.mp4`, blob);
        } catch (error) {
          console.error(`Failed to download or add video ${item.segmentId} to zip:`, error);
          toast.error(`Could not download video for segment ${item.segmentId}.`);
        }
      });

      await Promise.all(downloadPromises);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${(storyline?.name || 'storyline').replace(/ /g, '_')}_videos.zip`);

      toast.success('Download complete!');
    } catch (error) {
      console.error('Error creating zip file:', error);
      toast.error('An unexpected error occurred while creating the zip file.');
    } finally {
      setIsDownloadingVideos(false);
    }
  };

  const allClipsDone = storylineItems.length > 0 && storylineItems.every(item => item.status === 'done');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-[#1E2424]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-grow flex p-6 gap-6 overflow-hidden">
        {/* Left Pane: Frame Details */}
        <div className="w-1/3 flex flex-col gap-6">
          <div className="flex-grow flex flex-col bg-gray-50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#1E2424] mb-4">Frame Videos</h2>
            <ScrollArea className="flex-grow">
              <div className="space-y-6 pr-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Video Prompt</h3>
                  <p className="text-[#1E2424]">
                    {selectedVideo?.videoPrompt || selectedImage?.prompt || 'No video prompt available.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Transcript</h3>
                  <p className="text-[#1E2424]">
                    {selectedTranscript?.text || 'No transcript available.'}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Pane: Video Preview */}
        <div className="w-2/3 flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-6">
          {selectedVideo ? (
            <video
              key={selectedVideo.videoUrl}
              src={selectedVideo.videoUrl}
              className="w-full h-full max-w-[400px] aspect-[9/16] rounded-xl"
              controls
              autoPlay
              muted
            />
          ) : selectedStorylineItem && selectedStorylineItem.thumbnailUrl && selectedStorylineItem.status !== 'done' ? (
             <div className="relative w-full h-full max-w-[400px] aspect-[9/16] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={selectedStorylineItem.thumbnailUrl}
                  alt={`Preview for ${selectedStorylineItem.segmentId}`}
                  layout="fill"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white text-center p-4">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="font-semibold">Video is processing...</p>
                    <p className="text-sm opacity-80">Check back in a moment.</p>
                </div>
              </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p>Loading Storyline...</p>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <p>Select a clip to preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Storyline Bar & Compile Button */}
      <div className="relative">
        <StorylineBar
          items={storylineItems.map(item => ({
            ...item,
            isSelected: item.id === selectedVideoId,
          }))}
          onItemSelect={handleStorylineItemSelect}
          showVideo={storylineItems.some(i => i.status === 'done' && i.videoUrl)} // Show video if any have videoUrl
          showDownloadButton={false}
          segments={storyline?.segments as StorylineSegment[] || []}
          storylineName={storyline?.name || 'storyline'}
        />
        <div className="fixed bottom-4 right-6 z-20">
          <button
            onClick={handleDownloadVideos}
            disabled={isDownloadingVideos || !allClipsDone}
            className="px-6 py-3 shadow-lg bg-gray-800 text-white rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-700"
          >
            {isDownloadingVideos ? 'Downloading...' : 'Download Videos'}
          </button>
        </div>
      </div>
      {/* Spacer for the fixed storyline bar */}
      <div className="h-28 flex-shrink-0" />
    </div>
  );
} 