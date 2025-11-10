'use server';
import type { SuggestFormulaEPromptsOutput } from '@/ai/flows/suggest-formula-e-prompts';
import type { GenerateFormulaEImageInput } from '@/ai/flows/generate-formula-e-image';
import type { EditFormulaEImageInput } from '@/ai/flows/edit-formula-e-image';
import type { GenerateFormulaEVideoInput } from '@/ai/flows/generate-formula-e-video';

const BACKEND_URL = process.env.FORMULA_E_BACKEND_URL;

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

export async function generateFormulaEVideoAction(input: GenerateFormulaEVideoInput): Promise<{ operationName: string }> {
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
        const operationName = result.operationName;
        if (!operationName) {
            throw new Error("Backend did not return an operation name.");
        }
        return { operationName };
    } catch (error) {
        console.error(`Failed to fetch from backend endpoint /generate-video:`, error);
        throw error;
    }
}

export async function checkVideoStatusAction(operationName: string): Promise<{ done: boolean; videoUrl?: string; qrCode?: string; error?: string }> {
    if (!BACKEND_URL) {
        throw new Error('Backend URL is not configured.');
    }
    const url = `${BACKEND_URL}/video-status/${operationName}`;
    console.log(`Making GET request to ${url}`);

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
             const errorBody = await response.text();
             console.error(`Error from backend: ${response.status} ${response.statusText}`, errorBody);
             // Don't throw for certain errors, as we want to keep polling
             if (response.status === 429) {
                return { done: false, error: 'rate-limited' };
             }
             if (response.status === 404) {
                return { done: false, error: 'not-found' };
             }
             if (response.status === 500) {
                return { done: false, error: 'internal-server-error' };
             }
             throw new Error(`Request failed: ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        
        if (result.status === 'done') {
            if (result.error) {
                return { done: true, error: result.error.message };
            }
            const videoUrl = result.videoData;
            const qrCode = result.qrCode;
            if (!videoUrl) {
                return { done: true, error: "Backend did not return a video URL." };
            }
            return { done: true, videoUrl, qrCode };
        }

        return { done: false };

    } catch (error) {
        console.error(`Failed to fetch from backend endpoint /video-status:`, error);
        throw error;
    }
}
