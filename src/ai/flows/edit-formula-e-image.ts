'use server';
/**
 * @fileOverview Edits a Formula E-themed image based on a user's text prompt.
 *
 * - editFormulaEImage - A function that edits the Formula E image.
 * - EditFormulaEImageInput - The input type for the editFormulaEImage function.
 * - EditFormulaEImageOutput - The return type for the editFormulaEImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditFormulaEImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The image to edit, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('The editing instruction from the user.'),
});
export type EditFormulaEImageInput = z.infer<
  typeof EditFormulaEImageInputSchema
>;

const EditFormulaEImageOutputSchema = z.object({
  editedImageDataUri: z
    .string()
    .describe('The edited image as a data URI.'),
});
export type EditFormulaEImageOutput = z.infer<
  typeof EditFormulaEImageOutputSchema
>;

export async function editFormulaEImage(
  input: EditFormulaEImageInput
): Promise<EditFormulaEImageOutput> {
  return editFormulaEImageFlow(input);
}

const editFormulaEImageFlow = ai.defineFlow(
  {
    name: 'editFormulaEImageFlow',
    inputSchema: EditFormulaEImageInputSchema,
    outputSchema: EditFormulaEImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: input.imageDataUri}},
        {text: input.prompt},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media.url) {
        throw new Error("Image editing failed to produce an image.");
    }

    return {editedImageDataUri: media.url};
  }
);
