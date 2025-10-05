
'use server';

import { GenerateFormulaEImageInput } from '@/ai/flows/generate-formula-e-image';
import { EditFormulaEImageInput } from '@/ai/flows/edit-formula-e-image';
import { GenerateFormulaEVideoInput } from '@/ai/flows/generate-formula-e-video';

const BACKEND_URL = process.env.FORMULA_E_BACKEND_URL;

async function makeBackendRequest(endpoint: string, method: string = 'GET', body?: any) {
  if (!BACKEND_URL) {
    throw new Error('Backend URL is not configured.');
  }

  const url = `${BACKEND_URL}${endpoint}`;
  console.log(`Making request to ${method} ${url}`);
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error from backend: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log(`Received response from ${url}`, responseData);
    return responseData;
  } catch (error) {
    console.error(`Failed to fetch from backend endpoint ${endpoint}:`, error);
    throw error;
  }
}

export async function suggestFormulaEPromptsAction(): Promise<string[]> {
  try {
    const result = await makeBackendRequest('/suggest-prompts', 'POST', {});
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
  const result = await makeBackendRequest('/generate-image', 'POST', input);
  return result.generatedImageDataUri;
}

export async function editFormulaEImageAction(input: EditFormulaEImageInput): Promise<string> {
    const result = await makeBackendRequest('/edit-image', 'POST', input);
    return result.editedImageDataUri;
}

export async function generateFormulaEVideoAction(input: GenerateFormulaEVideoInput): Promise<string> {
    const result = await makeBackendRequest('/generate-video', 'POST', input);
    return result.videoDataUri;
}
