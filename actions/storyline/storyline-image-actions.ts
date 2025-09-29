'use server';

import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { z } from 'zod';
import type { TranscriptSegment } from './storyline-transcript-actions';
import { visualStyles } from '@/config/visual-styles';
import type { CharacterDetail } from './storyline-character-actions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const imagePromptSchema = z.object({
  timestamp: z.string().describe("The timestamp of the original transcript segment(s), e.g., '00:08 - 00:14'"),
  text: z.string().describe("The text of the original transcript segment(s)."),
  prompt: z.string().describe("The generated prompt for an image that visually tells this part of the story."),
});

const imagePromptsSchema = z.object({
  prompts: z.array(imagePromptSchema).describe("An array of image prompt suggestions, up to a maximum of 20."),
});

export interface ImageActionResponse {
    success: boolean;
    message: string;
    data?: z.infer<typeof imagePromptsSchema>;
}

export async function generateImagePrompts(
  transcript: TranscriptSegment[]
): Promise<ImageActionResponse> {
  console.log('--- Starting Image Prompt Generation ---');

  if (!transcript || transcript.length === 0) {
    return { success: false, message: 'Transcript data is empty or invalid.' };
  }

  const fullTranscript = transcript
    .map(s => `[${s.timestamp}] ${s.text}`)
    .join('\n');

  try {
    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'generate_image_prompts',
          description: 'Generates a list of image prompts for key moments in a transcript.',
          parameters: {
            type: 'object',
            properties: {
              prompts: {
                type: 'array',
                description: 'An array of up to 20 image prompt suggestions for key moments.',
                items: {
                  type: 'object',
                  properties: {
                    timestamp: {
                      type: 'string',
                      description: 'The timestamp of the original transcript segment(s), e.g., "00:08 - 00:14"',
                    },
                    text: {
                      type: 'string',
                      description: 'The text of the original transcript segment(s).',
                    },
                    prompt: {
                      type: 'string',
                      description: 'A detailed, creative prompt for an AI image generator.',
                    },
                  },
                  required: ['timestamp', 'text', 'prompt'],
                },
              },
            },
            required: ['prompts'],
          },
        },
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a visual prompt generator for AI image creation. Create simple, clear visual prompts based on video transcript segments.

RULES:
1. Keep prompts under 50 words each
2. Refer to characters as "the main character" - no physical descriptions
3. Focus on actions and scenes, not complex metaphors
4. Combine related adjacent segments when possible
5. Select up to 10 key visual moments only

Use the generate_image_prompts function with short, direct prompts.`,
        },
        {
          role: 'user',
          content: `Here is the full transcript:\n\n${fullTranscript}`,
        },
      ],
      tools: tools,
      tool_choice: { type: "function", function: { name: "generate_image_prompts" } },
    });

    const toolCalls = response.choices[0].message.tool_calls;
    if (!toolCalls) {
        throw new Error('No tool calls returned from Groq');
    }

    const functionArgs = toolCalls[0].function.arguments;
    const parsedArgs = JSON.parse(functionArgs);
    
    const validatedData = imagePromptsSchema.safeParse(parsedArgs);

    if (!validatedData.success) {
        console.error('Zod validation failed:', validatedData.error.flatten());
        throw new Error('Groq returned data in an unexpected format.');
    }

    console.log('--- Generated Image Prompts ---');
    console.log(JSON.stringify(validatedData.data, null, 2));
    console.log('--- Image Prompt Generation Finished ---');

    return {
      success: true,
      message: 'Successfully generated image prompts.',
      data: validatedData.data,
    };
  } catch (error) {
    console.error('An error occurred during image prompt generation:', error);
    return { success: false, message: 'An error occurred during processing.' };
  }
}

export interface GeneratedImage {
  segmentId: string;
  prompt: string;
  style: string;
  imageUrl: string;
  revisedPrompt?: string;
}

export interface GenerateImagesActionResponse {
    success: boolean;
    message: string;
    data?: GeneratedImage[];
}

export async function generateImagesForPrompts(
    segments: TranscriptSegment[],
    character: CharacterDetail | null,
    storylineId?: string
): Promise<GenerateImagesActionResponse> {
    console.log('--- Starting image generation for all prompts ---');
    if (character) {
        console.log(`Using character: ${character.name}`);
        console.log(`Character description: ${character.description}`);
    } else {
        console.log('No character was provided for image generation.');
    }

    const segmentsToGenerate = segments.filter(s => s.prompt && s.prompt.trim() !== '');

    if (segmentsToGenerate.length === 0) {
        return { success: false, message: 'No valid prompts provided for image generation.' };
    }
    
    try {
        // --- BULK GENERATION LOGIC ---
        console.log(`Generating ${segmentsToGenerate.length} images concurrently...`);
        const imageGenerationPromises = segmentsToGenerate.map(async (segment) => {
            console.log(`Generating image for segment ${segment.id}...`);
            
            const styleInfo = visualStyles[segment.style as keyof typeof visualStyles];
            if (!styleInfo) {
                console.error(`Invalid style "${segment.style}" for segment ${segment.id}. Skipping.`);
                return null;
            }

            const characterInstruction = character
                ? ` The main character in this image frame must follow this exact description: "${character.description}".`
                : '';

            let fullPrompt: string;
            if (typeof styleInfo.description === 'object') {
                fullPrompt = `Generate an image of the following scene: "${segment.prompt}".${characterInstruction} The image must conform to the following style guide (in JSON format): ${JSON.stringify(styleInfo.description, null, 2)}`;
            } else {
                fullPrompt = `Generate an image of the following scene: "${segment.prompt}".${characterInstruction} The image must be in ${styleInfo.description}.`;
            }
            
            console.log(`--- Generating image for segment ${segment.id} ---`);
            console.log(`Prompt sent to OpenAI:\n${fullPrompt}`);

            try {
                const response = await openai.images.generate({
                    model: "gpt-image-1",
                    prompt: fullPrompt,
                    n: 1,
                    size: "1024x1536",
                    quality: "medium",
                });
                
                const image = response.data?.[0];
                if (!image || !image.b64_json) {
                    console.error('Invalid response from OpenAI, no b64_json found. Full response:', JSON.stringify(response, null, 2));
                    throw new Error('Invalid response from OpenAI: no image data found.');
                }

                console.log(`Successfully generated image for segment ${segment.id}.`);
                
                const result: GeneratedImage = {
                    segmentId: segment.id,
                    prompt: segment.prompt,
                    style: segment.style,
                    imageUrl: `data:image/png;base64,${image.b64_json}`,
                    revisedPrompt: image.revised_prompt,
                };
                return result;

            } catch(e) {
                console.error(`Could not generate image for segment ${segment.id}. Prompt: "${fullPrompt}". Error:`, e);
                return null;
            }
        });

        const results = await Promise.all(imageGenerationPromises);
        const generatedImages = results.filter((result): result is GeneratedImage => result !== null);

        console.log('--- Finished Image Generation ---');
        
        // If storylineId is provided, batch upload all images to storage
        if (storylineId && generatedImages.length > 0) {
            console.log(`Batch uploading ${generatedImages.length} images to storage for storyline ${storylineId}`);
            
            const { batchUpdateSegmentsWithImagesAction } = await import('./storyline-storage-actions');
            const imagesToUpload = generatedImages.map(img => ({
                segmentId: img.segmentId,
                base64Image: img.imageUrl
            }));
            
            const batchResult = await batchUpdateSegmentsWithImagesAction(storylineId, imagesToUpload);
            
            if (batchResult.isSuccess && batchResult.data) {
                // Update the image URLs with the stored URLs
                const segments = batchResult.data.segments as any[];
                generatedImages.forEach(img => {
                    const segment = segments.find(s => s.id === img.segmentId);
                    if (segment?.imageUrl) {
                        img.imageUrl = segment.imageUrl;
                    }
                });
            }
        }
        
        // Create a log-friendly version of the data without the full Base64 string
        const imagesForLogging = generatedImages.map(image => {
            const { imageUrl, ...rest } = image;
            return {
                ...rest,
                imageUrl: imageUrl ? 'data:image/png;base64,...[TRUNCATED]' : 'N/A'
            };
        });
        console.log(JSON.stringify(imagesForLogging, null, 2));

        if (generatedImages.length === 0) {
            return { success: false, message: 'Image generation failed for all prompts.' };
        }

        return {
            success: true,
            message: `Successfully generated ${generatedImages.length}/${segmentsToGenerate.length} images.`,
            data: generatedImages,
        };

    } catch (error) {
        console.error('An error occurred during image generation process:', error);
        return { success: false, message: 'An error occurred during image generation.' };
    }
} 