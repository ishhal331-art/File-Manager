import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Search,
  Users,
  Building2,
  FileCheck,
  Zap,
} from 'lucide-react';
import { User, UploadedFile } from '../../types';
import { api } from '../../lib/api';

interface Props {
  currentUser: User;
  users?: User[];
  files: UploadedFile[];
  onReviewFile?: (file: UploadedFile) => void;
  onInspectFile?: (file: UploadedFile) => void;
}

export const AIAdvisorHub: React.FC<Props> = ({
  currentUser,
  users = [],
  files,
  onReviewFile,
  onInspectFile,
}) => {
  const [query, setQuery] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [responseStats, setResponseStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const isAdminOrManager = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';
  const clientUsers = users.filter((u) => u.role === 'USER');

  // Preset quick questions tailored for fiscal compliance & management
  const presetQuestions = [
    {
      label: 'Audit Dossier Compliance Gaps',
      question: 'Audit all dossiers for Q3 compliance gaps and list users with missing mandatory files.',
      icon: ShieldCheck,
    },
    {
      label: 'Compare Sales vs Purchases',
      question: 'Compare total sales ingestion against operating purchases and calculate the net fiscal margin.',
      icon: TrendingUp,
    },
    {
      label: 'Check Missing Bank Statements',
      question: 'Which client users currently have unsubmitted bank statements requiring reconciliation?',
      icon: AlertCircle,
    },
    {
      label: 'Estimate VAT Liability (15%)',
      question: 'Estimate total Output VAT from sales, Input VAT deductions from purchases, and Net VAT payable at 15%.',
      icon: FileSpreadsheet,
    },
    {
      label: 'Executive Summary for Leadership',
      question: 'Generate a structured executive compliance and financial audit summary for management.',
      icon: Sparkles,
    },
    {
      label: 'Priority Action Items',
      question: 'What are the top 3 priority operational and tax action items for our compliance team this week?',
      icon: Zap,
    },
  ];

  const handleAsk = async (questionToAsk?: string) => {
    const prompt = questionToAsk || query;
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setResponse(null);
    setResponseStats(null);
    setQuery(prompt);

    try {
      const res = await api.askAI(prompt, selectedUserFilter);
      setResponse(res.answer);
      if (res.stats) setResponseStats(res.stats);
    } catch (err: any) {
      setResponse(`⚠️ AI Advisor encountered an issue: ${err.message || 'Unable to process query.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="ai-advisor-hub">
      {/* 1. TOP HERO BANNER */}
      <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-[#263047] shadow-[0_20px_50px_rgba(11,15,24,0.6)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#102D30] text-[#22D39F] flex items-center justify-center font-black text-xl shadow-inner border border-[#22D39F]/30 shrink-0">
            <Sparkles className="w-6 h-6 text-[#22D39F]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#F0F4FF] tracking-tight">
                AI Fiscal & Compliance Advisor
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 shadow-inner">
                Gemini 2.5 Intelligence
              </span>
            </div>
            <p className="text-xs text-[#AEB8CC] font-medium mt-0.5">
              Ask fiscal questions, audit missing compliance files, calculate VAT margins, and query document data.
            </p>
          </div>
        </div>

        {/* TARGET USER SCOPE (IF ADMIN / MANAGER) */}
        {isAdminOrManager && clientUsers.length > 0 && (
          <div className="flex items-center gap-2 bg-[#0B0F18] p-1.5 rounded-2xl border border-[#263047]">
            <Users className="w-4 h-4 text-[#22D39F] ml-2" />
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-[#F0F4FF] focus:outline-none pr-2 cursor-pointer"
            >
              <option value="ALL" className="bg-[#161D2F] text-[#F0F4FF]">
                🌐 Entire Organization ({clientUsers.length} Clients)
              </option>
              {clientUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-[#161D2F] text-[#F0F4FF]">
                  👤 {u.fullName} (@{u.username})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. PRESET PROMPTS */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#7F8BA3] uppercase tracking-wider px-1">
          Quick Audit & Intelligence Queries
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {presetQuestions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(item.question)}
                disabled={loading}
                className="p-3.5 rounded-2xl bg-[#161D2F]/90 backdrop-blur-xl border border-[#263047] hover:bg-[#102D30] hover:border-[#22D39F] text-left transition-all cursor-pointer shadow-inner group flex items-start gap-3 disabled:opacity-50"
              >
                <div className="p-2 rounded-xl bg-[#0B0F18] text-[#22D39F] group-hover:bg-[#22D39F] group-hover:text-[#0E1120] transition-colors shrink-0 border border-[#263047]">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#F0F4FF] group-hover:text-[#22D39F] transition-colors truncate">
                    {item.label}
                  </h4>
                  <p className="text-[11px] text-[#AEB8CC] font-medium line-clamp-2 mt-0.5">
                    {item.question}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. NATURAL LANGUAGE INPUT BAR */}
      <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-4 sm:p-5 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#22D39F] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ask anything about invoices, sales ledgers, compliance status, or VAT liabilities..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#0B0F18] border border-[#263047] rounded-2xl text-xs font-bold text-[#F0F4FF] placeholder:text-[#7F8BA3] focus:outline-none focus:border-[#22D39F] shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-40"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#0E1120]" />
                <span>Analyzing Fiscal Data...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#0E1120]" />
                <span>Ask AI Advisor</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 4. AI RESPONSE CARD */}
      {response && (
        <div className="bg-[#161D2F]/95 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 border border-[#263047] shadow-[0_20px_50px_rgba(11,15,24,0.8)] space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#263047]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#102D30] text-[#22D39F] flex items-center justify-center font-black shadow-inner border border-[#22D39F]/30">
                <Sparkles className="w-4 h-4 text-[#22D39F]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#F0F4FF]">
                  Fiscal Intelligence Report
                </h4>
                <p className="text-[10px] font-medium text-[#7F8BA3]">
                  Generated in real-time from ingested files and compliance state.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-[#0B0F18] hover:bg-[#102D30] text-[#F0F4FF] hover:text-[#22D39F] text-xs font-bold border border-[#263047] hover:border-[#22D39F] flex items-center gap-1.5 shadow-inner transition-all cursor-pointer"
              title="Copy response to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#22D39F]" />
                  <span className="text-[#22D39F]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#22D39F]" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          </div>

          {/* RESPONSE BODY */}
          <div className="text-xs sm:text-sm font-medium text-[#F0F4FF] whitespace-pre-line leading-relaxed space-y-2 bg-[#0B0F18] p-5 rounded-2xl border border-[#263047] shadow-inner">
            {response}
          </div>

          {/* SUMMARY PILLS */}
          {responseStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#0B0F18] border border-[#263047] text-center shadow-inner">
                <p className="text-[10px] font-bold text-[#7F8BA3] uppercase">Sales Files</p>
                <p className="text-sm font-black text-[#22D39F]">{responseStats.salesCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0F18] border border-[#263047] text-center shadow-inner">
                <p className="text-[10px] font-bold text-[#7F8BA3] uppercase">Purchases</p>
                <p className="text-sm font-black text-[#60A5FA]">{responseStats.purchaseCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0F18] border border-[#263047] text-center shadow-inner">
                <p className="text-[10px] font-bold text-[#7F8BA3] uppercase">Net Margin</p>
                <p className="text-sm font-black text-[#F0F4FF]">${(responseStats.netProfit || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0F18] border border-[#263047] text-center shadow-inner">
                <p className="text-[10px] font-bold text-[#7F8BA3] uppercase">Compliance</p>
                <p className="text-sm font-black text-[#22D39F]">
                  {responseStats.compliantDossiers}/{responseStats.totalDossiers} Complete
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
