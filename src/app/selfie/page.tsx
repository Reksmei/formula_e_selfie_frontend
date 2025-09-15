
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { suggestFormulaEPromptsAction, generateFormulaEImageAction, editFormulaEImageAction, generateFormulaEVideoAction } from '../actions';
import CameraCapture from '@/components/camera-capture';
import { Loader2, Sparkles, User, Repeat, RotateCcw, Pencil, Film, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


type Step = 'capture' | 'preview' | 'generating' | 'result' | 'editing' | 'generating-video' | 'video-result' | 'error';

export default function SelfiePage() {
  const [step, setStep] = useState<Step>('capture');
  const [selfie, setSelfie] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPrompts() {
      try {
        const suggestedPrompts = await suggestFormulaEPromptsAction();
        setPrompts(suggestedPrompts);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to load prompts',
          description: 'Could not fetch AI suggestions. Please try again later.',
        });
      } finally {
        setIsLoadingPrompts(false);
      }
    }
    fetchPrompts();
  }, [toast]);

  const handleCapture = (imageDataUrl: string) => {
    setSelfie(imageDataUrl);
    setStep('preview');
  };

  const handleCameraError = (error: string) => {
    setStep('error');
    toast({
      variant: 'destructive',
      title: 'Camera Error',
      description: error,
    });
  };

  const handleGenerate = async () => {
    if (!selfie || !selectedPrompt) return;
    setStep('generating');
    try {
      const generatedImageUrl = await generateFormulaEImageAction({
        selfieDataUri: selfie,
        prompt: selectedPrompt,
      });
      setGeneratedImage(generatedImageUrl);
      setStep('result');
    } catch (error) {
      setStep('preview');
      toast({
        variant: 'destructive',
        title: 'Image Generation Failed',
        description: 'The AI could not generate your image. Please try again.',
      });
    }
  };

  const handleEdit = async () => {
    if (!generatedImage || !editPrompt) return;
    setIsEditing(true);
    try {
      const editedImageUrl = await editFormulaEImageAction({
        imageDataUri: generatedImage,
        prompt: editPrompt,
      });
      setGeneratedImage(editedImageUrl);
      setEditPrompt('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Image Editing Failed',
        description: 'The AI could not edit your image. Please try again.',
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!generatedImage) return;
    setStep('generating-video');
    try {
      const videoUrl = await generateFormulaEVideoAction({
        imageDataUri: generatedImage
      });
      setGeneratedVideo(videoUrl);
      setStep('video-result');
    } catch (error) {
      setStep('result');
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Video Generation Failed',
        description: 'The AI could not generate a video. Please try again.',
      });
    }
  };

  const reset = () => {
    setSelfie(null);
    setSelectedPrompt(null);
    setGeneratedImage(null);
    setGeneratedVideo(null);
    setStep('capture');
  };

  const retake = () => {
    setSelfie(null);
    setSelectedPrompt(null);
    setGeneratedImage(null);
    setGeneratedVideo(null);
    setStep('capture');
  }

  const renderContent = () => {
    switch (step) {
      case 'capture':
        return (
          <div className="w-full max-w-lg text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl font-headline">E-Prix Imagery</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Take a selfie, pick a prompt, and let our AI place you in the heart of Formula E action.
            </p>
            <div className="mt-8">
              <CameraCapture onCapture={handleCapture} onCameraError={handleCameraError} />
            </div>
          </div>
        );
      case 'preview':
        return (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><User /> Your Selfie</CardTitle>
                <CardDescription>This is the picture we'll use for the AI generation.</CardDescription>
              </CardHeader>
              <CardContent>
                {selfie && (
                  <Image
                    src={selfie}
                    alt="User's selfie"
                    width={500}
                    height={300}
                    className="rounded-lg object-cover aspect-video"
                  />
                )}
                <Button onClick={retake} variant="outline" className="w-full mt-4">
                  <RotateCcw className="mr-2 h-4 w-4" /> Retake
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><Sparkles /> Choose a Prompt</CardTitle>
                <CardDescription>Select a scenario for your E-Prix image.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPrompts ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  <RadioGroup onValueChange={setSelectedPrompt} className="space-y-2">
                    {prompts.map((prompt, index) => (
                      <div key={index} className="flex items-center space-x-2 rounded-md border p-3 hover:bg-secondary/50 transition-colors">
                        <RadioGroupItem value={prompt} id={`prompt-${index}`} />
                        <Label htmlFor={`prompt-${index}`} className="flex-1 cursor-pointer">{prompt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                <Button onClick={handleGenerate} disabled={!selectedPrompt} className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
                  Generate Image
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      case 'generating':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-3xl font-bold font-headline">Generating your E-Prix moment...</h2>
            <p className="text-muted-foreground">The AI is working its magic. This might take a moment.</p>
          </div>
        );
      case 'result':
        return (
          <div className="w-full max-w-5xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">Your E-Prix Image is Ready!</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              You can now edit your image with a prompt, or generate a video.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card>
                 <CardHeader>
                   <CardTitle className="font-headline">Original Selfie</CardTitle>
                 </CardHeader>
                 <CardContent>
                   {selfie && <Image src={selfie} alt="Original selfie" width={500} height={300} className="rounded-lg object-cover aspect-video" />}
                 </CardContent>
               </Card>
               <Card>
                 <CardHeader>
                   <CardTitle className="font-headline">Generated Image</CardTitle>
                 </CardHeader>
                 <CardContent>
                   {generatedImage && <Image src={generatedImage} alt="Generated Formula E image" width={500} height={300} className="rounded-lg object-cover aspect-video" />}
                 </CardContent>
               </Card>
             </div>
             <div className="mt-8 w-full max-w-lg mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline"><Pencil /> Edit Your Image</CardTitle>
                        <CardDescription>Describe the changes you'd like to make.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="e.g. 'make the lighting more dramatic'"
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                disabled={isEditing}
                            />
                            <Button onClick={handleEdit} disabled={!editPrompt || isEditing}>
                                {isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                <span className="ml-2">Apply</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
             </div>
            <div className="mt-8 flex justify-center gap-4">
                <Button onClick={reset} size="lg" variant="outline">
                    <Repeat className="mr-2 h-4 w-4" /> Start Over
                </Button>
                <Button onClick={handleGenerateVideo} size="lg">
                    <Film className="mr-2 h-4 w-4" /> Generate Video
                </Button>
            </div>
          </div>
        );
      case 'generating-video':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-3xl font-bold font-headline">Generating your video...</h2>
            <p className="text-muted-foreground">This can take a minute or two. Please be patient.</p>
            {generatedImage && <Image src={generatedImage} alt="Generating video from this image" width={200} height={112} className="rounded-lg object-cover aspect-video mt-4 opacity-50" />}
          </div>
        );
      case 'video-result':
        return (
          <div className="w-full max-w-2xl text-center">
             <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">Your Video is Ready!</h1>
             <Card className="mt-8">
                <CardContent className="p-4">
                    {generatedVideo && (
                        <video src={generatedVideo} controls autoPlay loop className="w-full rounded-lg" />
                    )}
                </CardContent>
             </Card>
             <div className="mt-8 flex justify-center gap-4">
                <Button onClick={reset} size="lg" variant="outline">
                    <Repeat className="mr-2 h-4 w-4" /> Start Over
                </Button>
                <a href={generatedVideo!} download="e-prix-video.mp4">
                    <Button size="lg">
                        <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                </a>
            </div>
          </div>
        );
      case 'error':
         return (
          <div className="w-full max-w-lg text-center">
             <h1 className="text-4xl font-bold tracking-tight text-destructive sm:text-5xl font-headline">Something went wrong</h1>
             <p className="mt-4 text-lg text-muted-foreground">
               We couldn't access your camera. Please check your browser permissions and try again.
             </p>
             <Button onClick={reset} variant="outline" size="lg" className="mt-8">
               <Repeat className="mr-2 h-4 w-4" /> Try Again
             </Button>
           </div>
         )
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background transition-colors duration-500">
       <Link href="/" className="absolute top-4 left-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
      {renderContent()}
    </main>
  );
}
