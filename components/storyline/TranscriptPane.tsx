'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TranscriptCard } from './TranscriptCard';
import { PromptField } from './PromptField';
import { PrimaryButton } from './PrimaryButton';
import { toast } from './Toast';
import { useStepper } from './Stepper';
import type { TranscriptSegment } from '@/actions/storyline/storyline-transcript-actions';
import { Loader2 } from 'lucide-react';

interface TranscriptPaneProps {
  initialSegments: TranscriptSegment[];
  onSegmentsSelected?: (segments: TranscriptSegment[]) => void;
  isGenerating?: boolean;
}

const SkeletonCard = () => (
  <div className="mb-3 p-4 bg-gray-100 rounded-xl animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
  </div>
);

const SkeletonPromptField = () => (
  <div className="p-4 bg-gray-50 rounded-xl animate-pulse">
    <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
    <div className="h-20 bg-gray-200 rounded"></div>
  </div>
);

export function TranscriptPane({ initialSegments, onSegmentsSelected, isGenerating = false }: TranscriptPaneProps) {
  const { goNext } = useStepper();
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  
  const promptRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    console.log('TranscriptPane received initialSegments:', initialSegments?.length);
    if (initialSegments && initialSegments.length > 0) {
      console.log('Setting segments, first segment:', initialSegments[0]);
      setSegments(initialSegments.map(s => ({ ...s, isSelected: true })));
    }
  }, [initialSegments]);

  const selectedCount = segments.filter(s => s.isSelected).length;
  const hasSelectedSegments = selectedCount > 0;

  console.log('TranscriptPane render - segments:', segments.length, 'isGenerating:', isGenerating);

  const handleSegmentSelect = (id: string, selected: boolean) => {
    setSegments(prev => prev.map(segment => 
      segment.id === id ? { ...segment, isSelected: selected } : segment
    ));
  };

  const handleSelectAllToggle = (selectAll: boolean) => {
    setSegments(prevSegments =>
      prevSegments.map(segment => ({ ...segment, isSelected: selectAll }))
    );
  };

  const handlePromptChange = (segmentId: string, prompt: string) => {
    setSegments(prev => prev.map(segment => 
      segment.id === segmentId ? { ...segment, prompt } : segment
    ));
  };

  const handleStyleChange = (segmentId: string, style: string) => {
    setSegments(prev => prev.map(segment => 
      segment.id === segmentId ? { ...segment, style } : segment
    ));
  };

  const handleTranscriptCardClick = (segmentId: string) => {
    const promptElement = promptRefs.current[segmentId];
    if (promptElement) {
      promptElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      promptElement.classList.add('ring-2', 'ring-[#C5F547]');
      setTimeout(() => {
        promptElement.classList.remove('ring-2', 'ring-[#C5F547]');
      }, 1000);
    }
  };

  const handleContinue = () => {
    const selectedSegments = segments.filter(s => s.isSelected && s.prompt.trim());

    if (selectedSegments.length === 0) {
      toast.error('No segments with prompts selected', 'Please select at least one segment and add a prompt to continue.');
      return;
    }

    if (onSegmentsSelected) {
      onSegmentsSelected(selectedSegments);
    }
    
    goNext();
  };

  // Show loading state when generating and no segments yet
  if (isGenerating && segments.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="flex-1 flex flex-col md:flex-row gap-8 px-6 py-8 overflow-hidden">
          {/* Left column - Loading transcript segments */}
          <div className="flex-1 md:max-w-[60%] flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#1E2424] mb-2">
                AI-Suggested Scenes
              </h2>
              <p className="text-sm text-[#1E2424]/60">
                Generating transcript and scene suggestions...
              </p>
            </div>
            <ScrollArea className="flex-1 -mr-4">
              <div className="pr-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </ScrollArea>
          </div>

          {/* Right column - Loading prompt fields */}
          <div className="flex-1 md:max-w-[40%] flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#1E2424] mb-2">
                Generated Prompts
              </h2>
              <p className="text-sm text-[#1E2424]/60">
                Preparing AI-generated prompts...
              </p>
            </div>
            <ScrollArea className="flex-1 -mr-4">
              <div className="space-y-3 pr-4">
                <SkeletonPromptField />
                <SkeletonPromptField />
                <SkeletonPromptField />
                <SkeletonPromptField />
              </div>
            </ScrollArea>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-[#1E2424]/10 py-4 px-6 flex items-center justify-center">
          <div className="flex items-center gap-3 text-[#1E2424]/60">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing your video...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state only when not generating and truly no segments
  if (!isGenerating && segments.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-center text-center">
        <h2 className="text-xl font-semibold text-[#1E2424] mb-2">
          No transcript available
        </h2>
        <p className="text-sm text-[#1E2424]/60">
          Go back to the previous step to upload a video.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Main content area */}
      <div className="flex-1 flex flex-col md:flex-row gap-8 px-6 py-8 overflow-hidden">
        {/* Left column - Transcript segments */}
        <div className="flex-1 md:max-w-[60%] flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#1E2424] mb-2">
              AI-Suggested Scenes
            </h2>
            <p className="text-sm text-[#1E2424]/60">
              Select the scenes you want to generate visuals for. Click a card to highlight its prompt.
            </p>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => handleSelectAllToggle(true)}
              className="text-xs font-medium text-gray-500 hover:text-gray-900"
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => handleSelectAllToggle(false)}
              className="text-xs font-medium text-gray-500 hover:text-gray-900"
            >
              Deselect All
            </button>
          </div>
          
          <ScrollArea className="flex-1 -mr-4">
            <div className="pr-4">
              {segments.map((segment) => (
                <TranscriptCard
                  key={segment.id}
                  segment={segment}
                  onSelect={handleSegmentSelect}
                  onClick={() => handleTranscriptCardClick(segment.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right column - Prompt fields */}
        <div className="flex-1 md:max-w-[40%] flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#1E2424] mb-2">
              Generated Prompts
            </h2>
            <p className="text-sm text-[#1E2424]/60">
              Edit the AI-generated prompts for your selected scenes.
            </p>
          </div>
          
          <ScrollArea className="flex-1 -mr-4">
            <div className="space-y-3 pr-4">
              {segments.map((segment) => (
                <PromptField
                  key={segment.id}
                  ref={(el) => {
                    promptRefs.current[segment.id] = el;
                  }}
                  segmentId={segment.id}
                  initialPrompt={segment.prompt}
                  initialStyle={segment.style}
                  isSelected={segment.isSelected}
                  isGenerating={false}
                  onPromptChange={handlePromptChange}
                  onStyleChange={handleStyleChange}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Bottom sticky bar */}
      <div className="sticky bottom-0 bg-white border-t border-[#1E2424]/10 py-4 px-6 flex items-center justify-between">
        <div className="text-sm text-[#1E2424]/60">
          {selectedCount} {selectedCount === 1 ? 'segment' : 'segments'} selected
        </div>
        
        <PrimaryButton
          onClick={handleContinue}
          disabled={!hasSelectedSegments}
          className="px-8"
        >
          Continue to Character Selection ({selectedCount})
        </PrimaryButton>
      </div>
    </div>
  );
} 