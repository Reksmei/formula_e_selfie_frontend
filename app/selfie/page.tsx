
'use client';

import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateFormulaEImageAction, editFormulaEImageAction } from '../actions';
import { Loader2, Sparkles, User, Repeat, RotateCcw, Pencil, Film, Download, Eye, ChevronDown, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


const CameraCapture = lazy(() => import('@/components/camera-capture'));

type Step = 'capture' | 'preview' | 'generating' | 'result' | 'editing' | 'error';


const editSuggestions = [
  "make the lighting more dramatic",
  "change the background to a futuristic city",
  "give it a vintage film look",
  "add celebratory confetti",
  "make me look like an anime character",
  "put me in the cockpit of the car",
  "make the image brighter",
];

export default function SelfiePage() {
  const [step, setStep] = useState<Step>('capture');
  const [selfie, setSelfie] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<ImagePlaceholder[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageQrCode, setImageQrCode] = useState<string | null>(null);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [showAllPrompts, setShowAllPrompts] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setPrompts(PlaceHolderImages);
    setIsLoadingPrompts(false);
  }, []);

  useEffect(() => {
    const suggestionInterval = setInterval(() => {
      setCurrentSuggestionIndex((prevIndex) => (prevIndex + 1) % editSuggestions.length);
    }, 2500);

    return () => clearInterval(suggestionInterval);
  }, []);

  const handleCapture = (imageDataUrl: string) => {
    setSelfie(imageDataUrl);
    setStep('preview');
  };

  const handleCameraError = useCallback((error: string) => {
    setStep('error');
    toast({
      variant: 'destructive',
      title: 'Camera Error',
      description: error,
    });
  }, [toast]);

  const handleGenerate = async () => {
    if (!selfie || !selectedPromptId) return;

    const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
    if (!selectedPrompt) {
        toast({
            variant: 'destructive',
            title: 'Prompt not found',
            description: 'Could not find the selected prompt details.',
        });
        return;
    }

    setStep('generating');
    try {
      const { imageUrl, qrCode } = await generateFormulaEImageAction({
        selfieDataUri: selfie,
        prompt: selectedPrompt.description,
        referenceImageId: selectedPrompt.referenceImageId
      });
      setGeneratedImage(imageUrl);
      setImageQrCode(`data:image/png;base64,${qrCode}`);
      setStep('result');
    } catch (error) {
      setStep('preview');
      toast({
        variant: 'destructive',
        title: 'Image Generation Failed',
        description: 'Sorry, we were unable to generate your image. Please try again.',
      });
    }
  };

  const handleEdit = async () => {
    if (!generatedImage || !editPrompt) return;
    setIsEditing(true);
    try {
      const imageToEdit = generatedImage;
      const { imageUrl, qrCode } = await editFormulaEImageAction({
        imageDataUri: imageToEdit,
        prompt: editPrompt,
        referenceImageId: prompts.find(p => p.id === selectedPromptId)?.referenceImageId
      });
      setGeneratedImage(imageUrl);
      setImageQrCode(`data:image/png;base64,${qrCode}`);
      setEditPrompt('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Image Editing Failed',
        description: 'Sorry, we were unable to edit your image. Please try again.',
      });
    } finally {
      setIsEditing(false);
    }
  };

  const reset = () => {
    setSelfie(null);
    setSelectedPromptId(null);
    setGeneratedImage(null);
    setImageQrCode(null);
    setStep('capture');
  };

  const retake = () => {
    setSelfie(null);
    setSelectedPromptId(null);
    setGeneratedImage(null);
    setImageQrCode(null);
    setStep('capture');
  }

  const chooseNewPrompt = () => {
    setGeneratedImage(null);
    setImageQrCode(null);
    setSelectedPromptId(null);
    setStep('preview');
  }

  const renderContent = () => {
    switch (step) {
      case 'capture':
        return (
          <>
            <div className="w-full max-w-xl text-center">
              <div className="bg-card rounded-xl p-8 md:p-10 mt-20">
                <p className="text-2xl md:text-3xl text-card-foreground font-body">
                  Take a selfie, pick a prompt, and let Nano Banana place you in the heart of Formula E action.<br/><br/>*Please note you make need to step back to ensure the camera fully sees you.
                </p>
              </div>
            </div>
            <div className="mt-8">
              <Suspense fallback={<div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
                <CameraCapture onCapture={handleCapture} onCameraError={handleCameraError} />
              </Suspense>
            </div>
          </>
        );
      case 'preview':
        const displayedPrompts = showAllPrompts ? prompts : prompts.slice(0, 4);
        return (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><User /> Your Selfie</CardTitle>
                <CardDescription className="font-body">This is the picture we'll use for editing you into your chosen Formula E scene.</CardDescription>
              </CardHeader>
              <CardContent>
                {selfie && (
                  <img
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
                  <>
                  <div className="grid grid-cols-2 gap-4">
                    {displayedPrompts.map((imageInfo) => (
                        <div
                          key={imageInfo.id}
                          className={cn(
                            "relative rounded-lg overflow-hidden cursor-pointer border-4 group",
                            selectedPromptId === imageInfo.id ? 'border-accent' : 'border-transparent'
                          )}
                          onClick={() => setSelectedPromptId(imageInfo.id)}
                        >
                          <img
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
                              <AlertDialogHeader className="max-h-[80vh] overflow-y-auto">
                                <AlertDialogTitle>Image Prompt</AlertDialogTitle>
                                <AlertDialogDescription className="break-words text-left">
                                  {imageInfo.description}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Close</AlertDialogCancel>
                                <AlertDialogAction onClick={() => setSelectedPromptId(imageInfo.id)}>Select</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )
                    )}
                  </div>
                  {!showAllPrompts && prompts.length > 4 && (
                      <Button 
                        onClick={() => setShowAllPrompts(true)} 
                        variant="outline" 
                        className="w-full mt-4"
                      >
                        <ChevronDown className="mr-2 h-4 w-4" /> See More
                      </Button>
                    )}
                  </>
                )}
                <Button onClick={handleGenerate} disabled={!selectedPromptId} className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90 font-body">
                  Generate Image
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      case 'generating':
        return (
            <div className="flex flex-col items-center justify-center gap-8 text-center">
                <div className="bg-card rounded-xl p-6 md:p-8 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold font-headline text-card-foreground">Generating your E-Prix moment...</h2>
                    <p className="text-muted-foreground font-body mt-4">The AI is working its magic. This might take a moment.</p>
                </div>
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
      case 'result':
        return (
          <div className="w-full max-w-5xl text-center">
            <div className="bg-card rounded-xl p-6 md:p-8 max-w-2xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tight text-card-foreground font-headline">Your Image is Ready!</h1>
              <p className="mt-4 text-lg text-muted-foreground font-body">
                You can now edit your image with a prompt, download it, or try a different prompt.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Original Selfie</CardTitle>
                </CardHeader>
                <CardContent>
                  {selfie && <img src={selfie} alt="Original selfie" width={500} height={300} className="rounded-lg object-cover aspect-video" />}
                  <div className="flex flex-col gap-2 mt-4">
                    <Button onClick={chooseNewPrompt} size="lg" variant="outline" className="font-body w-full">
                        <Sparkles className="mr-2 h-4 w-4" /> Try Another Style
                    </Button>
                    <Button onClick={reset} size="lg" variant="outline" className="font-body w-full">
                      <Repeat className="mr-2 h-4 w-4" /> Start Over
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Generated Image</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedImage && <img src={generatedImage} alt="Generated Formula E image" width={500} height={300} className="rounded-lg object-cover aspect-video" />}
                  {imageQrCode && (
                    <div className="flex flex-col gap-2 mt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="font-body w-full">
                            <img src="/qr-code.svg" className="mr-2 h-4 w-4" alt="qr code icon"/> Download Image
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Scan to Download Image</DialogTitle>
                            <DialogDescription>
                              Scan this QR code with your phone to download the generated image.
                            </DialogDescription>
                          </DialogHeader>
                            <div className="flex items-center justify-center p-4 bg-white rounded-lg">
                              <img src={imageQrCode} alt="Download QR Code" />
                            </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="mt-8 grid grid-cols-1">
              <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Pencil /> Edit Your Image</CardTitle>
                    <CardDescription className="font-body">Describe the changes you'd like to make.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder={`e.g. '${editSuggestions[currentSuggestionIndex]}'`}
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        disabled={isEditing}
                        className="font-body"
                      />
                      <Button onClick={handleEdit} disabled={!editPrompt || isEditing} variant="default" className="font-body">
                        {isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        <span className="ml-2">Apply</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
    <main className={cn(
      "flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-transparent transition-colors duration-500",
      "bg-selfie"
      )}>
       <Link href="/" passHref>
        <Button variant="outline" className="absolute top-4 left-4 flex items-center gap-2 bg-background/50 backdrop-blur-sm font-body px-4 py-5 text-base md:text-lg">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </Link>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="absolute top-4 right-4 flex items-center gap-2 bg-background/50 backdrop-blur-sm font-body px-4 py-5 text-base md:text-lg">
            <Info className="w-4 h-4" />
            How it Works
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="md:w-1/2">
              <DialogHeader>
                <DialogTitle>How it Works</DialogTitle>
                <DialogDescription>
                  Formula E AI Selfie is an AI demo that leverages Generative Media on Google Cloud to reimagine your selfie into a realistic, immersive Formula E scenario.
                  <br /><br />
                  The frontend web application is hosted with Firebase, where you take a selfie and select your prompt. After you select your prompt, the Cloud Run backend sends the the selfie and a text prompt to Gemini 2.5 Flash Image via the Vertex AI API. After receiving a response from Vertex AI, the backend uploads the image to Cloud Storage and shares the URL with the frontend.
                  <br /><br />
                  Nano Banana's (Gemini 2.5 Flash Image) image editing capabilities also allow us to make changes to our generated image with natural language prompts, such as "put my into the car". After sending your change prompt, the backend sends another request to Gemini 2.5 Flash Image with the generated image and editing prompt, before sending the Cloud Storage URL to the frontend with the updated image.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="md:w-1/2 mt-4 md:mt-0">
              <img 
                src="https://storage.googleapis.com/selfie-sample-images/formula_e_selfie_demo_architecture.svg" 
                alt="Architecture Diagram" 
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {renderContent()}
    </main>
  );
}
