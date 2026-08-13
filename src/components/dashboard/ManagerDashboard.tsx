import React, { useState, useEffect } from 'react';
import { User, UploadedFile, UserUploadProgress } from '../../types';
import { api } from '../../lib/api';
import { FileViewerModal } from './FileViewerModal';
import { NotificationsTab } from './NotificationsTab';
import { ProfileTab } from './ProfileTab';
import { Users, Eye, Download, LogOut, Bell, UserCheck, Search, X } from 'lucide-react';

interface Props {
  currentUser: User;
  onLogout: () => void;
}

export const ManagerDashboard: React.FC<Props> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'notifications' | 'profile'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [userProgressList, setUserProgressList] = useState<UserUploadProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected User for Review
  const [selectedUserForReview, setSelectedUserForReview] = useState<User | null>(null);
  const [selectedUserFiles, setSelectedUserFiles] = useState<UploadedFile[]>([]);
  const [selectedFileForViewer, setSelectedFileForViewer] = useState<UploadedFile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, progressRes] = await Promise.all([
        api.getUsers(),
        api.getUserProgress(),
      ]);
      setUsers(usersRes.users.filter((u) => u.role === 'USER'));
      setUserProgressList(progressRes.userProgress);
    } catch (err) {
      console.error('Failed to load manager data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewUser = async (user: User) => {
    setSelectedUserForReview(user);
    try {
      const res = await api.getFiles(user.id);
      setSelectedUserFiles(res.files);
    } catch (err) {
      console.error('Error loading files:', err);
    }
  };

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
                Client Compliance Monitoring
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 sm:p-2.5 rounded-2xl bg-[#F5F0E6] hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-all border border-[#EAE4D6] cursor-pointer"
            id="btn-manager-logout"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 space-y-6 sm:space-y-8">
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#FCFBF8] rounded-2xl sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-[#F0ECE1] space-y-4">
              <h2 className="text-base font-extrabold text-slate-800 pb-2 border-b border-[#F2ECE0]">
                Client Ingestion Progress Bars
              </h2>

              <div className="space-y-3">
                {userProgressList.map((prog) => {
                  const targetUser = users.find((u) => u.id === prog.userId);
                  if (!targetUser) return null;

                  return (
                    <div
                      key={prog.userId}
                      onClick={() => handleReviewUser(targetUser)}
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F6EF] hover:bg-[#F2ECE0] border border-[#EAE5D7] transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{prog.userName}</p>
                        <p className="text-[10px] text-slate-400">@{targetUser.username}</p>
                      </div>

                      <div className="w-full md:w-1/2 space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Progress</span>
                          <span className="text-[#8364ED]">{prog.percentage}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#E6E1F5] overflow-hidden">
                          <div
                            className="h-full bg-[#8364ED]"
                            style={{ width: `${prog.percentage}%` }}
                          />
                        </div>
                      </div>

                      <button className="px-3 py-1.5 rounded-xl bg-white text-[#8364ED] font-bold text-xs border border-[#E2DDD0] shrink-0">
                        Review
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && <NotificationsTab currentUser={currentUser} />}

        {activeTab === 'profile' && <ProfileTab currentUser={currentUser} />}
      </main>

      {/* REVIEW MODAL */}
      {selectedUserForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#FCFBF8] rounded-2xl sm:rounded-[32px] p-6 shadow-lg border border-[#F0EBE0] relative">
            <button
              onClick={() => setSelectedUserForReview(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Files for {selectedUserForReview.fullName}
            </h3>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedUserFiles.length === 0 ? (
                <p className="text-xs text-slate-400">No uploaded files found.</p>
              ) : (
                selectedUserFiles.map((f) => (
                  <div key={f.id} className="p-3 rounded-2xl bg-[#F8F6EF] flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{f.originalName}</p>
                      <p className="text-[10px] text-slate-400">{f.fileType}</p>
                    </div>
                    <button
                      onClick={() => setSelectedFileForViewer(f)}
                      className="px-3 py-1 rounded-xl bg-white text-[#8364ED] text-xs font-bold shrink-0 shadow-2xs"
                    >
                      Inspect Data
                    </button>
                  </div>
                ))
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
        className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-4 pointer-events-none flex items-center justify-center"
        id="manager-bottom-nav-bar"
      >
        <div className="pointer-events-auto max-w-md w-[calc(100%-0.5rem)] sm:w-full bg-[#FCFBF8]/95 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-[#EAE3D2] shadow-[0_12px_36px_rgba(110,85,190,0.2)] flex items-center justify-between gap-0.5 sm:gap-1">
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
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-3 rounded-full text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white shadow-[0_4px_14px_rgba(131,100,237,0.35)] scale-[1.02]'
                : 'text-slate-600 hover:text-[#8364ED] hover:bg-white/60'
            }`}
            id="tab-mgr-notifications"
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
            id="tab-mgr-profile"
          >
            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Manager Info</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
