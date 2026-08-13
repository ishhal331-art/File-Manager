import React from 'react';
import { CheckCircle2, FileText, AlertCircle } from 'lucide-react';

interface Props {
  salesUploaded: boolean;
  purchaseUploaded: boolean;
  bankUploaded: boolean;
}

export const ProgressWheel: React.FC<Props> = ({
  salesUploaded,
  purchaseUploaded,
  bankUploaded,
}) => {
  let count = 0;
  if (salesUploaded) count++;
  if (purchaseUploaded) count++;
  if (bankUploaded) count++;

  const percentage = Math.round((count / 3) * 100);

  // SVG Circular progress math
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      className="bg-[#FCFBF8] rounded-[32px] p-6 shadow-[0_15px_35px_rgba(110,85,190,0.08)] border border-[#F0ECE1] flex flex-col md:flex-row items-center gap-6"
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
            className="stroke-[#EFEBF8]"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-[#8364ED] transition-all duration-1000 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-slate-800 tracking-tight" id="wheel-percentage">
            {percentage}%
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Uploaded
          </span>
        </div>
      </div>

      {/* DETAILED FILE STATUS LIST */}
      <div className="flex-1 w-full space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE0]">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">
            Data Upload Status
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F0EBFA] text-[#8364ED]">
            {count} of 3 Files
          </span>
        </div>

        {/* Sales File Status */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F8F6EF] border border-[#ECE7DA] transition-all">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl ${salesUploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">1. Sales File</p>
              <p className="text-[10px] text-slate-400">Revenue & customer invoices</p>
            </div>
          </div>
          {salesUploaded ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" /> Pending
            </span>
          )}
        </div>

        {/* Purchase File Status */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F8F6EF] border border-[#ECE7DA] transition-all">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl ${purchaseUploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">2. Purchase File</p>
              <p className="text-[10px] text-slate-400">Vendor bills & expense receipts</p>
            </div>
          </div>
          {purchaseUploaded ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" /> Pending
            </span>
          )}
        </div>

        {/* Bank Statement Status */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F8F6EF] border border-[#ECE7DA] transition-all">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl ${bankUploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">3. Bank Statement</p>
              <p className="text-[10px] text-slate-400">Official banking transactions</p>
            </div>
          </div>
          {bankUploaded ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" /> Pending
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
