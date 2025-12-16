'use server';
/**
 * @fileOverview Defines the data contract for generating a Formula E-themed image.
 *
 * - GenerateFormulaEImageInput - The input type for the image generation.
 * - GenerateFormulaEImageOutput - The return type for the image generation.
 */

import {z} from 'genkit';

export const GenerateFormulaEImageInputSchema = z.object({
  selfieDataUri: z
    .string()
    .describe(
      "A selfie image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('The Formula E-related prompt selected by the user.'),
  referenceImageId: z
    .string()
    .optional()
    .describe('An optional ID for a reference image to guide the generation.'),
});
export type GenerateFormulaEImageInput = z.infer<
  typeof GenerateFormulaEImageInputSchema
>;

export const GenerateFormulaEImageOutputSchema = z.object({
  generatedImageDataUri: z
    .string()
    .describe(
      'The generated image as a data URI, combining the selfie and the Formula E theme.'
    ),
});
export type GenerateFormulaEImageOutput = z.infer<
  typeof GenerateFormulaEImageOutputSchema
>;
