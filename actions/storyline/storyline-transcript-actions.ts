'use server';

import { z } from 'zod';
import { promises as fs, createReadStream, createWriteStream } from 'fs';
import os from 'os';
import path from 'path';
import { pipeline } from 'stream/promises';
import { File } from 'node:buffer';
import OpenAI from 'openai'; // Re-add for type definitions
import { generateImagePrompts } from './storyline-image-actions';
import { generateCharacterConcepts } from './storyline-character-actions';
import type { CharacterConcept } from './storyline-character-actions';
import { createStorylineAction } from './storyline-storage-actions';
import { createClient } from '@supabase/supabase-js';
import { StorylineSegment } from '@/db/schema/storyline-schema';
import Groq from 'groq-sdk';

// Polyfill for OpenAI's browser-like environment check
// @ts-ignore - This is a necessary polyfill for the OpenAI SDK to work in a Next.js Server Action environment.
if (typeof globalThis.File === 'undefined') {
    // @ts-ignore - This is a necessary polyfill for the OpenAI SDK to work in a Next.js Server Action environment.
    globalThis.File = File;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Initialize Supabase client for storage operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB for audio files

const transcriptSchema = z.object({
  audioFile: z.any()
    .refine((file) => file && file.size > 0, { message: 'Audio file is required.' })
    .refine((file) => file && file.size <= MAX_FILE_SIZE, { message: `File size must be less than 25MB.` }),
  originalVideoUrl: z.string()
    .url({ message: 'originalVideoUrl must be a valid URL.' }),
  style: z.string().min(1, { message: 'Style is required.' }),
  fileName: z.string().optional(),
});

export interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: string;
  isSelected: boolean;
  prompt: string;
  style: string;
}

export interface InitialGenerationData {
  scenePrompts: TranscriptSegment[];
  transcriptText: string;
  style: string;
  storylineId?: string;
}

export interface ActionResponse {
  success: boolean;
  message: string;
  data?: InitialGenerationData;
}

interface VerboseTranscription extends OpenAI.Audio.Transcriptions.Transcription {
  segments: {
    start: number;
    end: number;
    text: string;
  }[];
}

async function uploadOriginalVideo(file: File, storylineId: string): Promise<string | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExtension = file.name.split('.').pop() || 'mp4';
    const filename = `${storylineId}/original.${fileExtension}`;
    
    const { error } = await supabase.storage
      .from('storyline-originals')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true
      });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('storyline-originals')
      .getPublicUrl(filename);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading original video:', error);
    return null;
  }
}

