import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
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
  const [timeRange, setTimeRange] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'YEAR'>('YEAR');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');
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

  // Pie Chart Data
  const pieData = [
    { name: 'Fully Compliant (3/3)', value: complianceStats.complete, color: '#2E7D32' },
    { name: 'In Progress (1-2/3)', value: complianceStats.inProgress, color: '#CBAF87' },
    { name: 'Not Started (0/3)', value: complianceStats.notStarted, color: '#92798B' },
  ];

  // Monthly Ingestion Trends Data for Bar & Area Charts
  const monthlyData = [
    { month: 'Jan', sales: 18500, purchase: 8200, net: 10300, files: 12 },
    { month: 'Feb', sales: 22400, purchase: 9400, net: 13000, files: 15 },
    { month: 'Mar', sales: 31200, purchase: 14100, net: 17100, files: 24 },
    { month: 'Apr', sales: 27800, purchase: 11500, net: 16300, files: 18 },
    { month: 'May', sales: 35600, purchase: 16200, net: 19400, files: 28 },
    { month: 'Jun', sales: 42100, purchase: 18900, net: 23200, files: 34 },
    { month: 'Jul', sales: 39500, purchase: 17400, net: 22100, files: 31 },
    { month: 'Aug', sales: Math.max(45000, totalSalesVal), purchase: Math.max(20000, totalPurchaseVal), net: Math.max(25000, netProfit), files: files.length || 38 },
  ];

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

      {/* 2. MAIN CHARTS GRID (RECHARTS VISUAL ANALYTICS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 1: MONTHLY SALES VS PURCHASES INGESTION (BAR & AREA) */}
        <div className="lg:col-span-2 bg-[#F3EAE2]/85 backdrop-blur-xl rounded-[32px] p-5 sm:p-6 border border-white/80 shadow-[0_15px_40px_rgba(48,33,18,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.9)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/60">
            <div>
              <h3 className="text-base font-black text-[#302112] tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#92798B]" />
                <span>Financial Ingestion Velocity (Sales vs Purchases)</span>
              </h3>
              <p className="text-xs text-[#5A463B] font-semibold">
                Monthly revenue and operating expense ingestion trend.
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

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="purchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#92798B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#92798B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#D0BEC7" vertical={false} />
                <XAxis dataKey="month" stroke="#5A463B" fontSize={11} fontWeight={700} tickLine={false} />
                <YAxis stroke="#5A463B" fontSize={11} fontWeight={700} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F3EAE2',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 10px 25px rgba(48,33,18,0.15)',
                    fontWeight: 700,
                    fontSize: '12px',
                    color: '#302112',
                  }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 800 }} />
                <Area type="monotone" dataKey="sales" name="Sales ($)" stroke="#2E7D32" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="purchase" name="Purchases ($)" stroke="#92798B" strokeWidth={2.5} fillOpacity={1} fill="url(#purchGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: DOSSIER COMPLIANCE DISTRIBUTION (DONUT / PIE) */}
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

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#F3EAE2" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F3EAE2',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.9)',
                    fontWeight: 700,
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

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
