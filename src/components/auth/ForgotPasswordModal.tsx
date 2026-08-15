import React, { useState } from 'react';
import { api } from '../../lib/api';
import { ShieldCheck, Lock, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultUsername?: string;
}

export const ForgotPasswordModal: React.FC<Props> = ({ isOpen, onClose, defaultUsername = '' }) => {
  const [username, setUsername] = useState(defaultUsername);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.forgotPassword(username.trim());
      setMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#302112]/40 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#F3EAE2]/95 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(48,33,18,0.22)] border border-white/80 relative transform transition-all duration-300"
        id="forgot-password-card"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#5A463B] hover:text-[#302112] hover:bg-[#E5DAD9] transition-all cursor-pointer"
          aria-label="Close modal"
          id="btn-close-forgot-modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E0D1D4] text-[#92798B] mb-4 shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-black text-[#302112] tracking-tight" id="forgot-password-title">
          Reset Your Password
        </h3>
        <p className="text-xs font-medium text-[#5A463B] mt-1 leading-relaxed">
          Submit your registered username below to dispatch a secure password reset request to your HRA Administrator.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-[#E0D1D4] border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2" id="forgot-password-error">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="mt-5 p-4 rounded-2xl bg-[#E5DAD9] border border-[#B19CAD] text-[#302112] text-xs flex flex-col items-center text-center gap-2" id="forgot-password-success">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            <p className="font-bold text-[#302112]">Recovery Protocol Initiated</p>
            <p className="text-[#5A463B] leading-relaxed font-medium">{message}</p>
            <button
              onClick={onClose}
              className="mt-3 px-6 py-2.5 rounded-full bg-[#92798B] hover:bg-[#5A463B] text-[#F3EAE2] text-xs font-bold shadow-md transition-all cursor-pointer"
              id="btn-forgot-done"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4" id="forgot-password-form">
            <div>
              <label className="block text-xs font-bold text-[#5A463B] mb-1.5" htmlFor="forgot-username-input">
                Username
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center justify-center w-8 h-8 rounded-xl bg-[#92798B] text-[#F3EAE2]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="forgot-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-14 pr-4 py-3 bg-[#E5DAD9]/80 border border-[#B19CAD]/50 rounded-2xl text-sm text-[#302112] font-semibold placeholder-[#92798B]/60 focus:outline-none focus:border-[#92798B] focus:ring-4 focus:ring-[#92798B]/15 transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-[#5A463B] bg-[#E5DAD9] hover:bg-[#D0BEC7] transition-all cursor-pointer"
                id="btn-cancel-forgot"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full text-xs font-extrabold text-[#F3EAE2] bg-gradient-to-r from-[#92798B] to-[#5A463B] shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                id="btn-submit-forgot"
              >
                {loading ? 'Processing...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
