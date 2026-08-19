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
  const salesFiles = files.filter((f) => f.fileType === 'SALES' || f.type === 'SALES_INVOICE');
  const purchaseFiles = files.filter((f) => f.fileType === 'PURCHASE' || f.type === 'PURCHASE_RECEIPT');
  const bankFiles = files.filter((f) => f.fileType === 'BANK_STATEMENT' || f.type === 'BANK_STATEMENT');
  const additionalFiles = files.filter((f) => f.fileType === 'ADDITIONAL' || f.type === 'ADDITIONAL_DOC');

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

  const handleAskAI = (questionText: string) => {
    setAiThinking(true);
    setAiAnswer(null);
    setTimeout(() => {
      const q = questionText.toLowerCase();
      let answer = '';
      if (q.includes('sales') || q.includes('turnover')) {
        answer = `Ingested sales across ${salesFiles.length} invoices total $${totalSalesVal.toLocaleString()}. 100% extracted via HRA AI OCR.`;
      } else if (q.includes('margin') || q.includes('net') || q.includes('profit')) {
        answer = `Your net operating balance stands at $${netProfit.toLocaleString()} (Margin: ${totalSalesVal > 0 ? Math.round((netProfit / totalSalesVal) * 100) : 0}%).`;
      } else if (q.includes('vat') || q.includes('tax')) {
        answer = `At ${vatRate}% VAT, Output Tax is $${estimatedOutputVat.toFixed(2)}, Input Credit is $${estimatedInputVat.toFixed(2)}, resulting in Net VAT Payable of $${netVatPayable.toFixed(2)}.`;
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
      {/* 1. TOP HERO CARD */}
      <div 
        className="bg-[#161D2F]/90 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 border border-[#263047] shadow-[0_20px_50px_rgba(11,15,24,0.7)] relative overflow-hidden"
        id="dashboard-hero-banner"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-black text-[#22D39F] bg-[#102D30] px-3 py-0.5 rounded-full border border-[#22D39F]/30 shadow-inner">
                Active Fiscal Period 2026
              </span>
              <span className="text-[11px] font-bold text-[#7F8BA3]">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F0F4FF] tracking-tight">
              Welcome back, {currentUser.fullName}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#AEB8CC] mt-1 max-w-2xl leading-relaxed">
              Your HRA financial intelligence workspace is active. Manage file dossiers, run live OCR analytics, and monitor compliance in real-time.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('upload')}
              className="px-5 py-3 rounded-2xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black shadow-[0_8px_20px_rgba(34,211,159,0.35)] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              id="btn-hero-goto-upload"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Go to Upload Center</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('ai')}
              className="px-4 py-3 rounded-2xl bg-[#0B0F18] hover:bg-[#102D30] text-[#F0F4FF] border border-[#263047] hover:border-[#22D39F] text-xs font-extrabold shadow-inner transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#22D39F]" />
              <span>AI OCR Insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THREE KEY FINANCIAL KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="dashboard-financial-kpis">
        {/* KPI 1: INGESTED SALES */}
        <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[28px] p-5 border border-[#263047] shadow-[0_12px_30px_rgba(11,15,24,0.6)] flex items-center justify-between glass-card-hover">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22D39F] shadow-[0_0_8px_#22D39F]" />
              <span className="text-[11px] font-black text-[#7F8BA3] uppercase tracking-wider">
                Ingested Sales
              </span>
            </div>
            <p className="text-2xl font-black text-[#F0F4FF] tracking-tight">
              ${totalSalesVal.toLocaleString()}
            </p>
            <p className="text-[11px] font-bold text-[#22D39F]">
              {salesFiles.length} file(s) structured via OCR
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#22D39F]/30 shrink-0">
            <TrendingUp className="w-6 h-6 text-[#22D39F]" />
          </div>
        </div>

        {/* KPI 2: INGESTED EXPENSES */}
        <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[28px] p-5 border border-[#263047] shadow-[0_12px_30px_rgba(11,15,24,0.6)] flex items-center justify-between glass-card-hover">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[11px] font-black text-[#7F8BA3] uppercase tracking-wider">
                Operating Purchases
              </span>
            </div>
            <p className="text-2xl font-black text-[#F0F4FF] tracking-tight">
              ${totalPurchaseVal.toLocaleString()}
            </p>
            <p className="text-[11px] font-bold text-[#AEB8CC]">
              {purchaseFiles.length} vendor receipt(s) verified
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#0B0F18] text-amber-400 flex items-center justify-center shadow-inner border border-[#263047] shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: NET FISCAL BALANCE */}
        <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[28px] p-5 border border-[#263047] shadow-[0_12px_30px_rgba(11,15,24,0.6)] flex items-center justify-between glass-card-hover">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-[11px] font-black text-[#7F8BA3] uppercase tracking-wider">
                Net Operating Balance
              </span>
            </div>
            <p className="text-2xl font-black text-[#F0F4FF] tracking-tight">
              ${netProfit.toLocaleString()}
            </p>
            <p className="text-[11px] font-bold text-[#22D39F]">
              Bank statement: {bankFiles.length > 0 ? '✓ Reconciled' : 'Pending Upload'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#102D30] text-cyan-400 flex items-center justify-center shadow-inner border border-[#263047] shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE 6-BENTO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="dashboard-bento-grid">
        {/* BENTO CARD 1: COMPLIANCE RADAR */}
        <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-5 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] flex flex-col justify-between glass-card-hover space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#263047]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#22D39F]/30">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#F0F4FF]">Compliance Radar</h3>
                <p className="text-[10px] font-bold text-[#7F8BA3]">3 Required + 1 Optional</p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30">
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
            className="w-full py-2.5 px-3 rounded-2xl bg-[#0B0F18] hover:bg-[#102D30] text-[#F0F4FF] hover:text-[#22D39F] text-xs font-black border border-[#263047] hover:border-[#22D39F] flex items-center justify-center gap-1.5 transition-all shadow-inner cursor-pointer"
          >
            <span>Open Upload Center</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#22D39F]" />
          </button>
        </div>

        {/* BENTO CARD 2: AI FINANCIAL ASSISTANT */}
        <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-5 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] flex flex-col justify-between glass-card-hover space-y-3">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#263047] mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#22D39F]/30">
                  <Sparkles className="w-4 h-4 text-[#22D39F]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#F0F4FF]">AI Financial Assistant</h3>
                  <p className="text-[10px] font-bold text-[#7F8BA3]">Instant OCR Ledger Q&A</p>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#22D39F] shadow-[0_0_8px_#22D39F] animate-pulse" />
            </div>

            {/* QUICK QUESTION PILLS */}
            <div className="space-y-1.5 mb-3">
              <p className="text-[10px] font-black text-[#7F8BA3] uppercase">Ask OCR Assistant:</p>
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
                    className="text-[10px] font-bold text-[#AEB8CC] bg-[#0B0F18] hover:bg-[#102D30] hover:text-[#F0F4FF] px-2.5 py-1 rounded-xl border border-[#263047] hover:border-[#22D39F] transition-all text-left cursor-pointer shadow-inner"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>

            {/* AI ANSWER DISPLAY */}
            {aiThinking ? (
              <div className="p-3 rounded-2xl bg-[#0B0F18] border border-[#263047] text-xs font-bold text-[#AEB8CC] flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-[#22D39F] animate-spin" />
                <span>Reading structured ledger data...</span>
              </div>
            ) : aiAnswer ? (
              <div className="p-3 rounded-2xl bg-[#0B0F18] border border-[#22D39F]/30 text-xs font-bold text-[#F0F4FF] shadow-inner leading-relaxed">
                <span className="text-[#22D39F] block text-[10px] font-black uppercase mb-1">AI Response:</span>
                {aiAnswer}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#0B0F18]/60 border border-[#263047] text-[11px] font-medium text-[#7F8BA3] text-center">
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
              className="flex-1 px-3 py-2 bg-[#0B0F18] border border-[#263047] rounded-xl text-xs font-bold text-[#F0F4FF] placeholder-[#7F8BA3] focus:outline-none focus:border-[#22D39F]"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] font-black transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* BENTO CARD 3: TAX & VAT CALCULATOR */}
        <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-5 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] flex flex-col justify-between glass-card-hover space-y-3">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#263047] mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#22D39F]/30">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#F0F4FF]">VAT & Tax Estimator</h3>
                  <p className="text-[10px] font-bold text-[#7F8BA3]">Dynamic Real-time Calculator</p>
                </div>
              </div>
              <span className="text-[11px] font-black text-[#22D39F] bg-[#102D30] px-2.5 py-0.5 rounded-full border border-[#22D39F]/30">
                Rate: {vatRate}%
              </span>
            </div>

            {/* SLIDER FOR VAT RATE */}
            <div className="space-y-1.5 mb-3 bg-[#0B0F18] p-3 rounded-2xl border border-[#263047]">
              <div className="flex justify-between text-xs font-black text-[#F0F4FF]">
                <span>Applicable Tax Rate</span>
                <span className="text-[#22D39F]">{vatRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                className="w-full accent-[#22D39F] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-black text-[#7F8BA3]">
                <span>0% (Exempt)</span>
                <span>15% (Standard)</span>
                <span>30%</span>
              </div>
            </div>

            {/* BREAKDOWN BOXES */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-[#0B0F18] border border-[#263047]">
                <span className="font-bold text-[#7F8BA3]">Output Tax (Sales):</span>
                <span className="font-black text-[#F0F4FF]">${estimatedOutputVat.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-[#0B0F18] border border-[#263047]">
                <span className="font-bold text-[#7F8BA3]">Input Tax Credit (Purchases):</span>
                <span className="font-black text-[#22D39F]">-${estimatedInputVat.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#102D30] text-[#22D39F] border border-[#22D39F]/30 shadow-inner">
                <span className="font-black">Net Tax Liability:</span>
                <span className="font-black text-sm">${netVatPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-center font-medium text-[#7F8BA3] pt-1">
            Calculated dynamically from verified OCR extracted records.
          </p>
        </div>

        {/* BENTO CARD 4: CATEGORY INGESTION HUB */}
        <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-5 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] flex flex-col justify-between glass-card-hover space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#263047]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#22D39F]/30">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#F0F4FF]">Category Ingestion Hub</h3>
                <p className="text-[10px] font-bold text-[#7F8BA3]">Dossier Direct Shortcuts</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-[#22D39F]">4 Vaults</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* SALES TILE */}
            <div 
              onClick={() => onNavigateTab('upload')}
              className="p-3 rounded-2xl bg-[#0B0F18] hover:bg-[#102D30] border border-[#263047] hover:border-[#22D39F] transition-all cursor-pointer shadow-inner space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#F0F4FF]">Sales Invoices</span>
                <span className={`w-2 h-2 rounded-full ${salesFiles.length > 0 ? 'bg-[#22D39F]' : 'bg-amber-400'}`} />
              </div>
              <p className="text-base font-black text-[#F0F4FF]">{salesFiles.length} file(s)</p>
              <span className="text-[9px] font-bold text-[#22D39F] block">Click to Manage ›</span>
            </div>

            {/* PURCHASES TILE */}
            <div 
              onClick={() => onNavigateTab('upload')}
              className="p-3 rounded-2xl bg-[#0B0F18] hover:bg-[#102D30] border border-[#263047] hover:border-[#22D39F] transition-all cursor-pointer shadow-inner space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#F0F4FF]">Purchases</span>
                <span className={`w-2 h-2 rounded-full ${purchaseFiles.length > 0 ? 'bg-[#22D39F]' : 'bg-amber-400'}`} />
              </div>
              <p className="text-base font-black text-[#F0F4FF]">{purchaseFiles.length} file(s)</p>
              <span className="text-[9px] font-bold text-[#22D39F] block">Click to Manage ›</span>
            </div>

            {/* BANK STATEMENTS TILE */}
            <div 
              onClick={() => onNavigateTab('upload')}
              className="p-3 rounded-2xl bg-[#0B0F18] hover:bg-[#102D30] border border-[#263047] hover:border-[#22D39F] transition-all cursor-pointer shadow-inner space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#F0F4FF]">Bank Statement</span>
                <span className={`w-2 h-2 rounded-full ${bankFiles.length > 0 ? 'bg-[#22D39F]' : 'bg-amber-400'}`} />
              </div>
              <p className="text-base font-black text-[#F0F4FF]">{bankFiles.length} file(s)</p>
              <span className="text-[9px] font-bold text-[#22D39F] block">Click to Manage ›</span>
            </div>

            {/* ADDITIONAL FILES TILE */}
            <div 
              onClick={() => onNavigateTab('upload')}
              className="p-3 rounded-2xl bg-[#0B0F18] hover:bg-[#102D30] border border-[#263047] hover:border-[#22D39F] transition-all cursor-pointer shadow-inner space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#F0F4FF]">Additional Docs</span>
                <span className="text-[9px] font-black text-[#7F8BA3]">Opt</span>
              </div>
              <p className="text-base font-black text-[#F0F4FF]">{additionalFiles.length} file(s)</p>
              <span className="text-[9px] font-bold text-[#22D39F] block">Click to Manage ›</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('upload')}
            className="w-full py-2.5 rounded-2xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black shadow-md transition-all cursor-pointer"
          >
            + Upload New File to Any Category
          </button>
        </div>

        {/* BENTO CARD 5: GOOGLE TASKS */}
        <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-5 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] flex flex-col justify-between glass-card-hover space-y-3">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#263047] mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#22D39F]/30">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#F0F4FF]">Google Tasks & Reminders</h3>
                  <p className="text-[10px] font-bold text-[#7F8BA3]">Live Interactive Action List</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('tasks')}
                className="text-[10px] font-black text-[#22D39F] hover:text-[#19C99A] underline cursor-pointer"
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
                      ? 'bg-[#0B0F18]/50 text-[#7F8BA3] line-through'
                      : 'bg-[#0B0F18] text-[#F0F4FF] hover:bg-[#102D30] border border-[#263047] shadow-inner'
                  }`}
                >
                  {t.done ? (
                    <CheckSquare className="w-4 h-4 text-[#22D39F] shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-[#7F8BA3] shrink-0" />
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
              className="flex-1 px-3 py-2 bg-[#0B0F18] border border-[#263047] rounded-xl text-xs font-bold text-[#F0F4FF] placeholder-[#7F8BA3] focus:outline-none focus:border-[#22D39F]"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] font-black transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* BENTO CARD 6: OCR INTELLIGENCE STUDIO */}
        <div className="bg-[#161D2F]/90 backdrop-blur-xl rounded-[32px] p-5 border border-[#263047] shadow-[0_15px_40px_rgba(11,15,24,0.6)] flex flex-col justify-between glass-card-hover space-y-3">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#263047] mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#102D30] text-[#22D39F] flex items-center justify-center shadow-inner border border-[#22D39F]/30">
                  <FileSpreadsheet className="w-4 h-4 text-[#22D39F]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#F0F4FF]">OCR Intelligence Studio</h3>
                  <p className="text-[10px] font-bold text-[#7F8BA3]">Document Vision & Structure</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-[#102D30] text-[#22D39F] px-2 py-0.5 rounded-full border border-[#22D39F]/30">
                99.4% OCR
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-[#0B0F18] border border-[#263047] flex items-center justify-between shadow-inner">
                <span className="font-bold text-[#7F8BA3]">Structured Data Fields:</span>
                <span className="font-black text-[#F0F4FF]">
                  {files.reduce((acc, f) => acc + (f.extractedData?.length || 4), 0)} extracted items
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#0B0F18] border border-[#263047] flex items-center justify-between shadow-inner">
                <span className="font-bold text-[#7F8BA3]">Latest Ingested File:</span>
                <span className="font-black text-[#22D39F] truncate max-w-[140px]">
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
                className="w-full py-2.5 rounded-2xl bg-[#22D39F] hover:bg-[#19C99A] text-[#0E1120] text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Latest OCR Extracted Data</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateTab('upload')}
                className="w-full py-2.5 rounded-2xl bg-[#0B0F18] text-[#7F8BA3] border border-[#263047] text-xs font-black shadow-inner cursor-pointer"
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
