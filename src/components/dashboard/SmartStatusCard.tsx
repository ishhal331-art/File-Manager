import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Clock, ShieldCheck, FileText } from 'lucide-react';

interface Props {
  salesUploaded: boolean;
  purchaseUploaded: boolean;
  bankUploaded: boolean;
  additionalUploaded?: boolean;
  additionalCount?: number;
}

export const SmartStatusCard: React.FC<Props> = ({
  salesUploaded,
  purchaseUploaded,
  bankUploaded,
  additionalUploaded = false,
  additionalCount = 0,
}) => {
  let completed = 0;
  if (salesUploaded) completed++;
  if (purchaseUploaded) completed++;
  if (bankUploaded) completed++;

  const pending = 3 - completed;

  let dynamicMessage = '';

  if (completed === 3) {
    dynamicMessage = "All 3 required financial categories are verified! " + 
      (additionalCount > 0 ? `Plus ${additionalCount} optional supporting document(s) ingested.` : "You're 100% compliant.");
  } else if (completed === 2) {
    dynamicMessage = "You're almost there! 1 required document still needs attention to finalize your dossier.";
  } else if (completed === 1) {
    dynamicMessage = "Good start! 2 required categories still need to be uploaded before review.";
  } else {
    dynamicMessage = "Ready for upload — please submit Sales, Purchase, and Bank statements to begin processing.";
  }

  return (
    <div
      className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] flex flex-col justify-between space-y-4"
      id="smart-portal-status-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#22D39F]/30">
            <Sparkles className="w-4 h-4 text-[#22D39F]" />
          </div>
          <h3 className="text-sm font-black text-[#F0F4FF]">Compliance Status</h3>
        </div>
        <span
          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-inner ${
            completed === 3
              ? 'bg-[#102D30] text-[#22D39F] border-[#22D39F]/40'
              : 'bg-[#0B0F18] text-[#AEB8CC] border-[#263047]'
          }`}
        >
          {completed === 3 ? '100% Compliant' : `${Math.round((completed / 3) * 100)}% In Progress`}
        </span>
      </div>

      <p className="text-xs sm:text-sm font-semibold text-[#F0F4FF] leading-relaxed bg-[#0B0F18] p-3.5 rounded-2xl border border-[#263047] shadow-inner">
        "{dynamicMessage}"
      </p>

      <div className="grid grid-cols-3 gap-2 text-center pt-1">
        <div className="p-2.5 rounded-xl bg-[#0B0F18] border border-[#263047] shadow-inner">
          <span className="text-[10px] font-black text-[#7F8BA3] block uppercase">Required</span>
          <span className="text-base font-black text-[#22D39F]">{completed}/3</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0B0F18] border border-[#263047] shadow-inner">
          <span className="text-[10px] font-black text-[#7F8BA3] block uppercase">Pending</span>
          <span className="text-base font-black text-amber-400">{pending}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0B0F18] border border-[#263047] shadow-inner">
          <span className="text-[10px] font-black text-[#7F8BA3] block uppercase">Optional</span>
          <span className="text-base font-black text-[#AEB8CC]">{additionalCount}</span>
        </div>
      </div>
    </div>
  );
};
