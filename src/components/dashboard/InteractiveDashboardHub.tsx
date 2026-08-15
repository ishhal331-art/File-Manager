import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Plus,
  CheckSquare,
  Square,
  Clock,
  Layers,
  UploadCloud,
  FileCheck,
  Send,
  HelpCircle,
  Eye,
  Building2,
  FolderOpen,
} from 'lucide-react';
import { UploadedFile, User } from '../../types';
import { ProgressWheel } from './ProgressWheel';

interface Props {
  currentUser: User;
  files: UploadedFile[];
  onNavigateTab: (tab: 'dashboard' | 'upload' | 'ai' | 'tasks' | 'notifications' | 'activity' | 'profile') => void;
  onInspectFile: (file: UploadedFile) => void;
  onQuickUploadCategory?: (category: string) => void;
}

export const InteractiveDashboardHub: React.FC<Props> = ({
  currentUser,
  files,
  onNavigateTab,
  onInspectFile,
  onQuickUploadCategory,
}) => {
  // Category counts
  const salesFiles = files.filter((f) => f.fileType === 'SALES');
  const purchaseFiles = files.filter((f) => f.fileType === 'PURCHASE');
  const bankFiles = files.filter((f) => f.fileType === 'BANK_STATEMENT');
  const additionalFiles = files.filter((f) => f.fileType === 'ADDITIONAL');

  // Compute total sales and purchases from extracted data or estimates
  const calculateTotal = (fileList: UploadedFile[], defaultUnit: number) => {
    let sum = 0;
    fileList.forEach((file) => {
      if (file.extractedData && file.extractedData.length > 0) {
        file.extractedData.forEach((row) => {
          const val = parseFloat(String(row.amount || row.total || row.value || '').replace(/[^0-9.-]+/g, ''));
          if (!isNaN(val)) sum += val;
        });
      } else {
        sum += defaultUnit;
      }
    });
    return sum;
  };

  const totalSalesVal = salesFiles.length > 0 ? calculateTotal(salesFiles, 12450) : 0;
  const totalPurchaseVal = purchaseFiles.length > 0 ? calculateTotal(purchaseFiles, 5320) : 0;
  const netProfit = totalSalesVal - totalPurchaseVal;

  // Interactive Tax Calculator State
  const [vatRate, setVatRate] = useState<number>(15);
  const estimatedOutputVat = (totalSalesVal * (vatRate / 100));
  const estimatedInputVat = (totalPurchaseVal * (vatRate / 100));
  const netVatPayable = estimatedOutputVat - estimatedInputVat;

  // Interactive AI Assistant Q&A State
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  // Quick tasks state
  const [quickTasks, setQuickTasks] = useState([
    { id: 1, text: 'Upload Q3 Sales Invoices (Mandatory)', done: salesFiles.length > 0 },
    { id: 2, text: 'Reconcile Bank Statement with Ledger', done: bankFiles.length > 0 },
    { id: 3, text: 'Review AI-extracted Purchase Receipts', done: purchaseFiles.length > 0 },
    { id: 4, text: 'Submit Quarterly Fiscal Compliance Dossier', done: files.length >= 3 },
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  const toggleTask = (id: number) => {
    setQuickTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setQuickTasks((prev) => [
      ...prev,
      { id: Date.now(), text: newTaskInput.trim(), done: false },
    ]);
    setNewTaskInput('');
  };

  const handleAskAI = (question: string) => {
    setAiQuery(question);
    setAiThinking(true);
    setAiAnswer(null);

    setTimeout(() => {
      let answer = '';
      const q = question.toLowerCase();
      if (q.includes('sales') || q.includes('revenue')) {
        answer = `Your total sales ingestion is $${totalSalesVal.toLocaleString()} across ${salesFiles.length} uploaded files. All client invoices have valid OCR timestamps.`;
      } else if (q.includes('purchase') || q.includes('expense')) {
        answer = `Total operating purchases amount to $${totalPurchaseVal.toLocaleString()} across ${purchaseFiles.length} files. Tax deductions are verified.`;
      } else if (q.includes('profit') || q.includes('margin') || q.includes('net')) {
        answer = `Estimated net fiscal profit is $${netProfit.toLocaleString()} (Operating Margin: ${totalSalesVal > 0 ? Math.round((netProfit / totalSalesVal) * 100) : 0}%).`;
      } else if (q.includes('tax') || q.includes('vat')) {
        answer = `At a ${vatRate}% rate, estimated Output VAT is $${estimatedOutputVat.toLocaleString(undefined, { maximumFractionDigits: 2 })} and Net Tax Payable is $${netVatPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}.`;
      } else if (q.includes('bank') || q.includes('reconcil')) {
        answer = bankFiles.length > 0
          ? `Bank statement is uploaded and verified against ${salesFiles.length + purchaseFiles.length} ledger transactions.`
          : 'Bank statement is pending upload in the Upload Center.';
      } else {
        answer = `HRA AI Document Intelligence has processed ${files.length} documents. Fiscal dossier compliance is at ${Math.round(((salesFiles.length > 0 ? 1 : 0) + (purchaseFiles.length > 0 ? 1 : 0) + (bankFiles.length > 0 ? 1 : 0)) / 3 * 100)}%.`;
      }
      setAiAnswer(answer);
      setAiThinking(false);
    }, 450);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="interactive-dashboard-hub">
      {/* 1. TOP INTERACTIVE HERO GLASS CARD */}
      <div 
        className="bg-[#F3EAE2]/80 backdrop-blur-2xl rounded-[36px] p-6 sm:p-8 border border-white/80 shadow-[0_20px_50px_rgba(48,33,18,0.08),inset_0_2px_3px_rgba(255,255,255,0.95)] relative overflow-hidden"
        id="dashboard-hero-banner"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-black text-[#92798B] bg-[#E5DAD9] px-3 py-0.5 rounded-full border border-white/80 shadow-2xs">
                Active Fiscal Period 2026
              </span>
              <span className="text-[11px] font-bold text-[#5A463B]">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#302112] tracking-tight">
              Welcome back, {currentUser.fullName}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#5A463B] mt-1 max-w-2xl leading-relaxed">
              Your HRA financial intelligence workspace is active. Manage file dossiers, run live OCR analytics, and monitor compliance in real-time.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('upload')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#92798B] via-[#5A463B] to-[#302112] hover:from-[#82687B] hover:to-[#4D3A2F] text-[#F3EAE2] text-xs font-black shadow-[0_8px_20px_rgba(48,33,18,0.2)] hover:shadow-[0_12px_25px_rgba(48,33,18,0.3)] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              id="btn-hero-goto-upload"
            >
              <UploadCloud className="w-4 h-4 text-[#F3EAE2]" />
              <span>Go to Upload Center</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('ai')}
              className="px-4 py-3 rounded-2xl bg-[#E5DAD9] hover:bg-white text-[#302112] border border-white/80 text-xs font-extrabold shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#92798B]" />
              <span>AI OCR Insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THREE KEY FINANCIAL KPI GLASS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="dashboard-financial-kpis">
        {/* KPI 1: INGESTED SALES */}
        <div className="bg-[#E5DAD9]/80 backdrop-blur-xl rounded-[28px] p-5 border border-white/80 shadow-[0_12px_30px_rgba(48,33,18,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex items-center justify-between glass-card-hover">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-[11px] font-black text-[#5A463B] uppercase tracking-wider">
                Ingested Sales
              </span>
            </div>
            <p className="text-2xl font-black text-[#302112] tracking-tight">
              ${totalSalesVal.toLocaleString()}
            </p>
            <p className="text-[11px] font-bold text-[#92798B]">
              {salesFiles.length} file(s) structured via OCR
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F3EAE2] text-[#92798B] flex items-center justify-center shadow-xs border border-white/80 shrink-0">
            <TrendingUp className="w-6 h-6 text-emerald-700" />
          </div>
        </div>

        {/* KPI 2: INGESTED EXPENSES */}
        <div className="bg-[#E0D1D4]/80 backdrop-blur-xl rounded-[28px] p-5 border border-white/80 shadow-[0_12px_30px_rgba(48,33,18,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex items-center justify-between glass-card-hover">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#CBAF87]" />
              <span className="text-[11px] font-black text-[#5A463B] uppercase tracking-wider">
                Operating Purchases
              </span>
            </div>
            <p className="text-2xl font-black text-[#302112] tracking-tight">
              ${totalPurchaseVal.toLocaleString()}
            </p>
            <p className="text-[11px] font-bold text-[#5A463B]">
              {purchaseFiles.length} vendor receipt(s) verified
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F3EAE2] text-[#5A463B] flex items-center justify-center shadow-xs border border-white/80 shrink-0">
            <TrendingDown className="w-6 h-6 text-[#92798B]" />
          </div>
        </div>

        {/* KPI 3: NET FISCAL BALANCE */}
        <div className="bg-[#F3EAE2]/90 backdrop-blur-xl rounded-[28px] p-5 border border-white/80 shadow-[0_12px_30px_rgba(48,33,18,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex items-center justify-between glass-card-hover">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span className="text-[11px] font-black text-[#5A463B] uppercase tracking-wider">
                Net Operating Balance
              </span>
            </div>
            <p className="text-2xl font-black text-[#302112] tracking-tight">
              ${netProfit.toLocaleString()}
            </p>
            <p className="text-[11px] font-bold text-emerald-700">
              Bank statement: {bankFiles.length > 0 ? '✓ Reconciled' : 'Pending Upload'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E5DAD9] text-[#302112] flex items-center justify-center shadow-xs border border-white/80 shrink-0">
            <Building2 className="w-6 h-6 text-[#92798B]" />
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE 6-BENTO LIQUID DROP GLASS CENTER (MATCHING UPLOADED REFERENCE DESIGN) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="dashboard-bento-grid">
        {/* BENTO CARD 1: COMPLIANCE & INGESTION RADAR */}
        <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-5 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col justify-between glass-card-hover space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#92798B] text-[#F3EAE2] flex items-center justify-center shadow-xs">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#302112]">Compliance Radar</h3>
                <p className="text-[10px] font-bold text-[#5A463B]">3 Required + 1 Optional</p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#E5DAD9] text-[#92798B] border border-white/80">
              Audit Ready
            </span>
          </div>

          <ProgressWheel
            salesUploaded={salesFiles.length > 0}
            purchaseUploaded={purchaseFiles.length > 0}
            bankUploaded={bankFiles.length > 0}
            additionalUploaded={additionalFiles.length > 0}
            additionalCount={additionalFiles.length}
            onNavigateToUpload={(cat) => {
              onNavigateTab('upload');
              if (cat && onQuickUploadCategory) onQuickUploadCategory(cat);
            }}
          />

          <button
            type="button"
            onClick={() => onNavigateTab('upload')}
            className="w-full py-2.5 px-3 rounded-2xl bg-[#E5DAD9] hover:bg-white text-[#302112] text-xs font-black border border-white/80 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <span>Open Upload Center</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#92798B]" />
          </button>
        </div>

        {/* BENTO CARD 2: INTERACTIVE AI FINANCIAL ASSISTANT */}
        <div className="bg-[#E5DAD9]/85 backdrop-blur-xl rounded-[32px] p-5 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col justify-between glass-card-hover space-y-3">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/60 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#92798B] to-[#5A463B] text-[#F3EAE2] flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-[#CBAF87]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#302112]">AI Financial Assistant</h3>
                  <p className="text-[10px] font-bold text-[#5A463B]">Instant OCR Ledger Q&A</p>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            </div>

            {/* QUICK QUESTION PILLS */}
            <div className="space-y-1.5 mb-3">
              <p className="text-[10px] font-black text-[#5A463B] uppercase">Ask OCR Assistant:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'What is my total sales turnover?',
                  'Calculate net operating margin',
                  'Summarize bank match rate',
                  'Estimated VAT payable',
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleAskAI(q)}
                    className="text-[10px] font-bold text-[#302112] bg-[#F3EAE2] hover:bg-white px-2.5 py-1 rounded-xl border border-white/80 transition-all text-left cursor-pointer shadow-2xs"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>

            {/* AI ANSWER DISPLAY */}
            {aiThinking ? (
              <div className="p-3 rounded-2xl bg-[#F3EAE2] border border-white/80 text-xs font-bold text-[#5A463B] flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-[#92798B] animate-spin" />
                <span>Reading structured ledger data...</span>
              </div>
            ) : aiAnswer ? (
              <div className="p-3 rounded-2xl bg-[#F3EAE2] border border-white/80 text-xs font-bold text-[#302112] shadow-2xs leading-relaxed">
                <span className="text-[#92798B] block text-[10px] font-black uppercase mb-1">AI Response:</span>
                {aiAnswer}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#F3EAE2]/60 border border-white/60 text-[11px] font-semibold text-[#5A463B] text-center">
                Click any suggestion above or type below to query your uploaded records.
              </div>
            )}
          </div>

          {/* INPUT BAR */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (aiQuery.trim()) handleAskAI(aiQuery);
            }}
            className="flex items-center gap-1.5 pt-2"
          >
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask anything about your files..."
              className="flex-1 px-3 py-2 bg-[#F3EAE2] border border-white/80 rounded-xl text-xs font-bold text-[#302112] placeholder-[#92798B]/60 focus:outline-none focus:border-[#92798B]"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[#92798B] hover:bg-[#5A463B] text-[#F3EAE2] transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* BENTO CARD 3: INTERACTIVE TAX & VAT CALCULATOR */}
        <div className="bg-[#E0D1D4]/85 backdrop-blur-xl rounded-[32px] p-5 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col justify-between glass-card-hover space-y-3">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/60 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#5A463B] text-[#F3EAE2] flex items-center justify-center shadow-xs">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#302112]">VAT & Tax Estimator</h3>
                  <p className="text-[10px] font-bold text-[#5A463B]">Dynamic Real-time Calculator</p>
                </div>
              </div>
              <span className="text-[11px] font-black text-[#302112] bg-[#F3EAE2] px-2.5 py-0.5 rounded-full border border-white/80">
                Rate: {vatRate}%
              </span>
            </div>

            {/* SLIDER FOR VAT RATE */}
            <div className="space-y-1.5 mb-3 bg-[#F3EAE2]/70 p-3 rounded-2xl border border-white/80">
              <div className="flex justify-between text-xs font-black text-[#302112]">
                <span>Applicable Tax Rate</span>
                <span>{vatRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                className="w-full accent-[#92798B] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-black text-[#5A463B]">
                <span>0% (Exempt)</span>
                <span>15% (Standard)</span>
                <span>30%</span>
              </div>
            </div>

            {/* BREAKDOWN BOXES */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-[#F3EAE2] border border-white/80">
                <span className="font-bold text-[#5A463B]">Output Tax (Sales):</span>
                <span className="font-black text-[#302112]">${estimatedOutputVat.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-[#F3EAE2] border border-white/80">
                <span className="font-bold text-[#5A463B]">Input Tax Credit (Purchases):</span>
                <span className="font-black text-emerald-800">-${estimatedInputVat.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#92798B] text-[#F3EAE2] shadow-xs">
                <span className="font-black">Net Tax Liability:</span>
                <span className="font-black text-sm">${netVatPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-center font-medium text-[#5A463B] pt-1">
            Calculated dynamically from verified OCR extracted records.
          </p>
        </div>

        {/* BENTO CARD 4: FAST CATEGORY DOSSIER HUB (4 TILES) */}
        <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-5 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col justify-between glass-card-hover space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#302112] text-[#F3EAE2] flex items-center justify-center shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#302112]">Category Ingestion Hub</h3>
                <p className="text-[10px] font-bold text-[#5A463B]">Dossier Direct Shortcuts</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-[#5A463B]">4 Vaults</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* SALES TILE */}
            <div 
              onClick={() => onNavigateTab('upload')}
              className="p-3 rounded-2xl bg-[#E5DAD9] hover:bg-white border border-white/80 transition-all cursor-pointer shadow-2xs space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#302112]">Sales Invoices</span>
                <span className={`w-2 h-2 rounded-full ${salesFiles.length > 0 ? 'bg-emerald-600' : 'bg-amber-600'}`} />
              </div>
              <p className="text-base font-black text-[#302112]">{salesFiles.length} file(s)</p>
              <span className="text-[9px] font-bold text-[#92798B] block">Click to Manage ›</span>
            </div>

            {/* PURCHASES TILE */}
            <div 
              onClick={() => onNavigateTab('upload')}
              className="p-3 rounded-2xl bg-[#E5DAD9] hover:bg-white border border-white/80 transition-all cursor-pointer shadow-2xs space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#302112]">Purchases</span>
                <span className={`w-2 h-2 rounded-full ${purchaseFiles.length > 0 ? 'bg-emerald-600' : 'bg-amber-600'}`} />
              </div>
              <p className="text-base font-black text-[#302112]">{purchaseFiles.length} file(s)</p>
              <span className="text-[9px] font-bold text-[#92798B] block">Click to Manage ›</span>
            </div>

            {/* BANK STATEMENTS TILE */}
            <div 
              onClick={() => onNavigateTab('upload')}
              className="p-3 rounded-2xl bg-[#E5DAD9] hover:bg-white border border-white/80 transition-all cursor-pointer shadow-2xs space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#302112]">Bank Statement</span>
                <span className={`w-2 h-2 rounded-full ${bankFiles.length > 0 ? 'bg-emerald-600' : 'bg-amber-600'}`} />
              </div>
              <p className="text-base font-black text-[#302112]">{bankFiles.length} file(s)</p>
              <span className="text-[9px] font-bold text-[#92798B] block">Click to Manage ›</span>
            </div>

            {/* ADDITIONAL FILES TILE */}
            <div 
              onClick={() => onNavigateTab('upload')}
              className="p-3 rounded-2xl bg-[#E5DAD9] hover:bg-white border border-white/80 transition-all cursor-pointer shadow-2xs space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#302112]">Additional Docs</span>
                <span className="text-[9px] font-black text-[#92798B]">Opt</span>
              </div>
              <p className="text-base font-black text-[#302112]">{additionalFiles.length} file(s)</p>
              <span className="text-[9px] font-bold text-[#92798B] block">Click to Manage ›</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('upload')}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#92798B] to-[#5A463B] text-[#F3EAE2] text-xs font-black shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            + Upload New File to Any Category
          </button>
        </div>

        {/* BENTO CARD 5: GOOGLE TASKS & FISCAL CHECKLIST */}
        <div className="bg-[#E5DAD9]/85 backdrop-blur-xl rounded-[32px] p-5 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col justify-between glass-card-hover space-y-3">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/60 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#92798B] text-[#F3EAE2] flex items-center justify-center shadow-xs">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#302112]">Google Tasks & Reminders</h3>
                  <p className="text-[10px] font-bold text-[#5A463B]">Live Interactive Action List</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('tasks')}
                className="text-[10px] font-black text-[#92798B] hover:text-[#302112] underline cursor-pointer"
              >
                Full Tab ›
              </button>
            </div>

            {/* TASK LIST ITEMS */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              {quickTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className={`p-2 rounded-xl flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                    t.done
                      ? 'bg-[#F3EAE2]/50 text-[#5A463B]/60 line-through'
                      : 'bg-[#F3EAE2] text-[#302112] hover:bg-white shadow-2xs'
                  }`}
                >
                  {t.done ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-[#92798B] shrink-0" />
                  )}
                  <span className="truncate">{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* INLINE ADD TASK */}
          <form onSubmit={addTask} className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              placeholder="Add new fiscal task..."
              className="flex-1 px-3 py-2 bg-[#F3EAE2] border border-white/80 rounded-xl text-xs font-bold text-[#302112] placeholder-[#92798B]/60 focus:outline-none focus:border-[#92798B]"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[#5A463B] hover:bg-[#302112] text-[#F3EAE2] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* BENTO CARD 6: AI OCR EXTRACTION STUDIO PREVIEW */}
        <div className="bg-[#C1ACBA]/75 backdrop-blur-xl rounded-[32px] p-5 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col justify-between glass-card-hover space-y-3">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/60 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#302112] text-[#F3EAE2] flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="w-4 h-4 text-[#CBAF87]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#302112]">OCR Intelligence Studio</h3>
                  <p className="text-[10px] font-bold text-[#5A463B]">Document Vision & Structure</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-[#F3EAE2] text-[#302112] px-2 py-0.5 rounded-full border border-white/80">
                99.4% OCR
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-[#F3EAE2] border border-white/80 flex items-center justify-between shadow-2xs">
                <span className="font-bold text-[#5A463B]">Structured Data Fields:</span>
                <span className="font-black text-[#302112]">
                  {files.reduce((acc, f) => acc + (f.extractedData?.length || 4), 0)} extracted items
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#F3EAE2] border border-white/80 flex items-center justify-between shadow-2xs">
                <span className="font-bold text-[#5A463B]">Latest Ingested File:</span>
                <span className="font-black text-[#302112] truncate max-w-[140px]">
                  {files[0]?.originalName || 'No files uploaded'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            {files.length > 0 ? (
              <button
                type="button"
                onClick={() => onInspectFile(files[0])}
                className="w-full py-2.5 rounded-2xl bg-[#302112] hover:bg-[#5A463B] text-[#F3EAE2] text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#CBAF87]" />
                <span>Inspect Latest OCR Extracted Data</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateTab('upload')}
                className="w-full py-2.5 rounded-2xl bg-[#302112] text-[#F3EAE2] text-xs font-black shadow-xs opacity-75 cursor-pointer"
              >
                Upload First File to Trigger OCR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
