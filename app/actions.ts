'use server';
import type { GenerateFormulaEImageInput } from '@/ai/flows/generate-formula-e-image';
import type { EditFormulaEImageInput } from '@/ai/flows/edit-formula-e-image';

const BACKEND_URL = process.env.FORMULA_E_BACKEND_URL;

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

        if (input.referenceImageId) {
            formData.append('referenceImageId', input.referenceImageId);
        }

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

        if (input.referenceImageId) {
            formData.append('referenceImageId', input.referenceImageId);
        }

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
