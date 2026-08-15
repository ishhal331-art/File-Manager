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
      className="min-h-screen w-full bg-gradient-to-br from-[#D0BEC7] via-[#E0D1D4] to-[#C1ACBA] flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden font-sans selection:bg-[#92798B]/30 selection:text-[#302112]"
      id="login-liquid-canvas"
    >
      {/* AMBIENT SOFT BACKGROUND LIQUID GLOWS */}
      <div className="absolute top-[-10%] left-[-5%] w-[480px] h-[480px] rounded-full bg-[#E0D1D4]/80 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[520px] h-[520px] rounded-full bg-[#C1ACBA]/60 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#F3EAE2]/40 blur-3xl pointer-events-none" />

      {/* MAIN LIQUID DROP GLASS CONTAINER (INSPIRED BY REFERENCE DESIGN) */}
      <div
        className="w-full max-w-5xl bg-[#F3EAE2]/75 backdrop-blur-2xl rounded-[36px] sm:rounded-[44px] p-5 sm:p-7 md:p-9 shadow-[0_30px_80px_rgba(48,33,18,0.14),0_10px_25px_rgba(90,70,59,0.06),inset_0_2px_3px_rgba(255,255,255,0.95),inset_0_-2px_3px_rgba(90,70,59,0.05)] border border-white/80 relative z-10 my-auto transition-all duration-300"
        id="liquid-glass-portal-window"
      >
        {/* TOP GLASS NAVIGATION HEADER - CENTERED LOGO & NAV */}
        <header className="flex flex-col items-center justify-center gap-3 pb-5 border-b border-white/60 mb-6 text-center">
          {/* CENTERED LOGO ONLY */}
          <div className="h-12 w-auto flex items-center justify-center">
            <HRALogo className="h-11 sm:h-12 w-auto" variant="dark" />
          </div>

          {/* TOP NAV PILL BUTTONS */}
          <div className="flex items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                handleRoleSwitch('user');
              }}
              className={`px-5 py-2 min-h-[40px] rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#302112] text-[#F3EAE2] shadow-[0_4px_14px_rgba(48,33,18,0.25)] scale-105'
                  : 'bg-[#E5DAD9]/80 hover:bg-[#E5DAD9] text-[#5A463B] border border-white/80'
              }`}
              id="btn-nav-signin"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`px-5 py-2 min-h-[40px] rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#302112] text-[#F3EAE2] shadow-[0_4px_14px_rgba(48,33,18,0.25)] scale-105'
                  : 'bg-[#E5DAD9]/80 hover:bg-[#E5DAD9] text-[#5A463B] border border-white/80'
              }`}
              id="btn-nav-signup"
            >
              Register
            </button>
          </div>
        </header>

        {/* BREADCRUMB / SUB-NAV ROW (MATCHING REFERENCE PICTURE SUB-BAR) */}
        <div className="flex items-center justify-between gap-2 p-2.5 sm:px-4 bg-[#E5DAD9]/70 backdrop-blur-md rounded-2xl border border-white/70 text-[11px] font-bold text-[#5A463B] mb-6 shadow-2xs overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[#302112] font-black">HRA Accountant Portal</span>
            <span>›</span>
            <span>Fiscal Dossiers</span>
            <span>›</span>
            <span className="text-[#92798B] font-extrabold">
              {mode === 'signin' ? 'Secure Authentication' : 'Client Registration'}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px] text-[#5A463B]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#92798B]" /> 256-Bit Encrypted
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#CBAF87]" /> AI OCR Powered
            </span>
          </div>
        </div>

        {/* SPLIT LAYOUT: AUTHENTICATION FORM + LIQUID BENTO FEATURE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT: AUTHENTICATION FORM (5 COLS) */}
          <div 
            className="lg:col-span-5 bg-[#F3EAE2]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-white/90 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_2px_2px_rgba(255,255,255,0.9)] flex flex-col justify-between"
            id="auth-form-card"
          >
            <div>
              {/* HEADING */}
              <div className="mb-4 text-center flex flex-col items-center">
                <div className="flex items-center justify-center gap-1.5 mb-1 text-center">
                  <span className="text-[#CBAF87] font-black text-base select-none">≡</span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#302112] tracking-tight text-center" id="login-title">
                    {mode === 'signin' ? 'Welcome to HRA Accountant' : 'Create HRA Accountant Account'}
                  </h2>
                </div>
                <p className="text-xs font-semibold text-[#5A463B] text-center">
                  {mode === 'signin'
                    ? 'Enter your credentials to access your financial dossier'
                    : 'Register as a new client to submit compliance files'}
                </p>
              </div>

              {/* ROLE SWITCHER PILLS (USER / ADMIN / MANAGER) */}
              {mode === 'signin' && (
                <div className="mb-4 p-1 bg-[#E5DAD9] border border-[#B19CAD]/30 rounded-2xl flex items-center gap-1 shadow-inner" id="role-pill-switch">
                  {(['user', 'manager', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleSwitch(r)}
                      className={`flex-1 py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer capitalize ${
                        activeRoleOption === r
                          ? 'bg-[#92798B] text-[#F3EAE2] shadow-[0_4px_12px_rgba(146,121,139,0.35)] scale-[1.02]'
                          : 'text-[#5A463B] hover:text-[#302112] hover:bg-white/40'
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
                <div className="mb-4 p-3 rounded-2xl bg-[#E0D1D4] border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2" id="auth-error-alert">
                  <Shield className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-[#E5DAD9] border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2" id="auth-success-alert">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* MAIN FORM */}
              <form onSubmit={handleAuthSubmit} className="space-y-3.5" id="main-auth-form">
                {mode === 'signup' && (
                  <div>
                    <label className="text-xs font-bold text-[#5A463B] pl-1 block mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe (Apex Corp)"
                      className="w-full px-4 py-3 bg-[#E5DAD9]/80 border border-[#B19CAD]/40 rounded-2xl text-xs font-bold text-[#302112] placeholder-[#92798B]/60 focus:outline-none focus:border-[#92798B] focus:bg-white transition-all shadow-inner"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-[#5A463B] pl-1 block mb-1">
                    Username
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex items-center justify-center w-7 h-7 rounded-xl bg-[#92798B] text-[#F3EAE2]">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="input-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full pl-12 pr-4 py-3 bg-[#E5DAD9]/80 border border-[#B19CAD]/40 rounded-2xl text-xs font-bold text-[#302112] placeholder-[#92798B]/60 focus:outline-none focus:border-[#92798B] focus:bg-white transition-all shadow-inner"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="text-xs font-bold text-[#5A463B] pl-1 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-4 py-3 bg-[#E5DAD9]/80 border border-[#B19CAD]/40 rounded-2xl text-xs font-bold text-[#302112] placeholder-[#92798B]/60 focus:outline-none focus:border-[#92798B] focus:bg-white transition-all shadow-inner"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-[#5A463B] pl-1 block mb-1">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex items-center justify-center w-7 h-7 rounded-xl bg-[#92798B] text-[#F3EAE2]">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="input-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-10 py-3 bg-[#E5DAD9]/80 border border-[#B19CAD]/40 rounded-2xl text-xs font-bold text-[#302112] placeholder-[#92798B]/60 focus:outline-none focus:border-[#92798B] focus:bg-white transition-all shadow-inner"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[#5A463B] hover:text-[#302112] p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {mode === 'signin' && (
                    <div className="flex justify-end pt-1 pr-1">
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-[11px] font-bold text-[#92798B] hover:text-[#5A463B] transition-colors cursor-pointer"
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
                    className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#92798B] via-[#5A463B] to-[#302112] text-[#F3EAE2] font-black text-xs tracking-wider uppercase shadow-[0_10px_25px_rgba(48,33,18,0.25)] hover:shadow-[0_14px_30px_rgba(48,33,18,0.35)] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer"
                    id="btn-submit-auth"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
            <div className="mt-4 pt-3 border-t border-[#B19CAD]/30 flex items-center justify-between text-[11px] text-[#5A463B] font-semibold">
              <span 
                onClick={() => handleRoleSwitch('user')} 
                className="hover:text-[#302112] cursor-pointer hover:underline"
              >
                Client: <strong className="text-[#302112]">user1</strong>
              </span>
              <span>•</span>
              <span 
                onClick={() => handleRoleSwitch('manager')} 
                className="hover:text-[#302112] cursor-pointer hover:underline"
              >
                Manager: <strong className="text-[#302112]">manager1</strong>
              </span>
              <span>•</span>
              <span 
                onClick={() => handleRoleSwitch('admin')} 
                className="hover:text-[#302112] cursor-pointer hover:underline"
              >
                Admin: <strong className="text-[#302112]">admin</strong>
              </span>
            </div>
          </div>

          {/* RIGHT: LIQUID DROP GLASS 6-BENTO CARDS (INSPIRED BY ATTACHED DESIGN) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5" id="login-bento-features">
            {/* TILE 1: MANAGEMENT */}
            <div className="bg-[#E5DAD9]/80 backdrop-blur-xl rounded-[28px] p-4 sm:p-5 border border-white/80 shadow-[0_12px_28px_rgba(48,33,18,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col justify-between space-y-3 glass-card-hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 bg-white/70 rounded-2xl border border-white shadow-2xs">
                  <div className="w-7 h-7 rounded-xl bg-[#92798B] text-[#F3EAE2] flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-[#CBAF87] text-[#302112] flex items-center justify-center">
                    <FolderLock className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full border border-white bg-[#CBAF87]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#302112] tracking-tight">Management</h3>
                <p className="text-[11px] font-medium text-[#5A463B] mt-1 leading-relaxed">
                  Streamlined client ingestion dossiers for sales invoices, purchase receipts, and bank logs.
                </p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#F3EAE2] text-[#92798B] border border-white">
                  3 Required + 1 Opt
                </span>
              </div>
            </div>

            {/* TILE 2: DATA ANALYTICS */}
            <div className="bg-[#E0D1D4]/80 backdrop-blur-xl rounded-[28px] p-4 sm:p-5 border border-white/80 shadow-[0_12px_28px_rgba(48,33,18,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col justify-between space-y-3 glass-card-hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 bg-white/70 rounded-2xl border border-white shadow-2xs">
                  <div className="w-7 h-7 rounded-xl bg-[#302112] text-[#F3EAE2] flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-[#B19CAD] text-[#302112] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full border border-white bg-emerald-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#302112] tracking-tight">Data Analytics</h3>
                <p className="text-[11px] font-medium text-[#5A463B] mt-1 leading-relaxed">
                  Real-time revenue versus expense tracking, tax estimations, and fiscal compliance scoring.
                </p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#F3EAE2] text-[#302112] border border-white">
                  Live KPIs
                </span>
              </div>
            </div>

            {/* TILE 3: OCR AUTOMATION */}
            <div className="bg-[#C1ACBA]/70 backdrop-blur-xl rounded-[28px] p-4 sm:p-5 border border-white/80 shadow-[0_12px_28px_rgba(48,33,18,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col justify-between space-y-3 glass-card-hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 bg-white/70 rounded-2xl border border-white shadow-2xs">
                  <div className="w-7 h-7 rounded-xl bg-[#5A463B] text-[#F3EAE2] flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-[#CBAF87] text-[#302112] flex items-center justify-center">
                    <FileCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full border border-white bg-[#CBAF87]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#302112] tracking-tight">AI OCR Engine</h3>
                <p className="text-[11px] font-medium text-[#5A463B] mt-1 leading-relaxed">
                  Automated OCR extracting line items, invoice numbers, tax amounts, and counterparty data.
                </p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#F3EAE2] text-[#5A463B] border border-white">
                  99.4% Accuracy
                </span>
              </div>
            </div>

            {/* TILE 4: ENTERPRISE SECURITY */}
            <div className="bg-[#F3EAE2]/80 backdrop-blur-xl rounded-[28px] p-4 sm:p-5 border border-white/80 shadow-[0_12px_28px_rgba(48,33,18,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col justify-between space-y-3 glass-card-hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 bg-white/70 rounded-2xl border border-white shadow-2xs">
                  <div className="w-7 h-7 rounded-xl bg-[#92798B] text-[#F3EAE2] flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-[#302112] text-[#F3EAE2] flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full border border-white bg-emerald-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#302112] tracking-tight">Multi-Role Security</h3>
                <p className="text-[11px] font-medium text-[#5A463B] mt-1 leading-relaxed">
                  Fine-grained permissions for Clients, Managers, and Admins with tamper-proof audit trails.
                </p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#E5DAD9] text-[#302112] border border-white">
                  Role-Gated
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM LIQUID GLASS FOOTER */}
        <footer className="mt-6 pt-4 border-t border-white/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-semibold text-[#5A463B]">
          <div className="flex items-center gap-2">
            <span>© 2026 HRA Accountant</span>
            <span>•</span>
            <span>Financial Ingestion & Intelligence System</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#302112] font-bold">Privacy Policy</span>
            <span>•</span>
            <span className="text-[#302112] font-bold">Compliance Terms</span>
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
