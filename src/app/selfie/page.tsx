
'use client';

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { suggestFormulaEPromptsAction, generateFormulaEImageAction, editFormulaEImageAction, generateFormulaEVideoAction } from '../actions';
import { Loader2, Sparkles, User, Repeat, RotateCcw, Pencil, Film, Download, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const CameraCapture = lazy(() => import('@/components/camera-capture'));

type Step = 'capture' | 'preview' | 'generating' | 'result' | 'editing' | 'generating-video' | 'video-result' | 'error';

export default function SelfiePage() {
  const [step, setStep] = useState<Step>('capture');
  const [selfie, setSelfie] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<ImagePlaceholder[]>([]);
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
        await suggestFormulaEPromptsAction();
        setPrompts(PlaceHolderImages);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to load prompts',
          description: 'Using fallback prompts. Please try again later for AI suggestions.',
        });
        setPrompts(PlaceHolderImages);
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
            <p className="mt-20 text-lg text-muted-foreground font-body">
              Take a selfie, pick a prompt, and let our AI place you in the heart of Formula E action.
            </p>
            <div className="mt-8">
              <Suspense fallback={<div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
                <CameraCapture onCapture={handleCapture} onCameraError={handleCameraError} />
              </Suspense>
            </div>
          </div>
        );
      case 'preview':
        return (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><User /> Your Selfie</CardTitle>
                <CardDescription className="font-body">This is the picture we'll use for the AI generation.</CardDescription>
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
                <Button onClick={retake} variant="outline" className="w-full mt-4 font-body">
                  <RotateCcw className="mr-2 h-4 w-4" /> Retake
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><Sparkles /> Choose a Prompt</CardTitle>
                <CardDescription className="font-body">Select a scenario for your E-Prix image.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPrompts ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {prompts.slice(0, 4).map((imageInfo) => (
                        <div
                          key={imageInfo.id}
                          className={cn(
                            "relative rounded-lg overflow-hidden cursor-pointer border-4 group",
                            selectedPrompt === imageInfo.description ? 'border-accent' : 'border-transparent'
                          )}
                          onClick={() => setSelectedPrompt(imageInfo.description)}
                        >
                          <Image
                            src={imageInfo.imageUrl}
                            alt={imageInfo.description}
                            width={300}
                            height={200}
                            className="object-cover w-full h-full aspect-[3/2]"
                          />
                          <div className="absolute inset-0 bg-black/50"></div>
                           <div className="absolute top-2 left-2 text-white font-bold text-sm bg-black/40 px-2 py-1 rounded-md">{imageInfo.id}</div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="absolute bottom-2 right-2 text-white h-8 w-8 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Image Prompt</AlertDialogTitle>
                                <AlertDialogDescription className="break-words">
                                  {imageInfo.description}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogAction>Close</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )
                    )}
                  </div>
                )}
                <Button onClick={handleGenerate} disabled={!selectedPrompt} className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90 font-body">
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
            <h2 className="text-3xl font-bold font-headline text-primary-foreground">Generating your E-Prix moment...</h2>
            <p className="text-muted-foreground font-body">The AI is working its magic. This might take a moment.</p>
          </div>
        );
      case 'result':
        return (
          <div className="w-full max-w-5xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary-foreground font-headline">Your Image is Ready!</h1>
            <p className="mt-4 text-lg text-muted-foreground font-body">
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
                        <CardDescription className="font-body">Describe the changes you'd like to make.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="e.g. 'make the lighting more dramatic'"
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                disabled={isEditing}
                                className="font-body"
                            />
                            <Button onClick={handleEdit} disabled={!editPrompt || isEditing} className="font-body">
                                {isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                <span className="ml-2">Apply</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
             </div>
            <div className="mt-8 flex justify-center gap-4">
                <Button onClick={reset} size="lg" variant="outline" className="font-body">
                    <Repeat className="mr-2 h-4 w-4" /> Start Over
                </Button>
                <Button onClick={handleGenerateVideo} size="lg" className="font-body">
                    <Film className="mr-2 h-4 w-4" /> Generate Video
                </Button>
            </div>
          </div>
        );
      case 'generating-video':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-3xl font-bold font-headline text-primary-foreground">Generating your video...</h2>
            <p className="text-muted-foreground font-body">This can take a minute or two. Please be patient.</p>
            {generatedImage && <Image src={generatedImage} alt="Generating video from this image" width={200} height={112} className="rounded-lg object-cover aspect-video mt-4 opacity-50" />}
          </div>
        );
      case 'video-result':
        return (
          <div className="w-full max-w-2xl text-center">
             <h1 className="text-4xl font-bold tracking-tight text-primary-foreground font-headline">Your Video is Ready!</h1>
             <Card className="mt-8">
                <CardContent className="p-4">
                    {generatedVideo && (
                        <video src={generatedVideo} controls autoPlay loop className="w-full rounded-lg" />
                    )}
                </CardContent>
             </Card>
             <div className="mt-8 flex justify-center gap-4">
                <Button onClick={reset} size="lg" variant="outline" className="font-body">
                    <Repeat className="mr-2 h-4 w-4" /> Start Over
                </Button>
                <a href={generatedVideo!} download="e-prix-video.mp4">
                    <Button size="lg" className="font-body">
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
             <p className="mt-4 text-lg text-muted-foreground font-body">
               We couldn't access your camera. Please check your browser permissions and try again.
             </p>
             <Button onClick={reset} variant="outline" size="lg" className="mt-8 font-body">
               <Repeat className="mr-2 h-4 w-4" /> Try Again
             </Button>
           </div>
         )
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-transparent transition-colors duration-500">
       <Link href="/" className="absolute top-4 left-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
      {renderContent()}
    </main>
  );
}

    
