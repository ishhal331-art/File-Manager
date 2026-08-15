import React, { useState, useEffect } from 'react';
import { User, UploadedFile } from '../../types';
import { api } from '../../lib/api';
import {
  Bell,
  Search,
  CheckSquare,
  Sparkles,
  LogOut,
  X,
  UploadCloud,
  LayoutDashboard,
  Clock,
  User as UserIcon,
  ShieldCheck,
  Building2,
  FolderOpen,
} from 'lucide-react';
import { SidebarNav, NavTab } from './SidebarNav';
import { UploadCard } from './UploadCard';
import { UploadIntelligenceOverview } from './UploadIntelligenceOverview';
import { SmartStatusCard } from './SmartStatusCard';
import { CentralUploadZone } from './CentralUploadZone';
import { AIDocumentIntelligenceCard } from './AIDocumentIntelligenceCard';
import { RecentActivityTimeline } from './RecentActivityTimeline';
import { FileViewerModal } from './FileViewerModal';
import { NotificationsTab } from './NotificationsTab';
import { ProfileTab } from './ProfileTab';
import { GoogleTasksTab } from './GoogleTasksTab';
import { AnalyticsAndGraphsView } from './AnalyticsAndGraphsView';
import { AIAdvisorHub } from './AIAdvisorHub';
import { InteractiveDashboardHub } from './InteractiveDashboardHub';
import { HRALogo } from '../HRALogo';
import { BarChart3 } from 'lucide-react';

interface Props {
  currentUser: User;
  onLogout: () => void;
}

