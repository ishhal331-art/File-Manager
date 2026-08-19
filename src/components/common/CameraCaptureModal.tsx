import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, SwitchCamera, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title?: string;
  categoryLabel?: string;
}

export const CameraCaptureModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Capture Document Photo',
  categoryLabel,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);

  // Check if multiple camera devices exist
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        if (videoDevices.length > 1) {
          setHasMultipleCameras(true);
        }
      }).catch(() => {});
    }
  }, []);

  const stopTracks = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start video stream when modal opens
  const startCamera = useCallback(async (mode: 'environment' | 'user' = facingMode) => {
    setIsInitializing(true);
    setCameraError(null);
    stopTracks();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser environment.');
      }

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        // Fallback with basic constraints
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. You can take a photo using your device camera below.'
          : 'Unable to connect to live camera. You can snap a picture using your device photo picker below.'
      );
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode, stopTracks]);

  useEffect(() => {
    if (isOpen) {
      setCapturedDataUrl(null);
      startCamera(facingMode);
    } else {
      stopTracks();
    }
    return () => {
      stopTracks();
    };
  }, [isOpen, facingMode]);

  // Take Snapshot
  const handleSnapPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Trigger visual flash
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedDataUrl(dataUrl);
      stopTracks();
    }
  };

  // Switch between front and back camera
  const handleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedDataUrl(null);
    startCamera(facingMode);
  };

  // Confirm photo and create File
  const handleConfirmPhoto = () => {
    if (!capturedDataUrl) return;

    // Convert dataURL to Blob and then File
    const arr = capturedDataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const prefix = categoryLabel ? categoryLabel.toLowerCase().replace(/\s+/g, '_') : 'photo_doc';
    const fileName = `${prefix}_${timestamp}.jpg`;
    const file = new File([blob], fileName, { type: 'image/jpeg', lastModified: Date.now() });

    onCapture(file);
    stopTracks();
    onClose();
  };

  // Fallback direct mobile capture input
  const handleMobileCaptured = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onCapture(file);
      stopTracks();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
      id="camera-capture-modal-overlay"
    >
      <div
        className="bg-[#161D2F] border border-[#263047] rounded-[32px] w-full max-w-xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh] relative"
        id="camera-capture-modal-container"
      >
        {/* FLASH EFFECT OVERLAY */}
        {flashEffect && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-200 opacity-90" />
        )}

        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-[#263047] flex items-center justify-between bg-[#0B0F18]/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#22D39F]/30">
              <Camera className="w-5 h-5 text-[#22D39F]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#F0F4FF] tracking-tight">{title}</h3>
              <p className="text-xs text-[#AEB8CC] font-medium">
                {categoryLabel ? `Target: ${categoryLabel}` : 'Capture a clear photo of invoice, bill, or receipt'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopTracks();
              onClose();
            }}
            className="w-9 h-9 rounded-2xl bg-[#0B0F18] hover:bg-[#161D2F] text-[#AEB8CC] hover:text-[#F0F4FF] border border-[#263047] flex items-center justify-center transition-all cursor-pointer shadow-inner"
            title="Close camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CAMERA VIEWPORT / SNAPSHOT AREA */}
        <div className="relative bg-black flex-1 min-h-[300px] sm:min-h-[380px] flex items-center justify-center overflow-hidden">
          {/* LIVE VIDEO */}
          {!capturedDataUrl && !cameraError && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover max-h-[55vh]"
            />
          )}

          {/* CAPTURED IMAGE PREVIEW */}
          {capturedDataUrl && (
            <img
              src={capturedDataUrl}
              alt="Captured document snapshot"
              className="w-full h-full object-contain max-h-[55vh] p-2"
            />
          )}

          {/* INITIALIZING SPINNER */}
          {isInitializing && !capturedDataUrl && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 z-10">
              <RefreshCw className="w-8 h-8 text-[#22D39F] animate-spin" />
              <p className="text-xs font-bold text-[#F0F4FF]">Initializing camera lens...</p>
            </div>
          )}

          {/* CAMERA ERROR / PERMISSION FALLBACK */}
          {cameraError && !capturedDataUrl && (
            <div className="p-6 text-center space-y-4 max-w-sm">
              <div className="w-12 h-12 rounded-3xl bg-amber-950/50 text-amber-400 border border-amber-800/60 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-[#F0F4FF]">Camera Access</p>
                <p className="text-xs text-[#AEB8CC]">{cameraError}</p>
              </div>
              <button
                type="button"
                onClick={() => mobileInputRef.current?.click()}
                className="w-full py-3 rounded-2xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4" />
                Click Picture via System Camera
              </button>
            </div>
          )}

          {/* DOCUMENT POSITIONING GUIDE FRAME (when live video is streaming) */}
          {!capturedDataUrl && !cameraError && !isInitializing && (
            <div className="absolute inset-4 sm:inset-6 border-2 border-dashed border-[#22D39F]/50 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="bg-[#0B0F18]/80 text-[#22D39F] text-[10px] font-black px-3 py-1 rounded-full border border-[#22D39F]/30 backdrop-blur-sm">
                Position Document Flat Inside Frame
              </span>
            </div>
          )}

          {/* CANVAS FOR RENDERING */}
          <canvas ref={canvasRef} className="hidden" />

          {/* HIDDEN MOBILE CAMERA INPUT */}
          <input
            ref={mobileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleMobileCaptured}
          />
        </div>

        {/* CONTROLS FOOTER */}
        <div className="p-4 sm:p-5 bg-[#0B0F18] border-t border-[#263047] flex items-center justify-between gap-3 shrink-0">
          {/* IF NOT YET CAPTURED */}
          {!capturedDataUrl && (
            <>
              {/* SYSTEM CAMERA / FILE PICKER FALLBACK */}
              <button
                type="button"
                onClick={() => mobileInputRef.current?.click()}
                className="px-3.5 py-2.5 rounded-2xl bg-[#161D2F] hover:bg-[#263047] text-[#AEB8CC] hover:text-[#F0F4FF] border border-[#263047] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-inner"
                title="Use phone camera app or gallery"
              >
                <ImageIcon className="w-4 h-4 text-[#22D39F]" />
                <span className="hidden sm:inline">Camera App / Gallery</span>
              </button>

              {/* SNAP BUTTON */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSnapPhoto}
                  disabled={isInitializing || !!cameraError}
                  className="w-14 h-14 rounded-full bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] flex items-center justify-center shadow-[0_0_20px_rgba(34,211,159,0.4)] transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Take picture"
                >
                  <div className="w-11 h-11 rounded-full border-2 border-[#0E1120] flex items-center justify-center">
                    <Camera className="w-6 h-6 text-[#0E1120]" />
                  </div>
                </button>
              </div>

              {/* FLIP CAMERA (IF AVAILABLE) */}
              <button
                type="button"
                onClick={handleFlipCamera}
                disabled={isInitializing || !!cameraError}
                className="px-3.5 py-2.5 rounded-2xl bg-[#161D2F] hover:bg-[#263047] text-[#AEB8CC] hover:text-[#F0F4FF] border border-[#263047] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-inner disabled:opacity-40"
                title="Flip between front and rear camera"
              >
                <SwitchCamera className="w-4 h-4 text-[#22D39F]" />
                <span className="hidden sm:inline">Flip</span>
              </button>
            </>
          )}

          {/* IF PHOTO CAPTURED: CONFIRM OR RETAKE */}
          {capturedDataUrl && (
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-2xl bg-[#161D2F] hover:bg-[#263047] text-[#AEB8CC] hover:text-[#F0F4FF] border border-[#263047] text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-inner"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="px-6 py-2.5 rounded-2xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,159,0.4)] transition-all cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                Use Photo & Ingest
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
