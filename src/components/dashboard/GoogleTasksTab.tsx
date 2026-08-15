import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  FileText,
  RefreshCw,
  LogOut,
  Sparkles,
  AlertCircle,
  Tag,
  Clock,
  StickyNote,
  FolderPlus,
  Search,
} from 'lucide-react';
import { User } from '../../types';
import {
  signInWithGoogleTasks,
  logoutGoogleTasks,
  fetchGoogleTaskLists,
  fetchGoogleTasks,
  createGoogleTask,
  updateGoogleTask,
  deleteGoogleTask,
  createGoogleTaskList,
  GoogleTaskList,
  GoogleTaskItem,
} from '../../lib/googleTasks';

interface Props {
  currentUser?: User;
  userName?: string;
}

interface LocalNote {
  id: string;
  title: string;
  content: string;
  color: string;
  updatedAt: string;
}

export const GoogleTasksTab: React.FC<Props> = ({ currentUser, userName }) => {
  const effectiveUserName = currentUser?.fullName || currentUser?.username || userName || 'User';
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Google Tasks state
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('@default');
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create Task Form State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [creatingTask, setCreatingTask] = useState<boolean>(false);

  // Create List Form State
  const [showNewListModal, setShowNewListModal] = useState<boolean>(false);
  const [newListTitle, setNewListTitle] = useState<string>('');
  const [creatingList, setCreatingList] = useState<boolean>(false);

  // Delete Confirmation State
  const [taskToDelete, setTaskToDelete] = useState<GoogleTaskItem | null>(null);

  // Local Scratchpad Notes
  const [localNotes, setLocalNotes] = useState<LocalNote[]>(() => {
    try {
      const saved = localStorage.getItem('portal_quick_notes');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: '1',
        title: 'Q3 Financial Checklist',
        content: 'Verify that Sales and Purchase files reconcile with the Bank Statement ending balance before final submission.',
        color: '#F3EAE2',
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Vendor Follow-up',
        content: 'Request updated invoices for the marketing software subscriptions.',
        color: '#F3EAE2',
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  const [activeTab, setActiveTab] = useState<'TASKS' | 'NOTES'>('TASKS');
  const [editingNote, setEditingNote] = useState<LocalNote | null>(null);

  const saveLocalNotes = (notes: LocalNote[]) => {
    setLocalNotes(notes);
    try {
      localStorage.setItem('portal_quick_notes', JSON.stringify(notes));
    } catch {
      // ignore
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogleTasks();
      if (result) {
        setToken(result.accessToken);
        setUserEmail(result.user.email || result.user.displayName || 'Google User');
        setIsSignedIn(true);
        await loadTaskListsAndTasks(result.accessToken, '@default');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogleTasks();
    setIsSignedIn(false);
    setToken(null);
    setUserEmail(null);
    setTasks([]);
    setTaskLists([]);
  };

  const loadTaskListsAndTasks = async (accessToken: string, listId: string = '@default') => {
    setLoading(true);
    setError(null);
    try {
      const lists = await fetchGoogleTaskLists(accessToken);
      setTaskLists(lists);

      const targetList = listId === '@default' && lists.length > 0 ? lists[0].id : listId;
      setSelectedListId(targetList);

      const items = await fetchGoogleTasks(accessToken, targetList);
      setTasks(items);
    } catch (err: any) {
      console.error('Load tasks error:', err);
      setError(err.message || 'Failed to load tasks from Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectList = async (listId: string) => {
    if (!token) return;
    setSelectedListId(listId);
    setLoading(true);
    setError(null);
    try {
      const items = await fetchGoogleTasks(token, listId);
      setTasks(items);
    } catch (err: any) {
      setError(err.message || 'Failed to load list tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTaskStatus = async (task: GoogleTaskItem) => {
    if (!token) return;
    const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      await updateGoogleTask(token, selectedListId, task.id, {
        id: task.id,
        status: newStatus,
        completed: newStatus === 'completed' ? new Date().toISOString() : undefined,
      });
    } catch (err: any) {
      console.error('Failed to toggle task:', err);
      // Rollback
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      setError(err.message || 'Failed to update task status.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTitle.trim()) return;

    setCreatingTask(true);
    setError(null);
    try {
      const payload: { title: string; notes?: string; due?: string } = {
        title: newTitle.trim(),
      };
      if (newNotes.trim()) payload.notes = newNotes.trim();
      if (newDueDate) payload.due = new Date(newDueDate).toISOString();

      const created = await createGoogleTask(token, selectedListId, payload);
      setTasks((prev) => [created, ...prev]);
      setNewTitle('');
      setNewNotes('');
      setNewDueDate('');
      setShowAddModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create task in Google Tasks.');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newListTitle.trim()) return;

    setCreatingList(true);
    setError(null);
    try {
      const created = await createGoogleTaskList(token, newListTitle.trim());
      setTaskLists((prev) => [...prev, created]);
      setSelectedListId(created.id);
      setTasks([]);
      setNewListTitle('');
      setShowNewListModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create task list.');
    } finally {
      setCreatingList(false);
    }
  };

  const confirmDeleteTask = async () => {
    if (!token || !taskToDelete) return;
    const targetId = taskToDelete.id;
    setTaskToDelete(null);

    setTasks((prev) => prev.filter((t) => t.id !== targetId));
    try {
      await deleteGoogleTask(token, selectedListId, targetId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete task.');
      // Refresh to restore accurate state
      if (token) loadTaskListsAndTasks(token, selectedListId);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ACTIVE' && t.status === 'completed') return false;
    if (filter === 'COMPLETED' && t.status !== 'completed') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q);
      return matchTitle || matchNotes;
    }
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const activeCount = tasks.filter((t) => t.status !== 'completed').length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in" id="google-tasks-view">
      {/* TOP BANNER / LIQUID GLASS HEADER */}
      <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#92798B] to-[#5A463B] text-[#F3EAE2] flex items-center justify-center shadow-xs shrink-0">
              <CheckSquare className="w-5 h-5 text-[#CBAF87]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#302112] tracking-tight">
                  Personal Tasks & Action Notes
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E5DAD9] text-[#92798B] border border-white/80 shadow-2xs">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-[#5A463B] font-semibold mt-0.5">
                Organize your financial reminders, audit notes, and tasks synced directly with Google Tasks.
              </p>
            </div>
          </div>
        </div>

        {/* AUTH CONTROLS / TABS */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <div className="flex items-center p-1 bg-[#E5DAD9] rounded-2xl border border-white/80 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('TASKS')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'TASKS'
                  ? 'bg-[#92798B] text-[#F3EAE2] shadow-xs'
                  : 'text-[#5A463B] hover:text-[#302112]'
              }`}
            >
              Google Tasks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('NOTES')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'NOTES'
                  ? 'bg-[#92798B] text-[#F3EAE2] shadow-xs'
                  : 'text-[#5A463B] hover:text-[#302112]'
              }`}
            >
              Quick Scratchpad
            </button>
          </div>

          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-[#E5DAD9] border border-white/80 text-[11px] font-black text-[#302112] flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="truncate max-w-[140px]">{userEmail}</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 rounded-xl bg-[#E5DAD9] hover:bg-rose-50 text-[#5A463B] hover:text-rose-700 border border-white/80 transition-all cursor-pointer shadow-2xs"
                title="Disconnect Google Tasks"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl bg-[#F3EAE2] hover:bg-[#E5DAD9] text-[#302112] text-xs font-black border border-white/80 shadow-2xs hover:shadow-xs flex items-center gap-2.5 transition-all cursor-pointer"
              id="btn-google-tasks-signin"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{loading ? 'Connecting...' : 'Connect Google Tasks'}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ACTIVE TAB CONTENT */}
      {activeTab === 'TASKS' ? (
        !isSignedIn ? (
          /* GOOGLE TASKS PROMO / CONNECT PROMPT */
          <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-8 sm:p-12 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#92798B] to-[#5A463B] text-[#F3EAE2] flex items-center justify-center shadow-xs">
              <Sparkles className="w-8 h-8 text-[#CBAF87]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-[#302112] tracking-tight">
                Sync Personal Notes with Google Tasks
              </h3>
              <p className="text-xs sm:text-sm text-[#5A463B] font-semibold max-w-lg mx-auto leading-relaxed">
                Connect your Google account to create, organize, and check off personal action items directly from within your HRA Dossier Portal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-4 rounded-2xl bg-[#E5DAD9]/80 backdrop-blur-md border border-white/80 space-y-1 shadow-2xs">
                <div className="w-7 h-7 rounded-xl bg-[#F3EAE2] text-[#92798B] flex items-center justify-center font-black text-xs shadow-2xs border border-white/80">1</div>
                <h4 className="text-xs font-black text-[#302112]">Direct Sync</h4>
                <p className="text-[11px] text-[#5A463B] font-medium">Changes reflect instantly in your Google Tasks mobile app and web.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#E5DAD9]/80 backdrop-blur-md border border-white/80 space-y-1 shadow-2xs">
                <div className="w-7 h-7 rounded-xl bg-[#F3EAE2] text-[#92798B] flex items-center justify-center font-black text-xs shadow-2xs border border-white/80">2</div>
                <h4 className="text-xs font-black text-[#302112]">Financial Notes</h4>
                <p className="text-[11px] text-[#5A463B] font-medium">Track missing invoices, ledger reconciliations, and filing deadlines.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#E5DAD9]/80 backdrop-blur-md border border-white/80 space-y-1 shadow-2xs">
                <div className="w-7 h-7 rounded-xl bg-[#F3EAE2] text-[#92798B] flex items-center justify-center font-black text-xs shadow-2xs border border-white/80">3</div>
                <h4 className="text-xs font-black text-[#302112]">Safe & Private</h4>
                <p className="text-[11px] text-[#5A463B] font-medium">Your tasks remain confidential to your Google account with OAuth permission.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={loading}
                className="px-8 py-3.5 rounded-full bg-[#92798B] hover:bg-[#5A463B] text-[#F3EAE2] text-xs sm:text-sm font-black shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer"
              >
                <CheckSquare className="w-5 h-5 text-[#CBAF87]" />
                <span>{loading ? 'Opening Google Sign-in...' : 'Connect to Google Tasks with Permission'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* CONNECTED TASKS DASHBOARD */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: LISTS & PROGRESS */}
            <div className="lg:col-span-4 space-y-6">
              {/* COMPLETION CARD */}
              <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-6 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#302112]">Task Completion</h3>
                  <span className="text-xs font-black text-[#92798B] bg-[#E5DAD9] px-2.5 py-0.5 rounded-full border border-white/80 shadow-2xs">
                    {completionPercentage}% Done
                  </span>
                </div>

                <div className="w-full bg-[#E5DAD9] h-2.5 rounded-full overflow-hidden border border-white/60">
                  <div
                    className="bg-[#92798B] h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-2xl bg-[#E5DAD9]/80 backdrop-blur-md border border-white/80 shadow-2xs">
                    <span className="text-[10px] font-black text-[#5A463B] uppercase tracking-wider block">Active</span>
                    <span className="text-lg font-black text-[#302112]">{activeCount}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#E5DAD9]/80 backdrop-blur-md border border-white/80 shadow-2xs">
                    <span className="text-[10px] font-black text-[#5A463B] uppercase tracking-wider block">Completed</span>
                    <span className="text-lg font-black text-emerald-700">{completedCount}</span>
                  </div>
                </div>
              </div>

              {/* TASK LISTS SELECTOR */}
              <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-6 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#302112] flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#92798B]" />
                    <span>My Task Lists</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowNewListModal(true)}
                    className="p-1.5 rounded-xl bg-[#F3EAE2] hover:bg-[#E5DAD9] text-[#92798B] border border-white/80 transition-all cursor-pointer shadow-2xs"
                    title="Create New Task List"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {taskLists.map((list) => {
                    const isSelected = list.id === selectedListId;
                    return (
                      <button
                        key={list.id}
                        type="button"
                        onClick={() => handleSelectList(list.id)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-between cursor-pointer border ${
                          isSelected
                            ? 'bg-[#92798B] text-[#F3EAE2] border-[#92798B] shadow-xs scale-[1.01]'
                            : 'bg-[#E5DAD9]/80 hover:bg-white text-[#302112] border-white/80'
                        }`}
                      >
                        <span className="truncate pr-2">{list.title}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: TASKS MANAGER */}
            <div className="lg:col-span-8 space-y-4">
              {/* CONTROLS BAR */}
              <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-4 sm:p-5 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* SEARCH INPUT */}
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 text-[#92798B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notes and tasks..."
                    className="w-full pl-9 pr-4 py-2 bg-[#E5DAD9] rounded-full border border-white/80 text-xs font-bold text-[#302112] placeholder:text-[#5A463B]/60 focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                  />
                </div>

                {/* FILTERS & ACTION */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center p-1 bg-[#E5DAD9] rounded-xl border border-white/80 shrink-0 shadow-inner">
                    {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-black capitalize transition-all cursor-pointer ${
                          filter === f
                            ? 'bg-[#92798B] text-[#F3EAE2] shadow-2xs'
                            : 'text-[#5A463B] hover:text-[#302112]'
                        }`}
                      >
                        {f.toLowerCase()}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (token) loadTaskListsAndTasks(token, selectedListId);
                    }}
                    disabled={loading}
                    className="p-2 rounded-xl bg-[#E5DAD9] hover:bg-white text-[#302112] border border-white/80 transition-all cursor-pointer shadow-2xs shrink-0"
                    title="Refresh Tasks"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#92798B]' : 'text-[#92798B]'}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#92798B] hover:bg-[#5A463B] text-[#F3EAE2] text-xs font-black shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    id="btn-add-google-task"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>

              {/* TASK LIST DISPLAY */}
              <div className="space-y-3">
                {loading && tasks.length === 0 ? (
                  <div className="p-12 text-center text-xs text-[#5A463B] font-semibold bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] border border-white/80">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#92798B] mx-auto mb-2" />
                    Loading your Google Tasks...
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="p-12 text-center bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] border border-dashed border-white/80 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-[#E5DAD9] text-[#92798B] flex items-center justify-center shadow-xs">
                      <CheckSquare className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#302112]">No tasks in this view</h4>
                      <p className="text-xs text-[#5A463B] font-medium">Click "Add Task" to record a note or action item.</p>
                    </div>
                  </div>
                ) : (
                  filteredTasks.map((t) => {
                    const isCompleted = t.status === 'completed';
                    return (
                      <div
                        key={t.id}
                        className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3.5 ${
                          isCompleted
                            ? 'bg-[#E5DAD9]/60 border-white/60 opacity-75'
                            : 'bg-[#F3EAE2]/85 backdrop-blur-xl hover:bg-white border-white/80 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => handleToggleTaskStatus(t)}
                            className="mt-0.5 text-[#92798B] hover:text-[#302112] transition-colors cursor-pointer shrink-0"
                            title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                          >
                            {isCompleted ? (
                              <CheckSquare className="w-5 h-5 text-emerald-700" />
                            ) : (
                              <Square className="w-5 h-5 text-[#92798B]" />
                            )}
                          </button>

                          <div className="space-y-1 min-w-0 flex-1">
                            <h4
                              className={`text-sm font-black text-[#302112] break-words ${
                                isCompleted ? 'line-through text-[#5A463B]/60' : ''
                              }`}
                            >
                              {t.title}
                            </h4>

                            {t.notes && (
                              <p className="text-xs text-[#5A463B] font-semibold whitespace-pre-line leading-relaxed bg-[#E5DAD9]/80 p-2.5 rounded-xl border border-white/80 shadow-inner">
                                {t.notes}
                              </p>
                            )}

                            <div className="flex items-center gap-3 pt-1 flex-wrap text-[11px] font-semibold text-[#5A463B]">
                              {t.due && (
                                <span className="flex items-center gap-1 text-[#92798B] bg-[#E5DAD9] px-2 py-0.5 rounded-md font-black border border-white/80">
                                  <Calendar className="w-3 h-3" />
                                  Due: {new Date(t.due).toLocaleDateString()}
                                </span>
                              )}
                              {t.updated && (
                                <span className="flex items-center gap-1 text-[#5A463B]/70">
                                  <Clock className="w-3 h-3 text-[#92798B]" />
                                  Updated: {new Date(t.updated).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* DELETE BUTTON (Triggers confirmation dialog as required by Workspace Skill) */}
                        <button
                          type="button"
                          onClick={() => setTaskToDelete(t)}
                          className="p-2 rounded-xl bg-[#E5DAD9] hover:bg-rose-50 text-[#5A463B] hover:text-rose-700 border border-white/80 transition-all cursor-pointer shrink-0 shadow-2xs"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        /* QUICK SCRATCHPAD / STICKY NOTES VIEW */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#302112] tracking-tight">
                Quick Scratchpad Memos
              </h3>
              <p className="text-xs text-[#5A463B] font-semibold">
                Instant personal notes saved locally for your working session.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newNote: LocalNote = {
                  id: Date.now().toString(),
                  title: 'New Memo',
                  content: 'Write your notes or reminders here...',
                  color: '#F3EAE2',
                  updatedAt: new Date().toISOString(),
                };
                saveLocalNotes([newNote, ...localNotes]);
                setEditingNote(newNote);
              }}
              className="px-4 py-2.5 rounded-2xl bg-[#92798B] hover:bg-[#5A463B] text-[#F3EAE2] text-xs font-black shadow-xs hover:shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Memo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-[28px] p-5 border border-white/80 shadow-[0_10px_25px_rgba(48,33,18,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.9)] bg-[#F3EAE2]/85 backdrop-blur-xl flex flex-col justify-between space-y-3 hover:shadow-md transition-all relative group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-[#302112] truncate pr-2">
                      {note.title}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        saveLocalNotes(localNotes.filter((n) => n.id !== note.id));
                      }}
                      className="p-1.5 rounded-lg text-[#5A463B] hover:text-rose-700 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Delete Memo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-[#5A463B] font-semibold whitespace-pre-line leading-relaxed line-clamp-4">
                    {note.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/60 flex items-center justify-between text-[11px] text-[#5A463B]">
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  <button
                    type="button"
                    onClick={() => setEditingNote(note)}
                    className="text-xs font-black text-[#92798B] hover:underline cursor-pointer"
                  >
                    Edit Note
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE GOOGLE TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#F3EAE2] rounded-[32px] p-6 sm:p-7 shadow-[0_25px_60px_rgba(48,33,18,0.25)] border border-white/90 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/60">
              <h3 className="text-base font-black text-[#302112]">Add Google Task / Note</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-[#5A463B] hover:text-[#302112] hover:bg-[#E5DAD9]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-black text-[#302112] block mb-1">Title / Reminder *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Reconcile July VAT input with Bank Statement"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#E5DAD9] border border-white/80 text-xs font-bold text-[#302112] placeholder:text-[#5A463B]/60 focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                />
              </div>

              <div>
                <label className="text-xs font-black text-[#302112] block mb-1">Notes / Details (Optional)</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Add reference numbers, vendor names, or audit checkpoints..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#E5DAD9] border border-white/80 text-xs font-bold text-[#302112] placeholder:text-[#5A463B]/60 focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                />
              </div>

              <div>
                <label className="text-xs font-black text-[#302112] block mb-1">Due Date (Optional)</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#E5DAD9] border border-white/80 text-xs font-bold text-[#302112] focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full bg-[#E5DAD9] text-[#302112] text-xs font-black hover:bg-white border border-white/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTask || !newTitle.trim()}
                  className="px-6 py-2.5 rounded-full bg-[#92798B] hover:bg-[#5A463B] text-[#F3EAE2] text-xs font-black shadow-xs hover:shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {creatingTask ? 'Adding...' : 'Save to Google Tasks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW LIST MODAL */}
      {showNewListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#F3EAE2] rounded-[32px] p-6 shadow-2xl border border-white/90 space-y-4">
            <h3 className="text-base font-black text-[#302112]">New Task List</h3>
            <form onSubmit={handleCreateList} className="space-y-3">
              <input
                type="text"
                required
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="List name (e.g. Audit Checkpoints)"
                className="w-full px-4 py-2.5 rounded-xl bg-[#E5DAD9] border border-white/80 text-xs font-bold text-[#302112] placeholder:text-[#5A463B]/60 focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewListModal(false)}
                  className="px-4 py-2 rounded-full bg-[#E5DAD9] text-[#302112] text-xs font-black hover:bg-white border border-white/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingList || !newListTitle.trim()}
                  className="px-5 py-2 rounded-full bg-[#92798B] hover:bg-[#5A463B] text-[#F3EAE2] text-xs font-black disabled:opacity-50 shadow-xs transition-all cursor-pointer"
                >
                  {creatingList ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LOCAL NOTE MODAL */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#F3EAE2] rounded-[32px] p-6 sm:p-7 shadow-2xl border border-white/90 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/60">
              <h3 className="text-base font-black text-[#302112]">Edit Memo</h3>
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="p-1.5 rounded-full text-[#5A463B] hover:text-[#302112] hover:bg-[#E5DAD9]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-[#E5DAD9] border border-white/80 text-xs font-bold text-[#302112] focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
              />
              <textarea
                rows={4}
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#E5DAD9] border border-white/80 text-xs font-bold text-[#302112] focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 rounded-full bg-[#E5DAD9] text-[#302112] text-xs font-black border border-white/80 hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveLocalNotes(
                      localNotes.map((n) =>
                        n.id === editingNote.id
                          ? { ...editingNote, updatedAt: new Date().toISOString() }
                          : n
                      )
                    );
                    setEditingNote(null);
                  }}
                  className="px-5 py-2 rounded-full bg-[#92798B] hover:bg-[#5A463B] text-[#F3EAE2] text-xs font-black shadow-xs transition-all cursor-pointer"
                >
                  Save Memo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION DIALOG FOR DESTRUCTIVE TASK DELETION (Workspace Skill Directive) */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#F3EAE2] rounded-[32px] p-6 shadow-2xl border border-white/90 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-[#302112]">
                Delete Google Task?
              </h3>
              <p className="text-xs text-[#5A463B] font-semibold">
                Are you sure you want to permanently delete{' '}
                <strong className="text-[#302112]">"{taskToDelete.title}"</strong> from your Google Tasks account? This operation cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 rounded-full bg-[#E5DAD9] hover:bg-white text-[#302112] text-xs font-black transition-all cursor-pointer border border-white/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTask}
                className="px-5 py-2 rounded-full bg-rose-700 hover:bg-rose-800 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
