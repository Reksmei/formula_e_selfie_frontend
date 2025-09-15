'use server';
/**
 * @fileOverview Generates a video from a Formula E image.
 *
 * - generateFormulaEVideo - A function that generates the video.
 * - GenerateFormulaEVideoInput - The input type for the function.
 * - GenerateFormulaEVideoOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const GenerateFormulaEVideoInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The image to generate a video from, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateFormulaEVideoInput = z.infer<
  typeof GenerateFormulaEVideoInputSchema
>;

const GenerateFormulaEVideoOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated video as a data URI.'),
});
export type GenerateFormulaEVideoOutput = z.infer<
  typeof GenerateFormulaEVideoOutputSchema
>;

export async function generateFormulaEVideo(
  input: GenerateFormulaEVideoInput
): Promise<GenerateFormulaEVideoOutput> {
  return generateFormulaEVideoFlow(input);
}

const generateFormulaEVideoFlow = ai.defineFlow(
  {
    name: 'generateFormulaEVideoFlow',
    inputSchema: GenerateFormulaEVideoInputSchema,
    outputSchema: GenerateFormulaEVideoOutputSchema,
  },
  async input => {
    let {operation} = await ai.generate({
      model: googleAI.model('veo-3.0-generate-preview'),
      prompt: [
        {
          text: 'make the image come to life, make it cinematic and dramatic',
        },
        {
          media: {
            url: input.imageDataUri,
          },
        },
      ],
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    while (!operation.done) {
      // Sleep for 5 seconds before checking again.
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.checkOperation(operation);
    }

    if (operation.error) {
      throw new Error('failed to generate video: ' + operation.error.message);
    }

    const video = operation.output?.message?.content.find(p => !!p.media);
    if (!video || !video.media?.url) {
      throw new Error('Failed to find the generated video');
    }
    
    // The video URL from Veo doesn't include the mime type, so we need to add it
    const videoDataUri = `data:video/mp4;base64,${video.media.url.split(',')[1]}`;

    return {videoDataUri};
  }
);
