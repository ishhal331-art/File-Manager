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
      className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[28px] p-5 sm:p-6 shadow-[0_15px_40px_rgba(11,15,24,0.6)] border border-[#263047] flex flex-col md:flex-row items-center gap-6"
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
            className="stroke-[#0B0F18]"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated progress circle */}
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

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-[#F0F4FF] tracking-tight" id="wheel-percentage">
            {percentage}%
          </span>
          <span className="text-[10px] font-black text-[#7F8BA3] uppercase tracking-wider">
            Compliance
          </span>
        </div>
      </div>

      {/* DETAILED FILE STATUS LIST */}
      <div className="flex-1 w-full space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-[#263047]">
          <h3 className="text-sm font-black text-[#F0F4FF] tracking-tight">
            Fiscal Dossier Compliance
          </h3>
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30">
            {count} of 3 Required
          </span>
        </div>

        {/* Sales File Status */}
        <div 
          onClick={() => onNavigateToUpload?.('SALES')}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0B0F18] border border-[#263047] transition-all hover:border-[#22D39F] cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl ${salesUploaded ? 'bg-[#102D30] text-[#22D39F]' : 'bg-[#161D2F] text-[#7F8BA3]'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#F0F4FF]">1. Sales Invoices</p>
              <p className="text-[10px] text-[#7F8BA3] font-medium">Customer revenue & turnover</p>
            </div>
          </div>
          {salesUploaded ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#22D39F] bg-[#102D30] px-2 py-0.5 rounded-md border border-[#22D39F]/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22D39F]" /> Ingested
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Upload
            </span>
          )}
        </div>

        {/* Purchase File Status */}
        <div 
          onClick={() => onNavigateToUpload?.('PURCHASE')}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0B0F18] border border-[#263047] transition-all hover:border-[#22D39F] cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl ${purchaseUploaded ? 'bg-[#102D30] text-[#22D39F]' : 'bg-[#161D2F] text-[#7F8BA3]'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#F0F4FF]">2. Purchase Receipts</p>
              <p className="text-[10px] text-[#7F8BA3] font-medium">Vendor expenses & bills</p>
            </div>
          </div>
          {purchaseUploaded ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#22D39F] bg-[#102D30] px-2 py-0.5 rounded-md border border-[#22D39F]/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22D39F]" /> Ingested
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Upload
            </span>
          )}
        </div>

        {/* Bank Statement Status */}
        <div 
          onClick={() => onNavigateToUpload?.('BANK_STATEMENT')}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0B0F18] border border-[#263047] transition-all hover:border-[#22D39F] cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl ${bankUploaded ? 'bg-[#102D30] text-[#22D39F]' : 'bg-[#161D2F] text-[#7F8BA3]'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#F0F4FF]">3. Bank Statement</p>
              <p className="text-[10px] text-[#7F8BA3] font-medium">Official statement logs</p>
            </div>
          </div>
          {bankUploaded ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#22D39F] bg-[#102D30] px-2 py-0.5 rounded-md border border-[#22D39F]/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22D39F]" /> Ingested
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Upload
            </span>
          )}
        </div>

        {/* Optional Additional Files Status */}
        <div 
          onClick={() => onNavigateToUpload?.('ADDITIONAL')}
          className="flex items-center justify-between p-2 rounded-2xl bg-[#0B0F18] border border-[#263047] transition-all hover:border-[#22D39F] cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-[#102D30] text-[#22D39F]">
              <PlusCircle className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#AEB8CC]">4. Additional Documents (Optional)</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#7F8BA3] bg-[#161D2F] px-2 py-0.5 rounded-md border border-[#263047]">
            {additionalCount > 0 ? `${additionalCount} Uploaded` : 'Optional'}
          </span>
        </div>
      </div>
    </div>
  );
};
