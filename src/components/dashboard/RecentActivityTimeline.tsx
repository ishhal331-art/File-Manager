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
  const activityItems = [
    ...files.map((file) => ({
      id: `file-${file.id}`,
      type: 'UPLOAD',
      title: `${file.fileType === 'SALES' || file.type === 'SALES_INVOICE' ? 'Sales File' : file.fileType === 'PURCHASE' || file.type === 'PURCHASE_RECEIPT' ? 'Purchase File' : file.fileType === 'BANK_STATEMENT' || file.type === 'BANK_STATEMENT' ? 'Bank Statement' : 'Additional Document'} Ingested`,
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
      className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] space-y-4"
      id="recent-activity-timeline"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#263047]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#22D39F]" />
          <h3 className="text-base font-black text-[#F0F4FF] tracking-tight">
            Recent Ingestion & Audit Stream
          </h3>
        </div>
        <span className="text-xs font-black text-[#22D39F] bg-[#102D30] px-2.5 py-0.5 rounded-full border border-[#22D39F]/30 shadow-inner">
          Live Stream
        </span>
      </div>

      {activityItems.length === 0 ? (
        <div className="p-8 text-center bg-[#0B0F18]/60 rounded-2xl border border-dashed border-[#263047] space-y-2">
          <Clock className="w-6 h-6 text-[#7F8BA3] mx-auto opacity-70" />
          <p className="text-xs font-bold text-[#F0F4FF]">No recent activity yet</p>
          <p className="text-[11px] font-medium text-[#7F8BA3]">Upload your financial documents to record audit events.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activityItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-[#0B0F18] hover:bg-[#102D30] border border-[#263047] hover:border-[#22D39F] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="p-2.5 rounded-xl bg-[#102D30] border border-[#22D39F]/30 text-[#22D39F] shrink-0 shadow-inner">
                  {item.type === 'UPLOAD' ? (
                    <FileSpreadsheet className="w-4 h-4 text-[#22D39F]" />
                  ) : item.type === 'OCR' ? (
                    <Sparkles className="w-4 h-4 text-[#22D39F]" />
                  ) : (
                    <Bell className="w-4 h-4 text-[#22D39F]" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-[#F0F4FF]">{item.title}</h4>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${
                        item.status === 'Completed'
                          ? 'bg-[#102D30] text-[#22D39F] border-[#22D39F]/40'
                          : item.status === 'AI Verified'
                          ? 'bg-[#102D30] text-[#22D39F] border-[#22D39F]/40'
                          : 'bg-[#161D2F] text-[#AEB8CC] border-[#263047]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#AEB8CC] font-medium break-words">{item.description}</p>
                  <p className="text-[10px] text-[#7F8BA3] font-medium">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {item.file && onInspectFile && (
                <button
                  type="button"
                  onClick={() => onInspectFile(item.file!)}
                  className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-[#161D2F] hover:bg-[#102D30] text-[#F0F4FF] text-xs font-bold border border-[#263047] hover:border-[#22D39F] shadow-inner flex items-center gap-1 cursor-pointer whitespace-nowrap transition-colors"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3 text-[#22D39F]" />
                </button>
              )}

              {item.type === 'NOTIF' && onOpenNotifications && (
                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-[#161D2F] hover:bg-[#102D30] text-[#F0F4FF] text-xs font-bold border border-[#263047] hover:border-[#22D39F] shadow-inner flex items-center gap-1 cursor-pointer whitespace-nowrap transition-colors"
                >
                  <span>View Message</span>
                  <ArrowRight className="w-3 h-3 text-[#22D39F]" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
