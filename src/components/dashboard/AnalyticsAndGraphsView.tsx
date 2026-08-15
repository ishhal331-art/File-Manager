import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Calculator,
  ShieldCheck,
  Building2,
  Users,
  Search,
  Filter,
} from 'lucide-react';
import { User, UploadedFile, UserUploadProgress } from '../../types';

interface Props {
  currentUser: User;
  users: User[];
  userProgressList: UserUploadProgress[];
  files: UploadedFile[];
  onInspectUser?: (user: User) => void;
  onInspectFile?: (file: UploadedFile) => void;
}

export const AnalyticsAndGraphsView: React.FC<Props> = ({
  currentUser,
  users,
  userProgressList,
  files,
  onInspectUser,
  onInspectFile,
}) => {
  const [timeRange, setTimeRange] = useState<'Q1' | 'Q2' | 'Q3' | 'YEAR'>('YEAR');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [vatRate, setVatRate] = useState<number>(15);

  const clientUsers = useMemo(() => users.filter((u) => u.role === 'USER'), [users]);

  // Compute file category metrics
  const salesFiles = useMemo(() => files.filter((f) => f.fileType === 'SALES'), [files]);
  const purchaseFiles = useMemo(() => files.filter((f) => f.fileType === 'PURCHASE'), [files]);
  const bankFiles = useMemo(() => files.filter((f) => f.fileType === 'BANK_STATEMENT'), [files]);
  const additionalFiles = useMemo(() => files.filter((f) => f.fileType === 'ADDITIONAL'), [files]);

  // Helper to compute extracted or estimated values
  const calculateTotalVolume = (fileList: UploadedFile[], defaultUnit: number) => {
    let total = 0;
    fileList.forEach((file) => {
      if (file.extractedData && Array.isArray(file.extractedData) && file.extractedData.length > 0) {
        file.extractedData.forEach((row: any) => {
          const val = parseFloat(String(row.amount || row.total || row.value || '').replace(/[^0-9.-]+/g, ''));
          if (!isNaN(val) && val > 0) total += val;
        });
      } else {
        total += defaultUnit;
      }
    });
    return total;
  };

  const totalSalesVal = calculateTotalVolume(salesFiles, 14200);
  const totalPurchaseVal = calculateTotalVolume(purchaseFiles, 6150);
  const netProfit = totalSalesVal - totalPurchaseVal;
  const marginPct = totalSalesVal > 0 ? Math.round((netProfit / totalSalesVal) * 100) : 0;

  // Compliance Breakdown Data
  const complianceStats = useMemo(() => {
    let complete = 0;
    let inProgress = 0;
    let notStarted = 0;

    clientUsers.forEach((u) => {
      const prog = userProgressList.find((p) => p.userId === u.id);
      const userFiles = files.filter((f) => f.userId === u.id);
      const hasSales = prog?.salesUploaded || userFiles.some((f) => f.fileType === 'SALES');
      const hasPurch = prog?.purchaseUploaded || userFiles.some((f) => f.fileType === 'PURCHASE');
      const hasBank = prog?.bankUploaded || userFiles.some((f) => f.fileType === 'BANK_STATEMENT');

      const count = (hasSales ? 1 : 0) + (hasPurch ? 1 : 0) + (hasBank ? 1 : 0);
      if (count === 3) complete++;
      else if (count > 0) inProgress++;
      else notStarted++;
    });

    return { complete, inProgress, notStarted, total: clientUsers.length };
  }, [clientUsers, userProgressList, files]);

  // Monthly Ingestion Trends Data
  const rawMonthlyData = [
    { month: 'Jan', sales: 18500, purchase: 8200, net: 10300, files: 12 },
    { month: 'Feb', sales: 22400, purchase: 9400, net: 13000, files: 15 },
    { month: 'Mar', sales: 31200, purchase: 14100, net: 17100, files: 24 },
    { month: 'Apr', sales: 27800, purchase: 11500, net: 16300, files: 18 },
    { month: 'May', sales: 35600, purchase: 16200, net: 19400, files: 28 },
    { month: 'Jun', sales: 42100, purchase: 18900, net: 23200, files: 34 },
    { month: 'Jul', sales: 39500, purchase: 17400, net: 22100, files: 31 },
    { month: 'Aug', sales: Math.max(45000, totalSalesVal), purchase: Math.max(20000, totalPurchaseVal), net: Math.max(25000, netProfit), files: files.length || 38 },
  ];

  const monthlyData = useMemo(() => {
    if (timeRange === 'Q1') return rawMonthlyData.slice(0, 3);
    if (timeRange === 'Q2') return rawMonthlyData.slice(3, 6);
    if (timeRange === 'Q3') return rawMonthlyData.slice(6, 8);
    return rawMonthlyData;
  }, [timeRange, rawMonthlyData]);

  // Category Distribution Data
  const categoryData = [
    { category: 'Sales Invoices', count: salesFiles.length, estimatedAmount: totalSalesVal, color: '#2E7D32' },
    { category: 'Purchase Receipts', count: purchaseFiles.length, estimatedAmount: totalPurchaseVal, color: '#92798B' },
    { category: 'Bank Statements', count: bankFiles.length, estimatedAmount: 0, color: '#5A463B' },
    { category: 'Additional Records', count: additionalFiles.length, estimatedAmount: 0, color: '#CBAF87' },
  ];

  // VAT calculations
  const outputVat = totalSalesVal * (vatRate / 100);
  const inputVat = totalPurchaseVal * (vatRate / 100);
  const netVatPayable = outputVat - inputVat;

  // Chart rendering helpers (High Performance Native SVG)
  const maxVal = useMemo(() => {
    const max = Math.max(...monthlyData.map((d) => Math.max(d.sales, d.purchase)));
    return Math.ceil(max / 10000) * 10000 || 50000;
  }, [monthlyData]);

  const svgWidth = 600;
  const svgHeight = 220;
  const padX = 40;
  const padY = 20;
  const chartW = svgWidth - padX * 2;
  const chartH = svgHeight - padY * 2;

  const pointsSales = monthlyData.map((d, i) => {
    const x = padX + (i / (monthlyData.length - 1 || 1)) * chartW;
    const y = padY + chartH - (d.sales / maxVal) * chartH;
    return { x, y, ...d };
  });

  const pointsPurchase = monthlyData.map((d, i) => {
    const x = padX + (i / (monthlyData.length - 1 || 1)) * chartW;
    const y = padY + chartH - (d.purchase / maxVal) * chartH;
    return { x, y, ...d };
  });

  const salesPath = pointsSales.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const salesAreaPath = `${salesPath} L ${pointsSales[pointsSales.length - 1].x} ${padY + chartH} L ${pointsSales[0].x} ${padY + chartH} Z`;

  const purchasePath = pointsPurchase.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const purchaseAreaPath = `${purchasePath} L ${pointsPurchase[pointsPurchase.length - 1].x} ${padY + chartH} L ${pointsPurchase[0].x} ${padY + chartH} Z`;

  // Donut chart calculation
  const totalDossiers = complianceStats.total || 1;
  const completeAngle = (complianceStats.complete / totalDossiers) * 360;
  const inProgressAngle = (complianceStats.inProgress / totalDossiers) * 360;
  const notStartedAngle = (complianceStats.notStarted / totalDossiers) * 360;

  const totalCircumference = 2 * Math.PI * 65; // radius 65
  const strokeComplete = (complianceStats.complete / totalDossiers) * totalCircumference;
  const strokeInProgress = (complianceStats.inProgress / totalDossiers) * totalCircumference;
  const strokeNotStarted = (complianceStats.notStarted / totalDossiers) * totalCircumference;

  return (
    <div className="space-y-6 animate-fade-in" id="analytics-graphs-view">
      {/* 1. TOP METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL SALES INGESTION */}
        <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[28px] p-5 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#5A463B]">
              Total Ingested Sales
            </p>
            <h3 className="text-2xl font-black text-[#302112] tracking-tight">
              ${totalSalesVal.toLocaleString()}
            </h3>
            <p className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-700" />
              <span>{salesFiles.length} sales files processed</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-900 border border-emerald-200/80 flex items-center justify-center shadow-xs shrink-0">
            <TrendingUp className="w-6 h-6 text-emerald-800" />
          </div>
        </div>

        {/* TOTAL PURCHASE EXPENSES */}
        <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[28px] p-5 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#5A463B]">
              Total Purchases / Expenses
            </p>
            <h3 className="text-2xl font-black text-[#302112] tracking-tight">
              ${totalPurchaseVal.toLocaleString()}
            </h3>
            <p className="text-[10px] font-bold text-[#92798B] flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#92798B]" />
              <span>{purchaseFiles.length} purchase files logged</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E5DAD9] text-[#92798B] border border-white/80 flex items-center justify-center shadow-xs shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        {/* NET FISCAL MARGIN */}
        <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[28px] p-5 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#5A463B]">
              Net Fiscal Position
            </p>
            <h3 className="text-2xl font-black text-[#302112] tracking-tight">
              ${netProfit.toLocaleString()}
            </h3>
            <p className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
              <span>Margin Rate: {marginPct}%</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#92798B] text-[#FAF6F0] flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-6 h-6 text-[#CBAF87]" />
          </div>
        </div>

        {/* GLOBAL COMPLIANCE RATE */}
        <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[28px] p-5 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#5A463B]">
              Dossier Compliance
            </p>
            <h3 className="text-2xl font-black text-[#302112] tracking-tight">
              {clientUsers.length > 0
                ? Math.round((complianceStats.complete / clientUsers.length) * 100)
                : 100}
              %
            </h3>
            <p className="text-[10px] font-bold text-[#5A463B] flex items-center gap-1">
              <span>
                {complianceStats.complete} of {clientUsers.length} complete
              </span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center justify-center shadow-xs shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
          </div>
        </div>
      </div>

      {/* 2. MAIN CHARTS GRID (HIGH PERFORMANCE NATIVE CHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 1: MONTHLY SALES VS PURCHASES INGESTION (AREA CHART) */}
        <div className="lg:col-span-2 bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/60">
            <div>
              <h3 className="text-base font-black text-[#302112] tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#92798B]" />
                <span>Financial Ingestion Velocity (Sales vs Purchases)</span>
              </h3>
              <p className="text-xs text-[#5A463B] font-semibold">
                Monthly revenue and operating expense ingestion velocity curve.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-[#E5DAD9] p-1 rounded-xl border border-white/80 text-xs font-black">
              {(['Q1', 'Q2', 'Q3', 'YEAR'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r as any)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    timeRange === r
                      ? 'bg-[#92798B] text-[#FAF6F0] shadow-2xs'
                      : 'text-[#5A463B] hover:text-[#302112]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* SVG AREA GRAPH */}
          <div className="relative pt-2">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-64 overflow-visible">
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#2E7D32" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="purchaseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#92798B" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#92798B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const yPos = padY + chartH * (1 - pct);
                const labelVal = Math.round((maxVal * pct) / 1000);
                return (
                  <g key={idx}>
                    <line
                      x1={padX}
                      y1={yPos}
                      x2={svgWidth - padX}
                      y2={yPos}
                      stroke="#E0D2C7"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padX - 8}
                      y={yPos + 4}
                      textAnchor="end"
                      fontSize="9"
                      fontWeight="700"
                      fill="#5A463B"
                    >
                      ${labelVal}k
                    </text>
                  </g>
                );
              })}

              {/* Area Fills */}
              <path d={salesAreaPath} fill="url(#salesGradient)" />
              <path d={purchaseAreaPath} fill="url(#purchaseGradient)" />

              {/* Line Strokes */}
              <path d={salesPath} fill="none" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
              <path d={purchasePath} fill="none" stroke="#92798B" strokeWidth="2.5" strokeLinecap="round" />

              {/* Interactive Data Points */}
              {pointsSales.map((p, i) => (
                <g key={`s-${i}`} className="cursor-pointer" onMouseEnter={() => setHoveredPoint({ ...p, type: 'Sales' })}>
                  <circle cx={p.x} cy={p.y} r="5" fill="#FAF6F0" stroke="#2E7D32" strokeWidth="2.5" />
                  <text x={p.x} y={padY + chartH + 16} textAnchor="middle" fontSize="10" fontWeight="800" fill="#302112">
                    {p.month}
                  </text>
                </g>
              ))}

              {pointsPurchase.map((p, i) => (
                <g key={`p-${i}`} className="cursor-pointer" onMouseEnter={() => setHoveredPoint({ ...p, type: 'Purchase' })}>
                  <circle cx={p.x} cy={p.y} r="4" fill="#FAF6F0" stroke="#92798B" strokeWidth="2.5" />
                </g>
              ))}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="absolute top-2 right-4 bg-[#FAF6F0] p-3 rounded-2xl border border-white/90 shadow-lg text-xs font-bold text-[#302112] animate-fade-in"
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <div className="flex items-center justify-between gap-4 font-black mb-1 border-b border-black/10 pb-1">
                  <span>{hoveredPoint.month} Snapshot</span>
                  <span className="text-[10px] text-[#5A463B]">{hoveredPoint.files} files</span>
                </div>
                <div className="space-y-0.5 text-[11px]">
                  <p className="text-emerald-800 font-extrabold flex items-center justify-between gap-3">
                    <span>Sales:</span> <span>${hoveredPoint.sales.toLocaleString()}</span>
                  </p>
                  <p className="text-[#92798B] font-extrabold flex items-center justify-between gap-3">
                    <span>Purchases:</span> <span>${hoveredPoint.purchase.toLocaleString()}</span>
                  </p>
                  <p className="text-[#302112] font-black flex items-center justify-between gap-3 pt-1 border-t border-black/5">
                    <span>Net Margin:</span> <span>${hoveredPoint.net.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-2 border-t border-white/60 text-xs font-black">
            <span className="flex items-center gap-2 text-emerald-800">
              <span className="w-3 h-3 rounded-full bg-[#2E7D32]"></span>
              <span>Ingested Sales Revenue</span>
            </span>
            <span className="flex items-center gap-2 text-[#92798B]">
              <span className="w-3 h-3 rounded-full bg-[#92798B]"></span>
              <span>Operating Purchases / Expenses</span>
            </span>
          </div>
        </div>

        {/* CHART 2: DOSSIER COMPLIANCE DISTRIBUTION (DONUT CHART) */}
        <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] flex flex-col justify-between space-y-4">
          <div className="pb-2 border-b border-white/60">
            <h3 className="text-base font-black text-[#302112] tracking-tight flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-[#92798B]" />
              <span>Dossier Compliance Status</span>
            </h3>
            <p className="text-xs text-[#5A463B] font-semibold">
              Distribution of mandatory file submissions across all client accounts.
            </p>
          </div>

          {/* SVG DONUT */}
          <div className="relative flex items-center justify-center py-2">
            <svg viewBox="0 0 160 160" className="w-48 h-48 transform -rotate-90">
              {/* Background Ring */}
              <circle
                cx="80"
                cy="80"
                r="65"
                fill="none"
                stroke="#E5DAD9"
                strokeWidth="18"
              />

              {/* Complete segment */}
              <circle
                cx="80"
                cy="80"
                r="65"
                fill="none"
                stroke="#2E7D32"
                strokeWidth="18"
                strokeDasharray={`${strokeComplete} ${totalCircumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />

              {/* In progress segment */}
              {strokeInProgress > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r="65"
                  fill="none"
                  stroke="#CBAF87"
                  strokeWidth="18"
                  strokeDasharray={`${strokeInProgress} ${totalCircumference}`}
                  strokeDashoffset={-strokeComplete}
                  strokeLinecap="round"
                />
              )}

              {/* Not started segment */}
              {strokeNotStarted > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r="65"
                  fill="none"
                  stroke="#92798B"
                  strokeWidth="18"
                  strokeDasharray={`${strokeNotStarted} ${totalCircumference}`}
                  strokeDashoffset={-(strokeComplete + strokeInProgress)}
                  strokeLinecap="round"
                />
              )}
            </svg>

            {/* Center percentage badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-[#302112]">
                {clientUsers.length > 0
                  ? Math.round((complianceStats.complete / clientUsers.length) * 100)
                  : 100}
                %
              </span>
              <span className="text-[10px] font-extrabold text-[#5A463B] uppercase">Compliant</span>
            </div>
          </div>

          {/* Legend breakdown list */}
          <div className="space-y-2 pt-2 border-t border-white/60">
            <div className="flex items-center justify-between text-xs font-bold text-[#302112]">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#2E7D32]"></span>
                <span>Fully Compliant (3/3 Vaults)</span>
              </span>
              <span className="font-black">{complianceStats.complete} users</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[#302112]">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#CBAF87]"></span>
                <span>In Progress (1-2 Vaults)</span>
              </span>
              <span className="font-black">{complianceStats.inProgress} users</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[#302112]">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#92798B]"></span>
                <span>Not Started (0/3 Vaults)</span>
              </span>
              <span className="font-black">{complianceStats.notStarted} users</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY BREAKDOWN & VAT LIABILITY SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CATEGORY BAR BREAKDOWN */}
        <div className="lg:col-span-2 bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/60">
            <div>
              <h3 className="text-base font-black text-[#302112] tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#92798B]" />
                <span>Document Volume by Vault Category</span>
              </h3>
              <p className="text-xs text-[#5A463B] font-semibold">
                Uploaded document distribution across mandatory & supporting vaults.
              </p>
            </div>
            <span className="text-xs font-black px-3 py-1 bg-[#E5DAD9] rounded-xl text-[#302112] border border-white/80">
              Total {files.length} Files
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categoryData.map((cat, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-[#E5DAD9]/80 border border-white/80 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#302112] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    {cat.category}
                  </span>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white text-[#302112] shadow-2xs">
                    {cat.count} files
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#D0BEC7] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${files.length > 0 ? Math.max(12, Math.round((cat.count / files.length) * 100)) : 0}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
                {cat.estimatedAmount > 0 && (
                  <p className="text-[11px] font-bold text-[#5A463B] text-right">
                    Ingested Value: ${cat.estimatedAmount.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* INTERACTIVE VAT & TAX LIABILITY ESTIMATOR */}
        <div className="bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] space-y-4">
          <div className="pb-2 border-b border-white/60">
            <h3 className="text-base font-black text-[#302112] tracking-tight flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#92798B]" />
              <span>Tax & VAT Liability Simulator</span>
            </h3>
            <p className="text-xs text-[#5A463B] font-semibold">
              Simulate estimated output vs deductible input tax.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#302112] mb-1">
                <span>Standard VAT / GST Rate</span>
                <span className="font-black px-2 py-0.5 rounded-lg bg-[#92798B] text-[#FAF6F0]">
                  {vatRate}%
                </span>
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
            </div>

            <div className="space-y-2 bg-[#E5DAD9]/80 p-3.5 rounded-2xl border border-white/80 text-xs">
              <div className="flex items-center justify-between text-[#5A463B] font-bold">
                <span>Estimated Output VAT (Sales):</span>
                <span className="text-[#302112] font-black">${outputVat.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between text-[#5A463B] font-bold">
                <span>Deductible Input VAT (Purchases):</span>
                <span className="text-emerald-800 font-black">-${inputVat.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-2 border-t border-white/60 flex items-center justify-between text-sm font-black text-[#302112]">
                <span>Net Estimated Tax Due:</span>
                <span className="text-[#92798B]">${netVatPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
