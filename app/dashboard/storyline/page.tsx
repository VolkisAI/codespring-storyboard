/**
 * Generate Storyline page for the Template App dashboard
 * Allows users to generate storylines
 */
'use client';

import React, { useState } from 'react';
import { Stepper, Step, useStepper } from '@/components/storyline/Stepper';
import { UploadPane } from '@/components/storyline/UploadPane';
import { TranscriptPane } from '@/components/storyline/TranscriptPane';
import { ImagePane } from '@/components/storyline/ImagePane';
import { VideoPane } from '@/components/storyline/VideoPane';
import { 
  generateTranscript,
  generateTranscriptOnly,
  generateTranscriptFromUrl,
  type TranscriptSegment 
} from '@/actions/storyline/storyline-transcript-actions';
import { 
  generateCharacterConcepts,
  type CharacterConcept,
  type CharacterDetail
} from '@/actions/storyline/storyline-character-actions';
import { 
  generateImagesForPrompts,
  type GeneratedImage 
} from '@/actions/storyline/storyline-image-actions';
import { CharacterSelectionPane } from '@/components/storyline/CharacterSelectionPane';
import { Toaster, toast } from '@/components/storyline/Toast';
import { StepperNavigation } from '@/components/storyline/StepperNavigation';
import { uploadVideoToSupabase } from '@/lib/supabase-client';
import { useAuth } from '@clerk/nextjs';

const steps = [
  { id: '01', name: 'Upload Video' },
  { id: '02', name: 'Review Scenes' },
  { id: '03', name: 'Select Character' },
  { id: '04', name: 'Generate Images' },
  { id: '05', name: 'Create Video' },
];

export default function StorylinePage() {
  const { userId } = useAuth();
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [characterConcepts, setCharacterConcepts] = useState<CharacterConcept[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterConcept | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<TranscriptSegment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCharacters, setIsGeneratingCharacters] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [storylineId, setStorylineId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleInitialGeneration = async (formData: FormData, goTo: (step: number) => void) => {
    setIsGenerating(true);
    setIsGeneratingCharacters(true);
    setUploadError(null);
    goTo(1);

    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // The `generateTranscript` action handles everything:
      // - Transcribing the audio file from the form data
      // - Creating image prompts
      // - Creating the storyline in the database
      // - Uploading the original video file
      const transcriptResult = await generateTranscript(null, formData);

      if (!transcriptResult.success || !transcriptResult.data) {
        throw new Error(transcriptResult.message || 'Failed to generate transcript.');
      }
      
      const { scenePrompts, transcriptText, style: resultStyle, storylineId: newStorylineId } = transcriptResult.data;
      
      // Store the storylineId
      if (newStorylineId) {
        setStorylineId(newStorylineId);
      }
      
      // Set transcript segments immediately so the user can see them
      console.log('Setting transcript segments:', scenePrompts.length);
      setTranscriptSegments(scenePrompts);
      setIsGenerating(false); // Transcript part is done, hide its loading skeleton
      
      toast.success('Transcript ready!', 'You can now review and select your scenes.');
      
      // Step 3: Generate characters in the background
      const truncatedTranscript = transcriptText.split(' ').slice(0, 200).join(' ');
      const characterResult = await generateCharacterConcepts(truncatedTranscript, resultStyle);
      
      if (characterResult.success && characterResult.data) {
        console.log('Setting character concepts:', characterResult.data.length);
        setCharacterConcepts(characterResult.data);
        toast.success('Characters ready!', 'Character concepts have been generated.');
      } else {
        console.error('Character generation failed:', characterResult.message);
        toast.error('Character generation failed', characterResult.message || 'Failed to generate character concepts.');
      }
      
      setIsGeneratingCharacters(false); // Character part is done, hide its loading skeleton

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error('Generation Failed', errorMessage);
      setUploadError(errorMessage);
      goTo(0); // Go back to upload pane on failure
      setIsGenerating(false);
      setIsGeneratingCharacters(false);
    }
  };
  
  const handleSegmentsSelected = (segments: TranscriptSegment[]) => {
    setSelectedSegments(segments);
    console.log(`Selected ${segments.length} segments for image generation`);
  };
  
  const handleCharacterSelect = (character: CharacterConcept) => {
    setSelectedCharacter(character);
    console.log('Selected character:', character.name);
  };

  const handleStartImageGeneration = async (character: CharacterConcept, goNext: () => void) => {
    if (!selectedSegments || selectedSegments.length === 0) {
      toast.error("No scenes selected", "Please go back and select scenes to generate images for.");
      return;
    }
    
    // Immediately go to the next step
    goNext();
    
    setIsGeneratingImages(true);
    setGeneratedImages([]); // Clear previous images
    setSelectedCharacter(character);

    const characterDetail: CharacterDetail = {
      name: character.name,
      description: character.description,
    };

    try {
      const response = await generateImagesForPrompts(
        selectedSegments,
        characterDetail,
        storylineId || undefined
      );

      if (response.success && response.data) {
        toast.success('Images generated!', response.message);
        setGeneratedImages(response.data);
      } else {
        throw new Error(response.message || 'Image generation failed.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Generation failed', errorMessage);
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleImagesGenerated = (images: GeneratedImage[]) => {
    setGeneratedImages(images);
  };

  return (
    <div className="w-full h-screen bg-white">
      <Stepper totalSteps={5} initialStep={0}>
        <Step step={0}>
          <UploadPane onGenerate={handleInitialGeneration} isGenerating={isGenerating} errorMessage={uploadError} />
        </Step>
        <Step step={1}>
          <TranscriptPane 
            initialSegments={transcriptSegments} 
            onSegmentsSelected={handleSegmentsSelected}
            isGenerating={isGenerating}
          />
        </Step>
        <Step step={2}>
          <CharacterSelectionPane 
            characterConcepts={characterConcepts} 
            onCharacterSelect={handleCharacterSelect}
            isGenerating={isGeneratingCharacters}
            selectedSegments={selectedSegments}
            onConfirmAndGenerate={handleStartImageGeneration}
          />
        </Step>
        <Step step={3}>
          <ImagePane 
            initialImages={generatedImages} 
            transcriptSegments={selectedSegments} 
            isGenerating={isGeneratingImages}
            storylineId={storylineId}
          />
        </Step>
        <Step step={4}>
          <VideoPane transcriptSegments={transcriptSegments} storylineId={storylineId} />
        </Step>
      </Stepper>
      <Toaster />
    </div>
  );
} 