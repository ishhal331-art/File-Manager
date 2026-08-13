import React, { useState } from 'react';
import { api } from '../../lib/api';
import { User as UserIcon, Lock, Eye, EyeOff, Cloud, AlertCircle, Sparkles, Shield, ChevronRight, Folder, Database, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface Props {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const [activeRoleOption, setActiveRoleOption] = useState<'user' | 'admin'>('user');
  const [username, setUsername] = useState('user1');
  const [password, setPassword] = useState('UserPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleRoleSwitch = (role: 'user' | 'admin') => {
    setActiveRoleOption(role);
    setError(null);
    if (role === 'admin') {
      setUsername('admin');
      setPassword('AdminPassword123!');
    } else {
      setUsername('user1');
      setPassword('UserPass123!');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login(username.trim(), password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-br from-[#E8E2F7] via-[#DFD7F5] to-[#D5CAFA] flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans selection:bg-[#8364ED]/20 selection:text-[#8364ED]"
      id="login-container"
    >
      {/* LEFT SIDE FLOATERS */}
      <div className="absolute top-12 left-6 lg:left-12 hidden md:flex items-center gap-3 p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(110,85,190,0.12)] float-bubble z-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8364ED] to-[#A58DF5] text-white flex items-center justify-center shadow-md">
          <Cloud className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-black text-slate-800">Cloud Storage</p>
          <p className="text-[10px] font-semibold text-slate-500">Persistent Disk & Supabase Vault</p>
        </div>
      </div>

      <div className="absolute bottom-16 left-8 lg:left-16 hidden md:flex items-center gap-3 p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(110,85,190,0.12)] float-bubble-delayed z-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-black text-slate-800">AI OCR Engine</p>
          <p className="text-[10px] font-semibold text-slate-500">Automated Financial Ingestion</p>
        </div>
      </div>

      {/* RIGHT SIDE FLOATERS */}
      <div className="absolute top-16 right-6 lg:right-12 hidden md:flex items-center gap-3 p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(110,85,190,0.12)] float-bubble-delayed z-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-black text-slate-800">Verified Compliance</p>
          <p className="text-[10px] font-semibold text-slate-500">Real-Time Ledger Reconciliation</p>
        </div>
      </div>

      <div className="absolute bottom-20 right-8 lg:right-16 hidden md:flex items-center gap-3 p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(110,85,190,0.12)] float-bubble z-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-black text-slate-800">Multi-Role Security</p>
          <p className="text-[10px] font-semibold text-slate-500">Protected Client & Admin Portals</p>
        </div>
      </div>

      {/* PORTAL TITLE BRANDING BAR */}
      <div className="mb-4 sm:mb-6 z-20 flex items-center gap-2.5 bg-white/60 backdrop-blur-md px-5 py-2 rounded-full border border-white/80 shadow-[0_8px_20px_rgba(110,85,190,0.08)]">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#8364ED] to-[#A58DF5] text-white flex items-center justify-center shadow-xs">
          <Folder className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-extrabold text-slate-800 tracking-tight" id="login-portal-name">
          Files Manager
        </span>
        <span className="text-[10px] font-bold text-[#8364ED] bg-[#F0EBFA] px-2 py-0.5 rounded-full border border-[#E2D8F7]">
          Secure Portal
        </span>
      </div>

      {/* CENTRAL RESPONSIVE CLAY CARD CONTAINER */}
      <div 
        className="w-full max-w-md bg-[#FCFBF8] rounded-[38px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(110,85,190,0.22),0_10px_20px_rgba(110,85,190,0.08),inset_0_2px_3px_rgba(255,255,255,0.9)] border border-[#F0ECE1] relative z-10 my-auto transition-all duration-300"
        id="login-card"
      >
        {/* TOP OF CARD: Cute Decorative 3D Clay Cloud Storage Icon */}
        <div className="flex flex-col items-center text-center">
          <div 
            className="w-13 h-13 rounded-3xl bg-gradient-to-tr from-[#E6E1FA] to-[#D5CAFA] border-2 border-white/90 flex items-center justify-center text-[#8364ED] shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_8px_16px_rgba(131,100,237,0.22)] mb-3 transform hover:scale-110 hover:rotate-3 transition-transform duration-300 relative group cursor-pointer"
            id="clay-cloud-container"
            title="Cloud Storage Storage Vault"
          >
            <Cloud className="w-7 h-7 text-[#8364ED] fill-[#8364ED]/20 stroke-[2.2]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border border-white text-[9px] font-black text-white flex items-center justify-center shadow-xs animate-pulse">
              ✨
            </div>
          </div>

          {/* WELCOME BACK HEADING WITH YELLOW CLAY RAY ACCENTS */}
          <div className="flex items-center gap-2 justify-center">
            <span className="text-amber-400 font-extrabold text-lg select-none">≡</span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#5C45B2] tracking-tight" id="login-welcome-heading">
              Welcome Back
            </h1>
            <span className="text-amber-400 font-extrabold text-lg select-none">≡</span>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 mb-5" id="login-welcome-subheading">
            Select account type to sign in
          </p>
        </div>

        {/* TWO LOGIN OPTIONS: USER vs ADMIN ROLE SWITCHER */}
        <div className="mb-6 p-1.5 bg-[#F5F2EA] border border-[#EAE5D8] rounded-2xl flex items-center gap-1 shadow-inner" id="role-options-switcher">
          <button
            type="button"
            onClick={() => handleRoleSwitch('user')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeRoleOption === 'user'
                ? 'bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white shadow-[0_4px_14px_rgba(131,100,237,0.35)] scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            id="btn-role-user"
          >
            <UserIcon className="w-4 h-4" />
            <span>User Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSwitch('admin')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeRoleOption === 'admin'
                ? 'bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white shadow-[0_4px_14px_rgba(131,100,237,0.35)] scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            id="btn-role-admin"
          >
            <Shield className="w-4 h-4" />
            <span>Admin Login</span>
          </button>
        </div>

        {/* ERROR ALERT DISPLAY */}
        {error && (
          <div 
            className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-shake shadow-xs"
            id="login-error-alert"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-4" id="login-form">
          {/* FIELD 1: Username / Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 pl-1 block">
              {activeRoleOption === 'admin' ? 'Admin Username' : 'Username or Email'}
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center justify-center w-8 h-8 rounded-full bg-[#8364ED] text-white shadow-xs z-10">
                {activeRoleOption === 'admin' ? <Shield className="w-4 h-4 text-white" /> : <UserIcon className="w-4 h-4 text-white" />}
              </div>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={activeRoleOption === 'admin' ? 'admin' : 'user1'}
                className="w-full pl-13 pr-4 py-3.5 bg-[#F5F2EA] border border-[#E8E3D5] rounded-2xl text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:border-[#8364ED] focus:ring-4 focus:ring-[#8364ED]/15 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* FIELD 2: Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 pl-1 block">
              Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center justify-center w-8 h-8 rounded-full bg-[#8364ED] text-white shadow-xs z-10">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-13 pr-11 py-3.5 bg-[#F5F2EA] border border-[#E8E3D5] rounded-2xl text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:border-[#8364ED] focus:ring-4 focus:ring-[#8364ED]/15 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                id="btn-toggle-password-visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* FORGOT PASSWORD LINK */}
            <div className="flex justify-end pt-1 pr-1">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-bold text-[#8364ED] hover:text-[#6E4CDA] transition-colors focus:outline-none cursor-pointer"
                id="btn-forgot-password-link"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* PRIMARY LOGIN PILL BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#8364ED] via-[#7959EB] to-[#6C47E8] text-white font-extrabold text-sm tracking-wide shadow-[0_12px_28px_rgba(131,100,237,0.38),inset_0_2px_2px_rgba(255,255,255,0.3)] hover:shadow-[0_15px_32px_rgba(131,100,237,0.48)] hover:from-[#7857E8] hover:to-[#613CE0] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer"
              id="btn-submit-login"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {activeRoleOption === 'admin' ? 'Admin' : 'User'}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultUsername={username}
      />
    </div>
  );
};


