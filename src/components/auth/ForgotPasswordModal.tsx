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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F18]/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#161D2F] backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(11,15,24,0.9),0_0_30px_rgba(34,211,159,0.15)] border border-[#263047] relative transform transition-all duration-300"
        id="forgot-password-card"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#7F8BA3] hover:text-[#F0F4FF] hover:bg-[#0B0F18] transition-all cursor-pointer"
          aria-label="Close modal"
          id="btn-close-forgot-modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#102D30] text-[#22D39F] mb-4 shadow-inner border border-[#22D39F]/20">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-black text-[#F0F4FF] tracking-tight" id="forgot-password-title">
          Reset Your Password
        </h3>
        <p className="text-xs font-medium text-[#AEB8CC] mt-1 leading-relaxed">
          Submit your registered username below to dispatch a secure password reset request to your HRA Administrator.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2" id="forgot-password-error">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="mt-5 p-4 rounded-2xl bg-[#0B0F18] border border-[#22D39F]/40 text-[#AEB8CC] text-xs flex flex-col items-center text-center gap-2" id="forgot-password-success">
            <CheckCircle2 className="w-8 h-8 text-[#22D39F]" />
            <p className="font-bold text-[#F0F4FF]">Recovery Protocol Initiated</p>
            <p className="text-[#AEB8CC] leading-relaxed font-medium">{message}</p>
            <button
              onClick={onClose}
              className="mt-3 px-6 py-2.5 rounded-full bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black shadow-md transition-all cursor-pointer"
              id="btn-forgot-done"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4" id="forgot-password-form">
            <div>
              <label className="block text-xs font-bold text-[#AEB8CC] mb-1.5" htmlFor="forgot-username-input">
                Username
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center justify-center w-8 h-8 rounded-xl bg-[#102D30] text-[#22D39F]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="forgot-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-14 pr-4 py-3 bg-[#0B0F18] border border-[#263047] rounded-2xl text-sm text-[#F0F4FF] font-semibold placeholder-[#7F8BA3] focus:outline-none focus:border-[#22D39F] focus:ring-2 focus:ring-[#22D39F]/20 transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-[#AEB8CC] bg-[#0B0F18] hover:bg-[#102D30] border border-[#263047] transition-all cursor-pointer"
                id="btn-cancel-forgot"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full text-xs font-black text-[#0E1120] bg-[#22D39F] hover:bg-[#19C99A] shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
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
