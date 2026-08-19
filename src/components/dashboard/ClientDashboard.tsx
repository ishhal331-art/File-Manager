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
import { LiveBackground } from '../common/LiveBackground';
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
          const unread = (notifRes.notifications || []).filter(
            (n: any) => !n.read && (n.targetUserId === 'ALL' || n.targetUserId === currentUser.id)
          ).length;
          setNotifCount(unread);
        }
      } catch (err) {
        console.error('Failed to load user portal data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [currentUser.id]);

  // Derived categorized lists
  const salesFiles = files.filter(
    (f) => f.fileType === 'SALES' || (f as any).type === 'SALES_INVOICE' || (f as any).type === 'SALES'
  );
  const purchaseFiles = files.filter(
    (f) => f.fileType === 'PURCHASE' || (f as any).type === 'PURCHASE_RECEIPT' || (f as any).type === 'PURCHASE'
  );
  const bankFiles = files.filter(
    (f) => f.fileType === 'BANK_STATEMENT' || (f as any).type === 'BANK_STATEMENT'
  );
  const additionalFiles = files.filter(
    (f) => f.fileType === 'ADDITIONAL' || (f as any).type === 'ADDITIONAL_DOC' || (f as any).type === 'ADDITIONAL'
  );

  // Filtered files for search
  const filteredFiles = files.filter((f) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const typeStr = (f.fileType || (f as any).type || '').toLowerCase();
    return (
      f.originalName.toLowerCase().includes(q) ||
      (f.summary && f.summary.toLowerCase().includes(q)) ||
      typeStr.includes(q)
    );
  });

  useEffect(() => {
    if (selectedFileForViewer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
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
      className="min-h-screen relative bg-[#0E1120] text-[#AEB8CC] font-sans selection:bg-[#22D39F]/30 selection:text-[#F0F4FF] p-3 sm:p-5 lg:p-6 flex gap-6"
      id="client-portal-root"
    >
      {/* LIVE INTERACTIVE BACKGROUND */}
      <LiveBackground />

      {/* DESKTOP SIDEBAR NAVIGATION */}
      <SidebarNav
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onLogout={onLogout}
        notifCount={notifCount}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col space-y-5 pb-28 sm:pb-32 relative z-10">
        {/* TOP HEADER */}
        <header
          className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[28px] p-4 sm:p-5 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] flex flex-col md:flex-row md:items-center justify-between gap-4"
          id="top-portal-header"
        >
          {/* HELLO GREETING & HRA BRANDING */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#102D30] text-[#22D39F] flex items-center justify-center font-black text-lg shadow-inner border border-[#22D39F]/30 shrink-0">
              <Sparkles className="w-5 h-5 text-[#22D39F]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#F0F4FF] tracking-tight leading-tight truncate">
                  HELLO, {currentUser.fullName.toUpperCase()}!
                </h1>
                <span className="hidden sm:inline px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30">
                  HRA Accountant
                </span>
              </div>
              <p className="text-xs text-[#7F8BA3] font-medium truncate">
                Fiscal Ingestion, AI OCR Compliance & Dossier Manager
              </p>
            </div>
          </div>

          {/* SEARCH BAR & QUICK ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-[#7F8BA3] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-bold text-[#F0F4FF] bg-[#0B0F18] border border-[#263047] rounded-full focus:outline-none focus:border-[#22D39F] focus:ring-2 focus:ring-[#22D39F]/20 placeholder:text-[#7F8BA3] transition-all shadow-inner"
                id="header-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7F8BA3] hover:text-[#F0F4FF]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* MESSAGES / NOTIFICATIONS */}
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`p-2.5 sm:px-3 sm:py-2 min-h-[44px] min-w-[44px] rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-inner relative active:scale-95 shrink-0 ${
                activeTab === 'notifications'
                  ? 'bg-[#22D39F] text-[#0E1120] border-[#22D39F]'
                  : 'bg-[#0B0F18] text-[#AEB8CC] border-[#263047] hover:border-[#22D39F] hover:text-[#F0F4FF]'
              }`}
              title="Notifications & Messages"
              id="btn-header-notifications"
            >
              <Bell className="w-4 h-4" />
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
              className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] rounded-2xl bg-[#0B0F18] hover:bg-rose-950/40 text-rose-400 border border-[#263047] hover:border-rose-700 transition-all cursor-pointer shadow-inner flex items-center justify-center active:scale-95 shrink-0"
              title="Log out"
              id="btn-header-logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* TAB 1: INTERACTIVE DASHBOARD HUB */}
        {activeTab === 'dashboard' && (
          <InteractiveDashboardHub
            currentUser={currentUser}
            files={files}
            onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
            onInspectFile={(file) => setSelectedFileForViewer(file)}
          />
        )}

        {/* TAB 2: CENTRAL UPLOAD CENTER */}
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
                  additionalCount={additionalFiles.length}
                />
              </div>
            </div>

            {/* 3. DOSSIER UPLOAD CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
              <UploadCard
                title="Sales Invoices"
                description="Client bills, outgoing invoices, point-of-sale logs & tax receipts."
                type="SALES_INVOICE"
                required={true}
                files={salesFiles}
                onUploadSuccess={handleUploadSuccess}
                onDeleteFile={handleDeleteFile}
                onInspectFile={(file) => setSelectedFileForViewer(file)}
                badgeColor="border-[#22D39F] text-[#22D39F]"
              />
              <UploadCard
                title="Purchase Receipts"
                description="Vendor bills, operational expenses, inventory acquisitions & supplies."
                type="PURCHASE_RECEIPT"
                required={true}
                files={purchaseFiles}
                onUploadSuccess={handleUploadSuccess}
                onDeleteFile={handleDeleteFile}
                onInspectFile={(file) => setSelectedFileForViewer(file)}
                badgeColor="border-[#22D39F] text-[#22D39F]"
              />
              <UploadCard
                title="Bank Statements"
                description="Monthly transaction logs, credit reconciliation & account summaries."
                type="BANK_STATEMENT"
                required={true}
                files={bankFiles}
                onUploadSuccess={handleUploadSuccess}
                onDeleteFile={handleDeleteFile}
                onInspectFile={(file) => setSelectedFileForViewer(file)}
                badgeColor="border-[#22D39F] text-[#22D39F]"
              />
              <UploadCard
                title="Additional Documents"
                description="Tax filings, legal agreements, audits & auxiliary financial docs."
                type="ADDITIONAL_DOC"
                required={false}
                files={additionalFiles}
                onUploadSuccess={handleUploadSuccess}
                onDeleteFile={handleDeleteFile}
                onInspectFile={(file) => setSelectedFileForViewer(file)}
                badgeColor="border-[#7F8BA3] text-[#AEB8CC]"
              />
            </div>
          </div>
        )}

        {/* TAB 3: GRAPHS & ANALYTICS VIEW */}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in" id="analytics-tab-view">
            <AnalyticsAndGraphsView
              files={files}
              onInspectFile={(file) => setSelectedFileForViewer(file)}
            />
          </div>
        )}

        {/* TAB 4: AI ADVISOR & OCR HUB */}
        {activeTab === 'ai' && (
          <div className="animate-fade-in" id="ai-advisor-tab-view">
            <AIAdvisorHub
              files={files}
              currentUser={currentUser}
              onInspectFile={(file) => setSelectedFileForViewer(file)}
            />
          </div>
        )}

        {/* TAB 5: GOOGLE TASKS & NOTES */}
        {activeTab === 'tasks' && (
          <div className="animate-fade-in" id="tasks-tab-view">
            <GoogleTasksTab currentUser={currentUser} />
          </div>
        )}

        {/* TAB 6: NOTIFICATIONS & MESSAGES */}
        {activeTab === 'notifications' && (
          <div className="animate-fade-in" id="notifications-tab-view">
            <NotificationsTab currentUser={currentUser} />
          </div>
        )}

        {/* TAB 7: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in" id="profile-tab-view">
            <ProfileTab currentUser={currentUser} />
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div
        className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-[#161D2F]/95 backdrop-blur-2xl rounded-2xl p-2 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.9)] flex items-center justify-around"
        id="mobile-bottom-nav"
      >
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] justify-center ${
            activeTab === 'dashboard' ? 'text-[#22D39F] font-black bg-[#102D30]' : 'text-[#7F8BA3] font-semibold'
          }`}
          id="mobile-nav-home"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] justify-center ${
            activeTab === 'upload' ? 'text-[#22D39F] font-black bg-[#102D30]' : 'text-[#7F8BA3] font-semibold'
          }`}
          id="mobile-nav-upload"
        >
          <UploadCloud className="w-5 h-5" />
          <span className="text-[10px]">Upload</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] justify-center ${
            activeTab === 'ai' ? 'text-[#22D39F] font-black bg-[#102D30]' : 'text-[#7F8BA3] font-semibold'
          }`}
          id="mobile-nav-ai"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">AI OCR</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] justify-center ${
            activeTab === 'tasks' ? 'text-[#22D39F] font-black bg-[#102D30]' : 'text-[#7F8BA3] font-semibold'
          }`}
          id="mobile-nav-tasks"
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px]">Tasks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer relative min-h-[44px] min-w-[44px] justify-center ${
            activeTab === 'notifications' ? 'text-[#22D39F] font-black bg-[#102D30]' : 'text-[#7F8BA3] font-semibold'
          }`}
          id="mobile-nav-alerts"
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px]">Alerts</span>
          {notifCount > 0 && (
            <span className="absolute top-1.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] justify-center ${
            activeTab === 'profile' ? 'text-[#22D39F] font-black bg-[#102D30]' : 'text-[#7F8BA3] font-semibold'
          }`}
          id="mobile-nav-profile"
        >
          <UserIcon className="w-5 h-5" />
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
