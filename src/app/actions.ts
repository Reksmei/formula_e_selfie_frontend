
'use server';

import { GenerateFormulaEImageInput } from '@/ai/flows/generate-formula-e-image';
import { EditFormulaEImageInput } from '@/ai/flows/edit-formula-e-image';
import { GenerateFormulaEVideoInput } from '@/ai/flows/generate-formula-e-video';

const BACKEND_URL = process.env.FORMULA_E_BACKEND_URL;

async function makeJsonBackendRequest(endpoint: string, method: string = 'POST', body?: any) {
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

// Helper to convert data URI to Blob
function dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}


export async function suggestFormulaEPromptsAction(): Promise<string[]> {
  try {
    const result = await makeJsonBackendRequest('/suggest-prompts', 'POST', {});
    return result.prompts;
  } catch (error) {
    console.error('Error suggesting prompts:', error);
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
    if (!BACKEND_URL) {
        throw new Error('Backend URL is not configured.');
    }
    const url = `${BACKEND_URL}/generate`;
    
    const formData = new FormData();
    const imageBlob = dataURItoBlob(input.selfieDataUri);
    formData.append('image', imageBlob, 'selfie.jpg');
    formData.append('prompt', input.prompt);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Error from backend: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Request failed: ${response.statusText}`);
        }

        const result = await response.json();
        return result.generatedImageDataUri;
    } catch (error) {
        console.error(`Failed to fetch from backend endpoint /generate:`, error);
        throw error;
    }
}

export async function editFormulaEImageAction(input: EditFormulaEImageInput): Promise<string> {
    // Assuming edit also needs multipart/form-data
    if (!BACKEND_URL) {
        throw new Error('Backend URL is not configured.');
    }
    const url = `${BACKEND_URL}/edit-image`;
    
    const formData = new FormData();
    const imageBlob = dataURItoBlob(input.imageDataUri);
    formData.append('image', imageBlob, 'image.jpg');
    formData.append('prompt', input.prompt);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Error from backend: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Request failed: ${response.statusText}`);
        }

        const result = await response.json();
        return result.editedImageDataUri;
    } catch (error) {
        console.error(`Failed to fetch from backend endpoint /edit-image:`, error);
        throw error;
    }
}

export async function generateFormulaEVideoAction(input: GenerateFormulaEVideoInput): Promise<string> {
    if (!BACKEND_URL) {
        throw new Error('Backend URL is not configured.');
    }
    const url = `${BACKEND_URL}/generate-video`;

    const formData = new FormData();
    const imageBlob = dataURItoBlob(input.imageDataUri);
    formData.append('image', imageBlob, 'image.jpg');

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Error from backend: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Request failed: ${response.statusText}`);
        }

        const result = await response.json();
        return result.videoDataUri;
    } catch (error) {
        console.error(`Failed to fetch from backend endpoint /generate-video:`, error);
        throw error;
    }
}
