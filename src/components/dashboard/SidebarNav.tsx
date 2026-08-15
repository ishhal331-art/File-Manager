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
      className="w-64 bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-5 border border-white/80 shadow-[0_20px_50px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col justify-between shrink-0 h-[calc(100vh-2rem)] sticky top-4 hidden lg:flex"
      id="desktop-sidebar-nav"
    >
      <div className="space-y-5">
        {/* HRA BRAND LOGO */}
        <div className="flex flex-col gap-1 px-1">
          <div className="h-10 w-full flex items-center justify-start">
            <HRALogo className="h-9 w-auto" variant="dark" />
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-black text-[#92798B] uppercase tracking-wider bg-[#E5DAD9] px-2.5 py-0.5 rounded-full border border-white/70 shadow-2xs">
              Enterprise
            </span>
            <span className="text-[10px] font-bold text-[#5A463B]">Files Portal</span>
          </div>
        </div>

        {/* USER PROFILE CHIP */}
        <div className="p-3 rounded-2xl bg-[#E5DAD9]/80 backdrop-blur-md border border-white/80 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#92798B] to-[#5A463B] text-[#F3EAE2] font-black text-sm flex items-center justify-center shadow-xs shrink-0">
            {currentUser.fullName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-[#302112] truncate">{currentUser.fullName}</p>
            <span className="text-[10px] font-extrabold text-[#92798B] bg-[#F3EAE2] px-2 py-0.5 rounded-md inline-block mt-0.5 border border-white/60">
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
                    ? 'bg-gradient-to-r from-[#92798B] via-[#5A463B] to-[#302112] text-[#F3EAE2] shadow-[0_6px_18px_rgba(90,70,59,0.25)] scale-[1.02]'
                    : 'text-[#5A463B] hover:text-[#302112] hover:bg-[#E5DAD9]/60'
                }`}
                id={`sidebar-link-${item.id}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FAF6F0]' : 'text-[#92798B]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                      isActive ? 'bg-[#FAF6F0] text-[#302112]' : 'bg-[#92798B] text-[#FAF6F0]'
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
      <div className="pt-3 border-t border-white/60">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold text-[#5A463B] hover:text-rose-800 hover:bg-[#E0D1D4] transition-all cursor-pointer"
          id="btn-sidebar-logout"
        >
          <LogOut className="w-4 h-4 text-[#FAF6F0] p-0.5 rounded bg-[#92798B]" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
