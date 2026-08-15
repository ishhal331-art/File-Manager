import React from 'react';
import { CheckCircle2, FileText, AlertCircle, PlusCircle } from 'lucide-react';

interface Props {
  salesUploaded: boolean;
  purchaseUploaded: boolean;
  bankUploaded: boolean;
  additionalUploaded?: boolean;
  additionalCount?: number;
  onNavigateToUpload?: (category?: string) => void;
}

export const ProgressWheel: React.FC<Props> = ({
  salesUploaded,
  purchaseUploaded,
  bankUploaded,
  additionalUploaded = false,
  additionalCount = 0,
  onNavigateToUpload,
}) => {
  let count = 0;
  if (salesUploaded) count++;
  if (purchaseUploaded) count++;
  if (bankUploaded) count++;

  const percentage = Math.round((count / 3) * 100);

  // SVG Circular progress math
  const size = 150;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] border border-white/80 flex flex-col md:flex-row items-center gap-6"
      id="progress-wheel-card"
    >
      {/* SVG DONUT WHEEL */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-[#E5DAD9]"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated progress circle */}
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

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-[#302112] tracking-tight" id="wheel-percentage">
            {percentage}%
          </span>
          <span className="text-[10px] font-black text-[#5A463B] uppercase tracking-wider">
            Compliance
          </span>
        </div>
      </div>

      {/* DETAILED FILE STATUS LIST */}
      <div className="flex-1 w-full space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-white/60">
          <h3 className="text-sm font-black text-[#302112] tracking-tight">
            Fiscal Dossier Compliance
          </h3>
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#E5DAD9] text-[#92798B] border border-white/80">
            {count} of 3 Required
          </span>
        </div>

        {/* Sales File Status */}
        <div 
          onClick={() => onNavigateToUpload?.('SALES')}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-[#E5DAD9]/80 backdrop-blur-md border border-white/80 transition-all hover:bg-white cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl ${salesUploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-[#D0BEC7] text-[#5A463B]'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-[#302112]">1. Sales Invoices</p>
              <p className="text-[10px] text-[#5A463B] font-medium">Customer revenue & turnover</p>
            </div>
          </div>
          {salesUploaded ? (
            <span className="flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-[#F3EAE2] px-2 py-0.5 rounded-md border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ingested
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#5A463B] bg-[#E0D1D4] px-2 py-0.5 rounded-md border border-white">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" /> Upload
            </span>
          )}
        </div>

        {/* Purchase File Status */}
        <div 
          onClick={() => onNavigateToUpload?.('PURCHASE')}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-[#E5DAD9]/80 backdrop-blur-md border border-white/80 transition-all hover:bg-white cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl ${purchaseUploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-[#D0BEC7] text-[#5A463B]'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-[#302112]">2. Purchase Receipts</p>
              <p className="text-[10px] text-[#5A463B] font-medium">Vendor expenses & bills</p>
            </div>
          </div>
          {purchaseUploaded ? (
            <span className="flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-[#F3EAE2] px-2 py-0.5 rounded-md border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ingested
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#5A463B] bg-[#E0D1D4] px-2 py-0.5 rounded-md border border-white">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" /> Upload
            </span>
          )}
        </div>

        {/* Bank Statement Status */}
        <div 
          onClick={() => onNavigateToUpload?.('BANK_STATEMENT')}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-[#E5DAD9]/80 backdrop-blur-md border border-white/80 transition-all hover:bg-white cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl ${bankUploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-[#D0BEC7] text-[#5A463B]'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-[#302112]">3. Bank Statement</p>
              <p className="text-[10px] text-[#5A463B] font-medium">Official statement logs</p>
            </div>
          </div>
          {bankUploaded ? (
            <span className="flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-[#F3EAE2] px-2 py-0.5 rounded-md border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ingested
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#5A463B] bg-[#E0D1D4] px-2 py-0.5 rounded-md border border-white">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" /> Upload
            </span>
          )}
        </div>

        {/* Optional Additional Files Status */}
        <div 
          onClick={() => onNavigateToUpload?.('ADDITIONAL')}
          className="flex items-center justify-between p-2 rounded-2xl bg-[#F3EAE2] border border-white/60 transition-all hover:bg-white cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-[#E5DAD9] text-[#92798B]">
              <PlusCircle className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-black text-[#302112]">4. Additional Documents (Optional)</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-[#92798B] bg-[#E5DAD9] px-2 py-0.5 rounded-md">
            {additionalCount > 0 ? `${additionalCount} Uploaded` : 'Optional'}
          </span>
        </div>
      </div>
    </div>
  );
};
