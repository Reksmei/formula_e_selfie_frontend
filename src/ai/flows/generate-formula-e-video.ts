'use server';
/**
 * @fileOverview Defines the data contract for generating a video from a Formula E image.
 *
 * - GenerateFormulaEVideoInput - The input type for the function.
 * - GenerateFormulaEVideoOutput - The return type for the function.
 */

import {z} from 'genkit';

export const GenerateFormulaEVideoInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The image to generate a video from, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateFormulaEVideoInput = z.infer<
  typeof GenerateFormulaEVideoInputSchema
>;

export const GenerateFormulaEVideoOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated video as a data URI.'),
});
export type GenerateFormulaEVideoOutput = z.infer<
  typeof GenerateFormulaEVideoOutputSchema
>;
