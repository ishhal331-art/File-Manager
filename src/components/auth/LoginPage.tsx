import React, { useState } from 'react';
import { api } from '../../lib/api';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  ChevronRight,
  CheckCircle2,
  Building2,
  FileSpreadsheet,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  FolderLock,
  FileCheck,
} from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { HRALogo } from '../HRALogo';
import { LiveBackground } from '../common/LiveBackground';

interface Props {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [activeRoleOption, setActiveRoleOption] = useState<'user' | 'admin' | 'manager'>('user');
  const [username, setUsername] = useState('user1');
  const [password, setPassword] = useState('UserPass123!');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleRoleSwitch = (role: 'user' | 'admin' | 'manager') => {
    setActiveRoleOption(role);
    setError(null);
    if (role === 'admin') {
      setUsername('admin');
      setPassword('AdminPassword123!');
    } else if (role === 'manager') {
      setUsername('manager1');
      setPassword('ManagerPass123!');
    } else {
      setUsername('user1');
      setPassword('UserPass123!');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signin') {
        const res = await api.login(username.trim(), password);
        onLoginSuccess(res.user);
      } else {
        // Register client account
        const res = await api.register({
          username: username.trim(),
          password,
          fullName: fullName.trim() || username.trim(),
          email: email.trim() || `${username.trim()}@company.com`,
          role: 'USER',
        });
        setSuccessMsg('Account registered successfully! Signing you in...');
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full relative flex flex-col items-center justify-center p-3.5 sm:p-6 md:p-8 lg:p-10 overflow-hidden font-sans selection:bg-[#22D39F]/30 selection:text-[#F0F4FF]"
      id="login-liquid-canvas"
    >
      {/* LIVE INTERACTIVE AMBIENT BACKGROUND */}
      <LiveBackground />

      {/* MAIN CONTAINER */}
      <div
        className="w-full max-w-5xl bg-[#161D2F]/90 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] p-5 sm:p-7 md:p-9 shadow-[0_30px_80px_rgba(11,15,24,0.8),0_0_40px_rgba(16,45,48,0.3)] border border-[#263047] relative z-10 my-auto transition-all duration-300"
        id="liquid-glass-portal-window"
      >
        {/* TOP HEADER - CENTERED LOGO & NAV */}
        <header className="flex flex-col items-center justify-center gap-3 pb-5 border-b border-[#263047] mb-6 text-center">
          {/* CENTERED LOGO */}
          <div className="h-12 w-auto flex items-center justify-center">
            <HRALogo className="h-11 sm:h-12 w-auto" variant="accent" />
          </div>

          {/* TOP NAV PILL BUTTONS */}
          <div className="flex items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                handleRoleSwitch('user');
              }}
              className={`px-5 py-2 min-h-[42px] rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#22D39F] text-[#0E1120] shadow-[0_4px_16px_rgba(34,211,159,0.4)] scale-105'
                  : 'bg-[#0B0F18] hover:bg-[#102D30] text-[#AEB8CC] hover:text-[#F0F4FF] border border-[#263047]'
              }`}
              id="btn-nav-signin"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`px-5 py-2 min-h-[42px] rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#22D39F] text-[#0E1120] shadow-[0_4px_16px_rgba(34,211,159,0.4)] scale-105'
                  : 'bg-[#0B0F18] hover:bg-[#102D30] text-[#AEB8CC] hover:text-[#F0F4FF] border border-[#263047]'
              }`}
              id="btn-nav-signup"
            >
              Register
            </button>
          </div>
        </header>

