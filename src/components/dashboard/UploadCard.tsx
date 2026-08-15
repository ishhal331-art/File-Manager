import React, { useRef, useState, useEffect } from 'react';
import { FileType, UploadedFile } from '../../types';
import { api } from '../../lib/api';
import { Upload, CheckCircle2, FileSpreadsheet, Eye, Sparkles, RefreshCw, Download, Trash2, Layers } from 'lucide-react';

interface Props {
  fileType: FileType;
  title: string;
  description: string;
  badgeNumber: string;
  categoryFiles: UploadedFile[];
  onUploadSuccess: (file: UploadedFile) => void;
  onViewFile: (file: UploadedFile) => void;
  onDeleteFile: (fileId: string) => void;
}

export const UploadCard: React.FC<Props> = ({
  fileType,
  title,
  description,
  badgeNumber,
  categoryFiles = [],
  onUploadSuccess,
  onViewFile,
  onDeleteFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string>('ALL');

  // Keep selected file in sync if files change
  useEffect(() => {
    if (categoryFiles.length > 0 && selectedFileId !== 'ALL') {
      const exists = categoryFiles.some((f) => f.id === selectedFileId);
      if (!exists) {
        setSelectedFileId(categoryFiles[0].id);
      }
    }
  }, [categoryFiles, selectedFileId]);

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
    a.download = `${file.fileType}_${file.originalName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    categoryFiles.forEach((file) => handleDownloadSingle(file));
  };

  const activeSelectedFile = categoryFiles.find((f) => f.id === selectedFileId);

  return (
    <div 
      className={`bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] border border-white/80 flex flex-col justify-between relative transition-all duration-300 hover:shadow-[0_20px_45px_rgba(48,33,18,0.12)] ${
        dragActive ? 'border-[#92798B] ring-4 ring-[#92798B]/20 bg-[#E0D1D4]' : ''
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
          <span className="w-8 h-8 rounded-2xl bg-[#E5DAD9] text-[#92798B] font-black text-xs flex items-center justify-center shadow-xs border border-white/80">
            {badgeNumber}
          </span>
          
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-[#92798B] bg-[#E5DAD9] border border-white/80 px-2.5 py-0.5 rounded-full shadow-2xs">
              Count: {categoryFiles.length}
            </span>
            {categoryFiles.length > 0 ? (
              <span className="text-[11px] font-black text-emerald-800 bg-[#E5DAD9] border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Uploaded
              </span>
            ) : fileType === 'ADDITIONAL' ? (
              <span className="text-[11px] font-bold text-[#5A463B] bg-[#E5DAD9] border border-white/80 px-2.5 py-0.5 rounded-full">
                Optional
              </span>
            ) : (
              <span className="text-[11px] font-bold text-[#5A463B] bg-[#E5DAD9] px-2.5 py-0.5 rounded-full border border-white/60">
                Action Required
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-black text-[#302112] tracking-tight" id={`title-${fileType.toLowerCase()}`}>
          {title}
        </h3>
        <p className="text-xs font-semibold text-[#5A463B] mt-1 leading-relaxed">
          {description}
        </p>

        {/* AI CAPABILITY TAG */}
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-extrabold text-[#5A463B] bg-[#E5DAD9]/80 px-2.5 py-1 rounded-xl w-max border border-white/70">
          <Sparkles className="w-3 h-3 text-[#CBAF87]" />
          <span>Supports Excel, Word, PDF, JPG/PNG (AI OCR)</span>
        </div>

        {/* FILE SELECTION DROPDOWN BY FILE NAME */}
        {categoryFiles.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-white/60 space-y-1.5">
            <label className="block text-[11px] font-black text-[#5A463B]">
              Uploaded Files in Section ({categoryFiles.length}):
            </label>
            <select
              value={selectedFileId}
              onChange={(e) => setSelectedFileId(e.target.value)}
              className="w-full text-xs font-bold text-[#302112] bg-[#E5DAD9] border border-white/80 px-3 py-2 rounded-xl focus:outline-none focus:border-[#92798B] cursor-pointer truncate"
              id={`select-file-${fileType.toLowerCase()}`}
            >
              <option value="ALL">📁 All Files in Section ({categoryFiles.length})</option>
              {categoryFiles.map((f, idx) => (
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
          <div className="p-5 rounded-2xl bg-[#E0D1D4] border border-white flex flex-col items-center text-center gap-2 animate-pulse">
            <RefreshCw className="w-6 h-6 text-[#92798B] animate-spin" />
            <p className="text-xs font-black text-[#302112]">Processing Ingestion...</p>
            <p className="text-[11px] font-semibold text-[#5A463B]">Executing AI OCR document extraction</p>
          </div>
        ) : categoryFiles.length > 0 ? (
          <div className="p-3.5 rounded-2xl bg-[#E5DAD9]/80 backdrop-blur-md border border-white/80 space-y-3">
            {selectedFileId === 'ALL' ? (
              /* ALL FILES VIEW */
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-black text-[#302112] pb-1 border-b border-white/60">
                  <span>Files in Section ({categoryFiles.length})</span>
                  <span className="text-[10px] font-black text-[#92798B]">Stored Dossier</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {categoryFiles.map((f) => (
                    <div key={f.id} className="p-2.5 bg-[#F3EAE2] rounded-xl border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="font-extrabold text-[#302112] break-words line-clamp-1" title={f.originalName}>
                          {f.originalName}
                        </p>
                        <p className="text-[10px] text-[#5A463B] flex items-center gap-1.5 flex-wrap font-medium">
                          <span className="whitespace-nowrap">{(f.size / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span className="whitespace-nowrap">{new Date(f.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => onViewFile(f)}
                          className="px-2.5 py-1 text-[#5A463B] hover:text-[#302112] hover:bg-[#E5DAD9] border border-white/80 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Inspect Data"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#92798B]" />
                          <span>Inspect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadSingle(f)}
                          className="p-1.5 text-[#F3EAE2] bg-[#92798B] hover:bg-[#5A463B] rounded-lg cursor-pointer transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteFile(f.id)}
                          className="p-1.5 text-[#5A463B] hover:text-rose-700 hover:bg-[#E0D1D4] border border-transparent rounded-lg cursor-pointer transition-colors"
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
                    className="w-full py-2.5 px-3 rounded-xl bg-[#F3EAE2] hover:bg-white text-[#302112] border border-white/80 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#92798B]" />
                    <span>Download All</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.click();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#92798B] to-[#5A463B] hover:from-[#82687B] hover:to-[#4D3A2F] text-[#F3EAE2] text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
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
                    <div className="p-2 rounded-xl bg-[#F3EAE2] border border-white/80 text-[#92798B] shadow-2xs shrink-0 mt-0.5">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-xs font-black text-[#302112] break-words line-clamp-2" title={activeSelectedFile.originalName}>
                        {activeSelectedFile.originalName}
                      </p>
                      <div className="text-[10px] text-[#5A463B] flex items-center gap-1.5 flex-wrap font-medium">
                        <span className="whitespace-nowrap">{(activeSelectedFile.size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span className="whitespace-nowrap">{new Date(activeSelectedFile.uploadedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteFile(activeSelectedFile.id)}
                    className="p-2 rounded-xl bg-[#F3EAE2] hover:bg-[#E0D1D4] text-[#5A463B] hover:text-rose-700 border border-white/80 transition-colors cursor-pointer shrink-0"
                    title="Delete file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onViewFile(activeSelectedFile)}
                    className="w-full py-2.5 px-2 rounded-xl bg-[#F3EAE2] hover:bg-white text-[#302112] border border-white/80 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#92798B]" />
                    <span>Inspect</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(activeSelectedFile)}
                    className="w-full py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#92798B] to-[#5A463B] text-[#F3EAE2] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
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
                  className="w-full py-2.5 px-3 rounded-xl bg-[#E5DAD9] hover:bg-[#D0BEC7] text-[#302112] border border-white/80 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#92798B]" />
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
            className="w-full py-5 px-4 rounded-2xl bg-gradient-to-r from-[#92798B] via-[#5A463B] to-[#302112] text-[#F3EAE2] font-black text-xs tracking-wide shadow-[0_10px_22px_rgba(48,33,18,0.2)] hover:shadow-[0_14px_28px_rgba(48,33,18,0.3)] active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer"
            id={`btn-upload-${fileType.toLowerCase()}`}
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
              <Upload className="w-4 h-4 text-[#F3EAE2]" />
            </div>
            <span>Click or Drag & Drop File</span>
            <span className="text-[10px] font-semibold text-[#F3EAE2]/80">Any file format supported</span>
          </button>
        )}
      </div>
    </div>
  );
};
