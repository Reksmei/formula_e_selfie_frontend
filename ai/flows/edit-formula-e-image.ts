'use server';
/**
 * @fileOverview Defines the data contract for editing a Formula E-themed image.
 *
 * - EditFormulaEImageInput - The input type for editing the image.
 * - EditFormulaEImageOutput - The return type for editing the image.
 */

import {z} from 'genkit';

export const EditFormulaEImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The image to edit, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('The editing instruction from the user.'),
  referenceImageId: z
    .string()
    .optional()
    .describe('An optional ID for a reference image to guide the generation.'),
});
export type EditFormulaEImageInput = z.infer<
  typeof EditFormulaEImageInputSchema
>;

export const EditFormulaEImageOutputSchema = z.object({
  editedImageDataUri: z
    .string()
    .describe('The edited image as a data URI.'),
});
export type EditFormulaEImageOutput = z.infer<
  typeof EditFormulaEImageOutputSchema
>;
