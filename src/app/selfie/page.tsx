
'use client';

import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { suggestFormulaEPromptsAction, generateFormulaEImageAction, editFormulaEImageAction, generateFormulaEVideoAction, checkVideoStatusAction } from '../actions';
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

type Step = 'capture' | 'preview' | 'generating' | 'result' | 'editing' | 'generating-video' | 'video-result' | 'error';
type VideoGenerationStatus = 'idle' | 'generating' | 'polling' | 'rate-limited' | 'not-found' | 'error' | 'success' | 'internal-server-error' | 'service-unavailable';

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
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [videoQrCode, setVideoQrCode] = useState<string | null>(null);
  const [videoGenStatus, setVideoGenStatus] = useState<VideoGenerationStatus>('idle');
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
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
      });
      setGeneratedImage(imageUrl);
      setImageQrCode(`data:image/png;base64,${qrCode}`);
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
      const imageToEdit = generatedImage;
      const { imageUrl, qrCode } = await editFormulaEImageAction({
        imageDataUri: imageToEdit,
        prompt: editPrompt,
      });
      setGeneratedImage(imageUrl);
      setImageQrCode(`data:image/png;base64,${qrCode}`);
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
  
  const pollVideoStatus = useCallback(async (operationName: string) => {
    try {
        const status = await checkVideoStatusAction(operationName);

        if (status.done === true) {
            if (status.error) {
                setVideoGenStatus('error');
                console.error("Video generation failed:", status.error);
                toast({
                    variant: 'destructive',
                    title: 'Video Generation Failed',
                    description: 'The AI could not generate a video. Please try again.',
                });
                setStep('result');
            } else if (status.videoUrl) {
                setGeneratedVideo(status.videoUrl);
                setVideoQrCode(`data:image/png;base64,${status.qrCode}`);
                setVideoGenStatus('success');
                setStep('video-result');
            }
        } else {
            if (status.error === 'rate-limited') {
                setVideoGenStatus('rate-limited');
            } else if (status.error === 'not-found') {
                setVideoGenStatus('not-found');
            } else if (status.error === 'internal-server-error') {
                setVideoGenStatus('internal-server-error');
            } else if (status.error === 'service-unavailable') {
                setVideoGenStatus('service-unavailable');
            }
            else {
                setVideoGenStatus('polling');
            }
            setTimeout(() => pollVideoStatus(operationName), 5000); // Poll every 5 seconds
        }
    } catch (error) {
        setVideoGenStatus('error');
        console.error("Error polling video status:", error);
        toast({
            variant: 'destructive',
            title: 'Video Status Check Failed',
            description: 'Could not check the status of the video generation. Please try again.',
        });
        setStep('result');
    }
  }, [toast]);

  const handleGenerateVideo = useCallback(async () => {
    if (!generatedImage) return;

    setStep('generating-video');
    setVideoGenStatus('generating');

    try {
        const { operationName } = await generateFormulaEVideoAction({
            imageDataUri: generatedImage
        });
        pollVideoStatus(operationName);
    } catch (error: any) {
        console.error("Failed to start video generation:", error);
        let description = 'Could not start the video generation process. Please try again.';
        if (typeof error.message === 'string' && error.message.includes('Quota exceeded')) {
            description = 'The video generation service is currently busy due to high demand. Please try again in a minute.';
        }
        toast({
            variant: 'destructive',
            title: 'Video Generation Failed',
            description,
        });
        setVideoGenStatus('error');
        setStep('result');
    }
  }, [generatedImage, pollVideoStatus, toast]);

  const reset = () => {
    setSelfie(null);
    setSelectedPromptId(null);
    setGeneratedImage(null);
    setImageQrCode(null);
    setGeneratedVideo(null);
    setVideoQrCode(null);
    setVideoGenStatus('idle');
    setStep('capture');
  };

  const retake = () => {
    setSelfie(null);
    setSelectedPromptId(null);
    setGeneratedImage(null);
    setImageQrCode(null);
    setGeneratedVideo(null);
    setVideoQrCode(null);
    setVideoGenStatus('idle');
    setStep('capture');
  }

  const chooseNewPrompt = () => {
    setGeneratedImage(null);
    setImageQrCode(null);
    setGeneratedVideo(null);
    setVideoQrCode(null);
    setSelectedPromptId(null);
    setVideoGenStatus('idle');
    setStep('preview');
  }

  const renderContent = () => {
    switch (step) {
      case 'capture':
        return (
          <div className="w-full max-w-lg text-center">
            <div className="bg-card rounded-xl p-6 md:p-8 mt-20">
              <p className="text-lg text-card-foreground font-body">
                Take a selfie, pick a prompt, and let our AI place you in the heart of Formula E action.
              </p>
            </div>
            <div className="mt-8">
              <Suspense fallback={<div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
                <CameraCapture onCapture={handleCapture} onCameraError={handleCameraError} />
              </Suspense>
            </div>
          </div>
        );
      case 'preview':
        const displayedPrompts = showAllPrompts ? prompts : prompts.slice(0, 4);
        return (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><User /> Your Selfie</CardTitle>
                <CardDescription className="font-body">This is the picture we'll use for the AI generation.</CardDescription>
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
                You can now edit your image with a prompt, generate a video, or try a different prompt.
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
                      <Button onClick={() => handleGenerateVideo()} size="lg" className="font-body w-full" disabled={videoGenStatus === 'generating' || videoGenStatus === 'polling'}>
                        <Film className="mr-2 h-4 w-4" /> Generate Video
                      </Button>
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
                      <Button onClick={handleEdit} disabled={!editPrompt || isEditing} className="font-body">
                        {isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        <span className="ml-2">Apply</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
            </div>
          </div>
        );
    case 'generating-video':
        let statusMessage = "Generating your video...";
        if (videoGenStatus === 'polling') {
            statusMessage = "Processing your video, checking for updates...";
        } else if (videoGenStatus === 'rate-limited') {
            statusMessage = "The service is busy. Still trying...";
        } else if (videoGenStatus === 'not-found') {
            statusMessage = "Starting video generation job...";
        } else if (videoGenStatus === 'internal-server-error' || videoGenStatus === 'service-unavailable') {
            statusMessage = "There was a temporary issue. Retrying...";
        }
        return (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                 <div className="mb-4">
                    {generatedImage && <img src={generatedImage} alt="Generating video from this image" width={300} height={168} className="rounded-lg object-cover aspect-video" />}
                </div>
                <div className="bg-card rounded-xl p-6 md:p-8 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold font-headline text-card-foreground">{statusMessage}</h2>
                    <p className="text-muted-foreground font-body mt-2">This can take a minute or two. Please be patient.</p>
                </div>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
                {videoQrCode && (
                  <Dialog>
                    <DialogTrigger asChild>
                       <Button size="lg" variant="outline" className="font-body">
                          <img src="/qr-code.svg" className="mr-2 h-4 w-4" alt="qr code icon"/> QR Code
                       </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Scan to Download Video</DialogTitle>
                        <DialogDescription>
                          Scan this QR code with your phone to download the generated video.
                        </DialogDescription>
                      </DialogHeader>
                        <div className="flex items-center justify-center p-4 bg-white rounded-lg">
                           <img src={videoQrCode} alt="Download QR Code" />
                        </div>
                    </DialogContent>
                  </Dialog>
                )}
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
    <main className={cn(
      "flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-transparent transition-colors duration-500",
      "bg-selfie"
      )}>
       <Link href="/" passHref>
        <Button variant="outline" className="absolute top-4 left-4 flex items-center gap-2 bg-background/50 backdrop-blur-sm font-body">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </Link>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="absolute top-4 right-4 flex items-center gap-2 bg-background/50 backdrop-blur-sm font-body">
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
                  Formula E AI Selfie is an AI demo that leverages Generative media on Google Cloud to reimagine your selfie into a realistic, immersive Formula E scenario.
                  <br /><br />
                  Frontend Web application is hosted with Firebase, where you take a selfie and select your prompt. After you select your prompt, the Cloud Run backend sends the the selfie and a text prompt to Gemini 2.5 Flash Image via the Vertex AI API. After receiving a response from Vertex AI, the backend uploads the image to Cloud Storage and shares the URL with the frontend.
                  <br /><br />
                  Gemini 2.5 Flash Image's image editing capabilities also allow us to make changes to our generated image with natural language prompts, such as "put my into the car". After sending your change prompt, the backend sends another request to Gemini 2.5 Flash Image with the generated image and editing prompt, before sending the Cloud Storage URL to the frontend with the updated image.
                  <br /><br />
                  Lastly, Veo 3.1's text and image-to-video functionality allows us to animate our video, as after we are happy with our image, the Cloud Run service sends the image and a simple text prompt to Veo 3.1 via the Vertex API, and uploads the output to Cloud Storage.
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

    

    


