'use server';
import type { SuggestFormulaEPromptsOutput } from '@/ai/flows/suggest-formula-e-prompts';
import type { GenerateFormulaEImageInput } from '@/ai/flows/generate-formula-e-image';
import type { EditFormulaEImageInput } from '@/ai/flows/edit-formula-e-image';
import type { GenerateFormulaEVideoInput } from '@/ai/flows/generate-formula-e-video';

const BACKEND_URL = process.env.FORMULA_E_BACKEND_URL;

async function makeJsonRequest(endpoint: string, method: string = 'POST', body: any) {
  if (!BACKEND_URL) {
    throw new Error('Backend URL is not configured.');
  }

  const url = `${BACKEND_URL}${endpoint}`;
  console.log(`Making JSON request to ${method} ${url}`);

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
    // NOTE: The /suggest-prompts endpoint does not exist on the backend.
    // This function returns a hardcoded list of prompts as a fallback.
    return [
      "A Formula E car racing through ancient Roman ruins.",
      "Celebrating a win on the podium in Monaco, champagne spraying.",
      "A pit stop scene with a futuristic female mechanic.",
      "Driving a Formula E car on the surface of Mars.",
      "A dynamic, anime-style action shot of a Formula E car drifting."
    ];
}

export async function generateFormulaEImageAction(input: GenerateFormulaEImageInput): Promise<{imageUrl: string, qrCode: string}> {
    if (!BACKEND_URL) {
        throw new Error('Backend URL is not configured.');
    }
    const url = `${BACKEND_URL}/generate`;
    console.log(`Making FormData request to POST ${url}`);

    try {
        const imageResponse = await fetch(input.selfieDataUri);
        const imageBlob = await imageResponse.blob();

        const formData = new FormData();
        formData.append('image', imageBlob, 'selfie.jpg');
        formData.append('prompt', input.prompt);

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Error from backend: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Request failed: ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        const imageUrl = result.imageData;
        const qrCode = result.qrCode;
        if (!imageUrl) {
            throw new Error("Backend did not return an image URL.");
        }
        return {imageUrl, qrCode};
    } catch (error) {
        console.error(`Failed to fetch from backend endpoint /generate:`, error);
        throw error;
    }
}

export async function editFormulaEImageAction(input: EditFormulaEImageInput): Promise<{imageUrl: string, qrCode: string}> {
    if (!BACKEND_URL) {
        throw new Error('Backend URL is not configured.');
    }
    const url = `${BACKEND_URL}/generate`;
    console.log(`Making FormData request to POST ${url} for editing`);

    try {
        const imageResponse = await fetch(input.imageDataUri);
        const imageBlob = await imageResponse.blob();

        const formData = new FormData();
        formData.append('image', imageBlob, 'image.jpg');
        formData.append('prompt', input.prompt);

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Error from backend: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Request failed: ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        const imageUrl = result.imageData;
        const qrCode = result.qrCode;
        if (!imageUrl) {
            throw new Error("Backend did not return an edited image URL.");
        }
        return {imageUrl, qrCode};
    } catch (error) {
        console.error(`Failed to fetch from backend endpoint /generate for editing:`, error);
        throw error;
    }
}

export async function generateFormulaEVideoAction(input: GenerateFormulaEVideoInput): Promise<{videoUrl: string, qrCode: string}> {
    if (!BACKEND_URL) {
        throw new Error('Backend URL is not configured.');
    }
    const url = `${BACKEND_URL}/generate-video`;
    console.log(`Making FormData request to POST ${url}`);

    try {
        const imageResponse = await fetch(input.imageDataUri);
        const imageBlob = await imageResponse.blob();

        const formData = new FormData();
        formData.append('image', imageBlob, 'image.jpg');
        formData.append('prompt', 'Turn this photo into a video');

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Error from backend: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Request failed: ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        const videoUrl = result.videoData;
        const qrCode = result.qrCode;
        if (!videoUrl) {
            throw new Error("Backend did not return a video URL.");
        }
        return {videoUrl, qrCode};
    } catch (error) {
        console.error(`Failed to fetch from backend endpoint /generate-video:`, error);
        throw error;
    }
}
