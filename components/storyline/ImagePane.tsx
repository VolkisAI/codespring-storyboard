'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { StorylineBar } from './StorylineBar';
import { PrimaryButton } from './PrimaryButton';
import { toast } from './Toast';
import { useStepper } from './Stepper';
import type { GeneratedImage } from '@/actions/storyline/storyline-image-actions';
import type { TranscriptSegment } from '@/actions/storyline/storyline-transcript-actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Loader2 } from 'lucide-react';

interface ImagePaneProps {
  initialImages?: GeneratedImage[];
  transcriptSegments?: TranscriptSegment[];
  isGenerating?: boolean;
  storylineId?: string | null;
}

interface StorylineItem {
  id: string;
  segmentId: string;
  thumbnailUrl: string;
  status: 'queued' | 'processing' | 'done';
}

const SkeletonLoader = () => (
  <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse" />
);

export function ImagePane({ initialImages = [], transcriptSegments = [], isGenerating = false, storylineId }: ImagePaneProps) {
  const { goNext } = useStepper();
  
  const [images, setImages] = useState(initialImages);
  const [storylineItems, setStorylineItems] = useState<StorylineItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  
  useEffect(() => {
    setImages(initialImages);
    
    let items: StorylineItem[];
    // If we are actively generating and have no final images yet
    if (isGenerating && initialImages.length === 0) {
      items = transcriptSegments.map(seg => ({
        id: seg.id,
        segmentId: seg.id,
        thumbnailUrl: '', // No image available yet
        status: 'processing' as const,
      }));
    } else {
      // If we have final images, use them
      items = initialImages.map(img => ({
        id: img.segmentId,
        segmentId: img.segmentId,
        thumbnailUrl: img.imageUrl,
        status: 'done' as const,
      }));
    }
    
    setStorylineItems(items);

    if (items.length > 0 && !selectedImageId) {
      setSelectedImageId(items[0].id);
    }
    // Depend on isGenerating to re-evaluate when it starts
  }, [initialImages, transcriptSegments, isGenerating, selectedImageId]);

  const [isGeneratingClips, setIsGeneratingClips] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedImage = images.find(img => img.segmentId === selectedImageId);
  const selectedTranscript = transcriptSegments.find(seg => seg.id === selectedImageId);

  const handleStorylineItemSelect = (itemId: string) => {
    setSelectedImageId(itemId);
  };
  
  const handleDownloadFrames = async () => {
    if (images.length === 0) {
      toast.error('No images to download', 'There are no images in the storyline to download.');
      return;
    }
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      images.forEach((image, index) => {
        const base64Data = image.imageUrl.split(',')[1];
        if (base64Data) {
          const filename = `frame_${image.segmentId || index + 1}.png`;
          zip.file(filename, base64Data, { base64: true });
        }
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'storyline_frames.zip');

      toast.success('Download started!', 'Your frames are being downloaded.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error('Download failed', errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateClips = async () => {
    setIsGeneratingClips(true);
    // This button should simply transition to the video generation pane
    // for ALL generated images.
    try {
      // A small delay can make the transition feel more deliberate.
      await new Promise(resolve => setTimeout(resolve, 500));
      goNext();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Could not proceed to video generation.';
      toast.error('Navigation failed', errorMessage);
      setIsGeneratingClips(false);
    }
  };

  const showLoadingState = isGenerating && images.length === 0;
  const selectedItem = storylineItems.find(item => item.id === selectedImageId);

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-grow flex p-6 gap-6 overflow-hidden">
        {/* Left Pane: Frame Details */}
        <div className="w-1/3 flex flex-col gap-6">
          <div className="flex-grow flex flex-col bg-gray-50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#1E2424] mb-4">Frame Details</h2>
            <ScrollArea className="flex-grow">
              <div className="space-y-6 pr-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Transcript</h3>
                  <p className="text-[#1E2424]">
                    {selectedTranscript?.text || 'No transcript available.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Image Prompt</h3>
                  <p className="text-[#1E2424]">
                    {selectedImage?.prompt || 'No prompt available.'}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Pane: Image Preview */}
        <div className="w-2/3 flex items-center justify-center bg-gray-50 rounded-2xl p-6">
          {selectedItem ? (
            selectedItem.thumbnailUrl ? (
              <div className="w-full h-full max-w-[400px] aspect-[9/16] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={selectedItem.thumbnailUrl}
                  alt={`Preview for ${selectedItem.segmentId}`}
                  width={400}
                  height={711}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full max-w-[400px] aspect-[9/16] flex flex-col items-center justify-center text-center">
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                <p className="text-sm text-gray-500 mt-4">Generating frame...</p>
              </div>
            )
          ) : showLoadingState ? (
            <div className="w-full h-full max-w-[400px] aspect-[9/16] flex flex-col items-center justify-center text-center">
              <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500 mt-4">Preparing generator...</p>
            </div>
          ) : (
            <div className="w-full h-full max-w-[400px] aspect-[9/16] flex items-center justify-center text-gray-400 text-center">
              Select an image to see a preview
            </div>
          )}
        </div>
      </div>

      {/* Storyline Bar & Generate Button */}
      <div className="relative">
        <StorylineBar
          items={storylineItems.map(item => ({
              ...item,
              isSelected: item.id === selectedImageId,
            }))
          }
          onItemSelect={handleStorylineItemSelect}
          showVideo={false}
          showDownloadButton={false}
          segments={[]}
          storylineName={storylineId || 'storyline'}
        />
        <div className="fixed bottom-4 right-6 z-20 flex items-center gap-4">
          <button
            onClick={handleDownloadFrames}
            disabled={isDownloading || images.length === 0}
            className="px-6 py-3 shadow-lg bg-gray-800 text-white rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-700"
          >
            {isDownloading ? 'Downloading...' : 'Download Frames'}
          </button>
          <PrimaryButton
            onClick={handleGenerateClips}
            disabled={images.length === 0 || isGeneratingClips}
            className="px-6 py-3 shadow-lg"
          >
            {isGeneratingClips ? 'Processing...' : `Generate ${images.length} Clips`}
          </PrimaryButton>
        </div>
      </div>
      {/* Spacer for the fixed storyline bar */}
      <div className="h-28 flex-shrink-0" />
    </div>
  );
} 