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
  CheckCircle2,
  ListTodo,
  Edit3,
  X,
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

export interface PortalTask {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  completed: boolean;
  priority?: 'HIGH' | 'MEDIUM' | 'NORMAL';
  createdAt: string;
  updatedAt: string;
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

  // Mode: 'PORTAL_TASKS' | 'GOOGLE_TASKS' | 'NOTES'
  const [activeMode, setActiveMode] = useState<'PORTAL_TASKS' | 'GOOGLE_TASKS' | 'NOTES'>('PORTAL_TASKS');

  // 1. NATIVE PORTAL TASKS STATE (Instant, No OAuth Required, Persisted)
  const [portalTasks, setPortalTasks] = useState<PortalTask[]>(() => {
    try {
      const saved = localStorage.getItem(`portal_tasks_${currentUser?.id || 'default'}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'pt_1',
        title: 'Review Sales Vault & Reconcile Q3 Invoices',
        notes: 'Cross-check total sales revenue ($45,000) against verified client transactions.',
        due: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        completed: false,
        priority: 'HIGH',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pt_2',
        title: 'Upload Bank Statement for Current Filing Period',
        notes: 'Ensure all pages are legible for automated AI OCR ledger processing.',
        due: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
        completed: false,
        priority: 'MEDIUM',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pt_3',
        title: 'Verify VAT Input Deductions on Purchase Receipts',
        notes: 'Confirm standard 15% VAT computation across operating expense documents.',
        completed: true,
        priority: 'NORMAL',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Task Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newPriority, setNewPriority] = useState<'HIGH' | 'MEDIUM' | 'NORMAL'>('NORMAL');

  // Google Tasks OAuth state
  const [isSignedInGoogle, setIsSignedInGoogle] = useState<boolean>(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleTaskLists, setGoogleTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedGoogleListId, setSelectedGoogleListId] = useState<string>('@default');
  const [googleTasks, setGoogleTasks] = useState<GoogleTaskItem[]>([]);

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
        title: 'Financial Audit Checklist',
        content: 'Verify that Sales and Purchase files reconcile with the Bank Statement ending balance before final submission.',
        color: '#161D2F',
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Vendor Follow-up Memo',
        content: 'Request updated invoices for office subscriptions and server equipment.',
        color: '#161D2F',
        updatedAt: new Date().toISOString(),
      },
    ];
  });
  const [editingNote, setEditingNote] = useState<LocalNote | null>(null);

  // Save Portal Tasks to LocalStorage
  const savePortalTasks = (newTasks: PortalTask[]) => {
    setPortalTasks(newTasks);
    try {
      localStorage.setItem(`portal_tasks_${currentUser?.id || 'default'}`, JSON.stringify(newTasks));
    } catch {
      // ignore
    }
  };

  // Save Local Notes
  const saveLocalNotes = (notes: LocalNote[]) => {
    setLocalNotes(notes);
    try {
      localStorage.setItem('portal_quick_notes', JSON.stringify(notes));
    } catch {
      // ignore
    }
  };

  // Toggle Mark as Done for Portal Tasks
  const handleTogglePortalTask = (taskId: string) => {
    const updated = portalTasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
    );
    savePortalTasks(updated);
  };

  // Delete Portal Task
  const handleDeletePortalTask = (taskId: string) => {
    const updated = portalTasks.filter((t) => t.id !== taskId);
    savePortalTasks(updated);
  };

  // Create Portal Task
  const handleCreatePortalTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: PortalTask = {
      id: `pt_${Date.now()}`,
      title: newTitle.trim(),
      notes: newNotes.trim() || undefined,
      due: newDueDate || undefined,
      completed: false,
      priority: newPriority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    savePortalTasks([newTask, ...portalTasks]);
    setNewTitle('');
    setNewNotes('');
    setNewDueDate('');
    setNewPriority('NORMAL');
    setShowAddModal(false);
  };

  // Google Tasks Sign In Handler
  const handleSignInGoogle = async () => {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const result = await signInWithGoogleTasks();
      if (result) {
        setGoogleToken(result.accessToken);
        setGoogleEmail(result.user.email || result.user.displayName || 'Google Account');
        setIsSignedInGoogle(true);
        setActiveMode('GOOGLE_TASKS');
        await loadGoogleTasks(result.accessToken, '@default');
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setGoogleError(err.message || 'Failed to sign in with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const loadGoogleTasks = async (token: string, listId: string = '@default') => {
    setGoogleLoading(true);
    try {
      const lists = await fetchGoogleTaskLists(token);
      setGoogleTaskLists(lists);
      const targetList = listId === '@default' && lists.length > 0 ? lists[0].id : listId;
      setSelectedGoogleListId(targetList);
      const items = await fetchGoogleTasks(token, targetList);
      setGoogleTasks(items);
    } catch (err: any) {
      setGoogleError(err.message || 'Failed to load Google Tasks.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleToggleGoogleTask = async (task: GoogleTaskItem) => {
    if (!googleToken) return;
    const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
    setGoogleTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
    try {
      await updateGoogleTask(googleToken, selectedGoogleListId, task.id, {
        id: task.id,
        status: newStatus,
        completed: newStatus === 'completed' ? new Date().toISOString() : undefined,
      });
    } catch (err: any) {
      setGoogleError('Failed to sync task status.');
      if (googleToken) loadGoogleTasks(googleToken, selectedGoogleListId);
    }
  };

  const handleDeleteGoogleTask = async (taskId: string) => {
    if (!googleToken) return;
    setGoogleTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await deleteGoogleTask(googleToken, selectedGoogleListId, taskId);
    } catch (err: any) {
      setGoogleError('Failed to delete Google task.');
      if (googleToken) loadGoogleTasks(googleToken, selectedGoogleListId);
    }
  };

  // Filter Portal Tasks
  const filteredPortalTasks = portalTasks.filter((t) => {
    if (filter === 'ACTIVE' && t.completed) return false;
    if (filter === 'COMPLETED' && !t.completed) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const portalCompletedCount = portalTasks.filter((t) => t.completed).length;
  const portalActiveCount = portalTasks.filter((t) => !t.completed).length;
  const portalCompletionPct =
    portalTasks.length > 0 ? Math.round((portalCompletedCount / portalTasks.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in" id="tasks-hub-tab-view">
      {/* 1. TOP BANNER / NAVIGATION HEADER */}
      <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-5 sm:p-7 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#22D39F]/30 shrink-0">
            <CheckSquare className="w-6 h-6 text-[#22D39F]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#F0F4FF] tracking-tight">
                Tasks & Reminders Hub
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 shadow-inner">
                Active
              </span>
            </div>
            <p className="text-xs text-[#AEB8CC] font-medium mt-0.5">
              Organize compliance items, toggle completed tasks, and delete finished notes.
            </p>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <div className="flex items-center p-1 bg-[#0B0F18] rounded-2xl border border-[#263047] shadow-inner">
            <button
              type="button"
              onClick={() => setActiveMode('PORTAL_TASKS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'PORTAL_TASKS'
                  ? 'bg-[#22D39F] text-[#0E1120] font-black shadow-md'
                  : 'text-[#AEB8CC] hover:text-[#F0F4FF]'
              }`}
            >
              Action Items ({portalTasks.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('GOOGLE_TASKS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'GOOGLE_TASKS'
                  ? 'bg-[#22D39F] text-[#0E1120] font-black shadow-md'
                  : 'text-[#AEB8CC] hover:text-[#F0F4FF]'
              }`}
            >
              Google Tasks
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('NOTES')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'NOTES'
                  ? 'bg-[#22D39F] text-[#0E1120] font-black shadow-md'
                  : 'text-[#AEB8CC] hover:text-[#F0F4FF]'
              }`}
            >
              Quick Scratchpad
            </button>
          </div>
        </div>
      </div>

      {/* 2. MODE: PORTAL ACTION ITEMS (INSTANT NATIVE TASKS) */}
      {activeMode === 'PORTAL_TASKS' && (
        <div className="space-y-6">
          {/* STATS & FILTER BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* TOTAL TASKS */}
            <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[28px] p-5 border border-[#263047] shadow-[0_10px_25px_rgba(11,15,24,0.6)] flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#7F8BA3]">
                  Total Tasks
                </p>
                <h3 className="text-2xl font-black text-[#F0F4FF]">{portalTasks.length}</h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#0B0F18] text-[#22D39F] border border-[#263047] flex items-center justify-center font-black shadow-inner">
                <ListTodo className="w-5 h-5" />
              </div>
            </div>

            {/* PENDING TASKS */}
            <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[28px] p-5 border border-[#263047] shadow-[0_10px_25px_rgba(11,15,24,0.6)] flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#7F8BA3]">
                  Pending / In Progress
                </p>
                <h3 className="text-2xl font-black text-amber-400">{portalActiveCount}</h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#0B0F18] text-amber-400 border border-[#263047] flex items-center justify-center font-black shadow-inner">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* COMPLETED TASKS */}
            <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[28px] p-5 border border-[#263047] shadow-[0_10px_25px_rgba(11,15,24,0.6)] flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#7F8BA3]">
                  Marked as Done
                </p>
                <h3 className="text-2xl font-black text-[#22D39F]">{portalCompletedCount}</h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 flex items-center justify-center font-black shadow-inner">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* ACTION & SEARCH CONTROLS */}
          <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[28px] p-4 sm:p-5 border border-[#263047] shadow-[0_10px_25px_rgba(11,15,24,0.6)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* SEARCH */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#7F8BA3] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search action items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-[#0B0F18] border border-[#263047] text-xs font-bold text-[#F0F4FF] placeholder:text-[#7F8BA3] focus:outline-none focus:border-[#22D39F] transition-all shadow-inner"
              />
            </div>

            {/* FILTER & ADD BUTTON */}
            <div className="flex flex-wrap items-center gap-2.5 justify-between sm:justify-end">
              <div className="flex items-center p-1 bg-[#0B0F18] rounded-xl border border-[#263047] text-xs font-bold">
                {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      filter === f
                        ? 'bg-[#22D39F] text-[#0E1120] font-black shadow-inner'
                        : 'text-[#AEB8CC] hover:text-[#F0F4FF]'
                    }`}
                  >
                    {f === 'ALL' ? 'All' : f === 'ACTIVE' ? 'Pending' : 'Done'}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                id="btn-add-portal-task"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* TASK LIST CARDS */}
          <div className="space-y-3">
            {filteredPortalTasks.length === 0 ? (
              <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-10 border border-dashed border-[#263047] text-center space-y-3 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-[#22D39F] mx-auto opacity-70" />
                <h4 className="text-sm font-black text-[#F0F4FF]">No Tasks Found</h4>
                <p className="text-xs text-[#AEB8CC] font-medium max-w-sm mx-auto">
                  {searchQuery ? 'No tasks match your search filter.' : 'All tasks for this filter are completed or none have been added yet.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#22D39F] text-[#0E1120] text-xs font-black shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Task</span>
                </button>
              </div>
            ) : (
              filteredPortalTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 sm:p-5 rounded-[24px] border border-[#263047] shadow-[0_8px_20px_rgba(11,15,24,0.4)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    task.completed
                      ? 'bg-[#0B0F18]/80 opacity-75'
                      : 'bg-[#161D2F] hover:bg-[#161D2F]/90'
                  }`}
                >
                  {/* LEFT: CHECKBOX & TASK CONTENT */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* MARK AS DONE CHECKBOX BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleTogglePortalTask(task.id)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5 border ${
                        task.completed
                          ? 'bg-[#22D39F] text-[#0E1120] border-[#22D39F] shadow-sm'
                          : 'bg-[#0B0F18] text-transparent hover:text-[#22D39F] hover:bg-[#102D30] border-[#263047] shadow-inner'
                      }`}
                      title={task.completed ? 'Mark as Incomplete / Pending' : 'Mark as Done'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-bold transition-all ${
                            task.completed
                              ? 'line-through text-[#7F8BA3]'
                              : 'text-[#F0F4FF]'
                          }`}
                        >
                          {task.title}
                        </h4>

                        {task.completed ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30">
                            Completed
                          </span>
                        ) : (
                          task.priority && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                task.priority === 'HIGH'
                                  ? 'bg-rose-950/40 text-rose-400 border-rose-800'
                                  : task.priority === 'MEDIUM'
                                  ? 'bg-amber-950/40 text-amber-400 border-amber-800'
                                  : 'bg-[#0B0F18] text-[#AEB8CC] border-[#263047]'
                              }`}
                            >
                              {task.priority} Priority
                            </span>
                          )
                        )}
                      </div>

                      {task.notes && (
                        <p className="text-xs text-[#AEB8CC] font-medium whitespace-pre-line leading-relaxed bg-[#0B0F18] p-2.5 rounded-xl border border-[#263047]">
                          {task.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-3 pt-1 text-[11px] font-medium text-[#7F8BA3]">
                        {task.due && (
                          <span className="flex items-center gap-1 text-[#22D39F] bg-[#102D30] px-2 py-0.5 rounded-md font-bold border border-[#22D39F]/30">
                            <Calendar className="w-3 h-3" />
                            Due: {task.due}
                          </span>
                        )}
                        <span>
                          Added: {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: ACTION BUTTONS (MARK AS DONE TOGGLE & DELETE TRASH BUTTON) */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePortalTask(task.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-inner ${
                        task.completed
                          ? 'bg-[#0B0F18] hover:bg-[#161D2F] text-[#AEB8CC] border-[#263047]'
                          : 'bg-[#102D30] hover:bg-[#22D39F] text-[#22D39F] hover:text-[#0E1120] border-[#22D39F]/40'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{task.completed ? 'Re-open' : 'Mark as Done'}</span>
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete task "${task.title}"?`)) {
                          handleDeletePortalTask(task.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-[#0B0F18] hover:bg-rose-950/50 text-[#7F8BA3] hover:text-rose-400 border border-[#263047] transition-all cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. MODE: GOOGLE TASKS OAUTH TAB */}
      {activeMode === 'GOOGLE_TASKS' && (
        <div className="space-y-6">
          {!isSignedInGoogle ? (
            <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-8 sm:p-12 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] text-center space-y-6 max-w-2xl mx-auto">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#22D39F]/30">
                <Sparkles className="w-8 h-8 text-[#22D39F]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-[#F0F4FF] tracking-tight">
                  Sync with Google Tasks Workspace
                </h3>
                <p className="text-xs sm:text-sm text-[#AEB8CC] font-medium max-w-lg mx-auto leading-relaxed">
                  Connect your corporate or personal Google account to two-way sync all reminders, checklist items, and deadlines directly with Google Calendar & Google Tasks apps.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignInGoogle}
                disabled={googleLoading}
                className="px-8 py-3.5 rounded-full bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs sm:text-sm font-black shadow-md transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer"
              >
                <CheckSquare className="w-5 h-5 text-[#0E1120]" />
                <span>{googleLoading ? 'Connecting...' : 'Connect to Google Tasks with Permission'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0B0F18] border border-[#263047] text-xs font-bold text-[#F0F4FF]">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22D39F] animate-pulse" />
                  <span>Connected: {googleEmail}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignedInGoogle(false);
                    setGoogleToken(null);
                  }}
                  className="text-[#22D39F] hover:underline cursor-pointer"
                >
                  Disconnect
                </button>
              </div>

              <div className="space-y-3">
                {googleTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-[#161D2F] border border-[#263047] shadow-inner flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleGoogleTask(task)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border cursor-pointer ${
                          task.status === 'completed'
                            ? 'bg-[#22D39F] text-[#0E1120] border-[#22D39F]'
                            : 'bg-[#0B0F18] text-transparent hover:text-[#22D39F]'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <span className={`text-xs font-bold ${task.status === 'completed' ? 'line-through text-[#7F8BA3]' : 'text-[#F0F4FF]'}`}>
                        {task.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteGoogleTask(task.id)}
                      className="p-1.5 rounded-lg text-[#7F8BA3] hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MODE: QUICK SCRATCHPAD / STICKY NOTES */}
      {activeMode === 'NOTES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#F0F4FF] tracking-tight">
                Quick Session Scratchpad
              </h3>
              <p className="text-xs text-[#AEB8CC] font-medium">
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
                  color: '#161D2F',
                  updatedAt: new Date().toISOString(),
                };
                saveLocalNotes([newNote, ...localNotes]);
                setEditingNote(newNote);
              }}
              className="px-4 py-2.5 rounded-2xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Memo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-[28px] p-5 border border-[#263047] shadow-[0_10px_25px_rgba(11,15,24,0.6)] bg-[#161D2F]/90 backdrop-blur-xl flex flex-col justify-between space-y-3 relative group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-[#F0F4FF] truncate pr-2">
                      {note.title}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        saveLocalNotes(localNotes.filter((n) => n.id !== note.id));
                      }}
                      className="p-1.5 rounded-lg text-[#7F8BA3] hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Memo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-[#AEB8CC] font-medium whitespace-pre-line leading-relaxed line-clamp-4">
                    {note.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#263047] flex items-center justify-between text-[11px] text-[#7F8BA3]">
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  <button
                    type="button"
                    onClick={() => setEditingNote(note)}
                    className="text-xs font-bold text-[#22D39F] hover:underline cursor-pointer"
                  >
                    Edit Note
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CREATE TASK POPUP MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F18]/80 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="w-full max-w-md bg-[#161D2F] rounded-[32px] p-6 sm:p-7 shadow-[0_25px_60px_rgba(11,15,24,0.9)] border border-[#263047] space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#263047]">
              <h3 className="text-base font-black text-[#F0F4FF]">Add Action Item</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-[#7F8BA3] hover:text-[#F0F4FF] hover:bg-[#0B0F18] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePortalTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#F0F4FF] block mb-1">Task Title / Reminder *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Reconcile July VAT input with Bank Statement"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F18] border border-[#263047] text-xs font-medium text-[#F0F4FF] placeholder:text-[#7F8BA3] focus:outline-none focus:border-[#22D39F] shadow-inner"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#F0F4FF] block mb-1">Notes / Details</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Optional details, invoice numbers, or client instructions..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F18] border border-[#263047] text-xs font-medium text-[#F0F4FF] placeholder:text-[#7F8BA3] focus:outline-none focus:border-[#22D39F] shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#F0F4FF] block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F18] border border-[#263047] text-xs font-medium text-[#F0F4FF] focus:outline-none focus:border-[#22D39F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#F0F4FF] block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F18] border border-[#263047] text-xs font-medium text-[#F0F4FF] focus:outline-none focus:border-[#22D39F] cursor-pointer"
                  >
                    <option value="NORMAL" className="bg-[#161D2F] text-[#F0F4FF]">Normal</option>
                    <option value="MEDIUM" className="bg-[#161D2F] text-[#F0F4FF]">Medium</option>
                    <option value="HIGH" className="bg-[#161D2F] text-[#F0F4FF]">High</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#0B0F18] text-[#AEB8CC] hover:text-[#F0F4FF] text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black shadow-md cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT NOTE POPUP MODAL */}
      {editingNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F18]/80 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingNote(null);
          }}
        >
          <div className="w-full max-w-md bg-[#161D2F] rounded-[32px] p-6 sm:p-7 shadow-[0_25px_60px_rgba(11,15,24,0.9)] border border-[#263047] space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#263047]">
              <h3 className="text-base font-black text-[#F0F4FF]">Edit Scratchpad Memo</h3>
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="p-1.5 rounded-full text-[#7F8BA3] hover:text-[#F0F4FF] hover:bg-[#0B0F18] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#F0F4FF] block mb-1">Title</label>
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F18] border border-[#263047] text-xs font-medium text-[#F0F4FF] focus:outline-none focus:border-[#22D39F] shadow-inner"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#F0F4FF] block mb-1">Content</label>
                <textarea
                  rows={4}
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F18] border border-[#263047] text-xs font-medium text-[#F0F4FF] focus:outline-none focus:border-[#22D39F] shadow-inner"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#0B0F18] text-[#AEB8CC] hover:text-[#F0F4FF] text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveLocalNotes(
                      localNotes.map((n) =>
                        n.id === editingNote.id ? { ...editingNote, updatedAt: new Date().toISOString() } : n
                      )
                    );
                    setEditingNote(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black shadow-md cursor-pointer"
                >
                  Save Memo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
