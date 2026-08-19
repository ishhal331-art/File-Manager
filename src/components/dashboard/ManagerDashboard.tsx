import React, { useState, useEffect } from 'react';
import { User, UploadedFile, UserUploadProgress } from '../../types';
import { api } from '../../lib/api';
import { FileViewerModal } from './FileViewerModal';
import { NotificationsTab } from './NotificationsTab';
import { ProfileTab } from './ProfileTab';
import { GoogleTasksTab } from './GoogleTasksTab';
import { AnalyticsAndGraphsView } from './AnalyticsAndGraphsView';
import { AIAdvisorHub } from './AIAdvisorHub';
import { AdminUserDetailDrawer } from './AdminUserDetailDrawer';
import { HRALogo } from '../HRALogo';
import { LiveBackground } from '../common/LiveBackground';
import { AttachmentPicker, PendingAttachment } from '../common/AttachmentPicker';
import {
  Users,
  Eye,
  LogOut,
  Bell,
  Search,
  X,
  UserPlus,
  Mail,
  Phone,
  Hash,
  Download,
  Trash2,
  Calendar,
  Clock,
  FileSpreadsheet,
  CheckSquare,
  Sparkles,
  FolderOpen,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';

interface Props {
  currentUser: User;
  onLogout: () => void;
}

export const ManagerDashboard: React.FC<Props> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'ai' | 'directory' | 'tasks' | 'notifications' | 'profile'>('users');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userProgressList, setUserProgressList] = useState<UserUploadProgress[]>([]);
  const [allUploadedFiles, setAllUploadedFiles] = useState<UploadedFile[]>([]);
  const [fileFilterType, setFileFilterType] = useState<string>('ALL');
  const [fileFilterUserId, setFileFilterUserId] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [notifCount, setNotifCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected User for Review Drawer
  const [selectedUserForReview, setSelectedUserForReview] = useState<User | null>(null);
  const [selectedFileForViewer, setSelectedFileForViewer] = useState<UploadedFile | null>(null);
  const [selectedFileIdsForDownload, setSelectedFileIdsForDownload] = useState<string[]>([]);

  // Add User Modal State (Manager can add USER accounts)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserSuccess, setAddUserSuccess] = useState<string | null>(null);

  // Send Notification Modal State
  const [showSendNotifModal, setShowSendNotifModal] = useState(false);
  const [notifTargetUserId, setNotifTargetUserId] = useState<string>('ALL');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifAttachments, setNotifAttachments] = useState<PendingAttachment[]>([]);
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);
  const [notifError, setNotifError] = useState<string | null>(null);

  useEffect(() => {
    loadManagerData();
  }, []);

  // Handle browser back button in ManagerDashboard so pressing Back closes modals or returns to tracker
  useEffect(() => {
    const handleBackButton = (e: Event) => {
      if (selectedFileForViewer) {
        e.preventDefault();
        setSelectedFileForViewer(null);
      } else if (selectedUserForReview) {
        e.preventDefault();
        setSelectedUserForReview(null);
      } else if (showAddUserModal) {
        e.preventDefault();
        setShowAddUserModal(false);
      } else if (showSendNotifModal) {
        e.preventDefault();
        setShowSendNotifModal(false);
      } else if (activeTab !== 'users') {
        e.preventDefault();
        setActiveTab('users');
      }
    };

    window.addEventListener('app:backbutton', handleBackButton);
    return () => window.removeEventListener('app:backbutton', handleBackButton);
  }, [
    selectedFileForViewer,
    selectedUserForReview,
    showAddUserModal,
    showSendNotifModal,
    activeTab,
  ]);

  const loadManagerData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.getUsers(),
        api.getUserProgress(),
        api.getFiles(),
        api.getNotifications(),
      ]);

      const usersRes = results[0].status === 'fulfilled' ? results[0].value : { users: [] };
      const progressRes = results[1].status === 'fulfilled' ? results[1].value : { userProgress: [] };
      const filesRes = results[2].status === 'fulfilled' ? results[2].value : { files: [] };
      const notifsRes = results[3].status === 'fulfilled' ? results[3].value : { notifications: [], unreadCount: 0 };

      setAllUsers(usersRes.users || []);
      setUserProgressList(progressRes.userProgress || []);
      setAllUploadedFiles(filesRes.files || []);
      const unread = notifsRes.unreadCount !== undefined
        ? notifsRes.unreadCount
        : (notifsRes.notifications || []).filter((n: any) => !n.readBy || !n.readBy.includes(currentUser.id)).length;
      setNotifCount(unread);
    } catch (err) {
      console.warn('Handled manager data load warning:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(null);
    setAddUserSuccess(null);

    if (newPassword !== newConfirmPassword) {
      setAddUserError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setAddUserError('Password must be at least 6 characters long.');
      return;
    }

    setCreatingUser(true);
    try {
      const res = await api.createUser({
        username: newUsername.trim(),
        password: newPassword,
        confirmPassword: newConfirmPassword,
        role: 'USER',
        fullName: newFullName.trim() || newUsername.trim(),
        status: 'ACTIVE',
      });
      setAddUserSuccess(res.message);
      setNewFullName('');
      setNewUsername('');
      setNewPassword('');
      setNewConfirmPassword('');
      setNewEmail('');
      setNewPhone('');
      setNewEmployeeId('');
      await loadManagerData();
      setTimeout(() => {
        setShowAddUserModal(false);
        setAddUserSuccess(null);
      }, 1200);
    } catch (err: any) {
      setAddUserError(err.message || 'Failed to create user account.');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleSendNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || (!notifMessage.trim() && notifAttachments.length === 0)) return;

    setSendingNotif(true);
    setNotifError(null);
    setNotifSuccess(null);
    try {
      const formatted = notifAttachments.map((a) => ({
        id: a.id,
        name: a.name,
        size: a.size,
        mimeType: a.mimeType,
        url: a.url,
      }));
      await api.createNotification(notifTitle.trim(), notifMessage.trim(), notifTargetUserId, formatted);
      setNotifSuccess('Notification sent successfully with attachments!');
      setNotifTitle('');
      setNotifMessage('');
      setNotifAttachments([]);
      setTimeout(() => {
        setShowSendNotifModal(false);
        setNotifSuccess(null);
      }, 1200);
      await loadManagerData();
    } catch (err: any) {
      setNotifError(err.message || 'Failed to dispatch notification.');
    } finally {
      setSendingNotif(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file from the dossier?')) return;
    try {
      await api.deleteFile(fileId);
      setAllUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
      await loadManagerData();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleDownloadFile = (file: UploadedFile) => {
    if (!file.fileUrl) return;
    const a = document.createElement('a');
    a.href = file.fileUrl;
    a.download = `${file.fileType}_${file.originalName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleSelectFile = (id: string) => {
    if (selectedFileIdsForDownload.includes(id)) {
      setSelectedFileIdsForDownload(selectedFileIdsForDownload.filter((fId) => fId !== id));
    } else {
      setSelectedFileIdsForDownload([...selectedFileIdsForDownload, id]);
    }
  };

  const handleDownloadSelectedFiles = () => {
    if (selectedFileIdsForDownload.length === 0) return;
    const filesToDownload = allUploadedFiles.filter((f) => selectedFileIdsForDownload.includes(f.id));
    filesToDownload.forEach((file, index) => {
      setTimeout(() => {
        handleDownloadFile(file);
      }, index * 300);
    });
  };

  const filteredUsers = allUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  const filteredFiles = allUploadedFiles.filter((file) => {
    const matchesType = fileFilterType === 'ALL' || file.fileType === fileFilterType;
    const matchesUser = fileFilterUserId === 'ALL' || file.userId === fileFilterUserId;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      file.originalName.toLowerCase().includes(q) ||
      (file.summary && file.summary.toLowerCase().includes(q));
    return matchesType && matchesUser && matchesSearch;
  });

  // Global Compliance Stats
  const totalStandardUsers = allUsers.filter((u) => u.role === 'USER').length;
  const compliantDossiersCount = userProgressList.filter(
    (p) => p.salesUploaded && p.purchaseUploaded && p.bankUploaded
  ).length;
  const incompleteDossiersCount = Math.max(0, totalStandardUsers - compliantDossiersCount);

  return (
    <div className="min-h-screen relative bg-[#0E1120] text-[#F0F4FF] font-sans selection:bg-[#22D39F]/30 selection:text-[#F0F4FF] overflow-x-hidden flex">
      {/* LIVE INTERACTIVE BACKGROUND */}
      <LiveBackground />

      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside
        className="w-64 bg-[#161D2F]/90 backdrop-blur-2xl rounded-[32px] p-5 border border-[#263047] shadow-[0_20px_50px_rgba(11,15,24,0.8)] flex flex-col justify-between shrink-0 h-[calc(100vh-2rem)] sticky top-4 m-4 hidden lg:flex"
        id="desktop-manager-sidebar"
      >
        <div className="space-y-5">
          {/* BRAND LOGO */}
          <div className="flex flex-col gap-1 px-1">
            <div className="h-10 w-full flex items-center justify-start">
              <HRALogo className="h-9 w-auto" variant="light" />
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-bold text-[#22D39F] uppercase tracking-wider bg-[#102D30] px-2.5 py-0.5 rounded-full border border-[#22D39F]/30 shadow-inner">
                Manager Console
              </span>
              <span className="text-[10px] font-bold text-[#7F8BA3]">Team Oversight</span>
            </div>
          </div>

          {/* USER PROFILE CHIP */}
          <div className="p-3 rounded-2xl bg-[#0B0F18] border border-[#263047] flex items-center gap-3 shadow-inner">
            <div className="w-9 h-9 rounded-xl bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#F0F4FF] truncate">{currentUser.fullName}</p>
              <span className="text-[10px] font-bold text-[#22D39F] bg-[#102D30] px-2 py-0.5 rounded-md inline-block mt-0.5 border border-[#22D39F]/20">
                MANAGER
              </span>
            </div>
          </div>

          {/* SIDEBAR NAVIGATION ITEMS */}
          <nav className="space-y-1.5" id="manager-sidebar-nav-links">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#22D39F] text-[#0E1120] shadow-[0_6px_18px_rgba(34,211,159,0.35)] scale-[1.02]'
                  : 'text-[#AEB8CC] hover:text-[#F0F4FF] hover:bg-[#0B0F18]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className={`w-4 h-4 ${activeTab === 'users' ? 'text-[#0E1120]' : 'text-[#22D39F]'}`} />
                <span>Users & Compliance</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'users' ? 'bg-[#0E1120] text-[#22D39F]' : 'bg-[#0B0F18] text-[#7F8BA3]'}`}>
                {allUsers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#22D39F] text-[#0E1120] shadow-[0_6px_18px_rgba(34,211,159,0.35)] scale-[1.02]'
                  : 'text-[#AEB8CC] hover:text-[#F0F4FF] hover:bg-[#0B0F18]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-[#0E1120]' : 'text-[#22D39F]'}`} />
                <span>Graphs & Analytics</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'analytics' ? 'bg-[#0E1120] text-[#22D39F]' : 'bg-[#0B0F18] text-[#7F8BA3]'}`}>
                Live
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-[#22D39F] text-[#0E1120] shadow-[0_6px_18px_rgba(34,211,159,0.35)] scale-[1.02]'
                  : 'text-[#AEB8CC] hover:text-[#F0F4FF] hover:bg-[#0B0F18]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className={`w-4 h-4 ${activeTab === 'ai' ? 'text-[#0E1120]' : 'text-[#22D39F]'}`} />
                <span>AI Fiscal Advisor & Q&A</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'ai' ? 'bg-[#0E1120] text-[#22D39F]' : 'bg-[#0B0F18] text-[#7F8BA3]'}`}>
                AI
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-[#22D39F] text-[#0E1120] shadow-[0_6px_18px_rgba(34,211,159,0.35)] scale-[1.02]'
                  : 'text-[#AEB8CC] hover:text-[#F0F4FF] hover:bg-[#0B0F18]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className={`w-4 h-4 ${activeTab === 'directory' ? 'text-[#0E1120]' : 'text-[#22D39F]'}`} />
                <span>All Dossiers Directory</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'directory' ? 'bg-[#0E1120] text-[#22D39F]' : 'bg-[#0B0F18] text-[#7F8BA3]'}`}>
                {allUploadedFiles.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-[#22D39F] text-[#0E1120] shadow-[0_6px_18px_rgba(34,211,159,0.35)] scale-[1.02]'
                  : 'text-[#AEB8CC] hover:text-[#F0F4FF] hover:bg-[#0B0F18]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className={`w-4 h-4 ${activeTab === 'tasks' ? 'text-[#0E1120]' : 'text-[#22D39F]'}`} />
                <span>Google Tasks & Notes</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-[#22D39F] text-[#0E1120] shadow-[0_6px_18px_rgba(34,211,159,0.35)] scale-[1.02]'
                  : 'text-[#AEB8CC] hover:text-[#F0F4FF] hover:bg-[#0B0F18]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-[#0E1120]' : 'text-[#22D39F]'}`} />
                <span>Messages & Alerts</span>
              </div>
              {notifCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-600 text-white">
                  {notifCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#22D39F] text-[#0E1120] shadow-[0_6px_18px_rgba(34,211,159,0.35)] scale-[1.02]'
                  : 'text-[#AEB8CC] hover:text-[#F0F4FF] hover:bg-[#0B0F18]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className={`w-4 h-4 ${activeTab === 'profile' ? 'text-[#0E1120]' : 'text-[#22D39F]'}`} />
                <span>Manager Profile</span>
              </div>
            </button>
          </nav>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="pt-3 border-t border-[#263047]">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#AEB8CC] hover:text-rose-400 hover:bg-[#0B0F18] transition-all cursor-pointer"
            id="btn-manager-sidebar-logout"
          >
            <LogOut className="w-4 h-4 text-[#22D39F]" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 p-3 sm:p-4 md:px-6">
          <div className="bg-[#161D2F]/90 backdrop-blur-2xl rounded-[28px] p-3.5 sm:p-4 border border-[#263047] shadow-[0_15px_35px_rgba(11,15,24,0.7)] flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 flex items-center justify-center shadow-inner shrink-0">
                <Sparkles className="w-5 h-5 text-[#22D39F]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-[#F0F4FF] tracking-tight leading-tight truncate">
                    MANAGER PORTAL: {currentUser.fullName.toUpperCase()}
                  </h1>
                  <span className="hidden sm:inline px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30">
                    Oversight Console
                  </span>
                </div>
                <p className="text-xs text-[#7F8BA3] font-medium truncate">
                  Review Submissions, Compliance Tracking & Dossier Downloads
                </p>
              </div>
            </div>

            {/* HEADER ACTIONS: STREAMLINED FOR ALL SCREENS */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="px-3 sm:px-3.5 py-2 min-h-[44px] rounded-2xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                title="Add New User Account"
                id="btn-manager-quick-add-user"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add User</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className={`p-2.5 sm:px-3 sm:py-2 min-h-[44px] min-w-[44px] rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-inner relative active:scale-95 ${
                  activeTab === 'notifications'
                    ? 'bg-[#102D30] text-[#22D39F] border-[#22D39F]'
                    : 'bg-[#0B0F18] text-[#AEB8CC] border-[#263047] hover:border-[#22D39F]'
                }`}
                title="Notifications & Messages"
                id="btn-manager-header-notifications"
              >
                <Bell className="w-4 h-4 text-[#22D39F]" />
                <span className="hidden md:inline">Messages</span>
                {notifCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] font-black bg-rose-600 text-white rounded-full">
                    {notifCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] rounded-2xl bg-[#0B0F18] hover:bg-rose-950/40 text-rose-400 border border-[#263047] transition-all cursor-pointer shadow-inner flex items-center justify-center active:scale-95"
                title="Log out"
                id="btn-manager-header-logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* MAIN BODY VIEW */}
        <main className="p-3 sm:p-4 md:px-6 pb-28 sm:pb-36 flex-1 space-y-6">
          {/* TAB 1: USERS & COMPLIANCE TRACKER */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in" id="manager-users-view">
              {/* STATS OVERVIEW CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[28px] p-5 border border-[#263047] shadow-[0_10px_30px_rgba(11,15,24,0.6)] space-y-1">
                  <span className="text-[10px] font-bold text-[#7F8BA3] uppercase tracking-wider block">
                    Total Monitored Users
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-[#F0F4FF]">{allUsers.length}</span>
                    <Users className="w-5 h-5 text-[#22D39F]" />
                  </div>
                  <p className="text-[11px] font-medium text-[#7F8BA3]">{totalStandardUsers} active team members</p>
                </div>

                <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[28px] p-5 border border-[#263047] shadow-[0_10px_30px_rgba(11,15,24,0.6)] space-y-1">
                  <span className="text-[10px] font-bold text-[#22D39F] uppercase tracking-wider block">
                    100% Complete Dossiers
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-[#22D39F]">{compliantDossiersCount}</span>
                    <CheckCircle2 className="w-5 h-5 text-[#22D39F]" />
                  </div>
                  <p className="text-[11px] font-medium text-[#22D39F]/80">Ready for accounting audit</p>
                </div>

                <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[28px] p-5 border border-[#263047] shadow-[0_10px_30px_rgba(11,15,24,0.6)] space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    Incomplete Dossiers
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">{incompleteDossiersCount}</span>
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-[11px] font-medium text-amber-400/80">Pending files</p>
                </div>

                <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[28px] p-5 border border-[#263047] shadow-[0_10px_30px_rgba(11,15,24,0.6)] space-y-1">
                  <span className="text-[10px] font-bold text-[#22D39F] uppercase tracking-wider block">
                    Total Uploads Ingested
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-[#F0F4FF]">{allUploadedFiles.length}</span>
                    <FileSpreadsheet className="w-5 h-5 text-[#22D39F]" />
                  </div>
                  <p className="text-[11px] font-medium text-[#7F8BA3]">Full line items extracted</p>
                </div>
              </div>

              {/* SEARCH & ADD USER BAR */}
              <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="w-4 h-4 text-[#7F8BA3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search users by name or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#0B0F18] border border-[#263047] rounded-full text-xs font-bold text-[#F0F4FF] placeholder:text-[#7F8BA3] focus:outline-none focus:border-[#22D39F] shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(true)}
                    className="px-5 py-2.5 rounded-full bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Enroll New User</span>
                  </button>
                </div>
              </div>

              {/* USERS LIST */}
              <div className="space-y-3">
                {loading ? (
                  <div className="p-8 text-center text-xs text-[#7F8BA3] font-medium bg-[#161D2F] backdrop-blur-xl rounded-[32px] border border-[#263047]">
                    Loading team compliance progress...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-10 text-center bg-[#161D2F] backdrop-blur-xl rounded-[32px] border border-dashed border-[#263047] space-y-2">
                    <Users className="w-8 h-8 mx-auto text-[#7F8BA3] opacity-50" />
                    <p className="text-sm font-bold text-[#F0F4FF]">No user accounts found</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const prog = userProgressList.find((p) => p.userId === user.id);
                    const salesOk = prog?.salesUploaded || false;
                    const purchaseOk = prog?.purchaseUploaded || false;
                    const bankOk = prog?.bankUploaded || false;

                    let completedCount = 0;
                    if (salesOk) completedCount++;
                    if (purchaseOk) completedCount++;
                    if (bankOk) completedCount++;
                    const percent = Math.round((completedCount / 3) * 100);

                    return (
                      <div
                        key={user.id}
                        className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        {/* USER INFO */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-2xl bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 font-bold text-lg flex items-center justify-center shadow-inner shrink-0">
                            {user.fullName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-black text-[#F0F4FF] tracking-tight truncate">
                                {user.fullName}
                              </h3>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0B0F18] text-[#22D39F] border border-[#263047]">
                                {user.role}
                              </span>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30">
                                {user.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#7F8BA3] font-medium mt-0.5 truncate">
                              @{user.username} {user.employeeId && `• ${user.employeeId}`} {user.email && `• ${user.email}`}
                            </p>
                          </div>
                        </div>

                        {/* COMPLIANCE CHIPS */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border shadow-inner ${
                              salesOk
                                ? 'bg-[#102D30] text-[#22D39F] border-[#22D39F]/30'
                                : 'bg-[#0B0F18] text-[#7F8BA3] border-[#263047]'
                            }`}
                          >
                            {salesOk ? <CheckCircle2 className="w-3.5 h-3.5 text-[#22D39F]" /> : <Clock className="w-3.5 h-3.5 text-[#7F8BA3]" />}
                            <span>Sales</span>
                          </span>

                          <span
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border shadow-inner ${
                              purchaseOk
                                ? 'bg-[#102D30] text-[#22D39F] border-[#22D39F]/30'
                                : 'bg-[#0B0F18] text-[#7F8BA3] border-[#263047]'
                            }`}
                          >
                            {purchaseOk ? <CheckCircle2 className="w-3.5 h-3.5 text-[#22D39F]" /> : <Clock className="w-3.5 h-3.5 text-[#7F8BA3]" />}
                            <span>Purchase</span>
                          </span>

                          <span
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border shadow-inner ${
                              bankOk
                                ? 'bg-[#102D30] text-[#22D39F] border-[#22D39F]/30'
                                : 'bg-[#0B0F18] text-[#7F8BA3] border-[#263047]'
                            }`}
                          >
                            {bankOk ? <CheckCircle2 className="w-3.5 h-3.5 text-[#22D39F]" /> : <Clock className="w-3.5 h-3.5 text-[#7F8BA3]" />}
                            <span>Bank</span>
                          </span>

                          <span className="text-xs font-bold text-[#22D39F] bg-[#102D30] px-3 py-1.5 rounded-xl border border-[#22D39F]/30 shadow-inner">
                            {percent}%
                          </span>
                        </div>

                        {/* MANAGER ACTIONS */}
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedUserForReview(user)}
                            className="px-3.5 py-2 rounded-xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                            title="Inspect User Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Dossier</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNotifTargetUserId(user.id);
                              setShowSendNotifModal(true);
                            }}
                            className="p-2 rounded-xl bg-[#0B0F18] hover:bg-[#102D30] text-[#F0F4FF] border border-[#263047] hover:border-[#22D39F] shadow-inner cursor-pointer transition-all"
                            title="Send Direct Notification"
                          >
                            <Send className="w-3.5 h-3.5 text-[#22D39F]" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GLOBAL DOSSIER DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="space-y-6 animate-fade-in" id="manager-directory-view">
              {/* TOP DIRECTORY FILTER BAR */}
              <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto flex-1 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-[#7F8BA3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search file name or contents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-[#0B0F18] border border-[#263047] rounded-full text-xs font-bold text-[#F0F4FF] placeholder:text-[#7F8BA3] focus:outline-none focus:border-[#22D39F] shadow-inner"
                    />
                  </div>

                  {/* USER FILTER */}
                  <select
                    value={fileFilterUserId}
                    onChange={(e) => setFileFilterUserId(e.target.value)}
                    className="px-3.5 py-2.5 bg-[#0B0F18] border border-[#263047] rounded-full text-xs font-bold text-[#F0F4FF] focus:outline-none focus:border-[#22D39F]"
                  >
                    <option value="ALL">📁 All Users' Files ({allUploadedFiles.length})</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        👤 {u.fullName} (@{u.username})
                      </option>
                    ))}
                  </select>

                  {/* FILE TYPE FILTER */}
                  <select
                    value={fileFilterType}
                    onChange={(e) => setFileFilterType(e.target.value)}
                    className="px-3.5 py-2.5 bg-[#0B0F18] border border-[#263047] rounded-full text-xs font-bold text-[#F0F4FF] focus:outline-none focus:border-[#22D39F]"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="SALES">Sales Files</option>
                    <option value="PURCHASE">Purchase Files</option>
                    <option value="BANK_STATEMENT">Bank Statements</option>
                  </select>
                </div>

                {/* BATCH DOWNLOAD BUTTON */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleDownloadSelectedFiles}
                    disabled={selectedFileIdsForDownload.length === 0}
                    className="px-5 py-2.5 rounded-full bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Selected ({selectedFileIdsForDownload.length})</span>
                  </button>
                </div>
              </div>

              {/* FILES LIST */}
              <div className="space-y-3">
                {filteredFiles.length === 0 ? (
                  <div className="p-10 text-center bg-[#161D2F] backdrop-blur-xl rounded-[32px] border border-dashed border-[#263047] space-y-2">
                    <FolderOpen className="w-8 h-8 mx-auto text-[#7F8BA3] opacity-50" />
                    <p className="text-sm font-bold text-[#F0F4FF]">No files in this dossier directory view</p>
                  </div>
                ) : (
                  filteredFiles.map((file) => {
                    const fileUser = allUsers.find((u) => u.id === file.userId);
                    const isSelected = selectedFileIdsForDownload.includes(file.id);

                    return (
                      <div
                        key={file.id}
                        className={`bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSelected
                            ? 'border-[#22D39F] shadow-[0_15px_40px_rgba(34,211,159,0.2)]'
                            : 'border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)]'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectFile(file.id)}
                            className="w-5 h-5 rounded-lg border-[#263047] bg-[#0B0F18] text-[#22D39F] focus:ring-0 mt-1 cursor-pointer"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30">
                                {file.fileType}
                              </span>
                              {fileUser && (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0B0F18] text-[#AEB8CC] border border-[#263047] shadow-inner">
                                  👤 {fileUser.fullName} (@{fileUser.username})
                                </span>
                              )}
                              <span className="text-[10px] font-medium text-[#7F8BA3]">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-[#F0F4FF] tracking-tight mt-1 truncate" title={file.originalName}>
                              {file.originalName}
                            </h4>
                            <p className="text-xs text-[#7F8BA3] font-medium mt-0.5 line-clamp-1">
                              {file.summary || 'AI parsed data line items available.'}
                            </p>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => setSelectedFileForViewer(file)}
                            className="px-3.5 py-2 rounded-xl bg-[#0B0F18] hover:bg-[#102D30] text-[#F0F4FF] text-xs font-bold border border-[#263047] hover:border-[#22D39F] flex items-center gap-1.5 shadow-inner cursor-pointer transition-all"
                            title="Inspect AI OCR Data"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#22D39F]" />
                            <span>Inspect</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadFile(file)}
                            className="p-2 rounded-xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] shadow-md cursor-pointer transition-all"
                            title="Download File"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-2 rounded-xl bg-[#0B0F18] hover:bg-rose-950/40 text-[#7F8BA3] hover:text-rose-400 border border-[#263047] shadow-inner cursor-pointer transition-all"
                            title="Delete File"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GRAPHS & VISUAL FISCAL ANALYTICS */}
          {activeTab === 'analytics' && (
            <AnalyticsAndGraphsView
              currentUser={currentUser}
              users={allUsers}
              userProgressList={userProgressList}
              files={allUploadedFiles}
              onInspectUser={(user) => setSelectedUserForReview(user)}
              onInspectFile={(file) => setSelectedFileForViewer(file)}
            />
          )}

          {/* TAB 3: AI FISCAL & COMPLIANCE ADVISOR / Q&A */}
          {activeTab === 'ai' && (
            <AIAdvisorHub
              currentUser={currentUser}
              users={allUsers}
              files={allUploadedFiles}
              onReviewFile={(file) => setSelectedFileForViewer(file)}
            />
          )}

          {/* TAB 4: GOOGLE TASKS & ACTION NOTES */}
          {activeTab === 'tasks' && <GoogleTasksTab currentUser={currentUser} />}

          {/* TAB 5: NOTIFICATIONS & DISPATCH */}
          {activeTab === 'notifications' && (
            <NotificationsTab currentUser={currentUser} onNotificationsViewed={loadManagerData} />
          )}

          {/* TAB 6: MANAGER PROFILE */}
          {activeTab === 'profile' && <ProfileTab currentUser={currentUser} onUserUpdated={loadManagerData} />}
        </main>
      </div>

      {/* MODAL: ADD USER (MANAGER ROLE CREATES USER ACCOUNTS) */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0B0F18]/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#161D2F] rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(11,15,24,0.9)] border border-[#263047] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#263047]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 shadow-inner">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#F0F4FF]">Enroll Team Member</h3>
                  <p className="text-xs text-[#7F8BA3] font-medium">Create user account credentials.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 rounded-full hover:bg-[#0B0F18] text-[#7F8BA3] hover:text-[#F0F4FF] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addUserError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{addUserError}</span>
              </div>
            )}

            {addUserSuccess && (
              <div className="p-3 rounded-xl bg-[#102D30] border border-[#22D39F]/30 text-[#22D39F] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22D39F] shrink-0" />
                <span>{addUserSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#AEB8CC] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Liam Taylor"
                    className="w-full px-3.5 py-2 bg-[#0B0F18] border border-[#263047] rounded-xl text-xs font-bold text-[#F0F4FF] focus:outline-none focus:border-[#22D39F] shadow-inner"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#AEB8CC] mb-1">Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. ltaylor"
                    className="w-full px-3.5 py-2 bg-[#0B0F18] border border-[#263047] rounded-xl text-xs font-bold text-[#F0F4FF] focus:outline-none focus:border-[#22D39F] shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#AEB8CC] mb-1">Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2 bg-[#0B0F18] border border-[#263047] rounded-xl text-xs font-bold text-[#F0F4FF] focus:outline-none focus:border-[#22D39F] shadow-inner"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#AEB8CC] mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={newConfirmPassword}
                    onChange={(e) => setNewConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-3.5 py-2 bg-[#0B0F18] border border-[#263047] rounded-xl text-xs font-bold text-[#F0F4FF] focus:outline-none focus:border-[#22D39F] shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#263047]">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-5 py-2 rounded-full bg-[#0B0F18] text-[#AEB8CC] hover:text-[#F0F4FF] text-xs font-bold border border-[#263047] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-6 py-2 rounded-full bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {creatingUser ? 'Creating...' : 'Enroll Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DISPATCH NOTIFICATION */}
      {showSendNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0B0F18]/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#161D2F] rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(11,15,24,0.9)] border border-[#263047] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#263047]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 shadow-inner">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#F0F4FF]">Send Notification</h3>
                  <p className="text-xs text-[#7F8BA3] font-medium">Dispatch message to team member.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSendNotifModal(false)}
                className="p-1.5 rounded-full hover:bg-[#0B0F18] text-[#7F8BA3] hover:text-[#F0F4FF] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {notifError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{notifError}</span>
              </div>
            )}

            {notifSuccess && (
              <div className="p-3 rounded-xl bg-[#102D30] border border-[#22D39F]/30 text-[#22D39F] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22D39F] shrink-0" />
                <span>{notifSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSendNotificationSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#AEB8CC] mb-1">Target Recipient</label>
                <select
                  value={notifTargetUserId}
                  onChange={(e) => setNotifTargetUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0F18] border border-[#263047] rounded-xl text-xs font-bold text-[#F0F4FF] focus:outline-none focus:border-[#22D39F]"
                >
                  <option value="ALL">📢 Broadcast to All Users</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      👤 {u.fullName} (@{u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#AEB8CC] mb-1">Subject Title</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Upload Verification Requested"
                  className="w-full px-3.5 py-2.5 bg-[#0B0F18] border border-[#263047] rounded-xl text-xs font-bold text-[#F0F4FF] placeholder:text-[#7F8BA3] focus:outline-none focus:border-[#22D39F] shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#AEB8CC] mb-1">Message</label>
                <textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Enter message details..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#0B0F18] border border-[#263047] rounded-2xl text-xs font-bold text-[#F0F4FF] placeholder:text-[#7F8BA3] focus:outline-none focus:border-[#22D39F] shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#AEB8CC] mb-1">
                  Attach Files (Screenshots, PDF, Word, Excel, CSV)
                </label>
                <AttachmentPicker
                  attachments={notifAttachments}
                  onChange={setNotifAttachments}
                  maxFiles={5}
                  disabled={sendingNotif}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#263047]">
                <button
                  type="button"
                  onClick={() => setShowSendNotifModal(false)}
                  className="px-5 py-2 rounded-full bg-[#0B0F18] text-[#AEB8CC] hover:text-[#F0F4FF] text-xs font-bold border border-[#263047] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingNotif}
                  className="px-6 py-2 rounded-full bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {sendingNotif ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER DOSSIER INSPECTOR DRAWER */}
      {selectedUserForReview && (
        <AdminUserDetailDrawer
          user={selectedUserForReview}
          initialFiles={allUploadedFiles.filter((f) => f.userId === selectedUserForReview.id)}
          onClose={() => setSelectedUserForReview(null)}
          onInspectFile={(file) => setSelectedFileForViewer(file)}
          onSendMessage={(targetUserId) => {
            setNotifTargetUserId(targetUserId);
            setShowSendNotifModal(true);
          }}
          onResetPassword={() => alert('Password reset is restricted to System Administrators.')}
          onToggleStatus={() => alert('Account status toggles are handled by System Administrators.')}
          onFileDeleted={loadManagerData}
        />
      )}

      {/* AI OCR DATA VIEWER MODAL */}
      {selectedFileForViewer && (
        <FileViewerModal
          file={selectedFileForViewer}
          onClose={() => setSelectedFileForViewer(null)}
          onSaved={() => loadManagerData()}
        />
      )}

      {/* MOBILE / TABLET FIXED BOTTOM NAVIGATION */}
      <nav
        className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-[#161D2F]/95 backdrop-blur-2xl border border-[#263047] rounded-[28px] p-1.5 shadow-[0_15px_35px_rgba(11,15,24,0.9)] flex items-center justify-around overflow-x-auto"
        id="mobile-manager-bottom-nav"
      >
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-2xl transition-all min-h-[44px] min-w-[44px] justify-center ${
            activeTab === 'users' ? 'bg-[#102D30] text-[#22D39F] shadow-inner' : 'text-[#7F8BA3]'
          }`}
        >
          <Users className="w-5 h-5 text-[#22D39F]" />
          <span className="text-[9px] font-bold mt-0.5">Users</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-2xl transition-all min-h-[44px] min-w-[44px] justify-center ${
            activeTab === 'analytics' ? 'bg-[#102D30] text-[#22D39F] shadow-inner' : 'text-[#7F8BA3]'
          }`}
        >
          <BarChart3 className="w-5 h-5 text-[#22D39F]" />
          <span className="text-[9px] font-bold mt-0.5">Graphs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-2xl transition-all min-h-[44px] min-w-[44px] justify-center ${
            activeTab === 'ai' ? 'bg-[#102D30] text-[#22D39F] shadow-inner' : 'text-[#7F8BA3]'
          }`}
        >
          <Sparkles className="w-5 h-5 text-[#22D39F]" />
          <span className="text-[9px] font-bold mt-0.5">AI</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-2xl transition-all min-h-[44px] min-w-[44px] justify-center ${
            activeTab === 'directory' ? 'bg-[#102D30] text-[#22D39F] shadow-inner' : 'text-[#7F8BA3]'
          }`}
        >
          <FolderOpen className="w-5 h-5 text-[#22D39F]" />
          <span className="text-[9px] font-bold mt-0.5">Dossiers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-2xl transition-all min-h-[44px] min-w-[44px] justify-center ${
            activeTab === 'tasks' ? 'bg-[#102D30] text-[#22D39F] shadow-inner' : 'text-[#7F8BA3]'
          }`}
        >
          <CheckSquare className="w-5 h-5 text-[#22D39F]" />
          <span className="text-[9px] font-bold mt-0.5">Tasks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-2xl transition-all relative min-h-[44px] min-w-[44px] justify-center ${
            activeTab === 'notifications' ? 'bg-[#102D30] text-[#22D39F] shadow-inner' : 'text-[#7F8BA3]'
          }`}
        >
          <Bell className="w-5 h-5 text-[#22D39F]" />
          <span className="text-[9px] font-bold mt-0.5">Messages</span>
          {notifCount > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 absolute top-1 right-2 border border-[#161D2F]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-2xl transition-all min-h-[44px] min-w-[44px] justify-center ${
            activeTab === 'profile' ? 'bg-[#102D30] text-[#22D39F] shadow-inner' : 'text-[#7F8BA3]'
          }`}
        >
          <ShieldCheck className="w-5 h-5 text-[#22D39F]" />
          <span className="text-[9px] font-bold mt-0.5">Profile</span>
        </button>
      </nav>
    </div>
  );
};
