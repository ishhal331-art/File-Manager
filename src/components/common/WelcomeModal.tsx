import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { HRALogo } from '../HRALogo';
import {
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Building2,
  Lock,
  Layers,
  FileCheck,
  Check,
  X,
  Clock,
  Send,
  HelpCircle,
} from 'lucide-react';

interface Props {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<Props> = ({ user, isOpen, onClose }) => {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimateIn(true);
      // Play a soft, pleasant welcome harmonic chord
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (warm celebratory major chord)
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
            gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + idx * 0.06 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.06 + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.06);
            osc.stop(ctx.currentTime + idx * 0.06 + 0.7);
          });
        }
      } catch (err) {
        // AudioContext silent fallback
      }
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  // Keyboard shortcut (Escape or Enter)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const isClient = user.role === 'USER';
  const isManager = user.role === 'MANAGER';
  const isAdmin = user.role === 'ADMIN';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in"
      id="welcome-portal-popup-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* GLOWING AMBIENT BACKGROUND DROPS */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#92798B]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#CBAF87]/25 rounded-full blur-3xl pointer-events-none" />

      {/* POPUP MODAL DIALOG CONTAINER */}
      <div
        className={`relative w-full max-w-2xl bg-[#F3EAE2] rounded-[36px] sm:rounded-[44px] border border-white/95 shadow-[0_30px_90px_rgba(48,33,18,0.4),0_10px_30px_rgba(90,70,59,0.15),inset_0_2px_3px_rgba(255,255,255,0.95)] p-6 sm:p-8 md:p-9 my-auto overflow-hidden transition-all duration-300 ${
          animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        id="welcome-portal-popup-modal"
      >
        {/* TOP ORNAMENTAL CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-7 sm:right-7 p-2 rounded-full text-[#5A463B] hover:text-[#302112] hover:bg-[#E5DAD9] transition-all cursor-pointer shadow-2xs border border-white/80 z-20"
          title="Close Welcome Window"
          id="btn-close-welcome-modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HERO BRANDING & WELCOME BANNER */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 pb-5 border-b border-white/80 relative">
          {/* LOGO BADGE WITH SHINE ANIMATION */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#92798B] via-[#5A463B] to-[#302112] p-3 shadow-lg flex items-center justify-center border border-white/40 group">
              <HRALogo className="w-full h-full" variant="light" />
            </div>
            {/* SPARKLE FLOATING PILL */}
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#CBAF87] to-[#B19CAD] text-[#302112] p-1.5 rounded-full shadow-md border-2 border-[#F3EAE2] animate-bounce">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Session Active
              </span>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#E5DAD9] text-[#92798B] border border-white/80">
                {user.role} Workspace
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#302112] tracking-tight" id="welcome-modal-title">
              Welcome to HRA Accountant Portal!
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#5A463B]">
              {getGreeting()},{' '}
              <strong className="text-[#302112] font-black">{user.fullName}</strong>. Your fiscal intelligence and dossier environment is ready.
            </p>
          </div>
        </div>

        {/* FANCY 4-BENTO FEATURE HIGHLIGHT GRID WITH BEAUTIFUL ICONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5 sm:my-6">
          {/* TILE 1: AI OCR INTELLIGENCE */}
          <div className="bg-[#E5DAD9]/85 backdrop-blur-md rounded-2xl sm:rounded-[24px] p-3.5 sm:p-4 border border-white/90 shadow-2xs flex items-start gap-3 hover:bg-[#E5DAD9] transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#92798B] to-[#5A463B] text-[#FAF6F0] flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <Zap className="w-5 h-5 text-[#CBAF87]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#302112]">AI OCR Extraction</h4>
                <span className="text-[9px] font-extrabold text-[#92798B] uppercase">Instant</span>
              </div>
              <p className="text-[11px] text-[#5A463B] font-medium mt-0.5 leading-snug">
                Automated document parsing for invoices, VAT amounts, and transaction lines.
              </p>
            </div>
          </div>

          {/* TILE 2: VAULT & DOSSIER COMPLIANCE */}
          <div className="bg-[#E5DAD9]/85 backdrop-blur-md rounded-2xl sm:rounded-[24px] p-3.5 sm:p-4 border border-white/90 shadow-2xs flex items-start gap-3 hover:bg-[#E5DAD9] transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5A463B] to-[#302112] text-[#FAF6F0] flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <FileSpreadsheet className="w-5 h-5 text-[#CBAF87]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#302112]">Fiscal Dossier Vaults</h4>
                <span className="text-[9px] font-extrabold text-emerald-800 uppercase">3 Required</span>
              </div>
              <p className="text-[11px] text-[#5A463B] font-medium mt-0.5 leading-snug">
                Seamless uploads for Sales, Purchase, and Bank Statement records.
              </p>
            </div>
          </div>

          {/* TILE 3: REAL-TIME TAX & KPIS */}
          <div className="bg-[#E5DAD9]/85 backdrop-blur-md rounded-2xl sm:rounded-[24px] p-3.5 sm:p-4 border border-white/90 shadow-2xs flex items-start gap-3 hover:bg-[#E5DAD9] transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#302112] to-[#92798B] text-[#FAF6F0] flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <BarChart3 className="w-5 h-5 text-[#CBAF87]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#302112]">Live Graphs & Analytics</h4>
                <span className="text-[9px] font-extrabold text-[#302112] uppercase">Live</span>
              </div>
              <p className="text-[11px] text-[#5A463B] font-medium mt-0.5 leading-snug">
                Interactive revenue vs expense graphs and computed VAT estimations.
              </p>
            </div>
          </div>

          {/* TILE 4: 256-BIT SECURITY */}
          <div className="bg-[#E5DAD9]/85 backdrop-blur-md rounded-2xl sm:rounded-[24px] p-3.5 sm:p-4 border border-white/90 shadow-2xs flex items-start gap-3 hover:bg-[#E5DAD9] transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#92798B] to-[#302112] text-[#FAF6F0] flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-[#CBAF87]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#302112]">Accountant Security</h4>
                <span className="text-[9px] font-extrabold text-emerald-800 uppercase">Protected</span>
              </div>
              <p className="text-[11px] text-[#5A463B] font-medium mt-0.5 leading-snug">
                Encrypted storage, authenticated downloads, and tamper-proof audit trails.
              </p>
            </div>
          </div>
        </div>

        {/* ROLE ORIENTATION BRIEF & ACTIONS FOOTER */}
        <div className="p-4 rounded-2xl bg-[#E5DAD9]/70 border border-white/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#5A463B] font-semibold text-center sm:text-left">
            <CheckCircle2 className="w-4 h-4 text-[#92798B] shrink-0" />
            <span>
              {isClient && 'You can now upload your quarterly documents or chat with the AI Advisor.'}
              {isManager && 'You can review client compliance progress and verify extracted data.'}
              {isAdmin && 'You have full administration over all user accounts, archives, and broadcasts.'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#92798B] via-[#5A463B] to-[#302112] text-[#F3EAE2] text-xs font-black tracking-wide uppercase shadow-[0_10px_25px_rgba(48,33,18,0.25)] hover:shadow-[0_14px_30px_rgba(48,33,18,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            id="btn-enter-workspace"
          >
            <span>Enter Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
