
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Formula E AI Selfie',
  description: 'Generate a new image based on your selfie and a Formula E-related prompt with Gemini 2.5 Flash Image and Veo 3.1.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: 'GoogleSans';
                src: url('/fonts/GoogleSans-Regular.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
              }
              @font-face {
                font-family: 'GoogleSans-Bold';
                src: url('/fonts/GoogleSans-Bold.ttf') format('truetype');
                font-weight: bold;
                font-style: normal;
              }
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
