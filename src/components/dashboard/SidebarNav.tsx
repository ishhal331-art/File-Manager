import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  Sparkles,
  CheckSquare,
  Users,
  Bell,
  Clock,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  BarChart3,
  FolderOpen,
} from 'lucide-react';
import { User } from '../../types';
import { HRALogo } from '../HRALogo';

export type NavTab =
  | 'dashboard'
  | 'analytics'
  | 'upload'
  | 'directory'
  | 'ai'
  | 'tasks'
  | 'users'
  | 'notifications'
  | 'activity'
  | 'profile';

interface Props {
  currentUser: User;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onLogout: () => void;
  notifCount?: number;
}

export const SidebarNav: React.FC<Props> = ({
  currentUser,
  activeTab,
  onTabChange,
  onLogout,
  notifCount = 0,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';
  const isManager = currentUser.role === 'MANAGER';

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    adminOnly?: boolean;
    managerOrAdmin?: boolean;
    userOnly?: boolean;
  }> = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Graphs & Analytics', icon: BarChart3 },
    { id: 'directory', label: 'Dossier Directory', icon: FolderOpen, managerOrAdmin: true },
    { id: 'upload', label: 'Upload Vaults', icon: UploadCloud, userOnly: true },
    { id: 'ai', label: 'AI Advisor & OCR', icon: Sparkles },
    { id: 'tasks', label: 'Google Tasks & Notes', icon: CheckSquare },
    { id: 'users', label: 'User Directory', icon: Users, managerOrAdmin: true },
    { id: 'notifications', label: 'Messages', icon: Bell, badge: notifCount },
    { id: 'profile', label: 'Profile Settings', icon: UserIcon },
  ];

  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.managerOrAdmin && !isAdmin && !isManager) return false;
    if (item.userOnly && (isAdmin || isManager)) return false;
    return true;
  });

  return (
    <aside
      className="w-64 bg-[#161D2F]/90 backdrop-blur-xl rounded-[28px] p-5 border border-[#263047] shadow-[0_20px_50px_rgba(11,15,24,0.7)] flex flex-col justify-between shrink-0 h-[calc(100vh-2rem)] sticky top-4 hidden lg:flex z-10"
      id="desktop-sidebar-nav"
    >
      <div className="space-y-5">
        {/* HRA BRAND LOGO */}
        <div className="flex flex-col gap-1 px-1">
          <div className="h-10 w-full flex items-center justify-start">
            <HRALogo className="h-9 w-auto" variant="accent" />
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-black text-[#22D39F] uppercase tracking-wider bg-[#102D30] px-2.5 py-0.5 rounded-full border border-[#22D39F]/30 shadow-inner">
              Accountant
            </span>
            <span className="text-[10px] font-bold text-[#7F8BA3]">Files Portal</span>
          </div>
        </div>

        {/* USER PROFILE CHIP */}
        <div className="p-3 rounded-2xl bg-[#0B0F18]/90 backdrop-blur-md border border-[#263047] flex items-center gap-3 shadow-inner">
          <div className="w-9 h-9 rounded-xl bg-[#102D30] text-[#22D39F] font-black text-sm flex items-center justify-center shadow-xs shrink-0 border border-[#22D39F]/30">
            {currentUser.fullName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-[#F0F4FF] truncate">{currentUser.fullName}</p>
            <span className="text-[10px] font-extrabold text-[#22D39F] bg-[#102D30] px-2 py-0.5 rounded-md inline-block mt-0.5 border border-[#22D39F]/20">
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="space-y-1.5" id="sidebar-nav-links">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#22D39F] text-[#0E1120] shadow-[0_4px_16px_rgba(34,211,159,0.35)] scale-[1.02]'
                    : 'text-[#AEB8CC] hover:text-[#F0F4FF] hover:bg-[#0B0F18]'
                }`}
                id={`sidebar-link-${item.id}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0E1120]' : 'text-[#22D39F]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                      isActive ? 'bg-[#0E1120] text-[#22D39F]' : 'bg-[#22D39F] text-[#0E1120]'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* LOGOUT BUTTON AT BOTTOM */}
      <div className="pt-3 border-t border-[#263047]">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold text-[#7F8BA3] hover:text-rose-400 hover:bg-[#0B0F18] transition-all cursor-pointer"
          id="btn-sidebar-logout"
        >
          <LogOut className="w-4 h-4 text-rose-400 p-0.5 rounded bg-rose-950/50" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
