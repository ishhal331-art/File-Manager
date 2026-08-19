import React from 'react';
import { Sparkles, CheckCircle2, Clock, AlertCircle, RefreshCw, FileText } from 'lucide-react';

interface Props {
  salesUploaded: boolean;
  purchaseUploaded: boolean;
  bankUploaded: boolean;
  totalFilesCount: number;
  onFilterClick?: (filterType: 'ALL' | 'COMPLETED' | 'PENDING' | 'PROCESSING') => void;
  activeFilter?: string;
}

export const UploadIntelligenceOverview: React.FC<Props> = ({
  salesUploaded,
  purchaseUploaded,
  bankUploaded,
  totalFilesCount,
  onFilterClick,
  activeFilter = 'ALL',
}) => {
  let completedSections = 0;
  if (salesUploaded) completedSections++;
  if (purchaseUploaded) completedSections++;
  if (bankUploaded) completedSections++;

  const percentage = Math.round((completedSections / 3) * 100);
  const pendingSections = 3 - completedSections;

  // SVG Circular math
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden"
      id="upload-intelligence-overview"
    >
      {/* LEFT / CIRCULAR RING & COMPLETION */}
      <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="stroke-[#0B0F18]"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Gradient progress ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="stroke-[#22D39F] transition-all duration-1000 ease-out"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center stats */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-[#F0F4FF] tracking-tight" id="overview-percentage">
              {percentage}%
            </span>
            <span className="text-[9px] font-black text-[#7F8BA3] uppercase tracking-wider">
              Completion
            </span>
          </div>
        </div>

        {/* SUMMARY HEADLINE */}
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30">
              Upload Intelligence
            </span>
            <span className="text-xs text-[#7F8BA3] font-semibold">Q3 Fiscal Year</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#F0F4FF] tracking-tight">
            {completedSections === 3
              ? 'All Financial Files Ingested'
              : `${completedSections} of 3 Categories Completed`}
          </h2>
          <p className="text-xs text-[#AEB8CC] font-medium max-w-sm leading-relaxed">
            {completedSections === 3
              ? 'Your compliance records are verified. AI OCR data extraction is active across all dossiers.'
              : `You have ${pendingSections} required document section${pendingSections === 1 ? '' : 's'} awaiting upload.`}
          </p>
        </div>
      </div>

      {/* RIGHT / CLICKABLE INTERACTIVE METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
        {/* TOTAL FILES */}
        <button
          type="button"
          onClick={() => onFilterClick && onFilterClick('ALL')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-[#22D39F] text-[#0E1120] border-[#22D39F] shadow-md scale-[1.02]'
              : 'bg-[#0B0F18] hover:bg-[#102D30] border-[#263047] text-[#AEB8CC]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider ${activeFilter === 'ALL' ? 'text-[#0E1120]' : 'text-[#7F8BA3]'}`}>
              Total Files
            </span>
            <FileText className={`w-3.5 h-3.5 ${activeFilter === 'ALL' ? 'text-[#0E1120]' : 'text-[#22D39F]'}`} />
          </div>
          <span className={`text-xl font-black block mt-1 ${activeFilter === 'ALL' ? 'text-[#0E1120]' : 'text-[#F0F4FF]'}`}>{totalFilesCount}</span>
        </button>

        {/* COMPLETED */}
        <button
          type="button"
          onClick={() => onFilterClick && onFilterClick('COMPLETED')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'COMPLETED'
              ? 'bg-[#22D39F] text-[#0E1120] border-[#22D39F] shadow-md scale-[1.02]'
              : 'bg-[#0B0F18] hover:bg-[#102D30] border-[#263047] text-[#AEB8CC]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider ${activeFilter === 'COMPLETED' ? 'text-[#0E1120]' : 'text-[#7F8BA3]'}`}>
              Completed
            </span>
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeFilter === 'COMPLETED' ? 'text-[#0E1120]' : 'text-[#22D39F]'}`} />
          </div>
          <span className={`text-xl font-black block mt-1 ${activeFilter === 'COMPLETED' ? 'text-[#0E1120]' : 'text-[#22D39F]'}`}>
            {completedSections}
          </span>
        </button>

        {/* PENDING */}
        <button
          type="button"
          onClick={() => onFilterClick && onFilterClick('PENDING')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'PENDING'
              ? 'bg-amber-500 text-[#0E1120] border-amber-500 shadow-md scale-[1.02]'
              : 'bg-[#0B0F18] hover:bg-[#102D30] border-[#263047] text-[#AEB8CC]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider ${activeFilter === 'PENDING' ? 'text-[#0E1120]' : 'text-[#7F8BA3]'}`}>
              Pending
            </span>
            <AlertCircle className={`w-3.5 h-3.5 ${activeFilter === 'PENDING' ? 'text-[#0E1120]' : 'text-amber-400'}`} />
          </div>
          <span className={`text-xl font-black block mt-1 ${activeFilter === 'PENDING' ? 'text-[#0E1120]' : 'text-amber-400'}`}>
            {pendingSections}
          </span>
        </button>

        {/* PROCESSING / AI OCR */}
        <button
          type="button"
          onClick={() => onFilterClick && onFilterClick('PROCESSING')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'PROCESSING'
              ? 'bg-[#102D30] text-[#22D39F] border-[#22D39F] shadow-md scale-[1.02]'
              : 'bg-[#0B0F18] hover:bg-[#102D30] border-[#263047] text-[#AEB8CC]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider ${activeFilter === 'PROCESSING' ? 'text-[#22D39F]' : 'text-[#7F8BA3]'}`}>
              AI Active
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#22D39F]" />
          </div>
          <span className={`text-xl font-black block mt-1 ${activeFilter === 'PROCESSING' ? 'text-[#22D39F]' : 'text-[#F0F4FF]'}`}>
            {totalFilesCount > 0 ? totalFilesCount : 0}
          </span>
        </button>
      </div>
    </div>
  );
};
