
'use server';
import type { GenerateFormulaEImageInput } from '@/ai/flows/generate-formula-e-image';
import type { EditFormulaEImageInput } from '@/ai/flows/edit-formula-e-image';
import { promises as fs } from 'fs';
import path from 'path';

const BACKEND_URL = process.env.FORMULA_E_BACKEND_URL;

async function getReferenceImageBlob(referenceImageUrl: string): Promise<[Blob, string] | [null, null]> {
    if (!referenceImageUrl) {
        return [null, null];
    }

    if (referenceImageUrl.startsWith('http')) {
        console.log(`Fetching remote reference image from: ${referenceImageUrl}`);
        const response = await fetch(referenceImageUrl);
        if (!response.ok) {
            console.error(`Failed to fetch remote reference image: ${response.statusText}`);
            return [null, null];
        }
        const blob = await response.blob();
        return [blob, 'reference.jpg'];
    } else if (referenceImageUrl.startsWith('/')) {
        try {
            const filePath = path.join(process.cwd(), 'public', referenceImageUrl);
            console.log(`Reading local reference image from: ${filePath}`);
            const fileBuffer = await fs.readFile(filePath);
            const blob = new Blob([fileBuffer], { type: 'image/jpeg' }); // Adjust MIME type if needed
            return [blob, path.basename(filePath)];
        } catch (error) {
            console.error(`Failed to read local reference image:`, error);
            return [null, null];
        }
    }
    
    return [null, null];
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

        if (input.referenceImageUrl) {
            const [referenceImageBlob, fileName] = await getReferenceImageBlob(input.referenceImageUrl);
            if (referenceImageBlob && fileName) {
                formData.append('referenceImage', referenceImageBlob, fileName);
            }
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

        if (input.referenceImageUrl) {
            const [referenceImageBlob, fileName] = await getReferenceImageBlob(input.referenceImageUrl);
            if (referenceImageBlob && fileName) {
                formData.append('referenceImage', referenceImageBlob, fileName);
            }
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
