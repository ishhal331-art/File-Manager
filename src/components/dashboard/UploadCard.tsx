import React, { useRef, useState } from 'react';
import { FileType, UploadedFile } from '../../types';
import { api } from '../../lib/api';
import { Upload, CheckCircle2, FileSpreadsheet, Eye, Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  fileType: FileType;
  title: string;
  description: string;
  badgeNumber: string;
  currentFile?: UploadedFile;
  onUploadSuccess: (file: UploadedFile) => void;
  onViewFile: (file: UploadedFile) => void;
  onDeleteFile?: (fileId: string) => void;
}

export const UploadCard: React.FC<Props> = ({
  fileType,
  title,
  description,
  badgeNumber,
  currentFile,
  onUploadSuccess,
  onViewFile,
  onDeleteFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Q3 2026');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file: File) => {
    setUploading(true);
    try {
      const isText = file.type.includes('text') || file.name.endsWith('.csv') || file.name.endsWith('.txt');
      let base64Data: string | undefined = undefined;
      let textContent: string | undefined = undefined;

      if (isText) {
        textContent = await file.text();
      }

      // Convert file to base64
      base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      const resData = await api.uploadFile({
        fileType,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        base64Data,
        textContent,
        period: selectedPeriod,
      });

      onUploadSuccess(resData.file);
    } catch (err: any) {
      alert(`Upload error: ${err.message || 'Error uploading file'}`);
    } finally {
      setUploading(false);
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
      await processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`bg-[#FCFBF8] rounded-[32px] p-6 shadow-[0_18px_40px_rgba(110,85,190,0.09)] border border-[#F0ECE1] flex flex-col justify-between relative transition-all duration-300 hover:shadow-[0_22px_45px_rgba(110,85,190,0.15)] ${
        dragActive ? 'border-[#8364ED] ring-4 ring-[#8364ED]/20 bg-[#F6F3FE]' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      id={`upload-card-${fileType.toLowerCase()}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="*/*"
        id={`input-file-${fileType.toLowerCase()}`}
      />

      {/* HEADER SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="w-8 h-8 rounded-2xl bg-[#F0EBFA] text-[#8364ED] font-extrabold text-xs flex items-center justify-center shadow-inner">
            {badgeNumber}
          </span>
          {currentFile ? (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Uploaded
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-slate-500 bg-[#F2ECE0] px-3 py-1 rounded-full">
              Action Required
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-800 tracking-tight" id={`title-${fileType.toLowerCase()}`}>
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {description}
        </p>

        {/* PERIOD SELECTOR */}
        <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[#F0ECE1]">
          <span className="text-[11px] font-bold text-slate-500">Filing Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-[11px] font-extrabold text-[#8364ED] bg-[#F0EBFA] border border-[#E2D8F7] px-2.5 py-1 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="Q3 2026">Q3 2026 (Current)</option>
            <option value="Q4 2026">Q4 2026</option>
            <option value="Q1 2026">Q1 2026</option>
            <option value="Q2 2026">Q2 2026</option>
            <option value="August 2026">August 2026</option>
            <option value="September 2026">September 2026</option>
            <option value="October 2026">October 2026</option>
          </select>
        </div>

        {/* AI CAPABILITY TAG */}
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-[#8364ED] bg-[#F3E3FD]/60 px-2.5 py-1 rounded-xl w-max border border-[#E9D9FA]">
          <Sparkles className="w-3 h-3" />
          <span>Supports Excel, Word, PDF, JPG/PNG (AI OCR)</span>
        </div>
      </div>

      {/* FILE STATUS / DISPLAY OR UPLOAD AREA */}
      <div className="mt-4">
        {uploading ? (
          <div className="p-5 rounded-2xl bg-[#F5F1FD] border border-[#E8DEF8] flex flex-col items-center text-center gap-2 animate-pulse">
            <RefreshCw className="w-6 h-6 text-[#8364ED] animate-spin" />
            <p className="text-xs font-bold text-slate-800">Processing File Ingestion...</p>
            <p className="text-[11px] text-slate-500">Executing AI OCR document extraction</p>
          </div>
        ) : currentFile ? (
          <div className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#EAE5D7] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-white border border-[#E2DDD0] text-[#8364ED] shadow-xs shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-slate-800 truncate" title={currentFile.originalName}>
                      {currentFile.originalName}
                    </p>
                    <span className="text-[9px] font-black text-[#8364ED] bg-white px-1.5 py-0.5 rounded border border-[#E2D8F7]">
                      {currentFile.period || 'Q3 2026'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {(currentFile.size / 1024).toFixed(1)} KB • {new Date(currentFile.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onViewFile(currentFile)}
                className="w-full py-2 px-2.5 rounded-xl bg-white hover:bg-[#F3EFE6] text-slate-700 border border-[#E0DBCF] text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                id={`btn-view-${fileType.toLowerCase()}`}
              >
                <Eye className="w-3.5 h-3.5 text-[#8364ED]" />
                <span>Inspect</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                className="w-full py-2 px-2.5 rounded-xl bg-[#8364ED] hover:bg-[#7150EA] text-white border border-[#7150EA] text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                id={`btn-upload-more-${fileType.toLowerCase()}`}
                title="Upload another file for this category"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>+ Upload New</span>
              </button>
            </div>
          </div>
        ) : (
          /* UPLOAD PROMPT BUTTON */
          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) fileInputRef.current.click();
            }}
            className="w-full py-5 px-4 rounded-2xl bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white font-bold text-xs tracking-wide shadow-[0_10px_22px_rgba(131,100,237,0.32)] hover:shadow-[0_14px_28px_rgba(131,100,237,0.42)] active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer"
            id={`btn-upload-${fileType.toLowerCase()}`}
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <span>Click or Drag & Drop File</span>
            <span className="text-[10px] font-medium text-white/80">Any file format supported</span>
          </button>
        )}
      </div>
    </div>
  );
};
