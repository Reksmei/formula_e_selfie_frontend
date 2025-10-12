
'use server';
import type { GenerateFormulaEImageInput } from '@/ai/flows/generate-formula-e-image';
import type { EditFormulaEImageInput } from '@/ai/flows/edit-formula-e-image';
import type { GenerateFormulaEVideoInput } from '@/ai/flows/generate-formula-e-video';
import type { SuggestFormulaEPromptsOutput } from '@/ai/flows/suggest-formula-e-prompts';

// This helper will now only be used for simple JSON requests.
async function makeBackendRequest(endpoint: string, method: string = 'POST', body: any) {
  const BACKEND_URL = process.env.FORMULA_E_BACKEND_URL;
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
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error from backend: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`Request failed: ${response.statusText} - ${errorBody}`);
    }

    const responseData = await response.json();
    console.log(`Received response from ${url}`);
    return responseData;
  } catch (error) {
    console.error(`Failed to fetch from backend endpoint ${endpoint}:`, error);
    throw error;
  }
}

export async function suggestFormulaEPromptsAction(): Promise<string[]> {
  try {
    const result: SuggestFormulaEPromptsOutput = await makeBackendRequest('/suggest-prompts', 'POST', {});
    return result.prompts;
  } catch (error) {
    console.error('Error suggesting prompts:', error);
    // Return fallback prompts on error
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
    try {
        const result = await makeBackendRequest('/generate', 'POST', {
            selfieDataUri: input.selfieDataUri,
            prompt: input.prompt
        });
        const imageUrl = result.url;
        if (!imageUrl) {
          throw new Error("Backend did not return an image URL.");
        }
        return imageUrl;
    } catch (error) {
        console.error(`Failed to fetch from backend endpoint /generate:`, error);
        throw error;
    }
}

export async function editFormulaEImageAction(input: EditFormulaEImageInput): Promise<string> {
    try {
        const result = await makeBackendRequest('/edit-image', 'POST', {
            imageDataUri: input.imageDataUri,
            prompt: input.prompt
        });
        const imageUrl = result.url;
        if (!imageUrl) {
            throw new Error("Backend did not return an edited image URL.");
        }
        return imageUrl;
    } catch (error) {
        console.error(`Failed to fetch from backend endpoint /edit-image:`, error);
        throw error;
    }
}

export async function generateFormulaEVideoAction(input: GenerateFormulaEVideoInput): Promise<string> {
    try {
        const result = await makeBackendRequest('/generate-video', 'POST', {
            imageDataUri: input.imageDataUri
        });
        const videoUrl = result.url;
        if (!videoUrl) {
            throw new Error("Backend did not return a video URL.");
        }
        return videoUrl;
    } catch (error) {
        console.error(`Failed to fetch from backend endpoint /generate-video:`, error);
        throw error;
    }
}