export async function generateTranscript(prevState: any, formData: FormData): Promise<ActionResponse> {
  console.log('--- Starting Transcript Generation ---');
  
  let tempAudioPath: string | undefined;
  
  try {
    const validatedFields = transcriptSchema.safeParse({
      audioFile: formData.get('audioFile'),
      originalVideoUrl: formData.get('originalVideoUrl'),
      style: formData.get('style'),
      fileName: formData.get('fileName'),
    });

    if (!validatedFields.success) {
      const errorMessages = validatedFields.error.flatten().fieldErrors;
      const message = errorMessages.audioFile?.[0] ?? errorMessages.originalVideoUrl?.[0] ?? errorMessages.style?.[0] ?? 'Invalid form data.';
      console.error('Validation failed:', errorMessages);
      return { success: false, message: message, data: undefined };
    }

    const { audioFile, originalVideoUrl, style, fileName } = validatedFields.data;
    const storylineName = fileName || originalVideoUrl.split('/').pop()?.split('.')[0] || 'Untitled Storyline';
    console.log(`[LOG] Processing audio file: ${audioFile.name} (${(audioFile.size / (1024*1024)).toFixed(2)} MB)`);

    tempAudioPath = path.join(os.tmpdir(), `audio-${Date.now()}.mp3`);

    try {
      console.log('[LOG] Creating write stream for audio file...');
      const fileStream = createWriteStream(tempAudioPath);
      // @ts-ignore - Ignoring TypeScript error for stream compatibility, which is handled in practice.
      await pipeline(audioFile.stream(), fileStream);
      console.log(`[LOG] Audio file saved temporarily to: ${tempAudioPath}`);
      
      // Verify file was written
      const stats = await fs.stat(tempAudioPath);
      console.log(`[LOG] Audio file size on disk: ${(stats.size / (1024*1024)).toFixed(2)} MB`);

    // Transcribe the MP3
    console.log('[LOG] Sending MP3 to Groq for transcription...');
    const transcription = await groq.audio.transcriptions.create({
        file: createReadStream(tempAudioPath!),
        model: 'whisper-large-v3-turbo', // Using Groq's fast whisper model
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
    });
    console.log('[LOG] Successfully received transcript from Groq.');
    
    const verboseTranscription = transcription as VerboseTranscription;
    const segments: TranscriptSegment[] = verboseTranscription.segments.map((segment, index) => ({
      id: `${index + 1}`,
      text: segment.text.trim(),
      timestamp: `${new Date(segment.start * 1000).toISOString().slice(14, 19)} - ${new Date(segment.end * 1000).toISOString().slice(14, 19)}`,
      isSelected: false,
      prompt: '',
      style: style,
    }));

    const fullTranscriptText = segments.map(s => s.text).join(' ');
    const truncatedTranscript = fullTranscriptText.split(' ').slice(0, 200).join(' ');
    console.log(`[LOG] Parsed ${segments.length} transcript segments.`);
    
    // Generate image prompts (character concepts are now generated separately on the client)
    const imagePromptsResponse = await generateImagePrompts(segments);

    if (!imagePromptsResponse.success || !imagePromptsResponse.data) {
      return { success: false, message: 'Failed to generate image prompts.' };
    }
    
    const scenePrompts = imagePromptsResponse.data?.prompts.map((p, index) => ({
      id: `${index + 1}`,
      text: p.text,
      timestamp: p.timestamp,
      isSelected: true,
      prompt: p.prompt,
      style: style,
    })) || [];

    if (scenePrompts.length === 0) {
      return { success: false, message: 'Failed to generate scene prompts from transcript.' };
    }

    // Create storyline segments for database
    const storylineSegments: Omit<StorylineSegment, 'status'>[] = scenePrompts.map((prompt, index) => ({
      id: prompt.id,
      order: index,
      timestamp: prompt.timestamp,
      text: prompt.text,
      prompt: prompt.prompt,
      style: prompt.style,
    }));

    // Create storyline in database
    const storylineResult = await createStorylineAction(storylineName, storylineSegments, originalVideoUrl);
    
    if (!storylineResult.isSuccess || !storylineResult.data) {
      return { success: false, message: 'Failed to create storyline in database.' };
    }

    const storylineId = storylineResult.data.id;

    // originalVideoUrl is already saved by createStorylineAction
    
    console.log('--- Transcript and Prompts Generation Finished ---');
    console.log(`Returning ${scenePrompts.length} scene prompts with storyline ID: ${storylineId}`);

    return { 
      success: true, 
      message: 'Transcript and prompts generated successfully.', 
      data: {
        scenePrompts,
        transcriptText: fullTranscriptText,
        style: style,
        storylineId,
      } 
    };

    } catch (innerError) {
      console.error('Error during file processing:', innerError);
      throw innerError;
    }

  } catch (error) {
    console.error('An error occurred during transcript generation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during processing.';
    
    // Always return a valid ActionResponse object
    return { success: false, message: errorMessage, data: undefined };
  } finally {
    // Clean up temporary files
    try {
      if (tempAudioPath) {
        await fs.unlink(tempAudioPath).catch(() => {});
      }
      console.log('[LOG] Cleaned up all temporary files.');
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
  }
}

async function transcribeAudio(audioUrl: string) {
  const tempMp3Path = path.join(os.tmpdir(), `audio-${Date.now()}.mp3`);
  try {
    const base64Data = audioUrl.split(',')[1];
    if (!base64Data) {
      return { success: false, message: 'Invalid audio data URL.' };
    }
    await fs.writeFile(tempMp3Path, base64Data, 'base64');
    console.log(`[LOG] Audio file saved temporarily to: ${tempMp3Path}`);

    console.log('[LOG] Sending MP3 to Groq for transcription...');
    const transcription = await groq.audio.transcriptions.create({
        file: createReadStream(tempMp3Path),
        model: 'whisper-large-v3-turbo',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
    });
    console.log('[LOG] Successfully received transcript from Groq.');
    
    const verboseTranscription = transcription as VerboseTranscription;
    const segments = verboseTranscription.segments.map((segment) => ({
      start: segment.start,
      end: segment.end,
      text: segment.text.trim(),
      timestamp: `${new Date(segment.start * 1000).toISOString().slice(14, 19)} - ${new Date(segment.end * 1000).toISOString().slice(14, 19)}`,
    }));

    return { success: true, message: 'Transcription complete.', data: segments };
  } catch (error) {
    console.error('An error occurred during audio transcription:', error);
    return { success: false, message: 'An error occurred during transcription.' };
  } finally {
    if (await fs.stat(tempMp3Path).catch(() => false)) {
      await fs.unlink(tempMp3Path).catch(console.error);
      console.log('[LOG] Cleaned up temporary audio file.');
    }
  }
}

export async function generateTranscriptFromUrl(
  videoUrl: string,
  style: string,
  fileName: string
): Promise<ActionResponse> {
  console.log('--- Starting Transcript Generation from URL ---');
  
  try {
    // For URL-based processing, we'll need the client to extract audio first
    // This function should only be called after client-side audio extraction
    return {
      success: false,
      message: 'URL-based processing requires client-side audio extraction first.',
      data: undefined
    };
  } catch (error) {
    console.error('Error in generateTranscriptFromUrl:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during processing.';
    return { success: false, message: errorMessage, data: undefined };
  }
}

export async function generateTranscriptOnly(
  audioUrl: string | null,
  formData?: FormData
): Promise<{
  success: boolean;
  message: string;
  data?: {
    scenePrompts: TranscriptSegment[];
    transcriptText: string;
    style: string;
  };
}> {
  try {
    const style = formData?.get('style') as string || 'cinematic';
    
    // If audioUrl is provided, use it directly. Otherwise, extract from formData.
    let audioUrlToUse = audioUrl;
    if (!audioUrlToUse && formData) {
      const audioFile = formData.get('audio');
      if (!audioFile || !(audioFile instanceof File)) {
        return { success: false, message: 'No audio file provided.' };
      }
      // Convert File to data URL for processing
      const arrayBuffer = await audioFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      audioUrlToUse = `data:${audioFile.type};base64,${base64}`;
    }

    if (!audioUrlToUse) {
      return { success: false, message: 'No audio URL provided.' };
    }

    console.log('--- Starting Transcript Generation Only ---');
    console.log(`Audio URL: ${audioUrlToUse.substring(0, 50)}...`);
    console.log(`Style: ${style}`);

    // Transcribe the audio
    const transcriptionResult = await transcribeAudio(audioUrlToUse);
    if (!transcriptionResult.success || !transcriptionResult.data) {
      return { success: false, message: transcriptionResult.message };
    }

    const transcribedSegments = transcriptionResult.data as { text: string; timestamp: string }[];
    const segments: TranscriptSegment[] = transcribedSegments.map((segment, index) => ({
      id: `${index + 1}`,
      text: segment.text,
      timestamp: segment.timestamp,
      isSelected: true,
      prompt: '',
      style: style,
    }));

    const fullTranscriptText = segments.map((s) => s.text).join(' ');
    console.log(`[LOG] Parsed ${segments.length} transcript segments.`);
    
    // Generate image prompts
    const imagePromptsResponse = await generateImagePrompts(segments);

    if (!imagePromptsResponse.success || !imagePromptsResponse.data) {
      console.error('Image prompt generation failed.');
      return { success: false, message: 'Failed to generate image prompts.' };
    }
    
    // Map the prompts to transcript segments
    const scenePrompts = imagePromptsResponse.data.prompts.map((p, index) => ({
      id: `${index + 1}`,
      text: p.text,
      timestamp: p.timestamp,
      isSelected: true,
      prompt: p.prompt,
      style: style,
    }));

    console.log('--- Transcript and Prompts Ready ---');
    console.log(`Returning ${scenePrompts.length} scene prompts`);

    return { 
      success: true, 
      message: 'Transcript and prompts ready.', 
      data: {
        scenePrompts,
        transcriptText: fullTranscriptText,
        style,
      } 
    };

  } catch (error) {
    console.error('Error in generateTranscriptOnly:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred.'
    };
  }
} 