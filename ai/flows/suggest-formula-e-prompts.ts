'use server';
/**
 * @fileOverview This file defines the data contract for suggesting Formula E related prompts.
 *
 * @interface SuggestFormulaEPromptsInput - The input type for suggesting prompts.
 * @interface SuggestFormulaEPromptsOutput - The output type for suggesting prompts.
 */

import {z} from 'genkit';

export const SuggestFormulaEPromptsInputSchema = z.object({})
export type SuggestFormulaEPromptsInput = z.infer<typeof SuggestFormulaEPromptsInputSchema>

export const SuggestFormulaEPromptsOutputSchema = z.object({
  prompts: z.array(z.string()).describe('An array of suggested Formula E prompts.')
})
export type SuggestFormulaEPromptsOutput = z.infer<typeof SuggestFormulaEPromptsOutputSchema>
