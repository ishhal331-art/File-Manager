import React, { useState, useEffect } from 'react';
import { User, UploadedFile, UserUploadProgress } from '../../types';
import { api } from '../../lib/api';
import { FileViewerModal } from './FileViewerModal';
import { NotificationsTab } from './NotificationsTab';
import { ProfileTab } from './ProfileTab';
import {
  Users,
  UserPlus,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileSpreadsheet,
  Lock,
  LogOut,
  Bell,
  Sparkles,
  Search,
  X,
  KeyRound,
  Check,
  Send,
  MessageSquare,
  Calendar,
  Clock,
  Trash2,
} from 'lucide-react';

interface Props {
  currentUser: User;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'notifications' | 'profile'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [userProgressList, setUserProgressList] = useState<UserUploadProgress[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Selected User for Review Modal / Panel
  const [selectedUserForReview, setSelectedUserForReview] = useState<User | null>(null);
  const [selectedUserFiles, setSelectedUserFiles] = useState<UploadedFile[]>([]);
  const [loadingSelectedUserFiles, setLoadingSelectedUserFiles] = useState(false);
  const [selectedFileForViewer, setSelectedFileForViewer] = useState<UploadedFile | null>(null);

  // Selection state for downloading files (1, 2, or 3 files)
  const [selectedFileIdsForDownload, setSelectedFileIdsForDownload] = useState<string[]>([]);

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addFullName, setAddFullName] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addConfirmPassword, setAddConfirmPassword] = useState('');
  const [addRole, setAddRole] = useState<'USER' | 'MANAGER'>('USER');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addStatus, setAddStatus] = useState<'ACTIVE' | 'DISABLED'>('ACTIVE');
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserSuccess, setAddUserSuccess] = useState<string | null>(null);
  const [addingUser, setAddingUser] = useState(false);

  // Admin Send Notification Modal State
  const [showSendNotifModal, setShowSendNotifModal] = useState(false);
  const [notifTargetUserId, setNotifTargetUserId] = useState<string>('ALL');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);
  const [notifError, setNotifError] = useState<string | null>(null);

  // Admin Reset Password Modal
  const [resetModalUser, setResetModalUser] = useState<User | null>(null);
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetConfirmPass, setResetConfirmPass] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  // Read-only User Detail Inspection Modal
  const [viewingUserDetail, setViewingUserDetail] = useState<User | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [notifCount, setNotifCount] = useState<number>(0);

  useEffect(() => {
    loadUsersData();
  }, []);

  // Handle browser back button in AdminDashboard so pressing Back closes modals or returns to tracker
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
      } else if (viewingUserDetail) {
        e.preventDefault();
        setViewingUserDetail(null);
      } else if (resetModalUser) {
        e.preventDefault();
        setResetModalUser(null);
      } else if (showSendNotifModal) {
        e.preventDefault();
        setShowSendNotifModal(false);
      } else if (activeTab !== 'dashboard') {
        e.preventDefault();
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('app:backbutton', handleBackButton);
    return () => window.removeEventListener('app:backbutton', handleBackButton);
  }, [
    selectedFileForViewer,
    selectedUserForReview,
    showAddUserModal,
    viewingUserDetail,
    resetModalUser,
    showSendNotifModal,
    activeTab,
  ]);

  const loadUsersData = async () => {
    setLoadingUsers(true);
    try {
      const [usersRes, progressRes, notifsRes] = await Promise.all([
        api.getUsers(),
        api.getUserProgress(),
        api.getNotifications().catch(() => ({ notifications: [] })),
      ]);
      setUsers(usersRes.users);
      setUserProgressList(progressRes.userProgress);
      setNotifCount(notifsRes.notifications ? notifsRes.notifications.length : 0);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenSendNotifModal = (targetId: string = 'ALL') => {
    setNotifTargetUserId(targetId);
    setNotifTitle('');
    setNotifMessage('');
    setNotifError(null);
    setNotifSuccess(null);
    setShowSendNotifModal(true);
  };

  const handleSendNotifSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      setNotifError('Please enter both title and message body.');
      return;
    }

    setSendingNotif(true);
    setNotifError(null);
    try {
      await api.createNotification(notifTitle.trim(), notifMessage.trim(), notifTargetUserId);
      setNotifSuccess('Notification sent successfully!');
      setTimeout(() => {
        setShowSendNotifModal(false);
        setNotifSuccess(null);
      }, 1200);
    } catch (err: any) {
      setNotifError(err.message || 'Failed to dispatch notification.');
    } finally {
      setSendingNotif(false);
    }
  };

  const handleReviewUser = async (user: User) => {
    setSelectedUserForReview(user);
    setLoadingSelectedUserFiles(true);
    setSelectedFileIdsForDownload([]);
    try {
      const res = await api.getFiles(user.id);
      setSelectedUserFiles(res.files);
      setSelectedFileIdsForDownload(res.files.map((f) => f.id));
    } catch (err) {
      console.error('Error loading user files:', err);
    } finally {
      setLoadingSelectedUserFiles(false);
    }
  };

  const handleDeleteFileInAdmin = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file from the system?')) return;
    try {
      await api.deleteFile(fileId);
      setSelectedUserFiles((prev) => prev.filter((f) => f.id !== fileId));
      setSelectedFileIdsForDownload((prev) => prev.filter((id) => id !== fileId));
      await loadUsersData();
    } catch (err: any) {
      alert(`Delete error: ${err.message || 'Could not delete file.'}`);
    }
  };

  const handleToggleFileSelection = (fileId: string) => {
    if (selectedFileIdsForDownload.includes(fileId)) {
      setSelectedFileIdsForDownload(selectedFileIdsForDownload.filter((id) => id !== fileId));
    } else {
      setSelectedFileIdsForDownload([...selectedFileIdsForDownload, fileId]);
    }
  };

  const handleDownloadSelectedFiles = () => {
    const filesToDownload = selectedUserFiles.filter((f) =>
      selectedFileIdsForDownload.includes(f.id)
    );

    if (filesToDownload.length === 0) {
      alert('Please select at least 1 file to download.');
      return;
    }

    filesToDownload.forEach((file) => {
      if (!file.fileUrl) return;
      const a = document.createElement('a');
      a.href = file.fileUrl;
      a.download = `${file.fileType}_${selectedUserForReview?.username}_${file.originalName}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await api.toggleUserStatus(user.id, newStatus);
      await loadUsersData();
      if (selectedUserForReview?.id === user.id) {
        setSelectedUserForReview({ ...user, status: newStatus as any });
      }
    } catch (err: any) {
      alert(`Status update error: ${err.message}`);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(null);
    setAddUserSuccess(null);

    // Password match check
    if (addPassword !== addConfirmPassword) {
      setAddUserError('Passwords do not match.');
      return;
    }

    if (addPassword.length < 6) {
      setAddUserError('Password must be at least 6 characters long.');
      return;
    }

    setAddingUser(true);
    try {
      const res = await api.createUser({
        fullName: addFullName.trim() || addUsername.trim(),
        username: addUsername.trim(),
        password: addPassword,
        confirmPassword: addConfirmPassword,
        role: addRole,
        status: addStatus,
      });

      setAddUserSuccess(res.message);
      setAddFullName('');
      setAddUsername('');
      setAddPassword('');
      setAddConfirmPassword('');

      await loadUsersData();
      setTimeout(() => {
        setShowAddUserModal(false);
        setAddUserSuccess(null);
      }, 1500);
    } catch (err: any) {
      setAddUserError(err.message || 'Failed to create user.');
    } finally {
      setAddingUser(false);
    }
  };

  const handleAdminResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;

    if (resetNewPass !== resetConfirmPass) {
      setResetError('Passwords do not match.');
      return;
    }

    try {
      await api.adminResetPassword(resetModalUser.id, resetNewPass, resetConfirmPass);
      alert(`Password for ${resetModalUser.username} updated.`);
      setResetModalUser(null);
      setResetNewPass('');
      setResetConfirmPass('');
    } catch (err: any) {
      setResetError(err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      (u.email && u.email.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-[#F4F0FC] text-slate-800 font-sans selection:bg-[#8364ED]/20 selection:text-[#8364ED] overflow-x-hidden">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-[#FCFBF8]/95 backdrop-blur-md border-b border-[#F0ECE1] shadow-[0_10px_25px_rgba(110,85,190,0.05)] py-3 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#8364ED] to-[#A58DF5] text-white flex items-center justify-center font-extrabold text-lg shadow-md shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight truncate" id="admin-portal-title">
                Files Manager Administration
              </h1>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 truncate">
                User Management & Compliance Review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('notifications')}
              className="px-3 py-2 rounded-2xl bg-[#F0EBFA] hover:bg-[#E2D6FA] text-[#8364ED] text-xs font-extrabold flex items-center gap-1.5 border border-[#E2D8F7] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              id="btn-admin-header-messages"
              title="Click to view Messages and Notifications"
            >
              <Bell className="w-3.5 h-3.5 text-[#8364ED]" />
              <span>{notifCount} Messages</span>
            </button>

            <button
              onClick={() => handleOpenSendNotifModal('ALL')}
              className="px-3 py-2 rounded-2xl bg-[#F0EBFA] hover:bg-[#E2D6FA] text-[#8364ED] text-xs font-bold flex items-center gap-1.5 border border-[#E2D8F7] transition-all cursor-pointer shadow-2xs"
              id="btn-admin-header-send-notif"
              title="Send Notification to Users"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Send Notification</span>
            </button>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
              id="btn-admin-add-user"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add User</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 sm:p-2.5 rounded-2xl bg-[#F5F0E6] hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-all border border-[#EAE4D6] cursor-pointer"
              title="Sign Out"
              id="btn-admin-logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-36 sm:pb-44 space-y-6 sm:space-y-8">
        {activeTab === 'users' && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in" id="admin-users-view">
            {/* SEARCH & DISPATCH / ADD USER BAR */}
            <div className="bg-[#FCFBF8] rounded-2xl sm:rounded-[32px] p-4 sm:p-6 shadow-[0_15px_35px_rgba(110,85,190,0.08)] border border-[#F0ECE1] flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user by name or username..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F7F5EE] border border-[#E8E4D8] rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#8364ED] shadow-inner"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
                <button
                  onClick={() => handleOpenSendNotifModal('ALL')}
                  className="px-4 py-2.5 rounded-full bg-[#F0EBFA] hover:bg-[#E2D6FA] text-[#8364ED] text-xs font-bold flex items-center gap-2 border border-[#E2D8F7] transition-all cursor-pointer shadow-xs"
                >
                  <Bell className="w-4 h-4" />
                  <span>Send Notification</span>
                </button>

                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  id="btn-add-user-modal-trigger"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            {/* BAR CHART / USER UPLOAD BARS OVERVIEW */}
            <div className="bg-[#FCFBF8] rounded-2xl sm:rounded-[32px] p-4 sm:p-6 shadow-[0_15px_35px_rgba(110,85,190,0.08)] border border-[#F0ECE1] space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#F2ECE0]">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                    User File Upload Status Overview (Bars)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click on any user row to review, inspect AI OCR extracted data, or download files.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#8364ED] bg-[#F0EBFA] px-3 py-1 rounded-full border border-[#E2D8F7] shrink-0">
                  Ingestion Tracker
                </span>
              </div>

              {/* BARS LIST */}
              <div className="space-y-3">
                {userProgressList.map((prog) => {
                  const targetUser = users.find((u) => u.id === prog.userId);
                  if (!targetUser) return null;

                  return (
                    <div
                      key={prog.userId}
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F6EF] hover:bg-[#F2ECE0] border border-[#EAE5D7] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 group"
                    >
                      <div className="flex items-center gap-3 w-full md:w-1/3 cursor-pointer" onClick={() => handleReviewUser(targetUser)}>
                        <div className="w-9 h-9 rounded-xl bg-white text-[#8364ED] font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                          {prog.userName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-[#8364ED] transition-colors truncate">
                            {prog.userName}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            @{targetUser.username} • Status:{' '}
                            <span className={targetUser.status === 'ACTIVE' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                              {targetUser.status}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* BAR PROGRESS DISPLAY */}
                      <div className="w-full md:w-5/12 space-y-1.5 cursor-pointer" onClick={() => handleReviewUser(targetUser)}>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="flex items-center gap-2 truncate">
                            <span>Upload Completion</span>
                            <span className="text-[10px] text-slate-400 font-normal truncate">
                              ({prog.salesUploaded ? 'Sales ✓ ' : ''}
                              {prog.purchaseUploaded ? 'Purchase ✓ ' : ''}
                              {prog.bankUploaded ? 'Bank ✓' : ''})
                            </span>
                          </span>
                          <span className="text-[#8364ED] shrink-0">{prog.percentage}%</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-[#E6E1F5] overflow-hidden p-0.5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#8364ED] to-[#A58DF5] transition-all duration-500"
                            style={{ width: `${prog.percentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSendNotifModal(targetUser.id);
                          }}
                          className="p-2 rounded-xl bg-white hover:bg-[#F0EBFA] text-[#8364ED] border border-[#E2DDD0] hover:border-[#8364ED] text-xs font-bold flex items-center gap-1 transition-all shadow-2xs"
                          title={`Send notification to ${prog.userName}`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Message</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReviewUser(targetUser)}
                          className="px-3 py-2 rounded-xl bg-white group-hover:bg-[#8364ED] text-slate-700 group-hover:text-white border border-[#E2DDD0] group-hover:border-[#8364ED] text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* USERS MANAGEMENT TABLE */}
            <div className="bg-[#FCFBF8] rounded-2xl sm:rounded-[32px] p-4 sm:p-6 shadow-[0_15px_35px_rgba(110,85,190,0.08)] border border-[#F0ECE1] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE0]">
                <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                  All Registered Users ({filteredUsers.length})
                </h3>
                <button
                  onClick={() => handleOpenSendNotifModal('ALL')}
                  className="px-3 py-1.5 rounded-xl bg-[#F0EBFA] hover:bg-[#E2D6FA] text-[#8364ED] font-bold text-xs flex items-center gap-1.5 border border-[#E2D8F7]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Notify All</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#EBE6D8] bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F7F5EE] border-b border-[#EBE6D8] text-slate-600 font-bold">
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Username</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Employee ID</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EDE2]">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#FCFBF8] transition-colors">
                        <td className="p-3 font-bold text-slate-800">{u.fullName}</td>
                        <td className="p-3 text-slate-600">@{u.username}</td>
                        <td className="p-3 font-semibold text-[#8364ED]">{u.role}</td>
                        <td className="p-3 text-slate-500">{u.employeeId || 'N/A'}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 sm:space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => setViewingUserDetail(u)}
                            className="px-2.5 py-1 rounded-lg bg-[#F0EBFA] text-[#8364ED] font-bold text-[11px] hover:bg-[#E2D6FA] inline-flex items-center gap-1"
                            title={`Review personal details for ${u.fullName}`}
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => handleReviewUser(u)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] hover:bg-slate-200"
                          >
                            Files
                          </button>
                          <button
                            onClick={() => handleOpenSendNotifModal(u.id)}
                            className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-[11px]"
                            title={`Send notification to ${u.fullName}`}
                          >
                            <Send className="w-3 h-3 inline" />
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                              u.status === 'ACTIVE'
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => setResetModalUser(u)}
                            className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-[11px]"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && <NotificationsTab currentUser={currentUser} />}

        {activeTab === 'profile' && <ProfileTab currentUser={currentUser} />}
      </main>

      {/* USER FILES REVIEW & DOWNLOAD MODAL */}
      {selectedUserForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] bg-[#FCFBF8] rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(110,85,190,0.25)] border border-[#F0EBE0] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE1] shrink-0">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
                  Review Files for {selectedUserForReview.fullName} (@{selectedUserForReview.username})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select 1, 2, or all 3 files to download as a batch.
                </p>
              </div>
              <button
                onClick={() => setSelectedUserForReview(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-[#F3EFE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
              {loadingSelectedUserFiles ? (
                <p className="text-center text-xs text-slate-400">Loading files...</p>
              ) : selectedUserFiles.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">
                  This user has not uploaded any files yet.
                </div>
              ) : (
                selectedUserFiles.map((file) => {
                  const isChecked = selectedFileIdsForDownload.includes(file.id);
                  return (
                    <div
                      key={file.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-[#F4EFFF] border-[#8364ED] ring-2 ring-[#8364ED]/20'
                          : 'bg-[#F8F6EF] border-[#EAE5D7]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleFileSelection(file.id)}
                          className="w-4 h-4 text-[#8364ED] rounded focus:ring-0 cursor-pointer"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black text-[#8364ED] bg-white px-2 py-0.5 rounded-md border border-[#E2D8F7]">
                              {file.fileType}
                            </span>
                            <span className="text-[10px] font-bold text-slate-700 bg-[#EAE4D6] px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#8364ED]" />
                              <span>{file.period || 'Q3 2026'}</span>
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800">{file.originalName}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Timestamp: {new Date(file.uploadedAt).toLocaleString()}
                            </span>
                            <span>•</span>
                            <span>{(file.size / 1024).toFixed(1)} KB</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedFileForViewer(file)}
                          className="px-3 py-1.5 rounded-xl bg-white text-slate-700 border border-[#E0DBCF] text-xs font-bold flex items-center gap-1 hover:bg-[#F0EBFA] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#8364ED]" />
                          <span>Inspect Data</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!file.fileUrl) return;
                            const a = document.createElement('a');
                            a.href = file.fileUrl;
                            a.download = `${file.fileType}_${selectedUserForReview?.username}_${file.period || 'Period'}_${file.originalName}`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#8364ED] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#7150EA] shadow-2xs cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteFileInAdmin(file.id)}
                          className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-[#F0ECE1] flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-slate-600">
                Selected: <strong>{selectedFileIdsForDownload.length}</strong> of {selectedUserFiles.length} Files
              </span>

              <button
                type="button"
                onClick={handleDownloadSelectedFiles}
                disabled={selectedFileIdsForDownload.length === 0}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-40 cursor-pointer"
                id="btn-download-selected-user-files"
              >
                <Download className="w-4 h-4" />
                <span>Download Selected Files</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL ("Users -> Add User") */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#FCFBF8] rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(110,85,190,0.25)] border border-[#F0EBE0] relative">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-1" id="add-user-modal-title">
              Create User Account (Admin)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Set username, password, and system role. Users complete their email, phone, and personal profile upon login.
            </p>

            {addUserError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{addUserError}</span>
              </div>
            )}

            {addUserSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{addUserSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="space-y-3" id="add-user-form">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username (Unique ID) *</label>
                <input
                  type="text"
                  value={addUsername}
                  onChange={(e) => setAddUsername(e.target.value)}
                  placeholder="e.g. jdoe_admin"
                  className="w-full px-3.5 py-2.5 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:border-[#8364ED]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Display Full Name (Optional)</label>
                <input
                  type="text"
                  value={addFullName}
                  onChange={(e) => setAddFullName(e.target.value)}
                  placeholder="e.g. John Doe (Defaults to username if empty)"
                  className="w-full px-3.5 py-2.5 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#8364ED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full px-3 py-2 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs font-medium focus:outline-none focus:border-[#8364ED]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    value={addConfirmPassword}
                    onChange={(e) => setAddConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3 py-2 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs font-medium focus:outline-none focus:border-[#8364ED]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">System Role *</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs font-bold text-[#8364ED] focus:outline-none focus:border-[#8364ED]"
                  >
                    <option value="USER">USER / CLIENT</option>
                    <option value="MANAGER">MANAGER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs font-medium focus:outline-none focus:border-[#8364ED]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 bg-[#F3EFE6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingUser}
                  className="px-6 py-2 rounded-full text-xs font-bold text-white bg-[#8364ED] hover:bg-[#7150EA] shadow-md cursor-pointer disabled:opacity-50"
                  id="btn-submit-add-user"
                >
                  {addingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* READ-ONLY PERSONAL INFORMATION REVIEW MODAL FOR ADMIN */}
      {viewingUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#FCFBF8] rounded-3xl p-6 shadow-xl border border-[#F0EBE0] space-y-4 relative">
            <button
              onClick={() => setViewingUserDetail(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#F2ECE0] pb-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F0EBFA] text-[#8364ED] flex items-center justify-center font-black text-xl shrink-0">
                {viewingUserDetail.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">{viewingUserDetail.fullName}</h3>
                <p className="text-xs text-slate-400">@{viewingUserDetail.username} • {viewingUserDetail.role}</p>
              </div>
            </div>

            <p className="text-[11px] font-semibold text-slate-500 italic bg-[#F7F4EC] p-2.5 rounded-xl border border-[#EAE4D6]">
              Note: Personal information (email, phone, employee ID) is self-managed by each user. Admin mode provides review access.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F8F6EF] border border-[#EAE5D7] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Email Address</span>
                  <span className="font-bold text-slate-800">{viewingUserDetail.email || 'Not configured'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Phone Number</span>
                  <span className="font-bold text-slate-800">{viewingUserDetail.phone || 'Not configured'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Employee ID</span>
                  <span className="font-bold text-slate-800">{viewingUserDetail.employeeId || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Account Status</span>
                  <span className="font-bold text-emerald-600">{viewingUserDetail.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Registered Date</span>
                  <span className="font-bold text-slate-700">
                    {new Date(viewingUserDetail.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingUserDetail(null)}
                className="px-5 py-2 rounded-xl bg-[#8364ED] text-white text-xs font-bold hover:bg-[#7150EA] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN RESET PASSWORD MODAL */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#FCFBF8] rounded-[32px] p-6 shadow-[0_25px_60px_rgba(110,85,190,0.25)] border border-[#F0EBE0] relative">
            <button
              onClick={() => setResetModalUser(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-800 mb-1">
              Reset Password for {resetModalUser.username}
            </h3>

            {resetError && (
              <p className="text-xs text-rose-600 mb-2 font-medium">{resetError}</p>
            )}

            <form onSubmit={handleAdminResetPasswordSubmit} className="space-y-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={resetNewPass}
                  onChange={(e) => setResetNewPass(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs font-medium focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={resetConfirmPass}
                  onChange={(e) => setResetConfirmPass(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs font-medium focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-3 py-1.5 rounded-full text-xs text-slate-600 bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#8364ED]"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEND NOTIFICATION MODAL */}
      {showSendNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#FCFBF8] rounded-2xl sm:rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(110,85,190,0.25)] border border-[#F0EBE0] relative">
            <button
              onClick={() => setShowSendNotifModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#8364ED] text-white flex items-center justify-center shadow-md">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
                  Dispatch Notification / Announcement
                </h3>
                <p className="text-xs text-slate-500">
                  Send a broadcast notice to all users or a specific individual user.
                </p>
              </div>
            </div>

            {notifError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{notifError}</span>
              </div>
            )}

            {notifSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{notifSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSendNotifSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Recipient
                </label>
                <select
                  value={notifTargetUserId}
                  onChange={(e) => setNotifTargetUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#8364ED]"
                >
                  <option value="ALL">📢 Broadcast to All Users</option>
                  {users
                    .filter((u) => u.id !== currentUser.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        👤 {u.fullName} (@{u.username}) [{u.role}]
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notification Title / Subject
                </label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Monthly Tax Audit Reminder"
                  className="w-full px-3.5 py-2.5 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#8364ED]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message Body
                </label>
                <textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  rows={4}
                  placeholder="Type the notification details or operational instructions here..."
                  className="w-full px-3.5 py-2.5 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#8364ED] resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSendNotifModal(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 bg-[#F3EFE6] hover:bg-[#EAE4D6] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingNotif}
                  className="px-6 py-2.5 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-[#8364ED] to-[#7150EA] hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingNotif ? 'Dispatching...' : 'Send Notification'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FILE VIEWER */}
      <FileViewerModal
        file={selectedFileForViewer}
        onClose={() => setSelectedFileForViewer(null)}
        onSaved={(updated) => {
          setSelectedUserFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
        }}
      />

      {/* FIXED FLOATING BOTTOM NAVIGATION BAR */}
      <nav 
        className="fixed bottom-2 sm:bottom-4 left-0 right-0 z-40 px-3 py-1 pointer-events-none flex items-center justify-center"
        id="admin-bottom-nav-bar"
      >
        <div className="pointer-events-auto max-w-md w-[calc(100%-1rem)] sm:w-full bg-[#FCFBF8]/95 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-[#EAE3D2] shadow-[0_12px_36px_rgba(110,85,190,0.25)] flex items-center justify-between gap-0.5 sm:gap-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-3 rounded-full text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white shadow-[0_4px_14px_rgba(131,100,237,0.35)] scale-[1.02]'
                : 'text-slate-600 hover:text-[#8364ED] hover:bg-white/60'
            }`}
            id="tab-admin-users"
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Users</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-3 rounded-full text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white shadow-[0_4px_14px_rgba(131,100,237,0.35)] scale-[1.02]'
                : 'text-slate-600 hover:text-[#8364ED] hover:bg-white/60'
            }`}
            id="tab-admin-notifications"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Dispatch</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-3 rounded-full text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white shadow-[0_4px_14px_rgba(131,100,237,0.35)] scale-[1.02]'
                : 'text-slate-600 hover:text-[#8364ED] hover:bg-white/60'
            }`}
            id="tab-admin-profile"
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Admin Info</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
