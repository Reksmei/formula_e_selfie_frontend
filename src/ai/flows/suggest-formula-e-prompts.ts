'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting Formula E related prompts to the user.
 *
 * The flow's purpose is to provide users with creative prompts to use with the image generation feature of the E-Prix Imagery app, so they don't have to come up with prompts themselves.
 *
 * @interface SuggestFormulaEPromptsInput - The input type for the suggestFormulaEPrompts function.
 * @interface SuggestFormulaEPromptsOutput - The output type for the suggestFormulaEPrompts function.
 * @function suggestFormulaEPrompts - A function that returns suggested Formula E prompts.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFormulaEPromptsInputSchema = z.object({})
export type SuggestFormulaEPromptsInput = z.infer<typeof SuggestFormulaEPromptsInputSchema>

const SuggestFormulaEPromptsOutputSchema = z.object({
  prompts: z.array(z.string()).describe('An array of suggested Formula E prompts.')
})
export type SuggestFormulaEPromptsOutput = z.infer<typeof SuggestFormulaEPromptsOutputSchema>

export async function suggestFormulaEPrompts(input: SuggestFormulaEPromptsInput): Promise<SuggestFormulaEPromptsOutput> {
  return suggestFormulaEPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFormulaEPromptsPrompt',
  input: {schema: SuggestFormulaEPromptsInputSchema},
  output: {schema: SuggestFormulaEPromptsOutputSchema},
  prompt: `You are an AI assistant designed to suggest creative prompts related to Formula E racing.

  Provide a list of diverse and engaging prompts that users can use to generate images using their selfie and the prompt.

  The prompts should be imaginative and capture the essence of Formula E, including its futuristic technology, iconic race locations, and the excitement of electric racing.

  Return the prompts as a JSON array of strings.

  Example Prompts:
  [
    "A Formula E car speeding through the neon-lit streets of Tokyo at night.",
    "A driver celebrating a Formula E victory with the backdrop of the New York City skyline.",
    "A futuristic Formula E car design inspired by a cheetah.",
    "A bird's-eye view of a Formula E race track winding through the Swiss Alps.",
    "A portrait of a Formula E engineer working on the car's electric powertrain."
  ]
  `
});

const suggestFormulaEPromptsFlow = ai.defineFlow({
    name: 'suggestFormulaEPromptsFlow',
    inputSchema: SuggestFormulaEPromptsInputSchema,
    outputSchema: SuggestFormulaEPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