export const ClientDashboard: React.FC<Props> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifCount, setNotifCount] = useState(0);
  const [selectedFileForViewer, setSelectedFileForViewer] = useState<UploadedFile | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING' | 'PROCESSING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch initial user data
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [filesRes, notifRes] = await Promise.all([
          api.getFiles(),
          api.getNotifications(),
        ]);
        if (mounted) {
          setFiles(filesRes.files || []);
          const unread = (notifRes.notifications || []).filter((n: any) => !n.isRead).length;
          setNotifCount(unread);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const salesFiles = files.filter((f) => f.fileType === 'SALES');
  const purchaseFiles = files.filter((f) => f.fileType === 'PURCHASE');
  const bankFiles = files.filter((f) => f.fileType === 'BANK_STATEMENT');
  const additionalFiles = files.filter((f) => f.fileType === 'ADDITIONAL');

  // Handle browser back button
  useEffect(() => {
    const handleBackButton = (e: Event) => {
      if (selectedFileForViewer) {
        e.preventDefault();
        setSelectedFileForViewer(null);
      } else if (activeTab !== 'dashboard') {
        e.preventDefault();
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('app:backbutton', handleBackButton);
    return () => window.removeEventListener('app:backbutton', handleBackButton);
  }, [selectedFileForViewer, activeTab]);

  const handleUploadSuccess = (newFile: UploadedFile) => {
    setFiles((prev) => [newFile, ...prev]);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to remove this uploaded file from your dossier?')) return;
    try {
      await api.deleteFile(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err: any) {
      alert(`Delete error: ${err.message || 'Could not delete file.'}`);
    }
  };

  const handleSavedFile = (updated: UploadedFile) => {
    setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  return (
    <div 
      className="min-h-screen bg-[#D0BEC7] text-[#302112] font-sans selection:bg-[#92798B]/30 selection:text-[#302112] p-3 sm:p-5 lg:p-6 flex gap-6"
      id="client-portal-root"
    >
      {/* DESKTOP SIDEBAR NAVIGATION (NO DOCS TAB, REFINED PALETTE) */}
      <SidebarNav
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onLogout={onLogout}
        notifCount={notifCount}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col space-y-5 pb-32 sm:pb-36">
        {/* TOP LIQUID GLASS HEADER */}
        <header
          className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[28px] p-4 sm:p-5 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col md:flex-row md:items-center justify-between gap-4"
          id="top-portal-header"
        >
          {/* HELLO GREETING & HRA BRANDING */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#92798B] to-[#5A463B] text-[#F3EAE2] flex items-center justify-center font-black text-lg shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 text-[#CBAF87]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#302112] tracking-tight leading-tight truncate">
                  HELLO, {currentUser.fullName.toUpperCase()}!
                </h1>
                <span className="hidden sm:inline px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E5DAD9] text-[#92798B] border border-white/80">
                  HRA Accountant
                </span>
              </div>
              <p className="text-xs text-[#5A463B] font-semibold truncate">
                Fiscal Ingestion, AI OCR Compliance & Dossier Manager
              </p>
            </div>
          </div>

          {/* SEARCH BAR & QUICK ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-[#92798B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-bold text-[#302112] bg-[#E5DAD9] border border-white/80 rounded-full focus:outline-none focus:border-[#92798B] focus:bg-white placeholder:text-[#5A463B]/60 transition-all shadow-inner"
                id="header-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A463B] hover:text-[#302112]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* MESSAGES / NOTIFICATIONS */}
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`p-2.5 sm:px-3 sm:py-2 min-h-[44px] min-w-[44px] rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs relative active:scale-95 shrink-0 ${
                activeTab === 'notifications'
                  ? 'bg-[#92798B] text-[#FAF6F0] border-[#92798B]'
                  : 'bg-[#E5DAD9] text-[#302112] border-white/80 hover:bg-white'
              }`}
              title="Notifications & Messages"
              id="btn-header-notifications"
            >
              <Bell className="w-4 h-4 text-[#FAF6F0] p-0.5 rounded-md bg-[#92798B]" />
              <span className="hidden md:inline">Messages</span>
              {notifCount > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] font-black bg-rose-600 text-white rounded-full">
                  {notifCount}
                </span>
              )}
            </button>

            {/* LOGOUT BUTTON FOR MOBILE / TABLET */}
            <button
              type="button"
              onClick={onLogout}
              className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] rounded-2xl bg-[#E5DAD9] hover:bg-rose-50 text-rose-700 border border-white/80 transition-all cursor-pointer shadow-2xs flex items-center justify-center active:scale-95 shrink-0"
              title="Log out"
              id="btn-header-logout"
            >
              <LogOut className="w-4 h-4 text-[#FAF6F0] p-0.5 rounded-md bg-[#92798B]" />
            </button>
          </div>
        </header>

        {/* TAB 1: INTERACTIVE DASHBOARD HUB (CLEANED UP - UPLOADS MOVED TO DEDICATED TAB) */}
        {activeTab === 'dashboard' && (
          <InteractiveDashboardHub
            currentUser={currentUser}
            files={files}
            onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
            onInspectFile={(file) => setSelectedFileForViewer(file)}
          />
        )}

        {/* TAB 2: CENTRAL UPLOAD CENTER (SALES, PURCHASE, BANK, OPTIONAL ADDITIONAL) */}
        {activeTab === 'upload' && (
          <div className="space-y-6 animate-fade-in" id="upload-center-tab-view">
            {/* 1. UPLOAD INTELLIGENCE OVERVIEW */}
            <UploadIntelligenceOverview
              salesUploaded={salesFiles.length > 0}
              purchaseUploaded={purchaseFiles.length > 0}
              bankUploaded={bankFiles.length > 0}
              totalFilesCount={files.length}
              activeFilter={statusFilter}
              onFilterClick={(type) => setStatusFilter(type)}
            />

            {/* 2. CENTRAL INGESTION ZONE + SMART STATUS SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CentralUploadZone
                  onUploadSuccess={handleUploadSuccess}
                  onInspectFile={(file) => setSelectedFileForViewer(file)}
                />
              </div>
              <div className="lg:col-span-1">
                <SmartStatusCard
                  salesUploaded={salesFiles.length > 0}
                  purchaseUploaded={purchaseFiles.length > 0}
                  bankUploaded={bankFiles.length > 0}
                  additionalUploaded={additionalFiles.length > 0}
                  additionalCount={additionalFiles.length}
                />
              </div>
            </div>

            {/* 3. FOUR UPLOAD CARDS GRID */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#302112] tracking-tight flex items-center gap-2">
                    <span>Target Dossier Vaults</span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#E5DAD9] text-[#92798B] border border-white/80">
                      3 Required + 1 Optional
                    </span>
                  </h3>
                  <p className="text-xs text-[#5A463B] font-semibold">
                    Upload documents directly into specific dossier vaults or manage existing uploads.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" id="upload-cards-grid">
                {/* 1. SALES FILE (REQUIRED) */}
                <UploadCard
                  fileType="SALES"
                  title="1. Sales File"
                  description="Upload revenue invoices, sales ledgers, customer receipts, or trade invoices."
                  badgeNumber="01"
                  categoryFiles={salesFiles}
                  onUploadSuccess={handleUploadSuccess}
                  onViewFile={(file) => setSelectedFileForViewer(file)}
                  onDeleteFile={handleDeleteFile}
                />

                {/* 2. PURCHASE FILE (REQUIRED) */}
                <UploadCard
                  fileType="PURCHASE"
                  title="2. Purchase File"
                  description="Upload vendor bills, supplier accounts, operational expenses, or purchase orders."
                  badgeNumber="02"
                  categoryFiles={purchaseFiles}
                  onUploadSuccess={handleUploadSuccess}
                  onViewFile={(file) => setSelectedFileForViewer(file)}
                  onDeleteFile={handleDeleteFile}
                />

                {/* 3. BANK STATEMENT (REQUIRED) */}
                <UploadCard
                  fileType="BANK_STATEMENT"
                  title="3. Bank Statement"
                  description="Upload official monthly bank statements, credit logs, account balances, or deposit records."
                  badgeNumber="03"
                  categoryFiles={bankFiles}
                  onUploadSuccess={handleUploadSuccess}
                  onViewFile={(file) => setSelectedFileForViewer(file)}
                  onDeleteFile={handleDeleteFile}
                />

                {/* 4. ADDITIONAL FILES (OPTIONAL) */}
                <UploadCard
                  fileType="ADDITIONAL"
                  title="4. Additional Files (Optional)"
                  description="Upload supporting records: VAT certificates, trade licenses, contracts, payroll, or misc."
                  badgeNumber="04"
                  categoryFiles={additionalFiles}
                  onUploadSuccess={handleUploadSuccess}
                  onViewFile={(file) => setSelectedFileForViewer(file)}
                  onDeleteFile={handleDeleteFile}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GRAPHS & VISUAL ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in" id="analytics-tab-view">
            <AnalyticsAndGraphsView
              currentUser={currentUser}
              users={[currentUser]}
              userProgressList={[]}
              files={files}
              onInspectFile={(file) => setSelectedFileForViewer(file)}
            />
          </div>
        )}

        {/* TAB 4: AI OCR & FISCAL ADVISOR */}
        {activeTab === 'ai' && (
          <div className="space-y-8 animate-fade-in" id="ai-insights-tab-view">
            <AIAdvisorHub
              currentUser={currentUser}
              users={[currentUser]}
              files={files}
              onReviewFile={(file) => setSelectedFileForViewer(file)}
            />
            <AIDocumentIntelligenceCard
              files={files}
              onReviewExtractedData={(file) => setSelectedFileForViewer(file)}
            />
          </div>
        )}

        {/* TAB 4: GOOGLE TASKS & PERSONAL NOTES */}
        {activeTab === 'tasks' && (
          <div className="animate-fade-in" id="tasks-tab-view">
            <GoogleTasksTab currentUser={currentUser} />
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS & MESSAGES */}
        {activeTab === 'notifications' && (
          <div className="animate-fade-in" id="notifications-tab-view">
            <NotificationsTab
              currentUser={currentUser}
              onNotificationsViewed={() => {
                api.getNotifications().then((res) => {
                  const unread = (res.notifications || []).filter((n: any) => !n.isRead).length;
                  setNotifCount(unread);
                });
              }}
            />
          </div>
        )}

        {/* TAB 6: ACTIVITY AUDIT LOG */}
        {activeTab === 'activity' && (
          <div className="animate-fade-in" id="activity-tab-view">
            <RecentActivityTimeline
              files={files}
              onInspectFile={(file) => setSelectedFileForViewer(file)}
              onOpenNotifications={() => setActiveTab('notifications')}
            />
          </div>
        )}

        {/* TAB 7: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in" id="profile-tab-view">
            <ProfileTab currentUser={currentUser} onUserUpdated={() => {}} />
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (FIXED ON SMARTPHONES & TABLETS - NO DOCS TAB) */}
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#F3EAE2]/95 backdrop-blur-xl border-t border-white/80 px-2 py-2 flex items-center justify-around shadow-[0_-8px_25px_rgba(48,33,18,0.12)]"
        id="mobile-bottom-nav"
      >
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'dashboard' ? 'text-[#302112] font-black bg-[#E5DAD9]' : 'text-[#5A463B] font-semibold'
          }`}
          id="mobile-nav-home"
        >
          <LayoutDashboard className="w-5 h-5 text-[#92798B]" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'upload' ? 'text-[#302112] font-black bg-[#E5DAD9]' : 'text-[#5A463B] font-semibold'
          }`}
          id="mobile-nav-upload"
        >
          <UploadCloud className="w-5 h-5 text-[#92798B]" />
          <span className="text-[10px]">Upload</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'ai' ? 'text-[#302112] font-black bg-[#E5DAD9]' : 'text-[#5A463B] font-semibold'
          }`}
          id="mobile-nav-ai"
        >
          <Sparkles className="w-5 h-5 text-[#CBAF87]" />
          <span className="text-[10px]">AI OCR</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'tasks' ? 'text-[#302112] font-black bg-[#E5DAD9]' : 'text-[#5A463B] font-semibold'
          }`}
          id="mobile-nav-tasks"
        >
          <CheckSquare className="w-5 h-5 text-[#92798B]" />
          <span className="text-[10px]">Tasks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all cursor-pointer relative ${
            activeTab === 'notifications' ? 'text-[#302112] font-black bg-[#E5DAD9]' : 'text-[#5A463B] font-semibold'
          }`}
          id="mobile-nav-alerts"
        >
          <Bell className="w-5 h-5 text-[#92798B]" />
          <span className="text-[10px]">Alerts</span>
          {notifCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-600" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'profile' ? 'text-[#302112] font-black bg-[#E5DAD9]' : 'text-[#5A463B] font-semibold'
          }`}
          id="mobile-nav-profile"
        >
          <UserIcon className="w-5 h-5 text-[#92798B]" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>

      {/* FILE INSPECTOR & AI OCR MODAL */}
      {selectedFileForViewer && (
        <FileViewerModal
          file={selectedFileForViewer}
          onClose={() => setSelectedFileForViewer(null)}
          onSaved={handleSavedFile}
        />
      )}
    </div>
  );
};
