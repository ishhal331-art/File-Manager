import React, { useState, useEffect } from 'react';
import { User, UploadedFile, UserUploadProgress } from '../../types';
import { api } from '../../lib/api';
import { FileViewerModal } from './FileViewerModal';
import { NotificationsTab } from './NotificationsTab';
import { ProfileTab } from './ProfileTab';
import { Users, Eye, LogOut, Bell, UserCheck, Search, X, UserPlus, Mail, Phone, Hash, ShieldCheck, Download, Trash2, Calendar, Clock, FileSpreadsheet, FileText, CheckSquare, Square } from 'lucide-react';

interface Props {
  currentUser: User;
  onLogout: () => void;
}

export const ManagerDashboard: React.FC<Props> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'directory' | 'notifications' | 'profile'>('users');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userProgressList, setUserProgressList] = useState<UserUploadProgress[]>([]);
  const [allUploadedFiles, setAllUploadedFiles] = useState<UploadedFile[]>([]);
  const [fileFilterType, setFileFilterType] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [notifCount, setNotifCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected User for Review
  const [selectedUserForReview, setSelectedUserForReview] = useState<User | null>(null);
  const [selectedUserFiles, setSelectedUserFiles] = useState<UploadedFile[]>([]);
  const [selectedFileForViewer, setSelectedFileForViewer] = useState<UploadedFile | null>(null);
  const [selectedFileIdsForDownload, setSelectedFileIdsForDownload] = useState<string[]>([]);

  // Modal for Viewing User Personal Details (Read-Only for Manager)
  const [viewingUserDetail, setViewingUserDetail] = useState<User | null>(null);

  // Modal for Adding New User (Manager can only add USER role)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    loadData();
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
      } else if (viewingUserDetail) {
        e.preventDefault();
        setViewingUserDetail(null);
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
    viewingUserDetail,
    activeTab,
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, progressRes, filesRes, notifsRes] = await Promise.all([
        api.getUsers(),
        api.getUserProgress(),
        api.getFiles(),
        api.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 })),
      ]);
      setAllUsers(usersRes.users);
      setUserProgressList(progressRes.userProgress);
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

  const handleOpenNotifications = () => {
    setActiveTab('notifications');
    setNotifCount(0);
  };

  const handleReviewUser = async (user: User) => {
    setSelectedUserForReview(user);
    try {
      const res = await api.getFiles(user.id);
      setSelectedUserFiles(res.files);
      setSelectedFileIdsForDownload(res.files.map((f) => f.id));
    } catch (err) {
      console.error('Error loading files:', err);
    }
  };

  const handleToggleFileSelection = (fileId: string) => {
    if (selectedFileIdsForDownload.includes(fileId)) {
      setSelectedFileIdsForDownload((prev) => prev.filter((id) => id !== fileId));
    } else {
      setSelectedFileIdsForDownload((prev) => [...prev, fileId]);
    }
  };

  const handleSelectAllFiles = () => {
    if (selectedFileIdsForDownload.length === selectedUserFiles.length) {
      setSelectedFileIdsForDownload([]);
    } else {
      setSelectedFileIdsForDownload(selectedUserFiles.map((f) => f.id));
    }
  };

  const handleDownloadFilesBatch = (filesToDownload: UploadedFile[]) => {
    if (filesToDownload.length === 0) {
      alert('Please select at least one file to download.');
      return;
    }

    filesToDownload.forEach((file) => {
      if (!file.fileUrl) return;
      const a = document.createElement('a');
      a.href = file.fileUrl;
      a.download = `${file.fileType}_${selectedUserForReview?.username || 'user'}_${file.period || 'Period'}_${file.originalName}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const handleExportUserReport = (user: User, userFiles: UploadedFile[]) => {
    let csv = `Client Document Compliance Report - ${user.fullName} (@${user.username})\n`;
    csv += `Email: ${user.email || 'N/A'}, Phone: ${user.phone || 'N/A'}, Employee ID: ${user.employeeId || 'N/A'}\n`;
    csv += `Total Files Stored: ${userFiles.length}\n\n`;
    csv += `File ID,Category,Period,File Name,Upload Timestamp,Size (KB),Parsed Rows\n`;

    userFiles.forEach((f) => {
      const kb = (f.size / 1024).toFixed(1);
      const rows = f.extractedData ? f.extractedData.length : 0;
      csv += `"${f.id}","${f.fileType}","${f.period || 'Q3 2026'}","${f.originalName}","${new Date(f.uploadedAt).toLocaleString()}",${kb},${rows}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${user.username}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDeleteFileInManager = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file from the user store?')) return;
    try {
      await api.deleteFile(fileId);
      setSelectedUserFiles((prev) => prev.filter((f) => f.id !== fileId));
      setSelectedFileIdsForDownload((prev) => prev.filter((id) => id !== fileId));
      await loadData();
    } catch (err: any) {
      alert(`Delete error: ${err.message || 'Could not delete file.'}`);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword || !newConfirmPassword) {
      alert('Username, password, and confirm password are required.');
      return;
    }

    if (newPassword !== newConfirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setCreatingUser(true);
    try {
      await api.createUser({
        fullName: newFullName.trim() || newUsername.trim(),
        username: newUsername.trim(),
        password: newPassword,
        confirmPassword: newConfirmPassword,
        role: 'USER',
        status: 'ACTIVE',
      });

      alert('User account created successfully! The client can log in and update their personal profile.');
      setShowAddUserModal(false);
      setNewFullName('');
      setNewUsername('');
      setNewPassword('');
      setNewConfirmPassword('');
      await loadData();
    } catch (err: any) {
      alert(`User creation error: ${err.message || 'Could not create user.'}`);
    } finally {
      setCreatingUser(false);
    }
  };

  const filteredUsers = allUsers.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(q))
    );
  });

  const clientUsers = filteredUsers.filter((u) => u.role === 'USER');

  return (
    <div className="min-h-screen bg-[#F4F0FC] text-slate-800 font-sans selection:bg-[#8364ED]/20 selection:text-[#8364ED] overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-[#FCFBF8]/95 backdrop-blur-md border-b border-[#F0ECE1] shadow-[0_10px_25px_rgba(110,85,190,0.05)] py-3 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#8364ED] to-[#A58DF5] text-white flex items-center justify-center font-extrabold text-lg shadow-md shrink-0">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight truncate" id="manager-portal-title">
                Manager Oversight Portal
              </h1>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 truncate">
                Client Compliance & Directory Oversight
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
              id="btn-manager-add-user"
              title="Add a new client user"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add User</span>
            </button>

            <button
              onClick={handleOpenNotifications}
              className="px-3 py-1.5 rounded-2xl bg-[#F0EBFA] hover:bg-[#E2D6FA] text-[#8364ED] text-xs font-extrabold flex items-center gap-1.5 border border-[#E2D8F7] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 relative"
              id="btn-manager-header-messages"
              title="Click to view Messages and Notifications"
            >
              <Bell className="w-3.5 h-3.5 text-[#8364ED]" />
              <span>{notifCount} Messages</span>
              {notifCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            <button
              onClick={onLogout}
              className="p-2 sm:p-2.5 rounded-2xl bg-[#F5F0E6] hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-all border border-[#EAE4D6] cursor-pointer"
              id="btn-manager-logout"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-36 sm:pb-44 space-y-6 sm:space-y-8">
        {/* SEARCH BAR */}
        {(activeTab === 'users' || activeTab === 'directory') && (
          <div className="bg-[#FCFBF8] p-3 rounded-2xl border border-[#F0ECE1] shadow-2xs flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users or managers by name, username, email, or employee ID..."
              className="w-full text-xs font-medium bg-transparent border-none outline-none text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#FCFBF8] rounded-2xl sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-[#F0ECE1] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE0]">
                <h2 className="text-base font-extrabold text-slate-800">
                  Client Ingestion Progress Tracker
                </h2>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="text-xs font-bold text-[#8364ED] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Register New Client</span>
                </button>
              </div>

              <div className="space-y-3">
                {userProgressList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No client progress records found.</p>
                ) : (
                  userProgressList.map((prog) => {
                    const targetUser = allUsers.find((u) => u.id === prog.userId);
                    if (!targetUser) return null;
                    if (
                      searchQuery &&
                      !targetUser.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
                      !targetUser.username.toLowerCase().includes(searchQuery.toLowerCase())
                    ) {
                      return null;
                    }

                    return (
                      <div
                        key={prog.userId}
                        className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F6EF] hover:bg-[#F2ECE0] border border-[#EAE5D7] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4"
                      >
                        <button
                          type="button"
                          onClick={() => handleReviewUser(targetUser)}
                          className="text-left group cursor-pointer"
                          title="Click username to review files & download records"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-[#8364ED] transition-colors underline decoration-dotted underline-offset-2">
                            {prog.userName}
                          </p>
                          <p className="text-[10px] text-slate-400">@{targetUser.username} • {targetUser.email || 'No Email'}</p>
                        </button>

                        <div className="w-full md:w-1/2 space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>Ingestion Progress</span>
                            <span className="text-[#8364ED]">{prog.percentage}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-[#E6E1F5] overflow-hidden">
                            <div
                              className="h-full bg-[#8364ED]"
                              style={{ width: `${prog.percentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setViewingUserDetail(targetUser)}
                            className="px-3 py-1.5 rounded-xl bg-white text-slate-700 font-bold text-xs border border-[#E2DDD0] hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                            title="View updated personal details"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#8364ED]" />
                            <span>Details</span>
                          </button>

                          <button
                            onClick={() => handleReviewUser(targetUser)}
                            className="px-3 py-1.5 rounded-xl bg-[#8364ED] text-white font-bold text-xs hover:bg-[#7150EA] flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <span>Review Files</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ALL INGESTED DOCUMENTS (MANAGER GLOBAL LEDGER) */}
            <div className="bg-[#FCFBF8] rounded-2xl sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-[#F0ECE1] space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#F2ECE0]">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#8364ED]" />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                      All Uploaded Files & Financial Ingestion Ledger
                    </h3>
                    <p className="text-xs text-slate-400">
                      All documents uploaded across assigned users in real-time.
                    </p>
                  </div>
                </div>

                {/* CATEGORY FILTER BUTTONS */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['ALL', 'SALES', 'PURCHASE', 'BANK_STATEMENT'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFileFilterType(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        fileFilterType === cat
                          ? 'bg-[#8364ED] text-white shadow-xs'
                          : 'bg-[#F2EDE2] text-slate-600 hover:bg-[#EAE4D6]'
                      }`}
                    >
                      {cat === 'ALL'
                        ? 'All'
                        : cat === 'SALES'
                        ? 'Sales'
                        : cat === 'PURCHASE'
                        ? 'Purchase'
                        : 'Bank'}
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#8364ED] bg-[#F0EBFA] px-3 py-1 rounded-full border border-[#E2D8F7] shrink-0 ml-1">
                    {allUploadedFiles.length} Total
                  </span>
                </div>
              </div>

              {allUploadedFiles.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium bg-[#F8F6EF] rounded-2xl border border-dashed border-[#E0DBCF]">
                  No files have been uploaded yet. User uploads will immediately appear here.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {allUploadedFiles
                    .filter((f) => {
                      const matchesCategory = fileFilterType === 'ALL' || f.fileType === fileFilterType;
                      const q = searchQuery.toLowerCase();
                      const matchesSearch =
                        !searchQuery ||
                        f.originalName.toLowerCase().includes(q) ||
                        (f.userName && f.userName.toLowerCase().includes(q)) ||
                        (f.period && f.period.toLowerCase().includes(q));
                      return matchesCategory && matchesSearch;
                    })
                    .map((file) => {
                      const functionLabel =
                        file.fileType === 'SALES'
                          ? 'Sales File'
                          : file.fileType === 'PURCHASE'
                          ? 'Purchase File'
                          : 'Bank Statement';

                      const functionColor =
                        file.fileType === 'SALES'
                          ? 'bg-purple-100 text-purple-700 border-purple-200'
                          : file.fileType === 'PURCHASE'
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border-emerald-200';

                      return (
                        <div
                          key={file.id}
                          className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F6EF] hover:bg-[#F2ECE0] border border-[#EAE5D7] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="p-2.5 rounded-xl bg-white border border-[#E0DBCF] text-[#8364ED] shrink-0 shadow-2xs">
                              <FileSpreadsheet className="w-5 h-5" />
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-black border px-2 py-0.5 rounded-md whitespace-nowrap ${functionColor}`}>
                                  {functionLabel}
                                </span>
                                <span className="text-[10px] font-bold text-slate-800 bg-[#EAE4D6] px-2 py-0.5 rounded-md whitespace-nowrap">
                                  User: {file.userName || file.userId}
                                </span>
                                <span className="text-[10px] font-bold text-slate-700 bg-[#EAE4D6] px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 whitespace-nowrap">
                                  <Calendar className="w-3 h-3 text-[#8364ED]" />
                                  <span>{file.period || 'Q3 2026'}</span>
                                </span>
                              </div>

                              <p className="text-xs sm:text-sm font-extrabold text-slate-800 break-words line-clamp-2" title={file.originalName}>
                                {file.originalName}
                              </p>

                              <div className="text-[11px] font-semibold text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {new Date(file.uploadedAt).toLocaleString()}
                                </span>
                                <span>•</span>
                                <span className="whitespace-nowrap">{(file.size / 1024).toFixed(1)} KB</span>
                              </div>
                            </div>
                          </div>

                          {/* ACTIONS */}
                          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#ECE6D8] w-full sm:w-auto justify-end">
                            <button
                              type="button"
                              onClick={() => setSelectedFileForViewer(file)}
                              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-[#E2DDD0] shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                              title="Inspect File OCR Extracted Data"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#8364ED]" />
                              <span>Inspect Data</span>
                            </button>

                            {file.fileUrl && (
                              <a
                                href={file.fileUrl}
                                download={file.originalName}
                                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#8364ED] hover:bg-[#7150EA] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap"
                                title="Download File"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DIRECTORY TAB FOR MANAGERS (VIEW ALL UPDATED USER & MANAGER DETAILS) */}
        {activeTab === 'directory' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#FCFBF8] rounded-2xl sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-[#F0ECE1] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE0]">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">
                    User & Manager Directory
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    View updated personal details for every registered user and manager
                  </p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-3 py-2 rounded-xl bg-[#8364ED] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-[#7150EA] cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add New User</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#EAE5D7] space-y-3 relative hover:border-[#8364ED]/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleReviewUser(u)}
                        className="text-left group cursor-pointer min-w-0"
                        title="Click to review user files and download history"
                      >
                        <h3 className="text-xs font-extrabold text-slate-800 group-hover:text-[#8364ED] transition-colors truncate underline decoration-dotted underline-offset-2">
                          {u.fullName}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium truncate">@{u.username}</p>
                      </button>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                          u.role === 'ADMIN'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : u.role === 'MANAGER'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-b border-[#EAE5D7] py-2.5">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{u.email || 'No email provided'}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{u.phone || 'No phone provided'}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">ID: {u.employeeId || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        Status: <strong className="text-emerald-600">{u.status}</strong>
                      </span>
                      <button
                        onClick={() => setViewingUserDetail(u)}
                        className="px-3 py-1 rounded-xl bg-white hover:bg-slate-50 text-[#8364ED] font-bold text-[11px] border border-[#E2DDD0] shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab 
            currentUser={currentUser} 
            onNotificationsViewed={() => setNotifCount(0)} 
          />
        )}

        {activeTab === 'profile' && <ProfileTab currentUser={currentUser} />}
      </main>

      {/* READ-ONLY PERSONAL DETAILS VIEW MODAL */}
      {viewingUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#FCFBF8] rounded-3xl p-6 shadow-xl border border-[#F0EBE0] space-y-4 relative animate-scale-up">
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
              Note: Personal details are updated directly by each individual user.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F8F6EF] border border-[#EAE5D7] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Email Address</span>
                  <span className="font-bold text-slate-800">{viewingUserDetail.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Phone Number</span>
                  <span className="font-bold text-slate-800">{viewingUserDetail.phone || 'Not provided'}</span>
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

      {/* ADD NEW USER MODAL (FOR MANAGERS) */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#FCFBF8] rounded-3xl p-6 shadow-xl border border-[#F0EBE0] space-y-4 relative animate-scale-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-2 border-b border-[#F2ECE0]">
              <UserPlus className="w-5 h-5 text-[#8364ED]" />
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Add New Client Account</h3>
                <p className="text-[11px] text-slate-500">
                  Assign username, password, and CLIENT role. Users self-manage their personal contact details upon login.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username (Unique ID) *</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. client_rvance"
                  className="w-full px-3.5 py-2 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#8364ED]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Display Full Name (Optional)</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Robert Vance (Defaults to Username if empty)"
                  className="w-full px-3.5 py-2 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#8364ED]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#8364ED]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    value={newConfirmPassword}
                    onChange={(e) => setNewConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-3.5 py-2 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#8364ED]"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-[#F8F6EF] rounded-xl border border-[#EAE5D7] text-xs">
                <p className="font-bold text-slate-700">Assigned Role: <span className="text-[#8364ED]">USER / CLIENT</span></p>
                <p className="text-[11px] text-slate-500 mt-0.5">Managers assign standard client accounts.</p>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-5 py-2 rounded-xl bg-[#8364ED] hover:bg-[#7150EA] text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{creatingUser ? 'Creating...' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW USER FILES MODAL */}
      {selectedUserForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl bg-[#FCFBF8] rounded-2xl sm:rounded-[32px] p-5 sm:p-7 shadow-2xl border border-[#F0EBE0] relative space-y-5">
            <button
              onClick={() => setSelectedUserForReview(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* MODAL HEADER WITH USER DOSSIER */}
            <div className="space-y-2 border-b border-[#F0EBE0] pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-[#F0EBFA] border border-[#E2D8F7] text-[#8364ED]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">
                    Document Dossier & Filings: {selectedUserForReview.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    @{selectedUserForReview.username} • {selectedUserForReview.email || 'No email'} • Phone: {selectedUserForReview.phone || 'N/A'}
                  </p>
                </div>
              </div>

              {/* ACTION TOOLBAR FOR MANAGERS */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFiles}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E0DBCF] hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {selectedFileIdsForDownload.length === selectedUserFiles.length && selectedUserFiles.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#8364ED]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>Select All ({selectedUserFiles.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const selectedFiles = selectedUserFiles.filter((f) => selectedFileIdsForDownload.includes(f.id));
                      handleDownloadFilesBatch(selectedFiles);
                    }}
                    disabled={selectedFileIdsForDownload.length === 0}
                    className="px-3 py-1.5 rounded-xl bg-[#8364ED] hover:bg-[#7150EA] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Selected ({selectedFileIdsForDownload.length})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleExportUserReport(selectedUserForReview, selectedUserFiles)}
                  className="px-3 py-1.5 rounded-xl bg-[#F0EBFA] hover:bg-[#E2D6FA] text-[#8364ED] font-bold text-xs border border-[#E2D8F7] flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export Compliance CSV</span>
                </button>
              </div>
            </div>

            {/* FILE LISTING WITH TIMESTAMPS & PERIOD TAGS */}
            <div className="space-y-3 max-h-[55vh] overflow-y-auto py-1 pr-1">
              {selectedUserFiles.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium bg-[#F8F6EF] rounded-2xl border border-dashed border-[#E0DBCF]">
                  No monthly or quarterly documents uploaded by this user yet.
                </div>
              ) : (
                selectedUserFiles.map((f) => {
                  const isSelected = selectedFileIdsForDownload.includes(f.id);
                  return (
                    <div
                      key={f.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                        isSelected
                          ? 'bg-[#F3EFE6] border-[#8364ED] ring-2 ring-[#8364ED]/20 shadow-2xs'
                          : 'bg-[#F8F6EF] border-[#EAE5D7] hover:border-[#DED8C6]'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleFileSelection(f.id)}
                          className="mt-1 text-slate-500 hover:text-[#8364ED] cursor-pointer shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#8364ED]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black text-[#8364ED] bg-white border border-[#E2D8F7] px-2 py-0.5 rounded-md whitespace-nowrap">
                              {f.fileType}
                            </span>
                            <span className="text-[10px] font-bold text-slate-700 bg-[#EAE4D6] px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 whitespace-nowrap">
                              <Calendar className="w-3 h-3 text-[#8364ED]" />
                              <span>{f.period || 'Q3 2026'}</span>
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm font-extrabold text-slate-800 break-words line-clamp-2" title={f.originalName}>
                            {f.originalName}
                          </p>

                          <div className="text-[11px] font-semibold text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {new Date(f.uploadedAt).toLocaleString()}
                            </span>
                            <span>•</span>
                            <span className="whitespace-nowrap">{(f.size / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                      </div>

                      {/* INDIVIDUAL FILE ACTIONS */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#ECE6D8] w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedFileForViewer(f)}
                          className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-[#E2DDD0] shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#8364ED]" />
                          <span>Inspect Data</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadFilesBatch([f])}
                          className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#8364ED] hover:bg-[#7150EA] text-white text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteFileInManager(f.id)}
                          className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-[#E2DDD0] hover:border-rose-200 transition-colors cursor-pointer shrink-0"
                          title="Delete file from system"
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
        </div>
      )}

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
        id="manager-bottom-nav-bar"
      >
        <div className="pointer-events-auto max-w-md w-[calc(100%-1rem)] sm:w-full bg-[#FCFBF8]/95 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-[#EAE3D2] shadow-[0_12px_36px_rgba(110,85,190,0.25)] flex items-center justify-between gap-0.5 sm:gap-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-3 rounded-full text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white shadow-[0_4px_14px_rgba(131,100,237,0.35)] scale-[1.02]'
                : 'text-slate-600 hover:text-[#8364ED] hover:bg-white/60'
            }`}
            id="tab-mgr-users"
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-3 rounded-full text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white shadow-[0_4px_14px_rgba(131,100,237,0.35)] scale-[1.02]'
                : 'text-slate-600 hover:text-[#8364ED] hover:bg-white/60'
            }`}
            id="tab-mgr-directory"
          >
            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Directory</span>
          </button>

          <button
            onClick={handleOpenNotifications}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-3 rounded-full text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer relative ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white shadow-[0_4px_14px_rgba(131,100,237,0.35)] scale-[1.02]'
                : 'text-slate-600 hover:text-[#8364ED] hover:bg-white/60'
            }`}
            id="tab-mgr-notifications"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Notifications</span>
            {notifCount > 0 && activeTab !== 'notifications' && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-1 right-2" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-3 rounded-full text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white shadow-[0_4px_14px_rgba(131,100,237,0.35)] scale-[1.02]'
                : 'text-slate-600 hover:text-[#8364ED] hover:bg-white/60'
            }`}
            id="tab-mgr-profile"
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Manager Info</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
