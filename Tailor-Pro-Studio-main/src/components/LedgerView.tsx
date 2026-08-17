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
  Download
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
        <div>
          <h1 className="font-black text-2xl sm:text-3xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight uppercase leading-none">
            FINANCIAL
            <br />
            ANALYTICS
          </h1>
        </div>

        {/* Top Segmented Pill Toggle Switch */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs self-end sm:self-auto">
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

          {/* Ledger Cashflow Log (Interactive Section for Adding Receipts) */}
          <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-xs sm:text-sm text-[#0D3B36] uppercase tracking-wider">
                Recent Cashflow Receipts
              </h3>
              <button
                type="button"
                onClick={onOpenLogTransaction}
                className="px-3 py-1.5 rounded-xl bg-[#0D3B36] hover:bg-[#082824] text-white text-xs font-extrabold flex items-center gap-1 shadow-2xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-[#DCA134]" />
                <span>Log Transaction</span>
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold ${
                        tx.type === 'deposit' || tx.type === 'revenue'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {tx.type === 'deposit' || tx.type === 'revenue' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900">{tx.description}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {tx.date} • {tx.method}
                      </p>
                    </div>
                  </div>

                  <span className="font-black text-xs text-[#0D3B36]">
                    +GHS {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CLIENT LEDGER */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4 animate-fade-in">
          {displayClients.map((client) => {
            const isPaidInFull = client.balanceDue === 0;

            return (
              <div
                key={client.id}
                className="bg-white/90 backdrop-blur-md rounded-[28px] p-5 sm:p-6 border border-white shadow-sm space-y-3.5 transition-all hover:shadow-md"
              >
                {/* Row 1: Client Name & Garment Tag */}
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-900 tracking-tight">
                    {client.name}
                  </h3>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    {client.garmentTag || 'GARMENT'}
                  </span>
                </div>

                {/* Row 2: Total Cost & Paid Deposit Summary */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Total: GHS {client.totalCost}</span>
                  <span>Paid Deposit: GHS {client.depositPaid}</span>
                </div>

                {/* Row 3: Payment Status Indicator Badge */}
                <div className="pt-1">
                  {!isPaidInFull ? (
                    <div className="inline-flex items-center gap-2 text-xs font-black text-[#E11D48] tracking-wider uppercase">
                      <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-2xs" />
                      <span>DUE: GHS {client.balanceDue}</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 text-xs font-black text-[#15803D] tracking-wider uppercase">
                      <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block shadow-2xs" />
                      <span>PAID IN FULL</span>
                    </div>
                  )}
                </div>

                {/* Rows 4 & 5: Action Pill Buttons Grid */}
                <div className="pt-2 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
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
                      className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0D3B36]" />
                      <span>View & Download Invoice</span>
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
                      className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                      title="Share Invoice directly to Client WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-white" />
                      <span>WhatsApp Invoice</span>
                    </button>

                    {/* Mark Paid Button (Shown when balance due > 0) */}
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
                        className="px-3.5 py-2 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
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
                      className="px-3.5 py-2 rounded-2xl bg-[#22C55E] hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                    >
                      <Scissors className="w-3.5 h-3.5 text-white" />
                      <span>Fitting</span>
                    </button>

                    {/* Pickup & Bill Buttons */}
                    {isPaidInFull && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (onAdvanceStage) {
                              onAdvanceStage(client.id, 'DELIVERED');
                            }
                            showNotification(`${client.name}'s garment marked Ready for Pickup!`);
                          }}
                          className="px-3.5 py-2 rounded-2xl bg-[#22C55E] hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-white" />
                          <span>Pickup</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenInvoice) {
                              onOpenInvoice(client);
                            } else {
                              showNotification(`Billing receipt printed for ${client.name}`);
                            }
                          }}
                          className="px-3.5 py-2 rounded-2xl bg-[#22C55E] hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-white" />
                          <span>Bill</span>
                        </button>
                      </>
                    )}
                  </div>

                  {!isPaidInFull && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onAdvanceStage) {
                            onAdvanceStage(client.id, 'DELIVERED');
                          }
                          showNotification(`${client.name}'s garment marked Ready for Pickup!`);
                        }}
                        className="px-3.5 py-2 rounded-2xl bg-[#22C55E] hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-white" />
                        <span>Pickup</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenInvoice) {
                            onOpenInvoice(client);
                          } else {
                            showNotification(`Bill & statement printed for ${client.name}`);
                          }
                        }}
                        className="px-3.5 py-2 rounded-2xl bg-[#22C55E] hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-white" />
                        <span>Bill</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

