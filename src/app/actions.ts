'use server';

import { generateFormulaEImage, GenerateFormulaEImageInput } from '@/ai/flows/generate-formula-e-image';
import { suggestFormulaEPrompts } from '@/ai/flows/suggest-formula-e-prompts';

export async function suggestFormulaEPromptsAction(): Promise<string[]> {
  try {
    const result = await suggestFormulaEPrompts({});
    return result.prompts;
  } catch (error) {
    console.error('Error suggesting prompts:', error);
    // In a real app, you might want more robust error handling or fallback prompts
    return [
        "A Formula E car racing through ancient Roman ruins.",
        "Celebrating a win on the podium in Monaco, champagne spraying.",
        "A pit stop scene with a futuristic female mechanic.",
        "Driving a Formula E car on the surface of Mars.",
        "A dynamic, anime-style action shot of a Formula E car drifting."
    ];
  }
}

export async function generateFormulaEImageAction(input: GenerateFormulaEImageInput): Promise<string> {
  const result = await generateFormulaEImage(input);
  return result.generatedImageDataUri;
}
