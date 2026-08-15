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
      className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col justify-between space-y-4"
      id="smart-portal-status-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E5DAD9] text-[#92798B] flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-[#CBAF87]" />
          </div>
          <h3 className="text-sm font-black text-[#302112]">Compliance Status</h3>
        </div>
        <span
          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${
            completed === 3
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-[#E5DAD9] text-[#92798B] border-white/80'
          }`}
        >
          {completed === 3 ? '100% Compliant' : `${Math.round((completed / 3) * 100)}% In Progress`}
        </span>
      </div>

      <p className="text-xs sm:text-sm font-bold text-[#302112] leading-relaxed bg-[#E5DAD9]/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 shadow-2xs">
        "{dynamicMessage}"
      </p>

      <div className="grid grid-cols-3 gap-2 text-center pt-1">
        <div className="p-2.5 rounded-xl bg-[#F3EAE2] border border-white/80 shadow-2xs">
          <span className="text-[10px] font-black text-[#5A463B] block uppercase">Required</span>
          <span className="text-base font-black text-emerald-700">{completed}/3</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#F3EAE2] border border-white/80 shadow-2xs">
          <span className="text-[10px] font-black text-[#5A463B] block uppercase">Pending</span>
          <span className="text-base font-black text-amber-700">{pending}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#F3EAE2] border border-white/80 shadow-2xs">
          <span className="text-[10px] font-black text-[#5A463B] block uppercase">Optional</span>
          <span className="text-base font-black text-[#92798B]">{additionalCount}</span>
        </div>
      </div>
    </div>
  );
};
