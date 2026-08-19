import React, { useRef, useState } from 'react';
import { Upload, Sparkles, FileText, CheckCircle2, RefreshCw, Layers } from 'lucide-react';
import { FileType, UploadedFile } from '../../types';
import { api } from '../../lib/api';

interface Props {
  onUploadSuccess: (file: UploadedFile) => void;
  onInspectFile: (file: UploadedFile) => void;
}

export const CentralUploadZone: React.FC<Props> = ({ onUploadSuccess, onInspectFile }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FileType>('SALES');
  const [dragActive, setDragActive] = useState(false);
  const [uploadStep, setUploadStep] = useState<'IDLE' | 'UPLOADING' | 'PROCESSING' | 'AI_READING' | 'COMPLETED'>('IDLE');
  const [lastUploaded, setLastUploaded] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

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
            Select target dossier and drop financial records for automatic parsing.
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

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="*/*"
        id="input-central-upload"
      />

      {/* DROP AREA */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (uploadStep === 'IDLE' && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
        className={`rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
          dragActive
            ? 'border-[#22D39F] bg-[#102D30]/60 ring-4 ring-[#22D39F]/20 scale-[1.01]'
            : uploadStep !== 'IDLE'
            ? 'border-[#22D39F] bg-[#0B0F18]'
            : 'border-[#263047] bg-[#0B0F18]/60 hover:bg-[#0B0F18] hover:border-[#22D39F]'
        }`}
      >
        {uploadStep === 'IDLE' && (
          <>
            <div className="w-14 h-14 rounded-3xl bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#22D39F]/30 group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-sm sm:text-base font-black text-[#F0F4FF]">
                Drop your documents here, or <span className="text-[#22D39F] underline underline-offset-2">Browse Files</span>
              </p>
              <p className="text-xs text-[#AEB8CC] font-medium">
                Target Dossier: <strong className="text-[#22D39F]">{selectedCategory === 'SALES' ? 'Sales Dossier' : selectedCategory === 'PURCHASE' ? 'Purchase Dossier' : selectedCategory === 'BANK_STATEMENT' ? 'Bank Statement' : 'Additional Documents (Optional)'}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              {['Excel', 'Word', 'PDF', 'JPG', 'PNG'].map((fmt) => (
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
    </div>
  );
};
