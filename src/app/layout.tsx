import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'E-Prix Imagery',
  description: 'Generate a new image based on your selfie and a Formula E-related prompt.',
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
                src: url('https://storage.googleapis.com/gemini_cycle_tour_tech_logo_reks/GoogleSans-Regular.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
              }
              @font-face {
                font-family: 'GoogleSans-Bold';
                src: url('https://storage.googleapis.com/gemini_cycle_tour_tech_logo_reks/GoogleSans-Bold.ttf') format('truetype');
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
