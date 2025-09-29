'use server';

import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { z } from 'zod';
import { visualStyles } from '@/config/visual-styles';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Simplified schema - just name and single description string
const characterPromptSchema = z.object({
  name: z.string().describe("The character's name."),
  description: z.string().describe("A simple, clear visual description of the character in one sentence."),
});

const characterPromptsSchema = z.object({
  characters: z.array(characterPromptSchema).length(4).describe("An array of exactly 4 distinct character variations."),
});

// Type for the final returned data from our main function
export interface CharacterConcept {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  revisedPrompt?: string;
}

export interface CharacterDetail {
  name: string;
  description: string;
}

export interface CharacterConceptResponse {
    success: boolean;
    message: string;
    data?: CharacterConcept[];
}

// Main function to be called from storyline-transcript-actions
export async function generateCharacterConcepts(
  fullTranscript: string,
  style: string
): Promise<CharacterConceptResponse> {
  console.log('--- Starting Character Concept Generation ---');
  
  if (!fullTranscript || fullTranscript.trim().length === 0) {
    return { success: false, message: 'Transcript is empty.' };
  }
  
  const styleInfo = visualStyles[style as keyof typeof visualStyles];
  if (!styleInfo) {
    return { success: false, message: `Invalid style provided: ${style}` };
  }

  try {
    // 1. Generate 4 character descriptions from the transcript
    console.log('[LOG] Generating character descriptions from transcript...');
    
    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'generate_character_descriptions',
          description: 'Generates 4 distinct character variations based on a transcript.',
          parameters: {
            type: 'object',
            properties: {
              characters: {
                type: 'array',
                description: 'An array of exactly 4 distinct character variations.',
                minItems: 4,
                maxItems: 4,
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: "The character's name.",
                    },
                    description: {
                      type: 'string',
                      description: "A simple, clear visual description of the character in one sentence.",
                    },
                  },
                  required: ['name', 'description'],
                },
              },
            },
            required: ['characters'],
          },
        },
      },
    ];

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a character designer. Create 4 simple character variations based on the transcript.

RULES:
1. Keep descriptions under 25 words each
2. All 4 characters should be the same type (robot, human, animal, etc.)
3. Focus on personality differences, not complex details
4. Style: ${styleInfo.name}

Use the generate_character_descriptions function with short, simple descriptions.`
        },
        {
          role: 'user',
          content: `Here is the full transcript:\n\n${fullTranscript}`,
        },
      ],
      tools: tools,
      tool_choice: { type: "function", function: { name: "generate_character_descriptions" } },
    });

    const toolCalls = response.choices[0].message.tool_calls;
    if (!toolCalls) {
      throw new Error('No tool calls returned from Groq for character descriptions.');
    }

    const functionArgs = toolCalls[0].function.arguments;
    const parsedArgs = JSON.parse(functionArgs);
    const validatedData = characterPromptsSchema.safeParse(parsedArgs);

    if (!validatedData.success) {
      console.error('Zod validation failed for character prompts:', validatedData.error.flatten());
      throw new Error('Groq returned character data in an unexpected format.');
    }

    const characterPrompts = validatedData.data.characters;
    console.log('[LOG] Successfully generated 4 character prompts.');

    // 2. Generate an image for each description concurrently
    console.log('[LOG] Generating images for the 4 character concepts...');

    const imageGenerationPromises = characterPrompts.map(async (charPrompt, index) => {
      let fullPrompt: string;
      if (typeof styleInfo.description === 'object') {
          fullPrompt = `Generate a character portrait: ${charPrompt.description}. Style: ${JSON.stringify(styleInfo.description, null, 2)}`;
      } else {
          fullPrompt = `Generate a character portrait: ${charPrompt.description}. Style: ${styleInfo.description}.`;
      }
      
      try {
        const response = await openai.images.generate({
            model: "gpt-image-1",
            prompt: fullPrompt,
            n: 1,
            size: "1024x1024",
            quality: "low",
        });
        
        const image = response.data?.[0];
        if (!image || !image.b64_json) {
            console.error('Invalid response from OpenAI, no image b64_json found. Full response:', JSON.stringify(response, null, 2));
            throw new Error('Invalid response from OpenAI: no image data found.');
        }

        const result: CharacterConcept = {
            id: `char-${index + 1}`,
            name: charPrompt.name,
            description: charPrompt.description,
            imageUrl: `data:image/png;base64,${image.b64_json}`,
            revisedPrompt: image.revised_prompt,
        };
        return result;

      } catch(e) {
          console.error(`Could not generate image for character "${charPrompt.name}". Prompt: "${fullPrompt}". Error:`, e);
          return null;
      }
    });

    const results = await Promise.all(imageGenerationPromises);
    const generatedCharacters = results.filter((result): result is CharacterConcept => result !== null);

    if (generatedCharacters.length !== 4) {
        console.warn(`Expected 4 character images, but only ${generatedCharacters.length} were generated successfully.`);
    }
    
    if (generatedCharacters.length === 0) {
        console.error('Character image generation failed for all prompts. Proceeding with an empty character list.');
    }
    
    console.log('--- Finished Character Concept Generation ---');
    return {
      success: true,
      message: `Successfully generated ${generatedCharacters.length} character concepts.`,
      data: generatedCharacters,
    };

  } catch (error) {
    console.error('An error occurred during character concept generation:', error);
    return { success: false, message: 'An error occurred during character processing.' };
  }
} 