import React, { useState } from 'react';
import { User } from '../../types';
import { api } from '../../lib/api';
import { UserCheck, Lock, Mail, Phone, Hash, Shield, KeyRound, CheckCircle2, AlertCircle, Save, Edit3 } from 'lucide-react';

interface Props {
  currentUser: User;
  onUserUpdated?: (user: User) => void;
}

export const ProfileTab: React.FC<Props> = ({ currentUser, onUserUpdated }) => {
  // Personal Info state
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [employeeId, setEmployeeId] = useState(currentUser.employeeId || '');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);
  const [passErrorMsg, setPassErrorMsg] = useState<string | null>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await api.updateProfile({ fullName, email, phone, employeeId });
      setProfileSuccess(res.message);
      if (onUserUpdated) {
        onUserUpdated(res.user);
      }
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update personal information.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassErrorMsg('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassErrorMsg('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPassErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoadingPass(true);
    setPassErrorMsg(null);
    setPassSuccessMsg(null);

    try {
      const res = await api.changePassword(currentPassword, newPassword, confirmPassword);
      setPassSuccessMsg(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="profile-tab-container">
      {/* PERSONAL INFORMATION EDITABLE CARD */}
      <div 
        className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#263047] flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 font-black text-2xl flex items-center justify-center shadow-inner shrink-0">
              {(fullName || currentUser.username).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-[#F0F4FF] tracking-tight" id="profile-full-name">
                  {currentUser.fullName}
                </h2>
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 shadow-inner">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs font-medium text-[#7F8BA3] mt-0.5">
                @{currentUser.username} • Account Status: <span className="text-[#22D39F] font-bold">{currentUser.status}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-[#22D39F] bg-[#102D30] px-3.5 py-1.5 rounded-2xl border border-[#22D39F]/30 shadow-inner inline-flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              <span>Self-Managed Personal Details</span>
            </span>
          </div>
        </div>

        {profileError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-2 shadow-inner">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        {profileSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-[#22D39F] shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {/* PERSONAL DETAILS FORM */}
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* FULL NAME */}
            <div className="p-4 rounded-2xl bg-[#0B0F18] backdrop-blur-md border border-[#263047] space-y-1.5 shadow-inner">
              <label className="text-[10px] font-bold text-[#7F8BA3] uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#22D39F]" /> Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="w-full px-3 py-2 bg-[#161D2F] border border-[#263047] rounded-xl text-xs font-bold text-[#F0F4FF] focus:outline-none focus:border-[#22D39F] shadow-inner"
                required
              />
            </div>

            {/* EMAIL */}
            <div className="p-4 rounded-2xl bg-[#0B0F18] backdrop-blur-md border border-[#263047] space-y-1.5 shadow-inner">
              <label className="text-[10px] font-bold text-[#7F8BA3] uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#22D39F]" /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@company.com"
                className="w-full px-3 py-2 bg-[#161D2F] border border-[#263047] rounded-xl text-xs font-bold text-[#F0F4FF] focus:outline-none focus:border-[#22D39F] shadow-inner"
              />
            </div>

            {/* PHONE */}
            <div className="p-4 rounded-2xl bg-[#0B0F18] backdrop-blur-md border border-[#263047] space-y-1.5 shadow-inner">
              <label className="text-[10px] font-bold text-[#7F8BA3] uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#22D39F]" /> Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 bg-[#161D2F] border border-[#263047] rounded-xl text-xs font-bold text-[#F0F4FF] focus:outline-none focus:border-[#22D39F] shadow-inner"
              />
            </div>

            {/* EMPLOYEE ID */}
            <div className="p-4 rounded-2xl bg-[#0B0F18] backdrop-blur-md border border-[#263047] space-y-1.5 shadow-inner">
              <label className="text-[10px] font-bold text-[#7F8BA3] uppercase tracking-wider flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-[#22D39F]" /> Employee ID
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="EMP-100"
                className="w-full px-3 py-2 bg-[#161D2F] border border-[#263047] rounded-xl text-xs font-bold text-[#F0F4FF] focus:outline-none focus:border-[#22D39F] shadow-inner"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-full bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              id="btn-save-personal-info"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Saving...' : 'Save Personal Details'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* CHANGE PASSWORD WORKFLOW CARD */}
      <div 
        className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] space-y-5"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-[#263047]">
          <div className="p-2.5 rounded-xl bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 shadow-inner">
            <KeyRound className="w-5 h-5 text-[#22D39F]" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#F0F4FF] tracking-tight">
              Security & Password Credentials
            </h3>
            <p className="text-xs text-[#AEB8CC] font-medium">
              Update your account access key. Passwords remain securely salted and hashed server-side.
            </p>
          </div>
        </div>

        {passErrorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-2 shadow-inner">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{passErrorMsg}</span>
          </div>
        )}

        {passSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-[#22D39F] shrink-0" />
            <span>{passSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg" id="change-password-form">
          <div>
            <label className="block text-xs font-bold text-[#F0F4FF] mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-2.5 bg-[#0B0F18] border border-[#263047] rounded-2xl text-xs font-medium text-[#F0F4FF] placeholder:text-[#7F8BA3] focus:outline-none focus:border-[#22D39F] shadow-inner"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#F0F4FF] mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="w-full px-4 py-2.5 bg-[#0B0F18] border border-[#263047] rounded-2xl text-xs font-medium text-[#F0F4FF] placeholder:text-[#7F8BA3] focus:outline-none focus:border-[#22D39F] shadow-inner"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F0F4FF] mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 bg-[#0B0F18] border border-[#263047] rounded-2xl text-xs font-medium text-[#F0F4FF] placeholder:text-[#7F8BA3] focus:outline-none focus:border-[#22D39F] shadow-inner"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loadingPass}
              className="px-6 py-2.5 rounded-full bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
              id="btn-submit-change-password"
            >
              {loadingPass ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
