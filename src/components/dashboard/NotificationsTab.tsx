import React, { useState, useEffect } from 'react';
import { User, AppNotification } from '../../types';
import { api } from '../../lib/api';
import { Bell, Send, Reply, Shield, MessageSquare, Sparkles, Trash2 } from 'lucide-react';

interface Props {
  currentUser: User;
  onNotificationsViewed?: () => void;
}

export const NotificationsTab: React.FC<Props> = ({ currentUser, onNotificationsViewed }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMessageMap, setReplyMessageMap] = useState<Record<string, string>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);

  // Admin New Notification Form state
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState('ALL');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [sendingNew, setSendingNew] = useState(false);

  useEffect(() => {
    loadNotifications();
    if (currentUser.role === 'ADMIN') {
      loadUsers();
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      
      // Automatically mark as read on viewing notifications tab
      await api.markNotificationsRead();
      if (onNotificationsViewed) {
        onNotificationsViewed();
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.getUsers();
      setAllUsers(res.users.filter((u) => u.id !== currentUser.id));
    } catch (err) {
      console.error('Failed to load users for notification dispatch:', err);
    }
  };

  const handleSendReply = async (notifId: string) => {
    const text = replyMessageMap[notifId];
    if (!text || !text.trim()) return;

    setSubmittingReplyId(notifId);
    try {
      await api.replyNotification(notifId, text.trim());
      setReplyMessageMap((prev) => ({ ...prev, [notifId]: '' }));
      await loadNotifications();
    } catch (err: any) {
      alert(`Reply error: ${err.message || 'Could not send reply.'}`);
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const handleDeleteNotification = async (notifId: string) => {
    try {
      await api.deleteNotification(notifId);
      await loadNotifications();
    } catch (err: any) {
      alert(`Delete error: ${err.message || 'Could not delete notification.'}`);
    }
  };

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    setSendingNew(true);
    try {
      await api.createNotification(newTitle.trim(), newMessage.trim(), targetUserId);
      setNewTitle('');
      setNewMessage('');
      await loadNotifications();
    } catch (err: any) {
      alert(`Error creating notification: ${err.message}`);
    } finally {
      setSendingNew(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="notifications-tab-container">
      {/* HEADER CARD WITH LIQUID DROP GLASS */}
      <div 
        className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#92798B] to-[#5A463B] text-[#F3EAE2] flex items-center justify-center shadow-xs shrink-0">
            <Bell className="w-6 h-6 text-[#CBAF87]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#302112] tracking-tight" id="notifications-heading">
              Notification & Dispatch Center
            </h2>
            <p className="text-xs text-[#5A463B] font-semibold mt-0.5">
              {currentUser.role === 'ADMIN'
                ? 'Send broadcast messages and review user replies in real time'
                : 'View official dossier notifications from Administration and reply directly'}
            </p>
          </div>
        </div>

        <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-[#E5DAD9] text-[#92798B] border border-white/80 shadow-2xs self-start sm:self-center">
          {notifications.length} Messages
        </span>
      </div>

      {/* ADMIN DISPATCH FORM (ONLY VISIBLE TO ADMIN) */}
      {currentUser.role === 'ADMIN' && (
        <div 
          className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] space-y-4"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-white/60">
            <Shield className="w-5 h-5 text-[#92798B]" />
            <h3 className="text-sm font-black text-[#302112] tracking-tight">
              Dispatch New Notification (Admin)
            </h3>
          </div>

          <form onSubmit={handleCreateBroadcast} className="space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-[#302112] mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Notification Subject Title"
                  className="w-full px-4 py-2.5 bg-[#E5DAD9] border border-white/80 rounded-xl text-xs text-[#302112] placeholder:text-[#5A463B]/60 font-bold focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#302112] mb-1">Target Recipient</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#E5DAD9] border border-white/80 rounded-xl text-xs text-[#302112] font-bold focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                >
                  <option value="ALL">📢 Broadcast All Users</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      👤 {u.fullName} ({u.username})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#302112] mb-1">Message</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type official notification message..."
                rows={2}
                className="w-full px-4 py-2.5 bg-[#E5DAD9] border border-white/80 rounded-2xl text-xs text-[#302112] placeholder:text-[#5A463B]/60 font-bold focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                required
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={sendingNew}
                className="px-6 py-2.5 rounded-full bg-[#92798B] hover:bg-[#5A463B] text-[#F3EAE2] text-xs font-black flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingNew ? 'Dispatching...' : 'Send Notification'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#5A463B] font-semibold animate-pulse bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] border border-white/80">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] border border-dashed border-white/80 text-center text-[#5A463B] space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto opacity-50 text-[#92798B]" />
            <p className="text-sm font-black text-[#302112]">No active notifications</p>
            <p className="text-xs text-[#5A463B] font-medium">Check back later for official administrative announcements.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] border border-white/80 space-y-4"
              id={`notification-card-${notif.id}`}
            >
              {/* TOP NOTIFICATION HEADER */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E5DAD9] text-[#92798B] border border-white/80 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Sparkles className="w-4.5 h-4.5 text-[#CBAF87]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#302112] tracking-tight">
                      {notif.title}
                    </h3>
                    <p className="text-[11px] text-[#5A463B] font-medium mt-0.5">
                      From <span className="font-bold text-[#302112]">{notif.senderName}</span> •{' '}
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#92798B] bg-[#E5DAD9] border border-white/80 px-2.5 py-1 rounded-full shadow-2xs">
                    {notif.targetUserId === 'ALL' ? 'Broadcast' : 'Direct Message'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteNotification(notif.id)}
                    className="p-1.5 rounded-full hover:bg-rose-50 text-[#5A463B] hover:text-rose-700 transition-colors cursor-pointer"
                    title="Dismiss / Delete notification thread"
                    id={`btn-delete-notif-${notif.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* MAIN MESSAGE BODY */}
              <div className="p-4 rounded-2xl bg-[#E5DAD9]/80 backdrop-blur-md border border-white/80 text-xs text-[#302112] font-semibold leading-relaxed shadow-inner">
                {notif.message}
              </div>

              {/* THREAD REPLIES */}
              {notif.replies && notif.replies.length > 0 && (
                <div className="pl-4 sm:pl-6 border-l-2 border-[#92798B]/30 space-y-2.5 my-3">
                  <p className="text-[11px] font-black text-[#5A463B] uppercase tracking-wider">
                    Discussion Replies ({notif.replies.length})
                  </p>
                  {notif.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-3 rounded-2xl text-xs shadow-2xs ${
                        reply.senderRole === 'ADMIN'
                          ? 'bg-[#E0D1D4] border border-white text-[#302112]'
                          : 'bg-white border border-white/80 text-[#302112]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-[#302112] flex items-center gap-1.5">
                          {reply.senderRole === 'ADMIN' ? (
                            <span className="text-[10px] font-black text-[#92798B] bg-white px-2 py-0.5 rounded-md border border-white/80 shadow-2xs">
                              ADMIN
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-[#5A463B] bg-[#E5DAD9] px-2 py-0.5 rounded-md border border-white/80">
                              USER
                            </span>
                          )}
                          {reply.senderName}
                        </span>
                        <span className="text-[10px] text-[#5A463B]/80 font-medium">
                          {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[#302112] font-semibold mt-1 leading-relaxed">{reply.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* REPLY INPUT AREA (ALL USERS CAN REPLY TO EXISTING NOTIFICATIONS) */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={replyMessageMap[notif.id] || ''}
                  onChange={(e) =>
                    setReplyMessageMap({ ...replyMessageMap, [notif.id]: e.target.value })
                  }
                  placeholder="Type a reply to Admin..."
                  className="flex-1 px-4 py-2.5 bg-[#E5DAD9] border border-white/80 rounded-full text-xs text-[#302112] placeholder:text-[#5A463B]/60 font-bold focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendReply(notif.id);
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSendReply(notif.id)}
                  disabled={submittingReplyId === notif.id || !(replyMessageMap[notif.id] || '').trim()}
                  className="px-5 py-2.5 rounded-full bg-[#92798B] hover:bg-[#5A463B] text-[#F3EAE2] text-xs font-black flex items-center gap-1.5 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-40 shrink-0"
                  id={`btn-reply-${notif.id}`}
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>{submittingReplyId === notif.id ? 'Sending...' : 'Reply'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
