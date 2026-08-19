import React, { useRef, useState } from 'react';
import { Upload, Sparkles, FileText, CheckCircle2, RefreshCw, Layers, Camera, Image as ImageIcon } from 'lucide-react';
import { FileType, UploadedFile } from '../../types';
import { api } from '../../lib/api';
import { CameraCaptureModal } from '../common/CameraCaptureModal';

interface Props {
  onUploadSuccess: (file: UploadedFile) => void;
  onInspectFile: (file: UploadedFile) => void;
}

export const CentralUploadZone: React.FC<Props> = ({ onUploadSuccess, onInspectFile }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mobileCameraRef = useRef<HTMLInputElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FileType>('SALES');
  const [dragActive, setDragActive] = useState(false);
  const [uploadStep, setUploadStep] = useState<'IDLE' | 'UPLOADING' | 'PROCESSING' | 'AI_READING' | 'COMPLETED'>('IDLE');
  const [lastUploaded, setLastUploaded] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const processFile = async (file: File) => {
    setError(null);
    setUploadStep('UPLOADING');

    try {
      const isText = file.type.includes('text') || file.name.endsWith('.csv') || file.name.endsWith('.txt');
      let base64Data: string | undefined = undefined;
      let textContent: string | undefined = undefined;

      if (isText) {
        textContent = await file.text();
      }

      base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      // Advance visual state
      setTimeout(() => setUploadStep('PROCESSING'), 400);
      setTimeout(() => setUploadStep('AI_READING'), 900);

      const resData = await api.uploadFile({
        fileType: selectedCategory,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        base64Data,
        textContent,
      });

      setLastUploaded(resData.file);
      onUploadSuccess(resData.file);
      setUploadStep('COMPLETED');

      setTimeout(() => {
        setUploadStep('IDLE');
      }, 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
      setUploadStep('IDLE');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (mobileCameraRef.current) {
        mobileCameraRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const getCategoryLabel = () => {
    switch (selectedCategory) {
      case 'SALES':
        return 'Sales Invoice';
      case 'PURCHASE':
        return 'Purchase Receipt';
      case 'BANK_STATEMENT':
        return 'Bank Statement';
      default:
        return 'Additional Document';
    }
  };

  return (
    <div
      className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] space-y-4"
      id="central-upload-zone"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#263047]">
        <div>
          <h3 className="text-base font-black text-[#F0F4FF] tracking-tight">
            Central Ingestion Center
          </h3>
          <p className="text-xs text-[#AEB8CC] font-medium">
            Select target dossier, then choose a file or take a live photo of your document.
          </p>
        </div>

        {/* CATEGORY SELECTOR PILLS */}
        <div className="flex items-center flex-wrap gap-1 p-1 bg-[#0B0F18] rounded-2xl border border-[#263047] shrink-0 self-start sm:self-auto shadow-inner">
          {(['SALES', 'PURCHASE', 'BANK_STATEMENT', 'ADDITIONAL'] as const).map((cat) => {
            const label =
              cat === 'SALES'
                ? 'Sales File'
                : cat === 'PURCHASE'
                ? 'Purchase File'
                : cat === 'BANK_STATEMENT'
                ? 'Bank Statement'
                : 'Additional (Opt)';
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#22D39F] text-[#0E1120] shadow-md scale-102'
                    : 'text-[#AEB8CC] hover:text-[#F0F4FF]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* HIDDEN FILE AND CAMERA INPUTS */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="*/*"
        id="input-central-upload"
      />
      <input
        ref={mobileCameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        id="input-central-camera-direct"
      />

      {/* DUAL ACTION QUICK SELECTOR BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadStep !== 'IDLE'}
          className="p-3.5 rounded-2xl bg-[#0B0F18] hover:bg-[#102D30] border border-[#263047] hover:border-[#22D39F] text-[#F0F4FF] flex items-center justify-center gap-3 transition-all cursor-pointer shadow-inner group disabled:opacity-50"
        >
          <div className="w-8 h-8 rounded-xl bg-[#161D2F] text-[#22D39F] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-xs font-black block">Choose File from Device</span>
            <span className="text-[10px] text-[#AEB8CC]">PDF, Excel, Word, CSV, Images</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsCameraOpen(true)}
          disabled={uploadStep !== 'IDLE'}
          className="p-3.5 rounded-2xl bg-[#102D30]/80 hover:bg-[#102D30] border border-[#22D39F]/40 hover:border-[#22D39F] text-[#F0F4FF] flex items-center justify-center gap-3 transition-all cursor-pointer shadow-inner group disabled:opacity-50"
        >
          <div className="w-8 h-8 rounded-xl bg-[#22D39F] text-[#0E1120] flex items-center justify-center group-hover:scale-110 transition-transform font-black">
            <Camera className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-xs font-black text-[#22D39F] block">Take / Click Photo</span>
            <span className="text-[10px] text-[#AEB8CC]">Snap physical receipt or bill via camera</span>
          </div>
        </button>
      </div>

      {/* DROP AREA */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition-all flex flex-col items-center justify-center space-y-3 ${
          dragActive
            ? 'border-[#22D39F] bg-[#102D30]/60 ring-4 ring-[#22D39F]/20 scale-[1.01]'
            : uploadStep !== 'IDLE'
            ? 'border-[#22D39F] bg-[#0B0F18]'
            : 'border-[#263047] bg-[#0B0F18]/60 hover:bg-[#0B0F18] hover:border-[#22D39F]'
        }`}
      >
        {uploadStep === 'IDLE' && (
          <>
            <div className="flex items-center gap-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-2xl bg-[#161D2F] hover:bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#263047] hover:border-[#22D39F] cursor-pointer hover:scale-105 transition-transform"
                title="Browse Files"
              >
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[#7F8BA3]">OR</span>
              <div
                onClick={() => setIsCameraOpen(true)}
                className="w-12 h-12 rounded-2xl bg-[#102D30] hover:bg-[#22D39F] text-[#22D39F] hover:text-[#0E1120] flex items-center justify-center shadow-inner border border-[#22D39F]/40 cursor-pointer hover:scale-105 transition-all"
                title="Take Document Photo"
              >
                <Camera className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm sm:text-base font-black text-[#F0F4FF]">
                Drop documents here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#22D39F] underline underline-offset-2 hover:text-[#19C99A] cursor-pointer font-black inline"
                >
                  Choose File
                </button>
                {' / '}
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="text-[#22D39F] underline underline-offset-2 hover:text-[#19C99A] cursor-pointer font-black inline"
                >
                  Click Picture
                </button>
              </p>
              <p className="text-xs text-[#AEB8CC] font-medium">
                Target Dossier: <strong className="text-[#22D39F]">{getCategoryLabel()}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              {['Excel', 'Word', 'PDF', 'JPG', 'PNG', 'Camera Photo'].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#102D30] text-[#22D39F] border border-[#22D39F]/20"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </>
        )}

        {uploadStep !== 'IDLE' && (
          <div className="space-y-4 w-full max-w-md mx-auto py-2">
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 text-[#22D39F] animate-spin" />
              <span className="text-sm font-black text-[#F0F4FF]">
                {uploadStep === 'UPLOADING' && '1/4 Uploading binary content...'}
                {uploadStep === 'PROCESSING' && '2/4 Ingesting into secure vault...'}
                {uploadStep === 'AI_READING' && '3/4 AI OCR reading & structuring tables...'}
                {uploadStep === 'COMPLETED' && '4/4 Ingestion complete & verified!'}
              </span>
            </div>

            {/* STEP PROGRESS BARS */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="h-1.5 rounded-full bg-[#22D39F]" />
              <div
                className={`h-1.5 rounded-full ${
                  uploadStep === 'PROCESSING' || uploadStep === 'AI_READING' || uploadStep === 'COMPLETED'
                    ? 'bg-[#22D39F]'
                    : 'bg-[#263047]'
                }`}
              />
              <div
                className={`h-1.5 rounded-full ${
                  uploadStep === 'AI_READING' || uploadStep === 'COMPLETED' ? 'bg-[#22D39F]' : 'bg-[#263047]'
                }`}
              />
              <div className={`h-1.5 rounded-full ${uploadStep === 'COMPLETED' ? 'bg-[#22D39F]' : 'bg-[#263047]'}`} />
            </div>

            {uploadStep === 'COMPLETED' && lastUploaded && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspectFile(lastUploaded);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black shadow-md transition-all cursor-pointer"
                >
                  Inspect Extracted Records Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-bold">
          {error}
        </div>
      )}

      {/* LIVE CAMERA CAPTURE MODAL */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => processFile(file)}
        title={`Take Photo for ${getCategoryLabel()}`}
        categoryLabel={getCategoryLabel()}
      />
    </div>
  );
};

