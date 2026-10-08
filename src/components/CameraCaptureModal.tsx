import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (blob: Blob, dataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ isOpen, onClose, onCapture }) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setCameraError(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setIsInitializing(true);
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? t('Camera access denied. Please grant permission in your browser.')
          : t('Could not connect to camera device. Ensure no other application is using it.')
      );
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);

    // Stop live stream while reviewing snapshot
    stopCamera();
  };

  const retakeSnapshot = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmSnapshot = () => {
    if (!capturedImage) return;
    // Convert dataUrl to Blob
    fetch(capturedImage)
      .then((res) => res.blob())
      .then((blob) => {
        onCapture(blob, capturedImage);
        onClose();
      })
      .catch((err) => {
        console.error('Failed to convert snapshot to blob:', err);
      });
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/90 text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-base sm:text-lg">{t('Live Plant Scanner')}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[360px] sm:min-h-[440px] overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center max-w-md text-zinc-300">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <p className="font-medium text-white mb-2">{t('Camera Unavailable')}</p>
              <p className="text-sm text-zinc-400 mb-4">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition"
              >
                {t('Retry Camera Access')}
              </button>
            </div>
          ) : capturedImage ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured Leaf"
                className="max-h-[60vh] max-w-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> {t('Snapshot Captured')}
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Target Reticle Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                <div className="w-64 h-64 sm:w-72 sm:h-72 border-2 border-emerald-400/70 border-dashed rounded-3xl relative flex items-center justify-center">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
                  <span className="text-xs font-medium text-emerald-200 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full shadow">
                    {t('Align leaf within guide')}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-md">
                  {t('Keep camera steady with good natural lighting')}
                </p>
              </div>

              {/* Camera Switcher Button */}
              <button
                onClick={toggleCameraFacing}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition"
                title={t('Switch Camera (Front/Rear)')}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <button
                onClick={retakeSnapshot}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-medium text-sm transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> {t('Retake Photo')}
              </button>
              <button
                onClick={confirmSnapshot}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
              >
                <Check className="w-4 h-4" /> {t('Analyze This Leaf')}
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm font-medium transition"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={takeSnapshot}
                disabled={isInitializing || !!cameraError}
                className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-950 animate-ping" />
                {t('Capture Leaf Scan')}
              </button>
              <div className="w-16" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
