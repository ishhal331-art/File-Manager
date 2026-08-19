import React, { useState, useEffect } from 'react';
import { User, UploadedFile } from '../../types';
import { api } from '../../lib/api';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Eye,
  Trash2,
  Send,
  Lock,
  KeyRound,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

interface Props {
  user: User | null;
  initialFiles?: UploadedFile[];
  onClose: () => void;
  onInspectFile: (file: UploadedFile) => void;
  onSendMessage: (targetUserId: string) => void;
  onResetPassword: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onFileDeleted?: () => void;
}

export const AdminUserDetailDrawer: React.FC<Props> = ({
  user,
  initialFiles,
  onClose,
  onInspectFile,
  onSendMessage,
  onResetPassword,
  onToggleStatus,
  onFileDeleted,
}) => {
  if (!user) return null;

  const [files, setFiles] = useState<UploadedFile[]>(() => initialFiles || []);
  const [loadingFiles, setLoadingFiles] = useState(() => !initialFiles || initialFiles.length === 0);

  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      setFiles(initialFiles);
      setLoadingFiles(false);
    }
    loadUserFiles();
  }, [user.id]);

  const loadUserFiles = async () => {
    try {
      const res = await api.getFiles(user.id);
      if (res && Array.isArray(res.files)) {
        setFiles(res.files);
      }
    } catch (err) {
      console.warn('Could not refresh user files list:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const salesFiles = files.filter((f) => f.fileType === 'SALES' || (f as any).type === 'SALES_INVOICE' || (f as any).type === 'SALES');
  const purchaseFiles = files.filter((f) => f.fileType === 'PURCHASE' || (f as any).type === 'PURCHASE_RECEIPT' || (f as any).type === 'PURCHASE');
  const bankFiles = files.filter((f) => f.fileType === 'BANK_STATEMENT' || (f as any).type === 'BANK_STATEMENT');

  let completedCount = 0;
  if (salesFiles.length > 0) completedCount++;
  if (purchaseFiles.length > 0) completedCount++;
  if (bankFiles.length > 0) completedCount++;

  const percentage = Math.round((completedCount / 3) * 100);

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to remove this file from the user dossier?')) return;
    try {
      await api.deleteFile(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      if (onFileDeleted) onFileDeleted();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleDownloadFile = (file: UploadedFile) => {
    if (!file.fileUrl) return;
    const a = document.createElement('a');
    a.href = file.fileUrl;
    a.download = `${file.fileType}_${user.username}_${file.originalName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0B0F18]/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      id="user-detail-popup-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* CENTERED POPUP MODAL DIALOG */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#161D2F] rounded-[32px] border border-[#263047] shadow-[0_25px_70px_rgba(11,15,24,0.9)] flex flex-col overflow-hidden my-auto animate-scale-in">
        {/* HEADER */}
        <div className="p-5 sm:p-6 border-b border-[#263047] flex items-center justify-between gap-4 sticky top-0 bg-[#161D2F]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 font-black text-lg flex items-center justify-center shadow-inner shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-black text-[#F0F4FF] tracking-tight truncate">
                {user.fullName}
              </h3>
              <p className="text-xs text-[#7F8BA3] font-bold truncate">
                @{user.username} • <span className="text-[#22D39F]">{user.role}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#7F8BA3] hover:text-[#F0F4FF] hover:bg-[#0B0F18] transition-colors cursor-pointer"
            title="Close Popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE BODY CONTENT */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* USER PROFILE INFO CARD */}
          <div className="bg-[#0B0F18] rounded-[28px] p-5 border border-[#263047] shadow-inner space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#7F8BA3] uppercase tracking-wider">
                Account Details
              </h4>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  user.status === 'ACTIVE'
                    ? 'bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30'
                    : 'bg-rose-950/40 text-rose-400 border border-rose-800'
                }`}
              >
                {user.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#AEB8CC] font-medium bg-[#161D2F] p-2.5 rounded-xl border border-[#263047]">
                <Mail className="w-4 h-4 text-[#22D39F] shrink-0" />
                <span className="truncate">{user.email || 'No email registered'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#AEB8CC] font-medium bg-[#161D2F] p-2.5 rounded-xl border border-[#263047]">
                <Phone className="w-4 h-4 text-[#22D39F] shrink-0" />
                <span>{user.phone || 'No phone registered'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#AEB8CC] font-medium bg-[#161D2F] p-2.5 rounded-xl border border-[#263047]">
                <Calendar className="w-4 h-4 text-[#22D39F] shrink-0" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-[#AEB8CC] font-medium bg-[#161D2F] p-2.5 rounded-xl border border-[#263047]">
                <Shield className="w-4 h-4 text-[#22D39F] shrink-0" />
                <span>Role: {user.role}</span>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSendMessage(user.id)}
                className="px-3.5 py-2 rounded-xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Notification</span>
              </button>

              <button
                type="button"
                onClick={() => onResetPassword(user)}
                className="px-3.5 py-2 rounded-xl bg-[#161D2F] hover:bg-[#102D30] text-[#F0F4FF] text-xs font-bold border border-[#263047] hover:border-[#22D39F] shadow-inner flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#22D39F]" />
                <span>Reset Password</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleStatus(user)}
                className="px-3.5 py-2 rounded-xl bg-[#161D2F] hover:bg-[#102D30] text-[#AEB8CC] hover:text-[#F0F4FF] text-xs font-bold border border-[#263047] shadow-inner cursor-pointer transition-all"
              >
                {user.status === 'ACTIVE' ? 'Disable Account' : 'Activate Account'}
              </button>
            </div>
          </div>

          {/* UPLOAD PROGRESS */}
          <div className="bg-[#0B0F18] rounded-[28px] p-5 border border-[#263047] shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#7F8BA3] uppercase tracking-wider">
                Upload Compliance Progress
              </h4>
              <span className="text-xs font-bold text-[#22D39F] bg-[#102D30] px-2.5 py-0.5 rounded-full border border-[#22D39F]/30">
                {percentage}% Completed
              </span>
            </div>

            <div className="w-full bg-[#161D2F] h-2.5 rounded-full overflow-hidden border border-[#263047]">
              <div
                className="bg-[#22D39F] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#22D39F]"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-xl bg-[#161D2F] border border-[#263047]">
                <span className="text-[10px] font-bold text-[#7F8BA3] block">Sales File</span>
                <span className="text-xs font-black text-[#F0F4FF]">{salesFiles.length} file(s)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#161D2F] border border-[#263047]">
                <span className="text-[10px] font-bold text-[#7F8BA3] block">Purchase File</span>
                <span className="text-xs font-black text-[#F0F4FF]">{purchaseFiles.length} file(s)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#161D2F] border border-[#263047]">
                <span className="text-[10px] font-bold text-[#7F8BA3] block">Bank Statement</span>
                <span className="text-xs font-black text-[#F0F4FF]">{bankFiles.length} file(s)</span>
              </div>
            </div>
          </div>

          {/* USER DOCUMENTS LIST */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#7F8BA3] uppercase tracking-wider">
              Uploaded Dossier Documents ({files.length})
            </h4>

            {loadingFiles ? (
              <div className="p-8 text-center text-xs text-[#7F8BA3] font-medium bg-[#0B0F18] rounded-2xl border border-[#263047]">
                Loading user documents...
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center bg-[#0B0F18] rounded-2xl border border-dashed border-[#263047] text-xs text-[#7F8BA3] font-medium">
                No documents uploaded by this user yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-3.5 bg-[#0B0F18] rounded-2xl border border-[#263047] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner hover:border-[#22D39F]/50 transition-all"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30">
                          {file.fileType}
                        </span>
                        <span className="text-[10px] font-medium text-[#7F8BA3]">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#F0F4FF] truncate" title={file.originalName}>
                        {file.originalName}
                      </p>
                      <p className="text-[10px] text-[#7F8BA3] font-medium">
                        {new Date(file.uploadedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => onInspectFile(file)}
                        className="px-2.5 py-1.5 bg-[#161D2F] hover:bg-[#102D30] text-[#F0F4FF] text-xs font-bold rounded-xl border border-[#263047] hover:border-[#22D39F] flex items-center gap-1 cursor-pointer transition-all shadow-inner"
                        title="Inspect AI OCR Data"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#22D39F]" />
                        <span>Inspect</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadFile(file)}
                        className="p-2 bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] rounded-xl shadow-md cursor-pointer transition-all"
                        title="Download File"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-2 bg-[#161D2F] hover:bg-rose-950/40 text-[#7F8BA3] hover:text-rose-400 rounded-xl border border-[#263047] cursor-pointer transition-all"
                        title="Delete File"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 border-t border-[#263047] bg-[#161D2F] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#0B0F18] text-[#AEB8CC] hover:text-[#F0F4FF] text-xs font-bold border border-[#263047] cursor-pointer transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
