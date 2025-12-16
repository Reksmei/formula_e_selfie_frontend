import { config } from 'dotenv';
config();

// The Genkit flows are defined and run in the backend service.
// This file is used for local development if you were to run the flows
// directly within the Next.js app.
// To run the flows locally, you would uncomment the following lines
// and run `npm run genkit:watch`.

// import '@/ai/flows/suggest-formula-e-prompts.ts';
// import '@/ai/flows/generate-formula-e-image.ts';
// import '@/ai/flows/edit-formula-e-image.ts';
// import '@/ai/flows/generate-formula-e-video.ts';
