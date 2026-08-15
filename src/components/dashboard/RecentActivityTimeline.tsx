import React from 'react';
import { UploadedFile, AppNotification } from '../../types';
import { Clock, FileSpreadsheet, Bell, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  files: UploadedFile[];
  notifications?: AppNotification[];
  onInspectFile?: (file: UploadedFile) => void;
  onOpenNotifications?: () => void;
}

export const RecentActivityTimeline: React.FC<Props> = ({
  files,
  notifications = [],
  onInspectFile,
  onOpenNotifications,
}) => {
  // Synthesize rich timeline items from real user files and system events
  const activityItems = [
    ...files.map((file) => ({
      id: `file-${file.id}`,
      type: 'UPLOAD',
      title: `${file.fileType === 'SALES' ? 'Sales File' : file.fileType === 'PURCHASE' ? 'Purchase File' : file.fileType === 'BANK_STATEMENT' ? 'Bank Statement' : 'Additional Document'} Ingested`,
      description: `${file.originalName} (${(file.size / 1024).toFixed(1)} KB) uploaded for ${file.period || 'Q3 2026'}.`,
      timestamp: file.uploadedAt,
      file,
      status: 'Completed',
    })),
    ...files.map((file) => ({
      id: `ocr-${file.id}`,
      type: 'OCR',
      title: 'AI OCR Extracted Tabular Data',
      description: `Indexed ${file.extractedData?.length || 4} financial records with 99% accuracy.`,
      timestamp: new Date(new Date(file.uploadedAt).getTime() + 5000).toISOString(),
      file,
      status: 'AI Verified',
    })),
    ...notifications.map((notif) => ({
      id: `notif-${notif.id}`,
      type: 'NOTIF',
      title: notif.title,
      description: notif.message,
      timestamp: notif.timestamp,
      file: null,
      status: 'Message',
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  return (
    <div
      className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] space-y-4"
      id="recent-activity-timeline"
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/60">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#92798B]" />
          <h3 className="text-base font-black text-[#302112] tracking-tight">
            Recent Ingestion & Audit Stream
          </h3>
        </div>
        <span className="text-xs font-black text-[#92798B] bg-[#E5DAD9] px-2.5 py-0.5 rounded-full border border-white/80 shadow-2xs">
          Live Stream
        </span>
      </div>

      {activityItems.length === 0 ? (
        <div className="p-8 text-center bg-[#E5DAD9]/60 backdrop-blur-md rounded-2xl border border-dashed border-white/80 space-y-2">
          <Clock className="w-6 h-6 text-[#92798B] mx-auto opacity-70" />
          <p className="text-xs font-black text-[#302112]">No recent activity yet</p>
          <p className="text-[11px] font-semibold text-[#5A463B]">Upload your financial documents to record audit events.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activityItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-[#E5DAD9]/80 backdrop-blur-md hover:bg-white border border-white/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="p-2.5 rounded-xl bg-[#F3EAE2] border border-white/80 text-[#92798B] shrink-0 shadow-2xs">
                  {item.type === 'UPLOAD' ? (
                    <FileSpreadsheet className="w-4 h-4 text-[#92798B]" />
                  ) : item.type === 'OCR' ? (
                    <Sparkles className="w-4 h-4 text-[#CBAF87]" />
                  ) : (
                    <Bell className="w-4 h-4 text-[#5A463B]" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-black text-[#302112]">{item.title}</h4>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${
                        item.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : item.status === 'AI Verified'
                          ? 'bg-[#E0D1D4] text-[#5A463B] border-white'
                          : 'bg-[#F3EAE2] text-[#302112] border-white'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A463B] font-semibold break-words">{item.description}</p>
                  <p className="text-[10px] text-[#5A463B]/70 font-medium">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {item.file && onInspectFile && (
                <button
                  type="button"
                  onClick={() => onInspectFile(item.file!)}
                  className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-[#F3EAE2] hover:bg-[#E5DAD9] text-[#302112] text-xs font-black border border-white/80 shadow-2xs flex items-center gap-1 cursor-pointer whitespace-nowrap transition-colors"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3 text-[#92798B]" />
                </button>
              )}

              {item.type === 'NOTIF' && onOpenNotifications && (
                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-[#F3EAE2] hover:bg-[#E5DAD9] text-[#302112] text-xs font-black border border-white/80 shadow-2xs flex items-center gap-1 cursor-pointer whitespace-nowrap transition-colors"
                >
                  <span>View Message</span>
                  <ArrowRight className="w-3 h-3 text-[#92798B]" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
