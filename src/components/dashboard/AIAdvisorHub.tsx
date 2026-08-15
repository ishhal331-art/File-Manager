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
}

export const AIAdvisorHub: React.FC<Props> = ({
  currentUser,
  users = [],
  files,
  onReviewFile,
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
      <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/80 shadow-[0_20px_50px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#92798B] to-[#5A463B] text-[#FAF6F0] flex items-center justify-center font-black text-xl shadow-xs shrink-0">
            <Sparkles className="w-6 h-6 text-[#CBAF87]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#302112] tracking-tight">
                AI Fiscal & Compliance Advisor
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E5DAD9] text-[#92798B] border border-white/80">
                Gemini 2.5 Intelligence
              </span>
            </div>
            <p className="text-xs text-[#5A463B] font-semibold mt-0.5">
              Ask fiscal questions, audit missing compliance files, calculate VAT margins, and query document data.
            </p>
          </div>
        </div>

        {/* TARGET USER SCOPE (IF ADMIN / MANAGER) */}
        {isAdminOrManager && clientUsers.length > 0 && (
          <div className="flex items-center gap-2 bg-[#E5DAD9] p-1.5 rounded-2xl border border-white/80">
            <Users className="w-4 h-4 text-[#92798B] ml-2" />
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-black text-[#302112] focus:outline-none pr-2 cursor-pointer"
            >
              <option value="ALL">🌐 Entire Organization ({clientUsers.length} Clients)</option>
              {clientUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  👤 {u.fullName} (@{u.username})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. PRESET PROMPTS */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-[#5A463B] uppercase tracking-wider px-1">
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
                className="p-3.5 rounded-2xl bg-[#F3EAE2]/85 backdrop-blur-xl border border-white/80 hover:bg-white hover:border-[#92798B] text-left transition-all cursor-pointer shadow-2xs group flex items-start gap-3 disabled:opacity-50"
              >
                <div className="p-2 rounded-xl bg-[#E5DAD9] text-[#92798B] group-hover:bg-[#92798B] group-hover:text-[#FAF6F0] transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-[#302112] group-hover:text-[#92798B] transition-colors truncate">
                    {item.label}
                  </h4>
                  <p className="text-[11px] text-[#5A463B] font-semibold line-clamp-2 mt-0.5">
                    {item.question}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. NATURAL LANGUAGE INPUT BAR */}
      <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-4 sm:p-5 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#92798B] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ask anything about invoices, sales ledgers, compliance status, or VAT liabilities..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#E5DAD9] border border-white/80 rounded-2xl text-xs font-bold text-[#302112] placeholder:text-[#5A463B]/60 focus:outline-none focus:border-[#92798B] focus:bg-white shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#92798B] hover:bg-[#5A463B] text-[#FAF6F0] text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-40"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#FAF6F0]" />
                <span>Analyzing Fiscal Data...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#FAF6F0]" />
                <span>Ask AI Advisor</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 4. AI RESPONSE CARD */}
      {response && (
        <div className="bg-[#F3EAE2]/90 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-[0_20px_50px_rgba(48,33,18,0.12),inset_0_2px_3px_rgba(255,255,255,0.95)] space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-white/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#92798B] to-[#5A463B] text-[#FAF6F0] flex items-center justify-center font-black shadow-xs">
                <Sparkles className="w-4 h-4 text-[#CBAF87]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#302112]">
                  Fiscal Intelligence Report
                </h4>
                <p className="text-[10px] font-bold text-[#5A463B]">
                  Generated in real-time from ingested files and compliance state.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-[#E5DAD9] hover:bg-white text-[#302112] text-xs font-black border border-white/80 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Copy response to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#92798B]" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          </div>

          {/* RESPONSE BODY */}
          <div className="text-xs sm:text-sm font-semibold text-[#302112] whitespace-pre-line leading-relaxed space-y-2 bg-[#E5DAD9]/80 p-5 rounded-2xl border border-white/80 shadow-inner">
            {response}
          </div>

          {/* SUMMARY PILLS */}
          {responseStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/70 border border-white/80 text-center">
                <p className="text-[10px] font-extrabold text-[#5A463B] uppercase">Sales Files</p>
                <p className="text-sm font-black text-[#302112]">{responseStats.salesCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/70 border border-white/80 text-center">
                <p className="text-[10px] font-extrabold text-[#5A463B] uppercase">Purchases</p>
                <p className="text-sm font-black text-[#302112]">{responseStats.purchaseCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/70 border border-white/80 text-center">
                <p className="text-[10px] font-extrabold text-[#5A463B] uppercase">Net Margin</p>
                <p className="text-sm font-black text-[#302112]">${(responseStats.netProfit || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/70 border border-white/80 text-center">
                <p className="text-[10px] font-extrabold text-[#5A463B] uppercase">Compliance</p>
                <p className="text-sm font-black text-emerald-800">
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
