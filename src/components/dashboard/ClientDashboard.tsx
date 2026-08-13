import React, { useState, useEffect } from 'react';
import { User, UploadedFile } from '../../types';
import { api } from '../../lib/api';
import { ProgressWheel } from './ProgressWheel';
import { UploadCard } from './UploadCard';
import { FileViewerModal } from './FileViewerModal';
import { NotificationsTab } from './NotificationsTab';
import { ProfileTab } from './ProfileTab';
import { LayoutDashboard, Bell, User as UserIcon, LogOut, Sparkles } from 'lucide-react';

interface Props {
  currentUser: User;
  onLogout: () => void;
}

export const ClientDashboard: React.FC<Props> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'notifications' | 'profile'>('dashboard');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [selectedFileForViewer, setSelectedFileForViewer] = useState<UploadedFile | null>(null);
  const [notifCount, setNotifCount] = useState<number>(0);

  useEffect(() => {
    loadUserFiles();
    loadNotifCount();
  }, []);

  const loadNotifCount = async () => {
    try {
      const res = await api.getNotifications();
      setNotifCount(res.notifications.length);
    } catch (err) {
      console.error('Failed to load notification count:', err);
    }
  };

  const loadUserFiles = async () => {
    try {
      const res = await api.getFiles();
      setFiles(res.files);
    } catch (err) {
      console.error('Failed to load user files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const salesFile = files.find((f) => f.fileType === 'SALES');
  const purchaseFile = files.find((f) => f.fileType === 'PURCHASE');
  const bankFile = files.find((f) => f.fileType === 'BANK_STATEMENT');

  const handleUploadSuccess = (newFile: UploadedFile) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.fileType !== newFile.fileType);
      return [...filtered, newFile];
    });
  };

  const handleSavedFile = (updated: UploadedFile) => {
    setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  return (
    <div className="min-h-screen bg-[#F4F0FC] text-slate-800 font-sans selection:bg-[#8364ED]/20 selection:text-[#8364ED] overflow-x-hidden">
      {/* TOP CLAY HEADER */}
      <header className="sticky top-0 z-30 bg-[#FCFBF8]/95 backdrop-blur-md border-b border-[#F0ECE1] shadow-[0_10px_25px_rgba(110,85,190,0.05)] py-3 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#8364ED] to-[#A58DF5] text-white flex items-center justify-center font-extrabold text-lg shadow-md shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight truncate" id="portal-title">
                Files Manager
              </h1>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 truncate">
                AI Ingestion & Compliance Engine
              </p>
            </div>
          </div>

          {/* USER BADGE, MESSAGES BUTTON & LOGOUT */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('notifications')}
              className="px-3 py-1.5 rounded-2xl bg-[#F0EBFA] hover:bg-[#E2D6FA] text-[#8364ED] text-xs font-extrabold flex items-center gap-1.5 border border-[#E2D8F7] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              title="Click to view Messages and Notifications"
              id="btn-client-header-messages"
            >
              <Bell className="w-3.5 h-3.5 text-[#8364ED]" />
              <span>{notifCount} Messages</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#F0EBFA] border border-[#E2D8F7]">
              <div className="w-6 h-6 rounded-xl bg-[#8364ED] text-white font-bold text-xs flex items-center justify-center">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.fullName}</p>
                <p className="text-[10px] font-semibold text-[#8364ED]">{currentUser.role}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 sm:p-2.5 rounded-2xl bg-[#F5F0E6] hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-all border border-[#EAE4D6] hover:border-rose-200 cursor-pointer shadow-2xs"
              title="Sign Out"
              id="btn-client-logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER CONTENT WITH BOTTOM PADDING */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-36 sm:pb-44 space-y-6 sm:space-y-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in" id="client-dashboard-tab-view">
            {/* PROGRESS WHEEL SECTION */}
            <ProgressWheel
              salesUploaded={!!salesFile}
              purchaseUploaded={!!purchaseFile}
              bankUploaded={!!bankFile}
            />

            {/* THREE FILE UPLOAD CARDS */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">
                    Required Financial Ingestion
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload documents in Excel, Word, PDF, or JPG/Picture format. AI OCR will parse image formats into editable data.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* 1. SALES FILE */}
                <UploadCard
                  fileType="SALES"
                  title="1. Sales File"
                  description="Upload revenue invoices, sales ledger, or customer transaction lists."
                  badgeNumber="01"
                  currentFile={salesFile}
                  onUploadSuccess={handleUploadSuccess}
                  onViewFile={(file) => setSelectedFileForViewer(file)}
                />

                {/* 2. PURCHASE FILE */}
                <UploadCard
                  fileType="PURCHASE"
                  title="2. Purchase File"
                  description="Upload vendor bills, supplier accounts, or operating expense receipts."
                  badgeNumber="02"
                  currentFile={purchaseFile}
                  onUploadSuccess={handleUploadSuccess}
                  onViewFile={(file) => setSelectedFileForViewer(file)}
                />

                {/* 3. BANK STATEMENT */}
                <UploadCard
                  fileType="BANK_STATEMENT"
                  title="3. Bank Statement"
                  description="Upload official monthly bank statements, credit logs, or deposit records."
                  badgeNumber="03"
                  currentFile={bankFile}
                  onUploadSuccess={handleUploadSuccess}
                  onViewFile={(file) => setSelectedFileForViewer(file)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && <NotificationsTab currentUser={currentUser} />}

        {activeTab === 'profile' && <ProfileTab currentUser={currentUser} />}
      </main>

      {/* FILE VIEWER & AI OCR DATA EDIT MODAL */}
      <FileViewerModal
        file={selectedFileForViewer}
        onClose={() => setSelectedFileForViewer(null)}
        onSaved={handleSavedFile}
      />

      {/* FIXED FLOATING BOTTOM NAVIGATION BAR */}
      <nav 
        className="fixed bottom-2 sm:bottom-4 left-0 right-0 z-40 px-3 py-1 pointer-events-none flex items-center justify-center"
        id="client-bottom-nav-bar"
      >
        <div className="pointer-events-auto max-w-md w-[calc(100%-1rem)] sm:w-full bg-[#FCFBF8]/95 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-[#EAE3D2] shadow-[0_12px_36px_rgba(110,85,190,0.25)] flex items-center justify-between gap-0.5 sm:gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-3 rounded-full text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white shadow-[0_4px_14px_rgba(131,100,237,0.35)] scale-[1.02]'
                : 'text-slate-600 hover:text-[#8364ED] hover:bg-white/60'
            }`}
            id="tab-btn-dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-3 rounded-full text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white shadow-[0_4px_14px_rgba(131,100,237,0.35)] scale-[1.02]'
                : 'text-slate-600 hover:text-[#8364ED] hover:bg-white/60'
            }`}
            id="tab-btn-notifications"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-3 rounded-full text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white shadow-[0_4px_14px_rgba(131,100,237,0.35)] scale-[1.02]'
                : 'text-slate-600 hover:text-[#8364ED] hover:bg-white/60'
            }`}
            id="tab-btn-profile"
          >
            <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
