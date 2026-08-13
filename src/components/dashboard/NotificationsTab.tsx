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
      {/* HEADER CARD */}
      <div className="bg-[#FCFBF8] rounded-[32px] p-6 shadow-[0_15px_35px_rgba(110,85,190,0.08)] border border-[#F0ECE1] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EBFA] text-[#8364ED] flex items-center justify-center shadow-inner">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight" id="notifications-heading">
              Notification & Dispatch Center
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.role === 'ADMIN'
                ? 'Send broadcast messages and review user replies in real time'
                : 'View portal notifications from Administration and reply directly to messages'}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#F0EBFA] text-[#8364ED] border border-[#E2D8F7]">
          {notifications.length} Messages
        </span>
      </div>

      {/* ADMIN DISPATCH FORM (ONLY VISIBLE TO ADMIN) */}
      {currentUser.role === 'ADMIN' && (
        <div className="bg-[#FCFBF8] rounded-[32px] p-6 shadow-[0_15px_35px_rgba(110,85,190,0.08)] border border-[#F0ECE1] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F2ECE0]">
            <Shield className="w-5 h-5 text-[#8364ED]" />
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Dispatch New Notification (Admin)
            </h3>
          </div>

          <form onSubmit={handleCreateBroadcast} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Notification Subject Title"
                  className="w-full px-4 py-2.5 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#8364ED] font-medium shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Recipient</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#F7F5EE] border border-[#E8E4D8] rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#8364ED] shadow-inner"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type official notification message..."
                rows={2}
                className="w-full px-4 py-2.5 bg-[#F7F5EE] border border-[#E8E4D8] rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#8364ED] font-medium shadow-inner"
                required
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={sendingNew}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
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
          <div className="p-8 text-center text-xs text-slate-400 font-medium animate-pulse">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 bg-[#FCFBF8] rounded-[32px] border border-[#F0ECE1] text-center text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#8364ED]" />
            <p className="text-sm font-bold text-slate-600">No active notifications</p>
            <p className="text-xs text-slate-400 mt-1">Check back later for official administrative announcements.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-[#FCFBF8] rounded-[32px] p-6 shadow-[0_15px_35px_rgba(110,85,190,0.06)] border border-[#F0ECE1] space-y-4"
              id={`notification-card-${notif.id}`}
            >
              {/* TOP NOTIFICATION HEADER */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F0EBFA] text-[#8364ED] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
                      {notif.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      From <span className="font-semibold text-slate-700">{notif.senderName}</span> •{' '}
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#8364ED] bg-[#F0EBFA] border border-[#E2D8F7] px-2.5 py-1 rounded-full">
                    {notif.targetUserId === 'ALL' ? 'Broadcast' : 'Direct Message'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteNotification(notif.id)}
                    className="p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Dismiss / Delete notification thread"
                    id={`btn-delete-notif-${notif.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* MAIN MESSAGE BODY */}
              <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#EAE5D7] text-xs text-slate-700 font-medium leading-relaxed">
                {notif.message}
              </div>

              {/* THREAD REPLIES */}
              {notif.replies && notif.replies.length > 0 && (
                <div className="pl-4 sm:pl-6 border-l-2 border-[#E5DEFA] space-y-2.5 my-3">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Discussion Replies ({notif.replies.length})
                  </p>
                  {notif.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-3 rounded-2xl text-xs ${
                        reply.senderRole === 'ADMIN'
                          ? 'bg-[#F2EDFA] border border-[#E4DAF8] text-slate-800'
                          : 'bg-white border border-[#EBE6D8] text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          {reply.senderRole === 'ADMIN' ? (
                            <span className="text-[10px] font-extrabold text-[#8364ED] bg-white px-2 py-0.5 rounded-md border border-[#E2D8F7]">
                              ADMIN
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-600 bg-[#F2ECE0] px-2 py-0.5 rounded-md">
                              USER
                            </span>
                          )}
                          {reply.senderName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium mt-1 leading-relaxed">{reply.message}</p>
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
                  className="flex-1 px-4 py-2.5 bg-[#F7F5EE] border border-[#E8E4D8] rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#8364ED] font-medium shadow-inner"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendReply(notif.id);
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSendReply(notif.id)}
                  disabled={submittingReplyId === notif.id || !(replyMessageMap[notif.id] || '').trim()}
                  className="px-5 py-2.5 rounded-full bg-[#8364ED] hover:bg-[#7150EA] text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-40 shrink-0"
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
