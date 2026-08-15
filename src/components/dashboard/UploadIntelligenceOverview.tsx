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
      className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden"
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
              className="stroke-[#E5DAD9]"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Gradient progress ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="stroke-[#92798B] transition-all duration-1000 ease-out"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center stats */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-[#302112] tracking-tight" id="overview-percentage">
              {percentage}%
            </span>
            <span className="text-[9px] font-black text-[#5A463B] uppercase tracking-wider">
              Completion
            </span>
          </div>
        </div>

        {/* SUMMARY HEADLINE */}
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E5DAD9] text-[#92798B] border border-white/80">
              Upload Intelligence
            </span>
            <span className="text-xs text-[#5A463B] font-semibold">Q3 Fiscal Year</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#302112] tracking-tight">
            {completedSections === 3
              ? 'All Financial Files Ingested'
              : `${completedSections} of 3 Categories Completed`}
          </h2>
          <p className="text-xs text-[#5A463B] font-semibold max-w-sm leading-relaxed">
            {completedSections === 3
              ? 'Your compliance records are verified. AI OCR data extraction is active across all dossiers.'
              : `You have ${pendingSections} required document section${pendingSections === 1 ? '' : 's'} awaiting upload.`}
          </p>
        </div>
      </div>

      {/* RIGHT / CLICKABLE INTERACTIVE METRICS (Filterable) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
        {/* TOTAL FILES */}
        <button
          type="button"
          onClick={() => onFilterClick && onFilterClick('ALL')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-[#92798B] text-[#F3EAE2] border-[#92798B] shadow-xs scale-[1.02]'
              : 'bg-[#E5DAD9]/80 hover:bg-white border-white/80 text-[#302112]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider ${activeFilter === 'ALL' ? 'text-[#F3EAE2]/90' : 'text-[#5A463B]'}`}>
              Total Files
            </span>
            <FileText className={`w-3.5 h-3.5 ${activeFilter === 'ALL' ? 'text-[#F3EAE2]' : 'text-[#92798B]'}`} />
          </div>
          <span className="text-xl font-black block mt-1">{totalFilesCount}</span>
        </button>

        {/* COMPLETED */}
        <button
          type="button"
          onClick={() => onFilterClick && onFilterClick('COMPLETED')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'COMPLETED'
              ? 'bg-emerald-700 text-[#F3EAE2] border-emerald-700 shadow-xs scale-[1.02]'
              : 'bg-[#E5DAD9]/80 hover:bg-white border-white/80 text-[#302112]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider ${activeFilter === 'COMPLETED' ? 'text-[#F3EAE2]/90' : 'text-[#5A463B]'}`}>
              Completed
            </span>
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeFilter === 'COMPLETED' ? 'text-[#F3EAE2]' : 'text-emerald-700'}`} />
          </div>
          <span className={`text-xl font-black block mt-1 ${activeFilter === 'COMPLETED' ? 'text-white' : 'text-emerald-700'}`}>
            {completedSections}
          </span>
        </button>

        {/* PENDING */}
        <button
          type="button"
          onClick={() => onFilterClick && onFilterClick('PENDING')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'PENDING'
              ? 'bg-[#CBAF87] text-[#302112] border-[#CBAF87] shadow-xs scale-[1.02]'
              : 'bg-[#E5DAD9]/80 hover:bg-white border-white/80 text-[#302112]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider ${activeFilter === 'PENDING' ? 'text-[#302112]' : 'text-[#5A463B]'}`}>
              Pending
            </span>
            <AlertCircle className={`w-3.5 h-3.5 ${activeFilter === 'PENDING' ? 'text-[#302112]' : 'text-amber-700'}`} />
          </div>
          <span className={`text-xl font-black block mt-1 ${activeFilter === 'PENDING' ? 'text-[#302112]' : 'text-amber-700'}`}>
            {pendingSections}
          </span>
        </button>

        {/* PROCESSING / AI OCR */}
        <button
          type="button"
          onClick={() => onFilterClick && onFilterClick('PROCESSING')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'PROCESSING'
              ? 'bg-[#5A463B] text-[#F3EAE2] border-[#5A463B] shadow-xs scale-[1.02]'
              : 'bg-[#E5DAD9]/80 hover:bg-white border-white/80 text-[#302112]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider ${activeFilter === 'PROCESSING' ? 'text-[#F3EAE2]/90' : 'text-[#5A463B]'}`}>
              AI Active
            </span>
            <Sparkles className={`w-3.5 h-3.5 ${activeFilter === 'PROCESSING' ? 'text-[#CBAF87]' : 'text-[#92798B]'}`} />
          </div>
          <span className={`text-xl font-black block mt-1 ${activeFilter === 'PROCESSING' ? 'text-white' : 'text-[#92798B]'}`}>
            {totalFilesCount > 0 ? totalFilesCount : 0}
          </span>
        </button>
      </div>
    </div>
  );
};
