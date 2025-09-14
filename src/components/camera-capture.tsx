'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, VideoOff, AlertCircle } from 'lucide-react';
import type { FC } from 'react';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onCameraError: (error: string) => void;
}

const CameraCapture: FC<CameraCaptureProps> = ({ onCapture, onCameraError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mediaStream: MediaStream;
    let isMounted = true;

    const enableCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } });
        if (isMounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err) {
        if (isMounted) {
          let message = 'An unknown camera error occurred.';
          if (err instanceof DOMException) {
              if (err.name === 'NotAllowedError') {
                  message = 'Camera access was denied. Please allow camera access in your browser settings to continue.';
              } else if (err.name === 'NotFoundError') {
                  message = 'No camera was found on your device. Please connect a camera to continue.';
              } else if (err.name === 'NotReadableError') {
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
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onCameraError]);

  const handleCapture = () => {
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
        onCapture(dataUrl);
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
        {stream ? (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <VideoOff className="w-16 h-16" />
            <p className="mt-2">Requesting camera access...</p>
          </div>
        )}
      </div>
      <Button onClick={handleCapture} disabled={!stream} size="lg">
        <Camera className="mr-2 h-5 w-5" />
        Take Selfie
      </Button>
    </div>
  );
};

export default CameraCapture;
