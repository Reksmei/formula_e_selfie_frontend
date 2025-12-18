
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50"
          src="https://storage.googleapis.com/created-videos/4855420956219534839/sample_3.mp4"
        />
        <div className="absolute inset-0 bg-background/50"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl text-center">
        <Image 
          src="https://storage.googleapis.com/selfie-sample-images/formula_e_gc_logo_black.svg"
          alt="Formula E Google Cloud Logo"
          width={300}
          height={75}
          className="w-auto h-auto mb-8"
        />
        <h1 className="whitespace-nowrap text-8xl font-bold tracking-tight text-primary-foreground sm:text-9xl font-headline">
          AI Selfie
        </h1>
        <p className="mt-6 text-3xl leading-8 text-muted-foreground font-body md:text-4xl">
        Generate a new image based on your selfie and a Formula E-related prompt with Gemini 2.5 Flash Image on Vertex AI.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/selfie">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-body text-2xl px-16 py-10">
              Get Started <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
