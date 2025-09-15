
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background transition-colors duration-500">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl font-headline">
          Welcome to E-Prix Imagery
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground font-body">
          Step into the world of Formula E. Generate a unique image of yourself in the heart of the action, powered by AI.
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
