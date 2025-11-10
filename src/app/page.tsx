'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30"
          src="https://storage.googleapis.com/created-videos/4855420956219534839/sample_3.mp4"
        />
        <div className="absolute inset-0 bg-background/50"></div>
      </div>
      <div className="relative z-10 w-full max-w-2xl text-center">
        <h1 className="whitespace-nowrap text-4xl font-bold tracking-tight text-primary-foreground sm:text-6xl font-headline">
          Formula E AI Selfie🏎️🤳
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground font-body">
        Generate a new image based on your selfie and a Formula E-related prompt. <br/> with Gemini 2.5 Flash Image and Veo 2.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/selfie">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-body">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
