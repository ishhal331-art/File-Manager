import React, { useRef, useState, useEffect } from 'react';
import { FileType, UploadedFile } from '../../types';
import { api } from '../../lib/api';
import { Upload, CheckCircle2, FileSpreadsheet, Eye, Sparkles, RefreshCw, Download, Trash2, Layers } from 'lucide-react';

interface Props {
  fileType?: FileType | string;
  type?: string;
  title: string;
  description: string;
  badgeNumber?: string;
  badgeColor?: string;
  required?: boolean;
  categoryFiles?: UploadedFile[];
  files?: UploadedFile[];
  onUploadSuccess: (file: UploadedFile) => void;
  onViewFile?: (file: UploadedFile) => void;
  onInspectFile?: (file: UploadedFile) => void;
  onDeleteFile: (fileId: string) => void;
}

export const UploadCard: React.FC<Props> = ({
  fileType,
  type,
  title,
  description,
  badgeNumber,
  badgeColor,
  required,
  categoryFiles,
  files,
  onUploadSuccess,
  onViewFile,
  onInspectFile,
  onDeleteFile,
}) => {
  const effectiveCategoryFiles = categoryFiles || files || [];
  const effectiveType = (fileType || type || 'SALES_INVOICE') as FileType;
  const inspectHandler = onInspectFile || onViewFile || (() => {});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string>('ALL');

  useEffect(() => {
    if (effectiveCategoryFiles.length > 0 && selectedFileId !== 'ALL') {
      const exists = effectiveCategoryFiles.some((f) => f.id === selectedFileId);
      if (!exists) {
        setSelectedFileId(effectiveCategoryFiles[0].id);
      }
    }
  }, [effectiveCategoryFiles, selectedFileId]);

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

      base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      const resData = await api.uploadFile({
        fileType: effectiveType,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        base64Data,
        textContent,
      });

      onUploadSuccess(resData.file);
      setSelectedFileId(resData.file.id);
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

  const handleDownloadSingle = (file: UploadedFile) => {
    if (!file.fileUrl) return;
    const a = document.createElement('a');
    a.href = file.fileUrl;
    a.download = `${file.fileType || file.type}_${file.originalName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    effectiveCategoryFiles.forEach((file) => handleDownloadSingle(file));
  };

  const activeSelectedFile = effectiveCategoryFiles.find((f) => f.id === selectedFileId);

  return (
    <div 
      className={`bg-[#161D2F]/90 backdrop-blur-xl rounded-[28px] p-5 sm:p-6 shadow-[0_15px_40px_rgba(11,15,24,0.6)] border border-[#263047] flex flex-col justify-between relative transition-all duration-300 hover:border-[#22D39F]/50 ${
        dragActive ? 'border-[#22D39F] ring-4 ring-[#22D39F]/20 bg-[#102D30]/70' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      id={`upload-card-${effectiveType.toLowerCase()}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="*/*"
        id={`input-file-${effectiveType.toLowerCase()}`}
      />

      {/* HEADER SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="w-8 h-8 rounded-xl bg-[#102D30] text-[#22D39F] font-black text-xs flex items-center justify-center shadow-inner border border-[#22D39F]/30">
            {badgeNumber || (effectiveType.startsWith('SALES') ? '01' : effectiveType.startsWith('PURCHASE') ? '02' : effectiveType.startsWith('BANK') ? '03' : '04')}
          </span>
          
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-[#7F8BA3] bg-[#0B0F18] border border-[#263047] px-2.5 py-0.5 rounded-full shadow-inner">
              Count: {effectiveCategoryFiles.length}
            </span>
            {effectiveCategoryFiles.length > 0 ? (
              <span className="text-[11px] font-black text-[#22D39F] bg-[#102D30] border border-[#22D39F]/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-inner">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22D39F]" />
                Uploaded
              </span>
            ) : required === false || effectiveType.includes('ADDITIONAL') ? (
              <span className="text-[11px] font-medium text-[#7F8BA3] bg-[#0B0F18] border border-[#263047] px-2.5 py-0.5 rounded-full">
                Optional
              </span>
            ) : (
              <span className="text-[11px] font-bold text-amber-400 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-800">
                Action Required
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-black text-[#F0F4FF] tracking-tight" id={`title-${effectiveType.toLowerCase()}`}>
          {title}
        </h3>
        <p className="text-xs font-medium text-[#AEB8CC] mt-1 leading-relaxed">
          {description}
        </p>

        {/* AI CAPABILITY TAG */}
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-[#22D39F] bg-[#102D30] px-2.5 py-1 rounded-xl w-max border border-[#22D39F]/30 shadow-inner">
          <Sparkles className="w-3 h-3 text-[#22D39F]" />
          <span>Supports Excel, Word, PDF, Images (AI OCR)</span>
        </div>

        {/* FILE SELECTION DROPDOWN */}
        {effectiveCategoryFiles.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-[#263047] space-y-1.5">
            <label className="block text-[11px] font-bold text-[#7F8BA3]">
              Uploaded Files in Section ({effectiveCategoryFiles.length}):
            </label>
            <select
              value={selectedFileId}
              onChange={(e) => setSelectedFileId(e.target.value)}
              className="w-full text-xs font-bold text-[#F0F4FF] bg-[#0B0F18] border border-[#263047] px-3 py-2 rounded-xl focus:outline-none focus:border-[#22D39F] cursor-pointer truncate"
              id={`select-file-${effectiveType.toLowerCase()}`}
            >
              <option value="ALL">📁 All Files in Section ({effectiveCategoryFiles.length})</option>
              {effectiveCategoryFiles.map((f, idx) => (
                <option key={f.id} value={f.id}>
                  📄 #{idx + 1}: {f.originalName} ({(f.size / 1024).toFixed(1)} KB)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* FILE STATUS / DISPLAY OR UPLOAD AREA */}
      <div className="mt-4">
        {uploading ? (
          <div className="p-5 rounded-2xl bg-[#0B0F18] border border-[#22D39F]/40 flex flex-col items-center text-center gap-2 animate-pulse">
            <RefreshCw className="w-6 h-6 text-[#22D39F] animate-spin" />
            <p className="text-xs font-black text-[#F0F4FF]">Processing Ingestion...</p>
            <p className="text-[11px] font-medium text-[#7F8BA3]">Executing AI OCR document extraction</p>
          </div>
        ) : effectiveCategoryFiles.length > 0 ? (
          <div className="p-3.5 rounded-2xl bg-[#0B0F18] border border-[#263047] space-y-3 shadow-inner">
            {selectedFileId === 'ALL' ? (
              /* ALL FILES VIEW */
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-black text-[#F0F4FF] pb-1 border-b border-[#263047]">
                  <span>Files in Section ({effectiveCategoryFiles.length})</span>
                  <span className="text-[10px] font-black text-[#22D39F]">Stored Dossier</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {effectiveCategoryFiles.map((f) => (
                    <div key={f.id} className="p-2.5 bg-[#161D2F] rounded-xl border border-[#263047] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-inner">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="font-bold text-[#F0F4FF] break-words line-clamp-1" title={f.originalName}>
                          {f.originalName}
                        </p>
                        <p className="text-[10px] text-[#7F8BA3] flex items-center gap-1.5 flex-wrap font-medium">
                          <span className="whitespace-nowrap">{(f.size / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span className="whitespace-nowrap">{new Date(f.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => inspectHandler(f)}
                          className="px-2.5 py-1 text-[#AEB8CC] hover:text-[#F0F4FF] hover:bg-[#102D30] border border-[#263047] hover:border-[#22D39F] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Inspect Data"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#22D39F]" />
                          <span>Inspect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadSingle(f)}
                          className="p-1.5 text-[#0E1120] bg-[#22D39F] hover:bg-[#19C99A] rounded-lg cursor-pointer transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteFile(f.id)}
                          className="p-1.5 text-[#7F8BA3] hover:text-rose-400 hover:bg-rose-950/30 border border-transparent rounded-lg cursor-pointer transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadAll}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#161D2F] hover:bg-[#102D30] text-[#F0F4FF] border border-[#263047] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-inner cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#22D39F]" />
                    <span>Download All</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.click();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Upload New</span>
                  </button>
                </div>
              </div>
            ) : activeSelectedFile ? (
              /* SINGLE SELECTED FILE VIEW */
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="p-2 rounded-xl bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 shadow-inner shrink-0 mt-0.5">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-xs font-bold text-[#F0F4FF] break-words line-clamp-2" title={activeSelectedFile.originalName}>
                        {activeSelectedFile.originalName}
                      </p>
                      <div className="text-[10px] text-[#7F8BA3] flex items-center gap-1.5 flex-wrap font-medium">
                        <span className="whitespace-nowrap">{(activeSelectedFile.size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span className="whitespace-nowrap">{new Date(activeSelectedFile.uploadedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteFile(activeSelectedFile.id)}
                    className="p-2 rounded-xl bg-[#161D2F] hover:bg-rose-950/40 text-[#7F8BA3] hover:text-rose-400 border border-[#263047] transition-colors cursor-pointer shrink-0"
                    title="Delete file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => inspectHandler(activeSelectedFile)}
                    className="w-full py-2.5 px-2 rounded-xl bg-[#161D2F] hover:bg-[#102D30] text-[#F0F4FF] border border-[#263047] hover:border-[#22D39F] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-inner cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#22D39F]" />
                    <span>Inspect</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(activeSelectedFile)}
                    className="w-full py-2.5 px-2 rounded-xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0B0F18] hover:bg-[#102D30] text-[#F0F4FF] border border-[#263047] hover:border-[#22D39F] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-inner"
                >
                  <Upload className="w-3.5 h-3.5 text-[#22D39F]" />
                  <span>+ Upload Another File</span>
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          /* UPLOAD PROMPT BUTTON WHEN NO FILES EXIST */
          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) fileInputRef.current.click();
            }}
            className="w-full py-5 px-4 rounded-2xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] font-black text-xs tracking-wide shadow-[0_10px_22px_rgba(34,211,159,0.3)] active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer"
            id={`btn-upload-${effectiveType.toLowerCase()}`}
          >
            <div className="w-9 h-9 rounded-full bg-[#0E1120]/15 flex items-center justify-center shadow-inner">
              <Upload className="w-4 h-4 text-[#0E1120]" />
            </div>
            <span>Click or Drag & Drop File</span>
            <span className="text-[10px] font-bold text-[#0E1120]/80">Any file format supported</span>
          </button>
        )}
      </div>
    </div>
  );
};
