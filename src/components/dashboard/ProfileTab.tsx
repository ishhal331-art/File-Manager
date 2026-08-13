import React, { useState } from 'react';
import { User } from '../../types';
import { api } from '../../lib/api';
import { UserCheck, Lock, Mail, Phone, Hash, Shield, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  currentUser: User;
}

export const ProfileTab: React.FC<Props> = ({ currentUser }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.changePassword(currentPassword, newPassword, confirmPassword);
      setSuccessMsg(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="profile-tab-container">
      {/* PERSONAL INFORMATION CARD */}
      <div className="bg-[#FCFBF8] rounded-[32px] p-6 sm:p-8 shadow-[0_15px_35px_rgba(110,85,190,0.08)] border border-[#F0ECE1] space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-[#F2ECE0]">
          {/* Avatar initial bubble */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#8364ED] to-[#A58DF5] text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {currentUser.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight" id="profile-full-name">
                {currentUser.fullName}
              </h2>
              <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-[#F0EBFA] text-[#8364ED] border border-[#E2D8F7]">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              @{currentUser.username} • Account Status: <span className="text-emerald-600 font-bold">{currentUser.status}</span>
            </p>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#EAE5D7] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[#8364ED]" /> Email Address
            </span>
            <p className="text-xs font-bold text-slate-800 truncate">
              {currentUser.email || 'Not configured'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#EAE5D7] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#8364ED]" /> Phone Number
            </span>
            <p className="text-xs font-bold text-slate-800 truncate">
              {currentUser.phone || 'Not configured'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#EAE5D7] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-[#8364ED]" /> Employee ID
            </span>
            <p className="text-xs font-bold text-slate-800 truncate">
              {currentUser.employeeId || 'EMP-100'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#EAE5D7] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#8364ED]" /> Account Role
            </span>
            <p className="text-xs font-bold text-slate-800 truncate">
              {currentUser.role}
            </p>
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD WORKFLOW CARD */}
      <div className="bg-[#FCFBF8] rounded-[32px] p-6 sm:p-8 shadow-[0_15px_35px_rgba(110,85,190,0.08)] border border-[#F0ECE1] space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#F2ECE0]">
          <div className="p-2 rounded-xl bg-[#F0EBFA] text-[#8364ED]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
              Security & Password Workflow
            </h3>
            <p className="text-xs text-slate-400">
              Update your account access key. Passwords remain securely hashed server-side.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg" id="change-password-form">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-2.5 bg-[#F7F5EE] border border-[#E8E4D8] rounded-2xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#8364ED] shadow-inner"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="w-full px-4 py-2.5 bg-[#F7F5EE] border border-[#E8E4D8] rounded-2xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#8364ED] shadow-inner"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 bg-[#F7F5EE] border border-[#E8E4D8] rounded-2xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#8364ED] shadow-inner"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              id="btn-submit-change-password"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
