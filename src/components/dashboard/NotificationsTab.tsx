import React, { useState, useEffect } from 'react';
import { User, AppNotification, NotificationAttachment } from '../../types';
import { api } from '../../lib/api';
import {
  Bell,
  Send,
  Reply,
  Shield,
  MessageSquare,
  Sparkles,
  Trash2,
  Paperclip,
  Image as ImageIcon,
  PlusCircle,
  X,
  UserCheck,
  Building2,
  FileSpreadsheet,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  NotificationAttachmentItem,
  formatFileSize,
} from '../common/NotificationAttachmentItem';
import { AttachmentPicker, PendingAttachment } from '../common/AttachmentPicker';

interface Props {
  currentUser: User;
  onNotificationsViewed?: () => void;
}

export const NotificationsTab: React.FC<Props> = ({
  currentUser,
  onNotificationsViewed,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply state per notification
  const [replyMessageMap, setReplyMessageMap] = useState<Record<string, string>>({});
  const [replyAttachmentsMap, setReplyAttachmentsMap] = useState<
    Record<string, PendingAttachment[]>
  >({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);

  // New Notification Composer Form state (for Admin, Manager, and User)
  const [showComposeForm, setShowComposeForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState('ALL');
  const [newAttachments, setNewAttachments] = useState<PendingAttachment[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [sendingNew, setSendingNew] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadUsers();
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
      if (res && Array.isArray(res.users)) {
        // Filter out current user from target selection
        setAllUsers(res.users.filter((u) => u.id !== currentUser.id));
      } else {
        setAllUsers([]);
      }
    } catch (err: any) {
      console.warn('Notification dispatch user list loading skipped:', err?.message || err);
      setAllUsers([]);
    }
  };

  const handleSendReply = async (notifId: string) => {
    const text = (replyMessageMap[notifId] || '').trim();
    const attachments = replyAttachmentsMap[notifId] || [];

    if (!text && attachments.length === 0) {
      alert('Please enter a message or attach a file to send a reply.');
      return;
    }

    setSubmittingReplyId(notifId);
    try {
      const formattedAttachments = attachments.map((a) => ({
        id: a.id,
        name: a.name,
        size: a.size,
        mimeType: a.mimeType,
        url: a.url,
      }));

      await api.replyNotification(notifId, text, formattedAttachments);
      setReplyMessageMap((prev) => ({ ...prev, [notifId]: '' }));
      setReplyAttachmentsMap((prev) => ({ ...prev, [notifId]: [] }));
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

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || (!newMessage.trim() && newAttachments.length === 0)) {
      alert('Please provide a title and either a message or an attachment.');
      return;
    }

    setSendingNew(true);
    try {
      const formattedAttachments = newAttachments.map((a) => ({
        id: a.id,
        name: a.name,
        size: a.size,
        mimeType: a.mimeType,
        url: a.url,
      }));

      await api.createNotification(
        newTitle.trim(),
        newMessage.trim(),
        targetUserId,
        formattedAttachments
      );

      setNewTitle('');
      setNewMessage('');
      setNewAttachments([]);
      setShowComposeForm(false);
      await loadNotifications();
    } catch (err: any) {
      alert(`Error creating notification: ${err.message}`);
    } finally {
      setSendingNew(false);
    }
  };

  // Paste screenshot support directly from clipboard
  const handlePasteInComposer = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const base64Url = uploadEvent.target?.result as string;
          if (base64Url) {
            setNewAttachments((prev) => [
              ...prev,
              {
                id: `att_${Math.random().toString(36).substring(2, 9)}`,
                name: `screenshot_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`,
                size: file.size,
                mimeType: file.type || 'image/png',
                url: base64Url,
                fileObj: file,
              },
            ]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Paste screenshot support in reply box
  const handlePasteInReply = (notifId: string, e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const base64Url = uploadEvent.target?.result as string;
          if (base64Url) {
            setReplyAttachmentsMap((prev) => ({
              ...prev,
              [notifId]: [
                ...(prev[notifId] || []),
                {
                  id: `att_${Math.random().toString(36).substring(2, 9)}`,
                  name: `screenshot_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`,
                  size: file.size,
                  mimeType: file.type || 'image/png',
                  url: base64Url,
                  fileObj: file,
                },
              ],
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="notifications-tab-container">
      {/* HEADER CARD */}
      <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#22D39F]/30 shrink-0">
            <Bell className="w-6 h-6 text-[#22D39F]" />
          </div>
          <div>
            <h2
              className="text-xl font-black text-[#F0F4FF] tracking-tight"
              id="notifications-heading"
            >
              Notification & Dispatch Center
            </h2>
            <p className="text-xs text-[#AEB8CC] font-medium mt-0.5">
              Send notifications and exchange replies with attachments (Screenshots, JPG, PNG, PDF, Word, Excel).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center flex-wrap">
          <button
            type="button"
            onClick={() => setShowComposeForm(!showComposeForm)}
            className="px-4 py-2 rounded-full bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            id="btn-toggle-compose-notification"
          >
            {showComposeForm ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Close Composer</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Notification / Message</span>
              </>
            )}
          </button>

          <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 shadow-inner">
            {notifications.length} Messages
          </span>
        </div>
      </div>

      {/* DISPATCH / COMPOSE FORM (ACCESSIBLE TO ADMIN, MANAGER, AND USER) */}
      {showComposeForm && (
        <div
          className="bg-[#161D2F] backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-[#263047] shadow-[0_20px_50px_rgba(11,15,24,0.8)] space-y-4 animate-fade-in"
          id="compose-notification-form-card"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#263047]">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#22D39F]" />
              <h3 className="text-sm font-black text-[#F0F4FF] tracking-tight">
                Compose New Notification ({currentUser.role})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowComposeForm(false)}
              className="p-1 rounded-full bg-[#0B0F18] hover:bg-[#263047] text-[#AEB8CC] hover:text-[#F0F4FF] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateNotification} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#F0F4FF] mb-1">
                  Subject / Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Fiscal Dossier Update, Sales Invoices Review, Notice"
                  className="w-full px-4 py-2.5 bg-[#0B0F18] border border-[#263047] rounded-xl text-xs text-[#F0F4FF] placeholder:text-[#7F8BA3] font-medium focus:outline-none focus:border-[#22D39F] shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F0F4FF] mb-1">
                  Target Recipient
                </label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0B0F18] border border-[#263047] rounded-xl text-xs text-[#F0F4FF] font-medium focus:outline-none focus:border-[#22D39F] shadow-inner cursor-pointer"
                >
                  {currentUser.role === 'ADMIN' && (
                    <option value="ALL">📢 Broadcast All Users</option>
                  )}
                  {currentUser.role === 'MANAGER' && (
                    <option value="ALL">📢 Broadcast All Team & Clients</option>
                  )}
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.role === 'ADMIN' ? '🛡️' : u.role === 'MANAGER' ? '👔' : '👤'}{' '}
                      {u.fullName} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F0F4FF] mb-1">
                Notification Message
              </label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onPaste={handlePasteInComposer}
                placeholder="Type your notification message here... (You can also press Ctrl+V to paste screenshots directly)"
                rows={3}
                className="w-full px-4 py-3 bg-[#0B0F18] border border-[#263047] rounded-2xl text-xs text-[#F0F4FF] placeholder:text-[#7F8BA3] font-medium focus:outline-none focus:border-[#22D39F] shadow-inner"
              />
            </div>

            {/* ATTACHMENT PICKER */}
            <div>
              <label className="block text-xs font-bold text-[#F0F4FF] mb-1.5">
                Attach Files (Screenshot, JPG, PNG, PDF, Word, Excel, CSV, etc.)
              </label>
              <AttachmentPicker
                attachments={newAttachments}
                onChange={setNewAttachments}
                maxFiles={5}
                disabled={sendingNew}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#263047]">
              <button
                type="button"
                onClick={() => setShowComposeForm(false)}
                className="px-5 py-2.5 rounded-full bg-[#0B0F18] hover:bg-[#263047] text-[#AEB8CC] hover:text-[#F0F4FF] text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingNew || !newTitle.trim()}
                className="px-6 py-2.5 rounded-full bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {sendingNew
                    ? 'Dispatching...'
                    : newAttachments.length > 0
                    ? `Send Notification (${newAttachments.length} attachments)`
                    : 'Send Notification'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#7F8BA3] font-medium animate-pulse bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] border border-[#263047]">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] border border-dashed border-[#263047] text-center text-[#7F8BA3] space-y-3">
            <MessageSquare className="w-8 h-8 mx-auto opacity-50 text-[#22D39F]" />
            <p className="text-sm font-bold text-[#F0F4FF]">No active notifications</p>
            <p className="text-xs text-[#AEB8CC] font-medium">
              You can compose a new notification or notice with attachments using the button above.
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const pendingReplies = replyAttachmentsMap[notif.id] || [];

            return (
              <div
                key={notif.id}
                className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 shadow-[0_15px_40px_rgba(11,15,24,0.6)] border border-[#263047] space-y-4"
                id={`notification-card-${notif.id}`}
              >
                {/* TOP NOTIFICATION HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                      <Sparkles className="w-5 h-5 text-[#22D39F]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#F0F4FF] tracking-tight">
                        {notif.title}
                      </h3>
                      <p className="text-[11px] text-[#7F8BA3] font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>
                          From <strong className="text-[#F0F4FF]">{notif.senderName}</strong>
                        </span>
                        {notif.senderRole && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30">
                            {notif.senderRole}
                          </span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[#7F8BA3]">
                          <Clock className="w-3 h-3" />
                          {new Date(notif.timestamp).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-[#22D39F] bg-[#102D30] border border-[#22D39F]/30 px-2.5 py-1 rounded-full shadow-inner">
                      {notif.targetUserId === 'ALL' ? 'Broadcast' : 'Direct Message'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="p-1.5 rounded-full hover:bg-rose-950/40 text-[#7F8BA3] hover:text-rose-400 transition-colors cursor-pointer"
                      title="Dismiss / Delete notification thread"
                      id={`btn-delete-notif-${notif.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* MAIN MESSAGE BODY */}
                {notif.message && (
                  <div className="p-4 rounded-2xl bg-[#0B0F18] border border-[#263047] text-xs text-[#F0F4FF] font-medium leading-relaxed shadow-inner whitespace-pre-wrap">
                    {notif.message}
                  </div>
                )}

                {/* NOTIFICATION ATTACHMENTS */}
                {notif.attachments && notif.attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-[#AEB8CC] uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-[#22D39F]" />
                      <span>Attachments ({notif.attachments.length})</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {notif.attachments.map((att) => (
                        <NotificationAttachmentItem key={att.id} attachment={att} />
                      ))}
                    </div>
                  </div>
                )}

                {/* THREAD REPLIES */}
                {notif.replies && notif.replies.length > 0 && (
                  <div className="pl-3 sm:pl-5 border-l-2 border-[#22D39F]/30 space-y-3 my-3">
                    <p className="text-[11px] font-bold text-[#AEB8CC] uppercase tracking-wider">
                      Discussion Thread ({notif.replies.length})
                    </p>
                    {notif.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-3.5 rounded-2xl text-xs shadow-inner space-y-2.5 ${
                          reply.senderRole === 'ADMIN'
                            ? 'bg-[#102D30] border border-[#22D39F]/30 text-[#F0F4FF]'
                            : reply.senderRole === 'MANAGER'
                            ? 'bg-[#0B0F18] border border-[#263047] text-[#F0F4FF]'
                            : 'bg-[#161D2F] border border-[#263047] text-[#F0F4FF]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#F0F4FF] flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-md border shadow-inner ${
                                reply.senderRole === 'ADMIN'
                                  ? 'bg-[#22D39F] text-[#0E1120] border-[#22D39F]'
                                  : reply.senderRole === 'MANAGER'
                                  ? 'bg-[#102D30] text-[#22D39F] border-[#22D39F]/40'
                                  : 'bg-[#0B0F18] text-[#AEB8CC] border-[#263047]'
                              }`}
                            >
                              {reply.senderRole}
                            </span>
                            {reply.senderName}
                          </span>
                          <span className="text-[10px] text-[#7F8BA3] font-medium">
                            {new Date(reply.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {reply.message && (
                          <p className="text-[#AEB8CC] font-medium leading-relaxed whitespace-pre-wrap">
                            {reply.message}
                          </p>
                        )}

                        {/* REPLIES ATTACHMENTS */}
                        {reply.attachments && reply.attachments.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {reply.attachments.map((att) => (
                              <NotificationAttachmentItem key={att.id} attachment={att} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* REPLY INPUT & ATTACHMENT COMPOSER */}
                <div className="pt-2 border-t border-[#263047] space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={replyMessageMap[notif.id] || ''}
                      onChange={(e) =>
                        setReplyMessageMap({
                          ...replyMessageMap,
                          [notif.id]: e.target.value,
                        })
                      }
                      onPaste={(e) => handlePasteInReply(notif.id, e)}
                      placeholder="Write a reply... (You can attach files or paste screenshots with Ctrl+V)"
                      className="flex-1 px-4 py-2.5 bg-[#0B0F18] border border-[#263047] rounded-2xl text-xs text-[#F0F4FF] placeholder:text-[#7F8BA3] font-medium focus:outline-none focus:border-[#22D39F] shadow-inner"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply(notif.id);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSendReply(notif.id)}
                      disabled={
                        submittingReplyId === notif.id ||
                        (!(replyMessageMap[notif.id] || '').trim() &&
                          pendingReplies.length === 0)
                      }
                      className="px-5 py-2.5 rounded-2xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-40 shrink-0"
                      id={`btn-reply-${notif.id}`}
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>
                        {submittingReplyId === notif.id
                          ? 'Sending...'
                          : pendingReplies.length > 0
                          ? `Reply (${pendingReplies.length} files)`
                          : 'Reply'}
                      </span>
                    </button>
                  </div>

                  {/* REPLY ATTACHMENT PICKER */}
                  <div className="pl-1">
                    <AttachmentPicker
                      attachments={pendingReplies}
                      onChange={(updated) =>
                        setReplyAttachmentsMap({
                          ...replyAttachmentsMap,
                          [notif.id]: updated,
                        })
                      }
                      maxFiles={3}
                      disabled={submittingReplyId === notif.id}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
