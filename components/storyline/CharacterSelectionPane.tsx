'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PrimaryButton } from './PrimaryButton';
import { useStepper } from './Stepper';
import type { CharacterConcept, CharacterDetail } from '@/actions/storyline/storyline-character-actions';
import type { TranscriptSegment } from '@/actions/storyline/storyline-transcript-actions';
import type { GeneratedImage } from '@/actions/storyline/storyline-image-actions';
import { generateImagesForPrompts } from '@/actions/storyline/storyline-image-actions';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from './Toast';

interface CharacterSelectionPaneProps {
  characterConcepts: CharacterConcept[];
  onCharacterSelect: (character: CharacterConcept) => void;
  isGenerating?: boolean;
  selectedSegments?: TranscriptSegment[];
  onConfirmAndGenerate: (character: CharacterConcept, goNext: () => void) => void;
}

const SkeletonCard = () => (
  <div className="relative aspect-square rounded-xl bg-gray-100 flex items-center justify-center">
    <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
  </div>
);

export function CharacterSelectionPane({ 
  characterConcepts, 
  onCharacterSelect, 
  isGenerating = false,
  selectedSegments = [],
  onConfirmAndGenerate,
}: CharacterSelectionPaneProps) {
  const { goNext } = useStepper();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterConcept | null>(null);

  useEffect(() => {
    // Pre-select the first character by default
    if (characterConcepts.length > 0 && !selectedCharacter) {
      setSelectedCharacter(characterConcepts[0]);
    }
  }, [characterConcepts, selectedCharacter]);

  const handleSelect = (character: CharacterConcept) => {
    setSelectedCharacter(character);
  };

  const handleConfirmAndGenerateImages = () => {
    if (!selectedCharacter) return;
    onCharacterSelect(selectedCharacter);
    onConfirmAndGenerate(selectedCharacter, goNext);
  };

  const showLoadingState = isGenerating && characterConcepts.length === 0;

  if (showLoadingState) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="flex-1 flex flex-col md:flex-row gap-8 px-6 py-8 overflow-hidden">
          {/* Left column - Skeleton grid */}
          <div className="flex-1 md:max-w-[40%] flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#1E2424] mb-2">
                Choose Your Character
              </h2>
              <p className="text-sm text-[#1E2424]/60">
                The AI is currently creating character concepts based on your video...
              </p>
            </div>
            <ScrollArea className="flex-1 -mr-4">
              <div className="grid grid-cols-2 gap-2 pr-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </ScrollArea>
          </div>
          {/* Right column - Skeleton preview */}
          <div className="flex-1 md:max-w-[60%] flex flex-col items-center justify-start pt-16">
            <div className="w-full max-w-sm flex flex-col items-center justify-center aspect-square bg-gray-100 rounded-2xl">
              <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500 mt-4">Generating preview...</p>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-[#1E2424]/10 py-4 px-6" />
      </div>
    );
  }

  if (!characterConcepts || characterConcepts.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-center text-center p-6">
        <h2 className="text-xl font-semibold text-[#1E2424] mb-2">
          Character Generation Failed
        </h2>
        <p className="text-sm text-[#1E2424]/60 max-w-md">
          The AI was unable to generate characters from the video. Please go back and try a different video file.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 flex flex-col md:flex-row gap-8 px-6 py-8 overflow-hidden">
        {/* Left column - Character grid */}
        <div className="flex-1 md:max-w-[40%] flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#1E2424] mb-2">
              Choose Your Character
            </h2>
            <p className="text-sm text-[#1E2424]/60">
              Select one of the AI-generated characters to be the star of your video.
            </p>
          </div>
          
          <ScrollArea className="flex-1 -mr-4">
            <div className="grid grid-cols-2 gap-2 pr-4">
              {characterConcepts.map((character) => (
                <div
                  key={character.id}
                  onClick={() => handleSelect(character)}
                  className={cn(
                    'relative aspect-square rounded-xl border-4 border-transparent hover:border-[#C5F547]/50 transition-all duration-200 cursor-pointer overflow-hidden group',
                    selectedCharacter?.id === character.id && 'border-[#C5F547]'
                  )}
                >
                  <Image
                    src={character.imageUrl}
                    alt={character.name}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3">
                    <p className="text-white font-bold text-sm truncate">{character.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right column - Selected character preview */}
        <div className="flex-1 md:max-w-[60%] flex flex-col items-center justify-start pt-16">
          {selectedCharacter && (
            <Tabs defaultValue="image" className="w-full max-w-sm">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="image">Image</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="image">
                <div className="w-full flex flex-col gap-4 items-center mt-4">
                  <div className="aspect-square w-full bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={selectedCharacter.imageUrl}
                      alt={`Preview of ${selectedCharacter.name}`}
                      width={512}
                      height={512}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className='text-center'>
                    <h3 className="text-lg font-bold text-[#1E2424]">{selectedCharacter.name}</h3>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="json">
                 <div className="w-full flex flex-col gap-4 items-center mt-4">
                    <div className='text-center'>
                        <h3 className="text-lg font-bold text-[#1E2424]">{selectedCharacter.name}</h3>
                    </div>
                    <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-gray-50">
                        <pre className="text-xs whitespace-pre-wrap break-words">
                            <code>
                                {(() => {
                                    try {
                                        return JSON.stringify(JSON.parse(selectedCharacter.description), null, 2);
                                    } catch (e) {
                                        return selectedCharacter.description;
                                    }
                                })()}
                            </code>
                        </pre>
                    </ScrollArea>
                 </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Bottom sticky bar */}
      <div className="sticky bottom-0 bg-white border-t border-[#1E2424]/10 py-4 px-6 flex items-center justify-end">
        <PrimaryButton
          onClick={handleConfirmAndGenerateImages}
          disabled={!selectedCharacter}
          className="px-8"
        >
          Confirm Character & Generate Images
        </PrimaryButton>
      </div>
    </div>
  );
} 