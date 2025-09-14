// src/ai/flows/generate-formula-e-image.ts
'use server';
/**
 * @fileOverview Generates a Formula E-themed image based on a user's selfie and a selected prompt.
 *
 * - generateFormulaEImage - A function that generates the Formula E image.
 * - GenerateFormulaEImageInput - The input type for the generateFormulaEImage function.
 * - GenerateFormulaEImageOutput - The return type for the generateFormulaEImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFormulaEImageInputSchema = z.object({
  selfieDataUri: z
    .string()
    .describe(
      "A selfie image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('The Formula E-related prompt selected by the user.'),
});
export type GenerateFormulaEImageInput = z.infer<
  typeof GenerateFormulaEImageInputSchema
>;

const GenerateFormulaEImageOutputSchema = z.object({
  generatedImageDataUri: z
    .string()
    .describe(
      'The generated image as a data URI, combining the selfie and the Formula E theme.'
    ),
});
export type GenerateFormulaEImageOutput = z.infer<
  typeof GenerateFormulaEImageOutputSchema
>;

export async function generateFormulaEImage(
  input: GenerateFormulaEImageInput
): Promise<GenerateFormulaEImageOutput> {
  return generateFormulaEImageFlow(input);
}

const generateFormulaEImagePrompt = ai.definePrompt({
  name: 'generateFormulaEImagePrompt',
  input: {schema: GenerateFormulaEImageInputSchema},
  output: {schema: GenerateFormulaEImageOutputSchema},
  prompt: [
    {
      media: {url: '{{selfieDataUri}}'},
    },
    {
      text: 'Generate an image of this character in a Formula E scenario: {{{prompt}}}',
    },
  ],
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
});

const generateFormulaEImageFlow = ai.defineFlow(
  {
    name: 'generateFormulaEImageFlow',
    inputSchema: GenerateFormulaEImageInputSchema,
    outputSchema: GenerateFormulaEImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: input.selfieDataUri}},
        {text: `generate an image of this character in a Formula E scenario: ${input.prompt}`},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {generatedImageDataUri: media.url!};
  }
);