        {/* SUB-NAV BREADCRUMB */}
        <div className="flex items-center justify-between gap-2 p-3 sm:px-4 bg-[#0B0F18]/85 backdrop-blur-md rounded-2xl border border-[#263047] text-[11px] font-bold text-[#7F8BA3] mb-6 shadow-inner overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[#F0F4FF] font-black">HRA Accountant Portal</span>
            <span>›</span>
            <span>Fiscal Dossiers</span>
            <span>›</span>
            <span className="text-[#22D39F] font-extrabold">
              {mode === 'signin' ? 'Secure Authentication' : 'Client Registration'}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px] text-[#AEB8CC]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22D39F]" /> 256-Bit Encrypted
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#22D39F]" /> AI OCR Powered
            </span>
          </div>
        </div>

        {/* SPLIT LAYOUT: AUTHENTICATION FORM + BENTO FEATURE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT: AUTHENTICATION FORM (5 COLS) */}
          <div 
            className="lg:col-span-5 bg-[#0B0F18]/90 backdrop-blur-xl rounded-[28px] p-5 sm:p-6 md:p-7 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] flex flex-col justify-between"
            id="auth-form-card"
          >
            <div>
              {/* HEADING */}
              <div className="mb-4 text-center flex flex-col items-center">
                <div className="flex items-center justify-center gap-1.5 mb-1 text-center">
                  <span className="text-[#22D39F] font-black text-base select-none">≡</span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#F0F4FF] tracking-tight text-center" id="login-title">
                    {mode === 'signin' ? 'Welcome to HRA Accountant' : 'Create HRA Account'}
                  </h2>
                </div>
                <p className="text-xs font-medium text-[#7F8BA3] text-center">
                  {mode === 'signin'
                    ? 'Enter your credentials to access your financial dossier'
                    : 'Register as a new client to submit compliance files'}
                </p>
              </div>

              {/* ROLE SWITCHER PILLS (USER / ADMIN / MANAGER) */}
              {mode === 'signin' && (
                <div className="mb-4 p-1 bg-[#0E1120] border border-[#263047] rounded-2xl flex items-center gap-1 shadow-inner" id="role-pill-switch">
                  {(['user', 'manager', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleSwitch(r)}
                      className={`flex-1 py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer capitalize ${
                        activeRoleOption === r
                          ? 'bg-[#22D39F] text-[#0E1120] shadow-[0_4px_12px_rgba(34,211,159,0.35)] scale-[1.02]'
                          : 'text-[#7F8BA3] hover:text-[#F0F4FF] hover:bg-[#161D2F]'
                      }`}
                      id={`btn-role-tab-${r}`}
                    >
                      {r === 'admin' ? (
                        <Shield className="w-3.5 h-3.5" />
                      ) : r === 'manager' ? (
                        <Building2 className="w-3.5 h-3.5" />
                      ) : (
                        <UserIcon className="w-3.5 h-3.5" />
                      )}
                      <span>{r}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* ERROR / SUCCESS ALERTS */}
              {error && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2" id="auth-error-alert">
                  <Shield className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-[#102D30] border border-[#22D39F] text-[#22D39F] text-xs font-semibold flex items-center gap-2" id="auth-success-alert">
                  <CheckCircle2 className="w-4 h-4 text-[#22D39F] shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* MAIN FORM */}
              <form onSubmit={handleAuthSubmit} className="space-y-3.5" id="main-auth-form">
                {mode === 'signup' && (
                  <div>
                    <label className="text-xs font-bold text-[#AEB8CC] pl-1 block mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe (Apex Corp)"
                      className="w-full px-4 py-3 bg-[#0E1120] border border-[#263047] rounded-2xl text-xs font-bold text-[#F0F4FF] placeholder-[#7F8BA3] focus:outline-none focus:border-[#22D39F] focus:ring-2 focus:ring-[#22D39F]/20 transition-all shadow-inner"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-[#AEB8CC] pl-1 block mb-1">
                    Username
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex items-center justify-center w-7 h-7 rounded-xl bg-[#102D30] text-[#22D39F]">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="input-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full pl-12 pr-4 py-3 bg-[#0E1120] border border-[#263047] rounded-2xl text-xs font-bold text-[#F0F4FF] placeholder-[#7F8BA3] focus:outline-none focus:border-[#22D39F] focus:ring-2 focus:ring-[#22D39F]/20 transition-all shadow-inner"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="text-xs font-bold text-[#AEB8CC] pl-1 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-4 py-3 bg-[#0E1120] border border-[#263047] rounded-2xl text-xs font-bold text-[#F0F4FF] placeholder-[#7F8BA3] focus:outline-none focus:border-[#22D39F] focus:ring-2 focus:ring-[#22D39F]/20 transition-all shadow-inner"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-[#AEB8CC] pl-1 block mb-1">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex items-center justify-center w-7 h-7 rounded-xl bg-[#102D30] text-[#22D39F]">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="input-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-10 py-3 bg-[#0E1120] border border-[#263047] rounded-2xl text-xs font-bold text-[#F0F4FF] placeholder-[#7F8BA3] focus:outline-none focus:border-[#22D39F] focus:ring-2 focus:ring-[#22D39F]/20 transition-all shadow-inner"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[#7F8BA3] hover:text-[#F0F4FF] p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {mode === 'signin' && (
                    <div className="flex justify-end pt-1.5 pr-1">
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-[11px] font-bold text-[#22D39F] hover:text-[#19C99A] transition-colors cursor-pointer"
                        id="btn-forgot-pw"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-full bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] font-black text-xs tracking-wider uppercase shadow-[0_10px_25px_rgba(34,211,159,0.35)] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer"
                    id="btn-submit-auth"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-[#0E1120]/30 border-t-[#0E1120] rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{mode === 'signin' ? 'Sign In to Portal' : 'Complete Registration'}</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* DEMO QUICK-SWITCH FOOTER */}
            <div className="mt-4 pt-3 border-t border-[#263047] flex items-center justify-between text-[11px] text-[#7F8BA3] font-semibold">
              <span 
                onClick={() => handleRoleSwitch('user')} 
                className="hover:text-[#22D39F] cursor-pointer hover:underline"
              >
                Client: <strong className="text-[#F0F4FF]">user1</strong>
              </span>
              <span>•</span>
              <span 
                onClick={() => handleRoleSwitch('manager')} 
                className="hover:text-[#22D39F] cursor-pointer hover:underline"
              >
                Manager: <strong className="text-[#F0F4FF]">manager1</strong>
              </span>
              <span>•</span>
              <span 
                onClick={() => handleRoleSwitch('admin')} 
                className="hover:text-[#22D39F] cursor-pointer hover:underline"
              >
                Admin: <strong className="text-[#F0F4FF]">admin</strong>
              </span>
            </div>
          </div>

          {/* RIGHT: DARK TEAL 4-BENTO CARDS */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5" id="login-bento-features">
            {/* TILE 1: MANAGEMENT */}
            <div className="bg-[#0B0F18]/80 backdrop-blur-xl rounded-[28px] p-4 sm:p-5 border border-[#263047] shadow-[0_12px_28px_rgba(11,15,24,0.5)] flex flex-col justify-between space-y-3 glass-card-hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 bg-[#161D2F] rounded-2xl border border-[#263047] shadow-inner">
                  <div className="w-7 h-7 rounded-xl bg-[#102D30] text-[#22D39F] flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-[#161D2F] text-[#F0F4FF] flex items-center justify-center">
                    <FolderLock className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#22D39F] shadow-[0_0_8px_#22D39F]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#F0F4FF] tracking-tight">Management</h3>
                <p className="text-[11px] font-medium text-[#AEB8CC] mt-1 leading-relaxed">
                  Streamlined client ingestion dossiers for sales invoices, purchase receipts, and bank logs.
                </p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30">
                  3 Required + 1 Opt
                </span>
              </div>
            </div>

            {/* TILE 2: DATA ANALYTICS */}
            <div className="bg-[#0B0F18]/80 backdrop-blur-xl rounded-[28px] p-4 sm:p-5 border border-[#263047] shadow-[0_12px_28px_rgba(11,15,24,0.5)] flex flex-col justify-between space-y-3 glass-card-hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 bg-[#161D2F] rounded-2xl border border-[#263047] shadow-inner">
                  <div className="w-7 h-7 rounded-xl bg-[#102D30] text-[#22D39F] flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-[#161D2F] text-[#F0F4FF] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#22D39F] shadow-[0_0_8px_#22D39F]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#F0F4FF] tracking-tight">Data Analytics</h3>
                <p className="text-[11px] font-medium text-[#AEB8CC] mt-1 leading-relaxed">
                  Real-time revenue versus expense tracking, tax estimations, and fiscal compliance scoring.
                </p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30">
                  Live KPIs
                </span>
              </div>
            </div>

            {/* TILE 3: OCR AUTOMATION */}
            <div className="bg-[#0B0F18]/80 backdrop-blur-xl rounded-[28px] p-4 sm:p-5 border border-[#263047] shadow-[0_12px_28px_rgba(11,15,24,0.5)] flex flex-col justify-between space-y-3 glass-card-hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 bg-[#161D2F] rounded-2xl border border-[#263047] shadow-inner">
                  <div className="w-7 h-7 rounded-xl bg-[#102D30] text-[#22D39F] flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-[#161D2F] text-[#F0F4FF] flex items-center justify-center">
                    <FileCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#22D39F] shadow-[0_0_8px_#22D39F]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#F0F4FF] tracking-tight">AI OCR Engine</h3>
                <p className="text-[11px] font-medium text-[#AEB8CC] mt-1 leading-relaxed">
                  Automated OCR extracting line items, invoice numbers, tax amounts, and counterparty data.
                </p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30">
                  99.4% Accuracy
                </span>
              </div>
            </div>

            {/* TILE 4: ENTERPRISE SECURITY */}
            <div className="bg-[#0B0F18]/80 backdrop-blur-xl rounded-[28px] p-4 sm:p-5 border border-[#263047] shadow-[0_12px_28px_rgba(11,15,24,0.5)] flex flex-col justify-between space-y-3 glass-card-hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 bg-[#161D2F] rounded-2xl border border-[#263047] shadow-inner">
                  <div className="w-7 h-7 rounded-xl bg-[#102D30] text-[#22D39F] flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-[#161D2F] text-[#F0F4FF] flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#22D39F] shadow-[0_0_8px_#22D39F]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#F0F4FF] tracking-tight">Multi-Role Security</h3>
                <p className="text-[11px] font-medium text-[#AEB8CC] mt-1 leading-relaxed">
                  Fine-grained permissions for Clients, Managers, and Admins with tamper-proof audit trails.
                </p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30">
                  Role-Gated
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM FOOTER */}
        <footer className="mt-6 pt-4 border-t border-[#263047] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-semibold text-[#7F8BA3]">
          <div className="flex items-center gap-2">
            <span className="text-[#AEB8CC]">© 2026 HRA Accountant</span>
            <span>•</span>
            <span>Financial Ingestion & Intelligence System</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#22D39F] font-bold">Privacy Policy</span>
            <span>•</span>
            <span className="text-[#22D39F] font-bold">Compliance Terms</span>
          </div>
        </footer>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultUsername={username}
      />
    </div>
  );
};
