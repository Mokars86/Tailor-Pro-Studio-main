import React, { useState } from 'react';
import {
  BarChart3,
  FileText,
  Printer,
  Check,
  Scissors,
  ShoppingBag,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  TrendingUp,
  Info,
  PieChart,
  MessageSquare,
  Download,
  X,
  Search,
  Eye
} from 'lucide-react';
import { Client, LedgerTransaction, RunwayStage } from '../types';

interface LedgerViewProps {
  transactions: LedgerTransaction[];
  clients?: Client[];
  onOpenLogTransaction: () => void;
  onOpenInvoice?: (client: Client) => void;
  onOpenCollectDeposit?: (client: Client) => void;
  onOpenFittingSession?: (client: Client) => void;
  onAdvanceStage?: (clientId: string, newStage: RunwayStage) => void;
  onMarkPaidDirectly?: (clientId: string) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  transactions,
  clients = [],
  onOpenLogTransaction,
  onOpenInvoice,
  onOpenCollectDeposit,
  onOpenFittingSession,
  onAdvanceStage,
  onMarkPaidDirectly
}) => {
  // Active Sub-Tab: 'revenue' | 'ledger'
  const [activeSubTab, setActiveSubTab] = useState<'revenue' | 'ledger'>('revenue');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAllCashflowModalOpen, setIsAllCashflowModalOpen] = useState<boolean>(false);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Real user clients list
  const displayClients: Client[] = clients;

  // Revenue Dashboard Stats
  const totalSales = displayClients.reduce((sum, c) => sum + (c.totalCost || 0), 0);
  const totalReceived = displayClients.reduce((sum, c) => sum + (c.depositPaid || 0), 0);
  const totalBalanceDue = displayClients.reduce((sum, c) => sum + (c.balanceDue || 0), 0);
  const collectionRate = totalSales > 0 ? Math.round((totalReceived / totalSales) * 100) : 0;
  
  const completedJobs = displayClients.filter((c) => c.runwayStage === 'DELIVERED').length;
  const totalJobs = displayClients.length;

  // Combine explicit transactions with automatic consultation deposits & full settlement receipts
  const autoClientTransactions: LedgerTransaction[] = [];
  displayClients.forEach((c) => {
    if (c.depositPaid > 0) {
      autoClientTransactions.push({
        id: `auto-dep-${c.id}`,
        date: c.timestamp ? c.timestamp.split('T')[0] : new Date().toISOString().split('T')[0],
        type: 'deposit',
        category: 'Consultation Deposit',
        description: `Consult Deposit Paid - ${c.name} (${c.garmentTag || 'Custom Order'})`,
        amount: c.depositPaid,
        clientOrVendor: c.name,
        status: 'cleared',
        method: 'Cash'
      });
    }
    if (c.balanceDue === 0 && c.totalCost > 0) {
      autoClientTransactions.push({
        id: `auto-full-${c.id}`,
        date: new Date().toISOString().split('T')[0],
        type: 'revenue',
        category: 'Full Settlement',
        description: `Full Settlement Completed - ${c.name} (${c.garmentTag || 'Custom Order'})`,
        amount: c.totalCost,
        clientOrVendor: c.name,
        status: 'cleared',
        method: 'Cash'
      });
    }
  });

  // Merge transactions, filtering duplicates
  const allCashflowTransactions: LedgerTransaction[] = [...transactions];
  autoClientTransactions.forEach((autoTx) => {
    const isDuplicate = allCashflowTransactions.some(
      (t) => t.id === autoTx.id || (t.clientOrVendor === autoTx.clientOrVendor && t.amount === autoTx.amount)
    );
    if (!isDuplicate) {
      allCashflowTransactions.push(autoTx);
    }
  });

  // Garment Demand Breakdown
  const garmentCounts: Record<string, number> = {};
  displayClients.forEach((c) => {
    const tag = c.garmentTag || 'Custom Order';
    garmentCounts[tag] = (garmentCounts[tag] || 0) + 1;
  });

  const garmentBreakdown = Object.entries(garmentCounts).map(([tag, count]) => {
    const percentage = Math.round((count / (displayClients.length || 1)) * 100);
    return { tag, count, percentage };
  });

  // Runway Pipeline Stage Counts
  const pipelineStageCounts: Record<string, number> = {
    CONSULT: 0,
    CUTTING: 0,
    FITTING: 0,
    DELIVERED: 0,
    SEWING: 0,
    COMPLETED: 0
  };

  displayClients.forEach((c) => {
    const stage = c.runwayStage || 'CONSULT';
    if (stage in pipelineStageCounts) {
      pipelineStageCounts[stage] = (pipelineStageCounts[stage] || 0) + 1;
    }
  });

  // Official Financial Ledger & Cashflow Printout Generator
  const handlePrintFinancialReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const reportDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const clientRowsHtml = displayClients
      .map(
        (c) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-weight: bold;">${c.name}</td>
        <td style="padding: 10px;">${c.garmentTag || 'Custom Outfit'}</td>
        <td style="padding: 10px; text-align: right; font-weight: bold;">GHS ${(c.totalCost || 0).toLocaleString()}</td>
        <td style="padding: 10px; text-align: right; color: #047857; font-weight: bold;">GHS ${(c.depositPaid || 0).toLocaleString()}</td>
        <td style="padding: 10px; text-align: right; font-weight: bold; color: ${c.balanceDue === 0 ? '#047857' : '#e11d48'};">
          GHS ${(c.balanceDue || 0).toLocaleString()}
        </td>
        <td style="padding: 10px; text-align: center;">
          <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; ${
            c.balanceDue === 0
              ? 'background: #dcfce7; color: #15803d;'
              : 'background: #ffe4e6; color: #be123c;'
          }">
            ${c.balanceDue === 0 ? 'PAID IN FULL' : 'BALANCE DUE'}
          </span>
        </td>
      </tr>
    `
      )
      .join('');

    const txRowsHtml = allCashflowTransactions
      .map(
        (tx) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 8px 10px; font-size: 12px; color: #64748b;">${tx.date}</td>
        <td style="padding: 8px 10px; font-size: 12px; font-weight: bold;">${tx.description}</td>
        <td style="padding: 8px 10px; font-size: 12px; text-transform: uppercase;">${tx.category}</td>
        <td style="padding: 8px 10px; font-size: 12px;">${tx.method || 'Cash'}</td>
        <td style="padding: 8px 10px; font-size: 12px; font-weight: bold; text-align: right; color: #0d3b36;">
          +GHS ${(tx.amount || 0).toLocaleString()}
        </td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Financial Ledger & Cashflow Report - Mokars Stitches Studio</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              button { display: none !important; }
            }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #0f172a; max-width: 950px; margin: 0 auto; background: #fff; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0d3b36; padding-bottom: 15px; margin-bottom: 20px; }
            .logo-title { font-size: 22px; font-weight: 900; color: #0d3b36; text-transform: uppercase; letter-spacing: 0.5px; }
            .sub-title { font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px; }
            .badge { background: #0d3b36; color: #dca134; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: 12px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
            .metric-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center; }
            .metric-title { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; }
            .metric-value { font-size: 18px; font-weight: 900; color: #0d3b36; margin-top: 4px; }
            .section-title { font-size: 14px; font-weight: 900; color: #0d3b36; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 20px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; text-align: left; }
            th { background: #0d3b36; color: #ffffff; padding: 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
            .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-title">MOKARS STITCHES STUDIO</div>
              <div class="sub-title">Official Financial Ledger, Cashflow Audit & Client Receivables Report</div>
            </div>
            <div style="text-align: right;">
              <div class="badge">FINANCIAL REPORT</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 5px; font-weight: 600;">Date: ${reportDate}</div>
            </div>
          </div>

          <div class="metrics-grid">
            <div class="metric-box">
              <div class="metric-title">GROSS REVENUE</div>
              <div class="metric-value">GHS ${totalSales.toLocaleString()}</div>
            </div>
            <div class="metric-box" style="border-color: #10b981; background: #ecfdf5;">
              <div class="metric-title" style="color: #047857;">CASH RECEIVED</div>
              <div class="metric-value" style="color: #047857;">GHS ${totalReceived.toLocaleString()}</div>
            </div>
            <div class="metric-box" style="border-color: #f59e0b; background: #fffbeb;">
              <div class="metric-title" style="color: #b45309;">OUTSTANDING DUE</div>
              <div class="metric-value" style="color: #b45309;">GHS ${totalBalanceDue.toLocaleString()}</div>
            </div>
            <div class="metric-box">
              <div class="metric-title">COLLECTION RATE</div>
              <div class="metric-value" style="color: #c2410c;">${collectionRate}%</div>
            </div>
          </div>

          <div class="section-title">1. CLIENT RECEIVABLES & LEDGER AUDIT</div>
          <table>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Garment Order</th>
                <th style="text-align: right;">Total Cost</th>
                <th style="text-align: right;">Deposit Paid</th>
                <th style="text-align: right;">Balance Due</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${clientRowsHtml || '<tr><td colspan="6" style="padding: 15px; text-align: center; color: #94a3b8;">No client records available.</td></tr>'}
            </tbody>
          </table>

          <div class="section-title">2. CASHFLOW RECEIPTS & TRANSACTION LOG</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction Details</th>
                <th>Category</th>
                <th>Method</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${txRowsHtml || '<tr><td colspan="5" style="padding: 15px; text-align: center; color: #94a3b8;">No cashflow transactions logged.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <div>
              <strong>Generated By:</strong> Tailor Pro Master Financial Control<br />
              <strong>Atelier Audit ID:</strong> FIN-${Date.now().toString().slice(-6)}
            </div>
            <div style="text-align: right;">
              _____________________________________<br />
              <strong>Master Tailor Signature & Official Stamp</strong>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-5 my-3 font-['Outfit']">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#0D3B36] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-400/40 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header & Top Segmented Pill Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-black text-2xl sm:text-3xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight uppercase leading-none">
              FINANCIAL
              <br />
              ANALYTICS
            </h1>
          </div>
        </div>

        {/* Action Controls & Subtab Toggle */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          {/* Print Financial Report Button */}
          <button
            type="button"
            onClick={handlePrintFinancialReport}
            className="px-3.5 py-2 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 text-[#0D3B36] dark:text-amber-300 border border-amber-400/40 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Print Financial Ledger & Cashflow Report"
          >
            <Printer className="w-4 h-4 text-[#DCA134]" />
            <span className="hidden xs:inline">Print Report</span>
          </button>

          {/* Top Segmented Pill Toggle Switch */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('revenue')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'revenue'
                  ? 'bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Revenue Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('ledger')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'ledger'
                  ? 'bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Client Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: REVENUE DASHBOARD */}
      {activeSubTab === 'revenue' && (
        <div className="space-y-4 animate-fade-in">
          {/* 4 Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Card 1: GROSS REVENUE */}
            <div className="bg-white dark:bg-[#092825] rounded-[22px] p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  GROSS REVENUE
                </span>
                <TrendingUp className="w-4 h-4 text-slate-400 dark:text-amber-300 shrink-0" />
              </div>
              <div className="font-black text-lg sm:text-2xl text-slate-900 dark:text-slate-100 mt-2">
                GHS {totalSales.toLocaleString()}
              </div>
            </div>

            {/* Card 2: CASH RECEIVED */}
            <div className="bg-white dark:bg-[#092825] rounded-[22px] p-4 sm:p-5 border-2 border-[#10B981] border-l-[6px] shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-[11px] font-black text-[#047857] dark:text-emerald-400 uppercase tracking-wider">
                  CASH RECEIVED
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#047857] dark:text-emerald-400 shrink-0" />
              </div>
              <div className="font-black text-lg sm:text-2xl text-[#047857] dark:text-emerald-300 mt-2">
                GHS {totalReceived.toLocaleString()}
              </div>
            </div>

            {/* Card 3: OUTSTANDING */}
            <div className="bg-[#FEF3C7]/90 dark:bg-[#1C2C1D] rounded-[22px] p-4 sm:p-5 border-2 border-[#F59E0B] shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-[11px] font-black text-[#B45309] dark:text-amber-300 uppercase tracking-wider">
                  OUTSTANDING
                </span>
                <Info className="w-4 h-4 text-[#B45309] dark:text-amber-300 shrink-0" />
              </div>
              <div className="font-black text-lg sm:text-2xl text-[#B45309] dark:text-amber-300 mt-2">
                GHS {totalBalanceDue.toLocaleString()}
              </div>
            </div>

            {/* Card 4: JOBS COMPLETED */}
            <div className="bg-white dark:bg-[#092825] rounded-[22px] p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  JOBS COMPLETED
                </span>
                <PieChart className="w-4 h-4 text-slate-400 dark:text-amber-300 shrink-0" />
              </div>
              <div className="font-black text-lg sm:text-2xl text-slate-900 dark:text-slate-100 mt-2">
                {completedJobs} / {totalJobs}
              </div>
            </div>
          </div>

          {/* PAYMENT COLLECTION RATE Section */}
          <div className="bg-white dark:bg-[#092825] rounded-[24px] p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] sm:text-xs">
                PAYMENT COLLECTION RATE
              </span>
              <span className="font-black text-[#C2410C] dark:text-amber-400">
                {collectionRate}% Collected
              </span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200/80 dark:border-slate-700 overflow-hidden p-0.5">
              <div
                className="h-full bg-[#C2410C] dark:bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </div>

          {/* TOP GARMENT DEMAND BREAKDOWN Section */}
          <div className="bg-white dark:bg-[#092825] rounded-[24px] p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-2xs space-y-3.5">
            <h3 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              TOP GARMENT DEMAND BREAKDOWN
            </h3>

            <div className="space-y-3">
              {garmentBreakdown.map((item) => (
                <div key={item.tag} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 uppercase">
                      {item.tag}
                    </span>
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      {item.count} orders ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700">
                    <div
                      className="h-full bg-[#0D3B36] dark:bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WORKSHOP RUNWAY PIPELINE STAGES Section */}
          <div className="bg-white dark:bg-[#092825] rounded-[24px] p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black text-slate-600 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#DCA134]" />
                <span>WORKSHOP RUNWAY PIPELINE STAGES</span>
              </h3>
              <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                6 Active Stages
              </span>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2.5">
              {[
                { stage: 'CONSULT', label: '1. CONSULTATION', color: 'bg-blue-500/10 text-blue-900 dark:text-blue-300 border-blue-300/40' },
                { stage: 'CUTTING', label: '2. CUTTING', color: 'bg-amber-500/10 text-amber-900 dark:text-amber-300 border-amber-300/40' },
                { stage: 'SEWING', label: '3. SEWING', color: 'bg-purple-500/10 text-purple-900 dark:text-purple-300 border-purple-300/40' },
                { stage: 'FITTING', label: '4. FITTING', color: 'bg-indigo-500/10 text-indigo-900 dark:text-indigo-300 border-indigo-300/40' },
                { stage: 'COMPLETED', label: '5. COMPLETED', color: 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 border-emerald-300/40' },
                { stage: 'DELIVERED', label: '6. DELIVERED', color: 'bg-[#0D3B36]/10 dark:bg-amber-400/20 text-[#0D3B36] dark:text-amber-300 border-[#DCA134]/40' }
              ].map((item) => (
                <div
                  key={item.stage}
                  className={`rounded-2xl p-3 border text-center flex flex-col items-center justify-center space-y-1 transition-all ${item.color}`}
                >
                  <span className="font-black text-xl sm:text-2xl leading-none">
                    {pipelineStageCounts[item.stage] || 0}
                  </span>
                  <span className="text-[10px] font-extrabold tracking-tight uppercase">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ledger Cashflow Log (Interactive Section for Automatic & Manual Receipts) */}
          {(() => {
            const hasMoreThanFourCashflow = allCashflowTransactions.length > 4;
            const visibleCashflow = hasMoreThanFourCashflow ? allCashflowTransactions.slice(0, 4) : allCashflowTransactions;

            return (
              <div className="bg-white dark:bg-[#092825] rounded-[24px] p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                  <div>
                    <h3 className="font-black text-xs sm:text-sm text-[#0D3B36] dark:text-amber-300 uppercase tracking-wider">
                      Recent Cashflow Receipts ({allCashflowTransactions.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Automatically populates consultation deposits, payment settlements & manual entries
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handlePrintFinancialReport}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-amber-300 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-200 dark:border-slate-700"
                      title="Print All Cashflow & Receivables Records"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#0D3B36] dark:text-amber-300" />
                      <span>Print All</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenLogTransaction}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-[#0D3B36] hover:bg-[#082824] dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] text-xs font-extrabold flex items-center justify-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#DCA134] dark:text-[#0D3B36]" />
                      <span>Log Manual</span>
                    </button>
                  </div>
                </div>

                {allCashflowTransactions.length > 0 ? (
                  <div className="space-y-2">
                    <div className="space-y-2">
                      {visibleCashflow.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-[#041614] border border-slate-200/80 dark:border-amber-400/20 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                                tx.type === 'deposit' || tx.type === 'revenue'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                              }`}
                            >
                              {tx.type === 'deposit' || tx.type === 'revenue' ? (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 truncate">{tx.description}</h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                                {tx.date} • {tx.method || 'Cash'} • <span className="uppercase text-[#0D3B36] dark:text-amber-300 font-bold">{tx.category}</span>
                              </p>
                            </div>
                          </div>

                          <span className="font-black text-xs text-[#0D3B36] dark:text-amber-300 shrink-0 ml-2">
                            +GHS {(tx.amount || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* View All Cashflow Receipts Footer Action */}
                    {hasMoreThanFourCashflow && (
                      <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-[#041614] p-3.5 rounded-2xl border border-slate-200 dark:border-amber-400/30 shadow-xs">
                        <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-amber-200 font-semibold min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#0D3B36]/10 dark:bg-amber-400/10 border border-[#0D3B36]/20 dark:border-amber-400/30 flex items-center justify-center text-[#0D3B36] dark:text-amber-300 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm truncate">
                              Showing 4 of {allCashflowTransactions.length} cashflow receipts
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-amber-200/70 font-normal block truncate">
                              Click below to open full screen financial cashflow log
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsAllCashflowModalOpen(true)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0D3B36] hover:bg-[#082824] dark:bg-[#DCA134] dark:hover:bg-[#c9902b] text-white dark:text-[#0D3B36] font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View All Receipts ({allCashflowTransactions.length})</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    No cashflow transactions recorded yet. Consultation deposits and full settlements automatically sync here.
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Dedicated Full-Screen All Cashflow Receipts & Financial Transactions Modal */}
      {isAllCashflowModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-start p-2 sm:p-4 overflow-y-auto animate-fade-in font-['Outfit'] select-none min-h-screen">
          <div className="w-full max-w-4xl my-auto space-y-3.5 sm:space-y-4">
            
            {/* Modal Header Bar */}
            <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-amber-400/30 rounded-2xl p-3 sm:p-4 sm:px-5 text-slate-900 dark:text-white shadow-2xl space-y-2.5 sm:space-y-3 w-full">
              {/* Top Row: Icon + Title + Close Button */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#0D3B36]/10 dark:bg-amber-400/20 border border-[#0D3B36]/20 dark:border-amber-400/40 text-[#0D3B36] dark:text-amber-300 shrink-0">
                    <FileText className="w-4.5 h-4.5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-base font-black tracking-wide uppercase text-[#0D3B36] dark:text-amber-300 leading-snug break-words">
                      ALL CASHFLOW RECEIPTS & FINANCIAL TRANSACTIONS ({allCashflowTransactions.length})
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-semibold leading-tight mt-0.5 hidden xs:block">
                      Complete financial receipts audit, consultation deposit tracking, and full payment settlements.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAllCashflowModalOpen(false)}
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-white/10 shrink-0"
                  title="Close Screen"
                >
                  <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Subtitle for mobile & Action Row */}
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-semibold leading-tight xs:hidden">
                  Complete receipts audit & payment settlements log.
                </p>

                <div className="flex items-center gap-2 w-full xs:w-auto ml-auto">
                  <button
                    type="button"
                    onClick={handlePrintFinancialReport}
                    className="flex-1 xs:flex-none px-3.5 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-[#0D3B36] dark:text-amber-300 border border-amber-400/40 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#DCA134]" />
                    <span>Print All</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAllCashflowModalOpen(false);
                      onOpenLogTransaction();
                    }}
                    className="flex-1 xs:flex-none px-3.5 py-2 rounded-xl bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-white dark:text-[#0D3B36]" />
                    <span>+ Log Manual</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body Container */}
            <div className="bg-slate-50 dark:bg-[#092825] border-2 border-slate-200 dark:border-amber-400/40 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl space-y-4 text-slate-800 dark:text-slate-100 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              {/* Live Search Bar inside Modal */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#0D3B36] dark:text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder="Filter transactions by client name, description, date, or category..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#041614] border border-slate-300 dark:border-amber-400/30 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-amber-200/50 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400 shadow-xs"
                />
              </div>

              {/* Transactions List */}
              {(() => {
                const modalFilteredTx = allCashflowTransactions.filter((tx) => {
                  if (!modalSearchQuery.trim()) return true;
                  const q = modalSearchQuery.toLowerCase();
                  return (
                    tx.description.toLowerCase().includes(q) ||
                    (tx.clientOrVendor && tx.clientOrVendor.toLowerCase().includes(q)) ||
                    (tx.category && tx.category.toLowerCase().includes(q)) ||
                    (tx.method && tx.method.toLowerCase().includes(q)) ||
                    tx.date.includes(q)
                  );
                });

                if (modalFilteredTx.length === 0) {
                  return (
                    <div className="p-6 text-center text-xs text-slate-500 dark:text-amber-200/70 font-semibold bg-white dark:bg-[#041614] rounded-2xl border border-slate-200 dark:border-amber-400/20 shadow-xs">
                      No cashflow receipts matched "{modalSearchQuery}".
                    </div>
                  );
                }

                return (
                  <div className="space-y-2.5">
                    {modalFilteredTx.map((tx) => (
                      <div
                        key={tx.id}
                        className="glass-card rounded-2xl p-3.5 sm:p-4 bg-white dark:bg-[#061E1B] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs shadow-xs hover:border-[#0D3B36]/30 dark:hover:border-amber-400/40 transition-all gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold shrink-0 border ${
                              tx.type === 'deposit' || tx.type === 'revenue'
                                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300'
                            }`}
                          >
                            {tx.type === 'deposit' || tx.type === 'revenue' ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4" />
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                              {tx.description}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2 flex-wrap">
                              <span>Date: <strong>{tx.date}</strong></span>
                              <span>•</span>
                              <span>Method: <strong>{tx.method || 'Cash'}</strong></span>
                              <span>•</span>
                              <span className="uppercase text-[#0D3B36] dark:text-amber-300 font-bold">{tx.category}</span>
                            </p>
                          </div>
                        </div>

                        <span className="font-black text-xs sm:text-base text-[#0D3B36] dark:text-amber-300 shrink-0">
                          +GHS {(tx.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-amber-400/30 rounded-2xl p-3 px-4 text-slate-700 dark:text-white text-xs font-semibold gap-2 shadow-xl">
              <span className="text-slate-600 dark:text-amber-200/80">
                Showing {allCashflowTransactions.length} cashflow receipts in financial audit log
              </span>
              <button
                type="button"
                onClick={() => setIsAllCashflowModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-amber-300 border border-slate-300 dark:border-amber-400/40 font-bold text-xs cursor-pointer transition-all active:scale-95 text-center"
              >
                Close Cashflow Screen
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 2: CLIENT LEDGER */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-3.5 sm:space-y-4 animate-fade-in">
          {displayClients.map((client) => {
            const isPaidInFull = client.balanceDue === 0;

            return (
              <div
                key={client.id}
                className="bg-white dark:bg-[#092825] backdrop-blur-md rounded-2xl sm:rounded-[28px] p-3.5 sm:p-5 border border-slate-200/90 dark:border-white/10 shadow-2xs space-y-3 transition-all hover:shadow-md"
              >
                {/* Row 1: Client Name & Garment Tag */}
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0D3B36] text-amber-300 font-black text-xs sm:text-sm flex items-center justify-center border border-amber-400/30 shrink-0">
                      {client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-sm sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight leading-tight truncate">
                        {client.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate mt-0.5">
                        Phone: {client.phone || 'No phone'}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-300 font-black text-[10px] sm:text-xs border border-slate-200 dark:border-slate-700 uppercase tracking-wider shrink-0 self-start xs:self-auto">
                    {client.garmentTag || 'GARMENT'}
                  </span>
                </div>

                {/* Row 2: Financial Summary Telemetry Badges */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#041614] border border-slate-200 dark:border-amber-400/20">
                    <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      TOTAL COST
                    </span>
                    <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate block mt-0.5">
                      GHS {client.totalCost}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60">
                    <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                      PAID DEPOSIT
                    </span>
                    <span className="font-black text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 truncate block mt-0.5">
                      GHS {client.depositPaid}
                    </span>
                  </div>

                  <div className={`p-2 rounded-xl border ${
                    isPaidInFull
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300'
                      : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}>
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider block">
                      {isPaidInFull ? 'STATUS' : 'BALANCE DUE'}
                    </span>
                    <span className="font-black text-xs sm:text-sm truncate block mt-0.5">
                      {isPaidInFull ? 'PAID IN FULL' : `GHS ${client.balanceDue}`}
                    </span>
                  </div>
                </div>

                {/* Row 3: Action Buttons Grid */}
                <div className="pt-1.5 grid grid-cols-2 xs:flex xs:flex-wrap items-center gap-1.5 sm:gap-2">
                  {/* View / Download Invoice Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenInvoice) {
                        onOpenInvoice(client);
                      } else {
                        showNotification(`Generating invoice for ${client.name}...`);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer truncate"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0D3B36] dark:text-amber-300 shrink-0" />
                    <span>Invoice</span>
                  </button>

                  {/* WhatsApp Quick Share Invoice Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const invoiceNum = `INV-${client.id ? client.id.toUpperCase().slice(-6) : 'B0B271'}`;
                      const text = encodeURIComponent(
                        `*MOKARS STITCHES STUDIO - OFFICIAL INVOICE #${invoiceNum}*\n\n` +
                        `👤 Billed To: ${client.name}\n` +
                        `👗 Order: ${client.garmentTag || 'Custom Order'}\n\n` +
                        `💵 Total Cost: GHS ${client.totalCost}\n` +
                        `✅ Deposit Paid: GHS ${client.depositPaid}\n` +
                        `💰 Balance Due: GHS ${client.balanceDue}\n\n` +
                        `💳 MoMo Payment Details:\n` +
                        `Number: 0546920418 (Mubarik Tuahir Ali)\n` +
                        `Reference: #${invoiceNum}`
                      );
                      const phoneNum = client.phone ? client.phone.replace(/[^0-9]/g, '') : '';
                      const url = phoneNum ? `https://wa.me/${phoneNum}?text=${text}` : `https://wa.me/?text=${text}`;
                      window.open(url, '_blank');
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer truncate"
                    title="Share Invoice directly to Client WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Mark Paid / Collect Deposit Button (Shown when balance due > 0) */}
                  {!isPaidInFull && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenCollectDeposit) {
                          onOpenCollectDeposit(client);
                        } else if (onMarkPaidDirectly) {
                          onMarkPaidDirectly(client.id);
                          showNotification(`Marked balance as paid for ${client.name}`);
                        } else {
                          showNotification(`Opened payment collector for ${client.name}`);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-[#0D3B36] hover:bg-[#082824] dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer truncate"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-[#0D3B36] shrink-0" />
                      <span>Mark Paid</span>
                    </button>
                  )}

                  {/* Fitting Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenFittingSession) {
                        onOpenFittingSession(client);
                      } else if (onAdvanceStage) {
                        onAdvanceStage(client.id, 'FITTING');
                        showNotification(`Fitting scheduled for ${client.name}`);
                      } else {
                        showNotification(`Fitting appointment set for ${client.name}`);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer truncate"
                  >
                    <Scissors className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>Fitting</span>
                  </button>

                  {/* Pickup Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onAdvanceStage) {
                        onAdvanceStage(client.id, 'DELIVERED');
                      }
                      showNotification(`${client.name}'s garment marked Ready for Pickup!`);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#22C55E] hover:bg-emerald-600 text-white font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer truncate"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>Pickup</span>
                  </button>

                  {/* Bill Statement Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenInvoice) {
                        onOpenInvoice(client);
                      } else {
                        showNotification(`Billing receipt printed for ${client.name}`);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer truncate"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>Bill</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

