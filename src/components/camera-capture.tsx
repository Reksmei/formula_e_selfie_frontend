
'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, AlertCircle, Loader2 } from 'lucide-react';
import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onCameraError: (error: string) => void;
}

const CameraCapture: FC<CameraCaptureProps> = ({ onCapture, onCameraError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;

    const enableCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
        });

        if (isMounted && videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
        } else {
          // If component unmounted while we were getting permission, stop tracks
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        if (isMounted) {
          let message = 'An unknown camera error occurred.';
          if (err instanceof DOMException) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              message = 'Camera access was denied. Please allow camera access in your browser settings to continue.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
              message = 'No camera was found on your device. Please connect a camera to continue.';
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
              message = 'The camera is currently in use by another application.';
            }
          }
          setError(message);
          onCameraError(message);
        }
      }
    };

    enableCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onCameraError]);

  const startCountdown = () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          captureImage();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the image horizontally for a mirror effect
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        // Use a timeout to ensure the state update doesn't block the UI thread
        setTimeout(() => onCapture(dataUrl), 0);
      }
    }
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4 text-left">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Camera Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-lg aspect-video bg-muted rounded-lg overflow-hidden border shadow-lg">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn('w-full h-full object-cover transform scale-x-[-1]', !isCameraReady && 'hidden')}
        />
        {!isCameraReady && (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-16 h-16 animate-spin" />
            <p className="mt-4">Requesting camera access...</p>
          </div>
        )}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-white text-9xl font-bold">{countdown}</span>
          </div>
        )}
      </div>
      <Button onClick={startCountdown} disabled={!isCameraReady || countdown !== null} size="lg">
        <Camera className="mr-2 h-5 w-5" />
        {countdown !== null ? 'Taking...' : 'Take Selfie'}
      </Button>
    </div>
  );
};

export default CameraCapture;
