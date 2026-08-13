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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#FCFBF8] rounded-[32px] p-6 md:p-8 shadow-[0_25px_60px_rgba(110,85,190,0.25)] border border-[#F0EBE0] relative transform transition-all duration-300 scale-100"
        id="forgot-password-card"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-[#F3EFE6] transition-all"
          aria-label="Close modal"
          id="btn-close-forgot-modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F0EBFA] text-[#8364ED] mb-4 shadow-inner">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-800 tracking-tight" id="forgot-password-title">
          Reset Your Password
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Authentication is strictly username & password managed. Submit your registered username below to dispatch a secure password reset request to your Administrator.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2" id="forgot-password-error">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="mt-5 p-4 rounded-2xl bg-[#F2FBF5] border border-emerald-200/80 text-emerald-800 text-xs flex flex-col items-center text-center gap-2" id="forgot-password-success">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <p className="font-semibold text-emerald-900">Recovery Protocol Initiated</p>
            <p className="text-emerald-700 leading-relaxed">{message}</p>
            <button
              onClick={onClose}
              className="mt-3 px-6 py-2.5 rounded-full bg-[#8364ED] text-white text-xs font-semibold shadow-md hover:bg-[#7150EA] transition-all"
              id="btn-forgot-done"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4" id="forgot-password-form">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="forgot-username-input">
                Username
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center justify-center w-8 h-8 rounded-xl bg-[#F0EBFA] text-[#8364ED]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="forgot-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-14 pr-4 py-3 bg-[#F7F5EE] border border-[#E9E5D9] rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#8364ED] focus:ring-4 focus:ring-[#8364ED]/15 transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 bg-[#F3EFE6] hover:bg-[#E9E4D8] transition-all"
                id="btn-cancel-forgot"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#8364ED] to-[#7150EA] shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
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
