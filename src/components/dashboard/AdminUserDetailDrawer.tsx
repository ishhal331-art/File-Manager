import React, { useState, useEffect } from 'react';
import { User, UploadedFile, UserUploadProgress } from '../../types';
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
  onClose: () => void;
  onInspectFile: (file: UploadedFile) => void;
  onSendMessage: (targetUserId: string) => void;
  onResetPassword: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onFileDeleted?: () => void;
}

export const AdminUserDetailDrawer: React.FC<Props> = ({
  user,
  onClose,
  onInspectFile,
  onSendMessage,
  onResetPassword,
  onToggleStatus,
  onFileDeleted,
}) => {
  if (!user) return null;

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  useEffect(() => {
    loadUserFiles();
  }, [user.id]);

  const loadUserFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await api.getFiles(user.id);
      setFiles(res.files || []);
    } catch (err) {
      console.error('Failed to load user files in drawer:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const salesFiles = files.filter((f) => f.fileType === 'SALES');
  const purchaseFiles = files.filter((f) => f.fileType === 'PURCHASE');
  const bankFiles = files.filter((f) => f.fileType === 'BANK_STATEMENT');

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
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* DRAWER PANEL */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[#F3EAE2] border-l border-white/80 shadow-[0_25px_60px_rgba(48,33,18,0.25)] flex flex-col justify-between overflow-y-auto">
          {/* HEADER */}
          <div className="p-6 sm:p-7 border-b border-white/60 flex items-center justify-between gap-4 sticky top-0 bg-[#F3EAE2]/95 backdrop-blur-md z-10">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#92798B] to-[#5A463B] text-[#F3EAE2] font-black text-lg flex items-center justify-center shadow-xs shrink-0">
                {user.fullName.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-[#302112] tracking-tight truncate">
                  {user.fullName}
                </h3>
                <p className="text-xs text-[#5A463B] font-bold truncate">
                  @{user.username} • {user.role}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[#5A463B] hover:text-[#302112] hover:bg-[#E5DAD9] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* BODY CONTENT */}
          <div className="p-6 sm:p-7 space-y-6 flex-1">
            {/* USER PROFILE INFO CARD */}
            <div className="bg-[#E5DAD9]/80 backdrop-blur-md rounded-[28px] p-5 border border-white/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#302112] uppercase tracking-wider">
                  Account Details
                </h4>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    user.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {user.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {user.email && (
                  <div className="flex items-center gap-2 text-[#5A463B] font-semibold">
                    <Mail className="w-3.5 h-3.5 text-[#92798B]" />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-2 text-[#5A463B] font-semibold">
                    <Phone className="w-3.5 h-3.5 text-[#92798B]" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[#5A463B] font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-[#92798B]" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-[#5A463B] font-semibold">
                  <Shield className="w-3.5 h-3.5 text-[#92798B]" />
                  <span>Role: {user.role}</span>
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSendMessage(user.id)}
                  className="px-3.5 py-2 rounded-xl bg-[#92798B] hover:bg-[#5A463B] text-[#F3EAE2] text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Notification</span>
                </button>

                <button
                  type="button"
                  onClick={() => onResetPassword(user)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F3EAE2] text-[#302112] text-xs font-black border border-white/80 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#92798B]" />
                  <span>Reset Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleStatus(user)}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-[#F3EAE2] text-[#302112] text-xs font-black border border-white/80 shadow-2xs cursor-pointer transition-all"
                >
                  {user.status === 'ACTIVE' ? 'Disable Account' : 'Activate Account'}
                </button>
              </div>
            </div>

            {/* UPLOAD PROGRESS */}
            <div className="bg-[#E5DAD9]/80 backdrop-blur-md rounded-[28px] p-5 border border-white/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#302112] uppercase tracking-wider">
                  Upload Compliance Progress
                </h4>
                <span className="text-xs font-black text-[#92798B] bg-[#F3EAE2] px-2.5 py-0.5 rounded-full border border-white/80 shadow-2xs">
                  {percentage}% Completed
                </span>
              </div>

              <div className="w-full bg-[#F3EAE2] h-2.5 rounded-full overflow-hidden border border-white/60">
                <div
                  className="bg-[#92798B] h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2.5 rounded-xl bg-[#F3EAE2] border border-white/80 shadow-2xs">
                  <span className="text-[10px] font-black text-[#5A463B] block">Sales File</span>
                  <span className="text-xs font-black text-[#302112]">{salesFiles.length} file(s)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F3EAE2] border border-white/80 shadow-2xs">
                  <span className="text-[10px] font-black text-[#5A463B] block">Purchase File</span>
                  <span className="text-xs font-black text-[#302112]">{purchaseFiles.length} file(s)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F3EAE2] border border-white/80 shadow-2xs">
                  <span className="text-[10px] font-black text-[#5A463B] block">Bank Statement</span>
                  <span className="text-xs font-black text-[#302112]">{bankFiles.length} file(s)</span>
                </div>
              </div>
            </div>

            {/* USER DOCUMENTS LIST */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-[#302112] uppercase tracking-wider">
                Uploaded Dossier Documents ({files.length})
              </h4>

              {loadingFiles ? (
                <div className="p-8 text-center text-xs text-[#5A463B] font-semibold bg-white/80 rounded-2xl border border-white/80">
                  Loading user documents...
                </div>
              ) : files.length === 0 ? (
                <div className="p-8 text-center bg-white/80 rounded-2xl border border-dashed border-white/80 text-xs text-[#5A463B] font-semibold">
                  No documents uploaded by this user yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 bg-white/90 rounded-2xl border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#E5DAD9] text-[#92798B] border border-white/80">
                            {file.fileType}
                          </span>
                          <span className="text-[10px] font-bold text-[#5A463B]">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <p className="text-xs font-black text-[#302112] truncate" title={file.originalName}>
                          {file.originalName}
                        </p>
                        <p className="text-[10px] text-[#5A463B]/70 font-semibold">
                          {new Date(file.uploadedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => onInspectFile(file)}
                          className="px-2.5 py-1.5 bg-[#F3EAE2] hover:bg-[#E5DAD9] text-[#302112] text-xs font-black rounded-xl border border-white/80 flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                          title="Inspect AI OCR Data"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#92798B]" />
                          <span>Inspect</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadFile(file)}
                          className="p-2 bg-[#92798B] hover:bg-[#5A463B] text-[#F3EAE2] rounded-xl shadow-2xs cursor-pointer transition-all"
                          title="Download File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 bg-white hover:bg-rose-50 text-[#5A463B] hover:text-rose-700 rounded-xl border border-white/80 cursor-pointer transition-all shadow-2xs"
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
          <div className="p-4 sm:p-5 border-t border-white/60 bg-[#F3EAE2] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#E5DAD9] text-[#302112] text-xs font-black hover:bg-white border border-white/80 cursor-pointer shadow-2xs"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
