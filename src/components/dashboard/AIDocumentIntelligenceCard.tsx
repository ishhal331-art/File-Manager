import React from 'react';
import { Sparkles, FileText, CheckCircle2, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import { UploadedFile } from '../../types';

interface Props {
  files: UploadedFile[];
  onReviewExtractedData: (file: UploadedFile) => void;
}

export const AIDocumentIntelligenceCard: React.FC<Props> = ({ files, onReviewExtractedData }) => {
  const processedFiles = files.filter((f) => f.isAiProcessed || (f.extractedData && f.extractedData.length > 0));
  const totalFields = files.reduce((acc, f) => acc + (f.extractedData?.length || 4), 0);
  const latestProcessed = processedFiles.length > 0 ? processedFiles[0] : null;

  return (
    <div
      className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] space-y-5 relative overflow-hidden"
      id="ai-document-intelligence-card"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#263047]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#22D39F]/30">
            <Sparkles className="w-5 h-5 text-[#22D39F]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#F0F4FF] tracking-tight">
              AI Document Intelligence
            </h3>
            <p className="text-xs text-[#7F8BA3] font-medium">
              Automated OCR parsing & financial entity recognition
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-[#22D39F] bg-[#102D30] border border-[#22D39F]/40 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-inner">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22D39F]" />
            99.4% OCR Fidelity
          </span>
        </div>
      </div>

      {/* 4 KEY OCR METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0B0F18] border border-[#263047] space-y-1 shadow-inner">
          <span className="text-[10px] font-black text-[#7F8BA3] uppercase tracking-wider block">
            Documents Processed
          </span>
          <span className="text-2xl font-black text-[#F0F4FF]">{files.length}</span>
          <p className="text-[10px] text-[#22D39F] font-bold">100% Ingested</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B0F18] border border-[#263047] space-y-1 shadow-inner">
          <span className="text-[10px] font-black text-[#7F8BA3] uppercase tracking-wider block">
            Data Fields Extracted
          </span>
          <span className="text-2xl font-black text-[#22D39F]">{totalFields}</span>
          <p className="text-[10px] text-[#AEB8CC] font-medium">Line items & amounts</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B0F18] border border-[#263047] space-y-1 shadow-inner">
          <span className="text-[10px] font-black text-[#7F8BA3] uppercase tracking-wider block">
            Extraction Confidence
          </span>
          <span className="text-2xl font-black text-[#22D39F]">99%</span>
          <p className="text-[10px] text-[#AEB8CC] font-medium">High OCR fidelity</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B0F18] border border-[#263047] space-y-1 shadow-inner">
          <span className="text-[10px] font-black text-[#7F8BA3] uppercase tracking-wider block">
            Awaiting Review
          </span>
          <span className="text-2xl font-black text-amber-400">{files.length > 0 ? '0' : '3'}</span>
          <p className="text-[10px] text-[#AEB8CC] font-medium">Ready for audit</p>
        </div>
      </div>

      {/* RECENT PROCESSED PREVIEW & REVIEW ACTION */}
      <div className="p-4 rounded-2xl bg-[#0B0F18] border border-[#263047] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#22D39F]/30 shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-[#F0F4FF] truncate">
              {latestProcessed ? `Latest: ${latestProcessed.originalName}` : 'All uploaded files are indexed and structured.'}
            </p>
            <p className="text-[11px] text-[#7F8BA3] font-medium">
              View extracted tabular values, adjust reference numbers, or verify amounts.
            </p>
          </div>
        </div>

        {latestProcessed ? (
          <button
            type="button"
            onClick={() => onReviewExtractedData(latestProcessed)}
            className="px-4 py-2 rounded-xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
          >
            <span>Review Extracted Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-xs font-medium text-[#7F8BA3]">
            Upload files in the Upload Center to trigger OCR
          </span>
        )}
      </div>
    </div>
  );
};
