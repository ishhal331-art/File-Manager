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
      const [usersRes, progressRes, filesRes, notifsRes] = await Promise.all([
        api.getUsers(),
        api.getUserProgress(),
        api.getFiles(),
        api.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 })),
      ]);
      setAllUsers(usersRes.users || []);
      setUserProgressList(progressRes.userProgress || []);
      setAllUploadedFiles(filesRes.files || []);
      const unread = notifsRes.unreadCount !== undefined
        ? notifsRes.unreadCount
        : (notifsRes.notifications || []).filter((n: any) => !n.readBy || !n.readBy.includes(currentUser.id)).length;
      setNotifCount(unread);
    } catch (err) {
      console.error('Failed to load manager data:', err);
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
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    setSendingNotif(true);
    setNotifError(null);
    setNotifSuccess(null);
    try {
      await api.createNotification(notifTitle.trim(), notifMessage.trim(), notifTargetUserId);
      setNotifSuccess('Notification sent successfully!');
      setNotifTitle('');
      setNotifMessage('');
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
    <div className="min-h-screen bg-[#E5DAD9] text-[#302112] font-sans selection:bg-[#92798B]/20 selection:text-[#302112] overflow-x-hidden flex">
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside
        className="w-64 bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-5 border border-white/80 shadow-[0_20px_50px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col justify-between shrink-0 h-[calc(100vh-2rem)] sticky top-4 m-4 hidden lg:flex"
        id="desktop-manager-sidebar"
      >
        <div className="space-y-5">
          {/* BRAND LOGO */}
          <div className="flex flex-col gap-1 px-1">
            <div className="h-10 w-full flex items-center justify-start">
              <HRALogo className="h-9 w-auto" variant="dark" />
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-black text-[#92798B] uppercase tracking-wider bg-[#E5DAD9] px-2.5 py-0.5 rounded-full border border-white/70 shadow-2xs">
                Manager Console
              </span>
              <span className="text-[10px] font-bold text-[#5A463B]">Team Oversight</span>
            </div>
          </div>

          {/* USER PROFILE CHIP */}
          <div className="p-3 rounded-2xl bg-[#E5DAD9]/80 backdrop-blur-md border border-white/80 flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#92798B] to-[#5A463B] text-[#FAF6F0] font-black text-sm flex items-center justify-center shadow-xs shrink-0">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-[#302112] truncate">{currentUser.fullName}</p>
              <span className="text-[10px] font-extrabold text-[#92798B] bg-[#F3EAE2] px-2 py-0.5 rounded-md inline-block mt-0.5 border border-white/60">
                MANAGER
              </span>
            </div>
          </div>

          {/* SIDEBAR NAVIGATION ITEMS */}
          <nav className="space-y-1.5" id="manager-sidebar-nav-links">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-[#92798B] via-[#5A463B] to-[#302112] text-[#FAF6F0] shadow-[0_6px_18px_rgba(90,70,59,0.25)] scale-[1.02]'
                  : 'text-[#5A463B] hover:text-[#302112] hover:bg-[#E5DAD9]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className={`w-4 h-4 ${activeTab === 'users' ? 'text-[#FAF6F0]' : 'text-[#92798B]'}`} />
                <span>Users & Compliance</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E5DAD9] text-[#92798B]">
                {allUsers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-[#92798B] via-[#5A463B] to-[#302112] text-[#FAF6F0] shadow-[0_6px_18px_rgba(90,70,59,0.25)] scale-[1.02]'
                  : 'text-[#5A463B] hover:text-[#302112] hover:bg-[#E5DAD9]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-[#FAF6F0]' : 'text-[#92798B]'}`} />
                <span>Graphs & Analytics</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E5DAD9] text-[#92798B]">
                Live
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-[#92798B] via-[#5A463B] to-[#302112] text-[#FAF6F0] shadow-[0_6px_18px_rgba(90,70,59,0.25)] scale-[1.02]'
                  : 'text-[#5A463B] hover:text-[#302112] hover:bg-[#E5DAD9]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className={`w-4 h-4 ${activeTab === 'ai' ? 'text-[#FAF6F0]' : 'text-[#92798B]'}`} />
                <span>AI Fiscal Advisor & Q&A</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E5DAD9] text-[#92798B]">
                AI
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-gradient-to-r from-[#92798B] via-[#5A463B] to-[#302112] text-[#FAF6F0] shadow-[0_6px_18px_rgba(90,70,59,0.25)] scale-[1.02]'
                  : 'text-[#5A463B] hover:text-[#302112] hover:bg-[#E5DAD9]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className={`w-4 h-4 ${activeTab === 'directory' ? 'text-[#FAF6F0]' : 'text-[#92798B]'}`} />
                <span>All Dossiers Directory</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E5DAD9] text-[#92798B]">
                {allUploadedFiles.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-gradient-to-r from-[#92798B] via-[#5A463B] to-[#302112] text-[#FAF6F0] shadow-[0_6px_18px_rgba(90,70,59,0.25)] scale-[1.02]'
                  : 'text-[#5A463B] hover:text-[#302112] hover:bg-[#E5DAD9]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className={`w-4 h-4 ${activeTab === 'tasks' ? 'text-[#FAF6F0]' : 'text-[#92798B]'}`} />
                <span>Google Tasks & Notes</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-gradient-to-r from-[#92798B] via-[#5A463B] to-[#302112] text-[#FAF6F0] shadow-[0_6px_18px_rgba(90,70,59,0.25)] scale-[1.02]'
                  : 'text-[#5A463B] hover:text-[#302112] hover:bg-[#E5DAD9]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-[#FAF6F0]' : 'text-[#92798B]'}`} />
                <span>Messages & Alerts</span>
              </div>
              {notifCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-600 text-[#FAF6F0]">
                  {notifCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#92798B] via-[#5A463B] to-[#302112] text-[#FAF6F0] shadow-[0_6px_18px_rgba(90,70,59,0.25)] scale-[1.02]'
                  : 'text-[#5A463B] hover:text-[#302112] hover:bg-[#E5DAD9]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className={`w-4 h-4 ${activeTab === 'profile' ? 'text-[#FAF6F0]' : 'text-[#92798B]'}`} />
                <span>Manager Profile</span>
              </div>
            </button>
          </nav>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="pt-3 border-t border-white/60">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold text-[#5A463B] hover:text-rose-800 hover:bg-[#E0D1D4] transition-all cursor-pointer"
            id="btn-manager-sidebar-logout"
          >
            <LogOut className="w-4 h-4 text-[#FAF6F0] p-0.5 rounded bg-[#92798B]" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        {/* TOP LIQUID GLASS HEADER */}
        <header className="sticky top-0 z-30 p-3 sm:p-4 md:px-6">
          <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[28px] p-3.5 sm:p-4 border border-white/80 shadow-[0_15px_35px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#92798B] to-[#5A463B] text-[#FAF6F0] flex items-center justify-center shadow-xs shrink-0">
                <Sparkles className="w-5 h-5 text-[#FAF6F0]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-[#302112] tracking-tight leading-tight truncate">
                    MANAGER PORTAL: {currentUser.fullName.toUpperCase()}
                  </h1>
                  <span className="hidden sm:inline px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E5DAD9] text-[#92798B] border border-white/80">
                    Oversight Console
                  </span>
                </div>
                <p className="text-xs text-[#5A463B] font-semibold truncate">
                  Review Submissions, Compliance Tracking & Dossier Downloads
                </p>
              </div>
            </div>

            {/* HEADER ACTIONS */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="px-3.5 py-2 min-h-[44px] rounded-2xl bg-[#92798B] hover:bg-[#5A463B] text-[#FAF6F0] text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                id="btn-manager-quick-add-user"
              >
                <UserPlus className="w-4 h-4 text-[#FAF6F0]" />
                <span className="hidden sm:inline">Add User</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`p-2.5 sm:px-3.5 sm:py-2 min-h-[44px] min-w-[44px] rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  activeTab === 'analytics'
                    ? 'bg-[#92798B] text-[#FAF6F0] border-[#92798B]'
                    : 'bg-[#E5DAD9] text-[#302112] border-white/80 hover:bg-white'
                }`}
                title="View Fiscal Graphs & Analytics"
                id="btn-manager-header-analytics"
              >
                <BarChart3 className="w-4 h-4 text-[#FAF6F0] p-0.5 rounded-md bg-[#92798B]" />
                <span className="hidden md:inline">Analytics</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={`p-2.5 sm:px-3.5 sm:py-2 min-h-[44px] min-w-[44px] rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  activeTab === 'ai'
                    ? 'bg-[#92798B] text-[#FAF6F0] border-[#92798B]'
                    : 'bg-[#E5DAD9] text-[#302112] border-white/80 hover:bg-white'
                }`}
                title="Open AI Fiscal & Compliance Advisor"
                id="btn-manager-header-ai"
              >
                <Sparkles className="w-4 h-4 text-[#FAF6F0] p-0.5 rounded-md bg-[#92798B]" />
                <span className="hidden md:inline">AI Advisor</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                className={`p-2.5 sm:px-3.5 sm:py-2 min-h-[44px] min-w-[44px] rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  activeTab === 'tasks'
                    ? 'bg-[#92798B] text-[#FAF6F0] border-[#92798B]'
                    : 'bg-[#E5DAD9] text-[#302112] border-white/80 hover:bg-white'
                }`}
                title="Open Google Tasks & Notes"
                id="btn-manager-header-tasks"
              >
                <CheckSquare className="w-4 h-4 text-[#FAF6F0] p-0.5 rounded-md bg-[#92798B]" />
                <span className="hidden sm:inline">Tasks</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className={`p-2.5 sm:px-3.5 sm:py-2 min-h-[44px] min-w-[44px] rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs relative ${
                  activeTab === 'notifications'
                    ? 'bg-[#92798B] text-[#FAF6F0] border-[#92798B]'
                    : 'bg-[#E5DAD9] text-[#302112] border-white/80 hover:bg-white'
                }`}
                title="Notifications & Messages"
                id="btn-manager-header-notifications"
              >
                <Bell className="w-4 h-4 text-[#FAF6F0] p-0.5 rounded-md bg-[#92798B]" />
                <span className="hidden sm:inline">Messages</span>
                {notifCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] font-black bg-rose-600 text-[#FAF6F0] rounded-full">
                    {notifCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] rounded-2xl bg-[#E5DAD9] hover:bg-rose-50 text-rose-700 border border-white/80 transition-all cursor-pointer shadow-2xs flex items-center justify-center"
                title="Log out"
                id="btn-manager-header-logout"
              >
                <LogOut className="w-4 h-4 text-[#FAF6F0] p-0.5 rounded-md bg-[#92798B]" />
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
                <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[28px] p-5 border border-white/80 shadow-[0_10px_30px_rgba(48,33,18,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] space-y-1">
                  <span className="text-[10px] font-black text-[#5A463B] uppercase tracking-wider block">
                    Total Monitored Users
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-[#302112]">{allUsers.length}</span>
                    <Users className="w-5 h-5 text-[#FAF6F0] p-1 rounded-lg bg-[#92798B]" />
                  </div>
                  <p className="text-[11px] font-bold text-[#5A463B]/80">{totalStandardUsers} active team members</p>
                </div>

                <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[28px] p-5 border border-white/80 shadow-[0_10px_30px_rgba(48,33,18,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] space-y-1">
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                    100% Complete Dossiers
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-800">{compliantDossiersCount}</span>
                    <CheckCircle2 className="w-5 h-5 text-[#FAF6F0] p-1 rounded-lg bg-emerald-700" />
                  </div>
                  <p className="text-[11px] font-bold text-emerald-800/80">Ready for accounting audit</p>
                </div>

                <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[28px] p-5 border border-white/80 shadow-[0_10px_30px_rgba(48,33,18,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] space-y-1">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
                    Incomplete Dossiers
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-amber-800">{incompleteDossiersCount}</span>
                    <Clock className="w-5 h-5 text-[#FAF6F0] p-1 rounded-lg bg-amber-700" />
                  </div>
                  <p className="text-[11px] font-bold text-amber-800/80">Pending files</p>
                </div>

                <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[28px] p-5 border border-white/80 shadow-[0_10px_30px_rgba(48,33,18,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] space-y-1">
                  <span className="text-[10px] font-black text-[#92798B] uppercase tracking-wider block">
                    Total Uploads Ingested
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-[#302112]">{allUploadedFiles.length}</span>
                    <FileSpreadsheet className="w-5 h-5 text-[#FAF6F0] p-1 rounded-lg bg-[#5A463B]" />
                  </div>
                  <p className="text-[11px] font-bold text-[#5A463B]/80">Full line items extracted</p>
                </div>
              </div>

              {/* SEARCH & ADD USER BAR */}
              <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="w-4 h-4 text-[#92798B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search users by name or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#E5DAD9] border border-white/80 rounded-full text-xs font-bold text-[#302112] placeholder:text-[#5A463B]/60 focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(true)}
                    className="px-5 py-2.5 rounded-full bg-[#92798B] hover:bg-[#5A463B] text-[#FAF6F0] text-xs font-black flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-[#FAF6F0]" />
                    <span>Enroll New User</span>
                  </button>
                </div>
              </div>

              {/* USERS LIST */}
              <div className="space-y-3">
                {loading ? (
                  <div className="p-8 text-center text-xs text-[#5A463B] font-semibold bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] border border-white/80">
                    Loading team compliance progress...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-10 text-center bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] border border-dashed border-white/80 space-y-2">
                    <Users className="w-8 h-8 mx-auto text-[#92798B] opacity-50" />
                    <p className="text-sm font-black text-[#302112]">No user accounts found</p>
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
                        className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        {/* USER INFO */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#92798B] to-[#5A463B] text-[#FAF6F0] font-black text-lg flex items-center justify-center shadow-xs shrink-0">
                            {user.fullName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-black text-[#302112] tracking-tight truncate">
                                {user.fullName}
                              </h3>
                              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#E5DAD9] text-[#92798B] border border-white/80">
                                {user.role}
                              </span>
                              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {user.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#5A463B] font-semibold mt-0.5 truncate">
                              @{user.username} {user.employeeId && `• ${user.employeeId}`} {user.email && `• ${user.email}`}
                            </p>
                          </div>
                        </div>

                        {/* COMPLIANCE CHIPS */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border shadow-2xs ${
                              salesOk
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-[#E5DAD9] text-[#5A463B] border-white/80'
                            }`}
                          >
                            {salesOk ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <Clock className="w-3.5 h-3.5 text-[#92798B]" />}
                            <span>Sales</span>
                          </span>

                          <span
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border shadow-2xs ${
                              purchaseOk
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-[#E5DAD9] text-[#5A463B] border-white/80'
                            }`}
                          >
                            {purchaseOk ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <Clock className="w-3.5 h-3.5 text-[#92798B]" />}
                            <span>Purchase</span>
                          </span>

                          <span
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border shadow-2xs ${
                              bankOk
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-[#E5DAD9] text-[#5A463B] border-white/80'
                            }`}
                          >
                            {bankOk ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <Clock className="w-3.5 h-3.5 text-[#92798B]" />}
                            <span>Bank</span>
                          </span>

                          <span className="text-xs font-black text-[#92798B] bg-[#E5DAD9] px-3 py-1.5 rounded-xl border border-white/80 shadow-2xs">
                            {percent}%
                          </span>
                        </div>

                        {/* MANAGER ACTIONS */}
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedUserForReview(user)}
                            className="px-3.5 py-2 rounded-xl bg-[#92798B] hover:bg-[#5A463B] text-[#FAF6F0] text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                            title="Inspect User Dossier"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#FAF6F0]" />
                            <span>Dossier</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNotifTargetUserId(user.id);
                              setShowSendNotifModal(true);
                            }}
                            className="p-2 rounded-xl bg-[#E5DAD9] hover:bg-white text-[#302112] border border-white/80 shadow-2xs cursor-pointer transition-all"
                            title="Send Direct Notification"
                          >
                            <Send className="w-3.5 h-3.5 text-[#FAF6F0] p-0.5 rounded bg-[#92798B]" />
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
              <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto flex-1 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-[#92798B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search file name or contents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-[#E5DAD9] border border-white/80 rounded-full text-xs font-bold text-[#302112] placeholder:text-[#5A463B]/60 focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                    />
                  </div>

                  {/* USER FILTER */}
                  <select
                    value={fileFilterUserId}
                    onChange={(e) => setFileFilterUserId(e.target.value)}
                    className="px-3.5 py-2.5 bg-[#E5DAD9] border border-white/80 rounded-full text-xs font-bold text-[#302112] focus:outline-none focus:border-[#92798B]"
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
                    className="px-3.5 py-2.5 bg-[#E5DAD9] border border-white/80 rounded-full text-xs font-bold text-[#302112] focus:outline-none focus:border-[#92798B]"
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
                    className="px-5 py-2.5 rounded-full bg-[#92798B] hover:bg-[#5A463B] text-[#FAF6F0] text-xs font-black flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Download className="w-4 h-4 text-[#FAF6F0]" />
                    <span>Download Selected ({selectedFileIdsForDownload.length})</span>
                  </button>
                </div>
              </div>

              {/* FILES LIST */}
              <div className="space-y-3">
                {filteredFiles.length === 0 ? (
                  <div className="p-10 text-center bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] border border-dashed border-white/80 space-y-2">
                    <FolderOpen className="w-8 h-8 mx-auto text-[#92798B] opacity-50" />
                    <p className="text-sm font-black text-[#302112]">No files in this dossier directory view</p>
                  </div>
                ) : (
                  filteredFiles.map((file) => {
                    const fileUser = allUsers.find((u) => u.id === file.userId);
                    const isSelected = selectedFileIdsForDownload.includes(file.id);

                    return (
                      <div
                        key={file.id}
                        className={`bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSelected
                            ? 'border-[#92798B] shadow-[0_15px_40px_rgba(146,121,139,0.25)]'
                            : 'border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)]'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectFile(file.id)}
                            className="w-5 h-5 rounded-lg border-white/80 text-[#92798B] focus:ring-0 mt-1 cursor-pointer"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#E5DAD9] text-[#92798B] border border-white/80">
                                {file.fileType}
                              </span>
                              {fileUser && (
                                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white text-[#302112] border border-white/80 shadow-2xs">
                                  👤 {fileUser.fullName} (@{fileUser.username})
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-[#5A463B]">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-[#302112] tracking-tight mt-1 truncate" title={file.originalName}>
                              {file.originalName}
                            </h4>
                            <p className="text-xs text-[#5A463B] font-semibold mt-0.5 line-clamp-1">
                              {file.summary || 'AI parsed data line items available.'}
                            </p>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => setSelectedFileForViewer(file)}
                            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#E5DAD9] text-[#302112] text-xs font-black border border-white/80 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                            title="Inspect AI OCR Data"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#FAF6F0] p-0.5 rounded bg-[#92798B]" />
                            <span>Inspect</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadFile(file)}
                            className="p-2 rounded-xl bg-[#92798B] hover:bg-[#5A463B] text-[#FAF6F0] shadow-2xs cursor-pointer transition-all"
                            title="Download File"
                          >
                            <Download className="w-4 h-4 text-[#FAF6F0]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-2 rounded-xl bg-white hover:bg-rose-50 text-[#5A463B] hover:text-rose-700 border border-white/80 shadow-2xs cursor-pointer transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#F3EAE2] rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(48,33,18,0.25)] border border-white/90 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#E5DAD9] text-[#92798B] border border-white/80 shadow-2xs">
                  <UserPlus className="w-5 h-5 text-[#FAF6F0] p-0.5 rounded bg-[#92798B]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#302112]">Enroll Team Member</h3>
                  <p className="text-xs text-[#5A463B] font-semibold">Create user account credentials.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 rounded-full hover:bg-[#E5DAD9] text-[#5A463B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addUserError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{addUserError}</span>
              </div>
            )}

            {addUserSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{addUserSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#302112] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Liam Taylor"
                    className="w-full px-3.5 py-2 bg-[#E5DAD9] border border-white/80 rounded-xl text-xs font-bold text-[#302112] focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#302112] mb-1">Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. ltaylor"
                    className="w-full px-3.5 py-2 bg-[#E5DAD9] border border-white/80 rounded-xl text-xs font-bold text-[#302112] focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#302112] mb-1">Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2 bg-[#E5DAD9] border border-white/80 rounded-xl text-xs font-bold text-[#302112] focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#302112] mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={newConfirmPassword}
                    onChange={(e) => setNewConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-3.5 py-2 bg-[#E5DAD9] border border-white/80 rounded-xl text-xs font-bold text-[#302112] focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/60">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-5 py-2 rounded-full bg-[#E5DAD9] text-[#302112] text-xs font-bold hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-6 py-2 rounded-full bg-[#92798B] hover:bg-[#5A463B] text-[#FAF6F0] text-xs font-black shadow-xs cursor-pointer disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#F3EAE2] rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(48,33,18,0.25)] border border-white/90 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#E5DAD9] text-[#92798B] border border-white/80 shadow-2xs">
                  <Send className="w-5 h-5 text-[#FAF6F0] p-0.5 rounded bg-[#92798B]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#302112]">Send Notification</h3>
                  <p className="text-xs text-[#5A463B] font-semibold">Dispatch message to team member.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSendNotifModal(false)}
                className="p-1.5 rounded-full hover:bg-[#E5DAD9] text-[#5A463B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {notifError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{notifError}</span>
              </div>
            )}

            {notifSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{notifSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSendNotificationSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-[#302112] mb-1">Target Recipient</label>
                <select
                  value={notifTargetUserId}
                  onChange={(e) => setNotifTargetUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#E5DAD9] border border-white/80 rounded-xl text-xs font-bold text-[#302112] focus:outline-none focus:border-[#92798B]"
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
                <label className="block text-xs font-black text-[#302112] mb-1">Subject Title</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Upload Verification Requested"
                  className="w-full px-3.5 py-2.5 bg-[#E5DAD9] border border-white/80 rounded-xl text-xs font-bold text-[#302112] placeholder:text-[#5A463B]/60 focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#302112] mb-1">Message</label>
                <textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Enter message details..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#E5DAD9] border border-white/80 rounded-2xl text-xs font-bold text-[#302112] placeholder:text-[#5A463B]/60 focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/60">
                <button
                  type="button"
                  onClick={() => setShowSendNotifModal(false)}
                  className="px-5 py-2 rounded-full bg-[#E5DAD9] text-[#302112] text-xs font-bold hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingNotif}
                  className="px-6 py-2 rounded-full bg-[#92798B] hover:bg-[#5A463B] text-[#FAF6F0] text-xs font-black shadow-xs cursor-pointer disabled:opacity-50"
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
        className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-[#F3EAE2]/95 backdrop-blur-xl border border-white/90 rounded-[28px] p-2 shadow-[0_15px_35px_rgba(48,33,18,0.2)] flex items-center justify-around"
        id="mobile-manager-bottom-nav"
      >
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-2xl transition-all ${
            activeTab === 'users' ? 'bg-[#92798B] text-[#FAF6F0] shadow-xs' : 'text-[#5A463B]'
          }`}
        >
          <Users className="w-5 h-5 text-[#FAF6F0] p-0.5 rounded bg-[#92798B]" />
          <span className="text-[9px] font-black mt-0.5">Users</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-2xl transition-all ${
            activeTab === 'analytics' ? 'bg-[#92798B] text-[#FAF6F0] shadow-xs' : 'text-[#5A463B]'
          }`}
        >
          <BarChart3 className="w-5 h-5 text-[#FAF6F0] p-0.5 rounded bg-[#92798B]" />
          <span className="text-[9px] font-black mt-0.5">Graphs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-2xl transition-all ${
            activeTab === 'ai' ? 'bg-[#92798B] text-[#FAF6F0] shadow-xs' : 'text-[#5A463B]'
          }`}
        >
          <Sparkles className="w-5 h-5 text-[#FAF6F0] p-0.5 rounded bg-[#92798B]" />
          <span className="text-[9px] font-black mt-0.5">AI</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-2xl transition-all ${
            activeTab === 'directory' ? 'bg-[#92798B] text-[#FAF6F0] shadow-xs' : 'text-[#5A463B]'
          }`}
        >
          <FolderOpen className="w-5 h-5 text-[#FAF6F0] p-0.5 rounded bg-[#92798B]" />
          <span className="text-[9px] font-black mt-0.5">Dossiers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-2xl transition-all ${
            activeTab === 'tasks' ? 'bg-[#92798B] text-[#FAF6F0] shadow-xs' : 'text-[#5A463B]'
          }`}
        >
          <CheckSquare className="w-5 h-5 text-[#FAF6F0] p-0.5 rounded bg-[#92798B]" />
          <span className="text-[9px] font-black mt-0.5">Tasks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-2xl transition-all relative ${
            activeTab === 'notifications' ? 'bg-[#92798B] text-[#FAF6F0] shadow-xs' : 'text-[#5A463B]'
          }`}
        >
          <Bell className="w-5 h-5 text-[#FAF6F0] p-0.5 rounded bg-[#92798B]" />
          <span className="text-[9px] font-black mt-0.5">Messages</span>
          {notifCount > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 absolute top-1 right-2 border border-white" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-2xl transition-all ${
            activeTab === 'profile' ? 'bg-[#92798B] text-[#FAF6F0] shadow-xs' : 'text-[#5A463B]'
          }`}
        >
          <ShieldCheck className="w-5 h-5 text-[#FAF6F0] p-0.5 rounded bg-[#92798B]" />
          <span className="text-[9px] font-black mt-0.5">Profile</span>
        </button>
      </nav>
    </div>
  );
};
