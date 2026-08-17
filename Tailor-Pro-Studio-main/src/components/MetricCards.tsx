import React from 'react';
import { DollarSign, AlertTriangle, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { ShopStats, UnpaidDeposit } from '../types';

interface MetricCardsProps {
  stats: ShopStats;
  unpaidDeposits: UnpaidDeposit[];
  onOpenCollectDeposit: (deposit?: UnpaidDeposit) => void;
  onOpenLedger: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  stats,
  unpaidDeposits,
  onOpenCollectDeposit,
  onOpenLedger
}) => {
  const totalUnpaidAmount = stats.unpaidDeposits;

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 my-3 sm:my-4 font-['Outfit'] select-none">
      {/* 1. Shop Revenue Card */}
      <div
        onClick={onOpenLedger}
        className="group relative bg-gradient-to-br from-white via-white to-[#EBF5F0]/80 dark:from-[#0B2A27] dark:via-[#09221F] dark:to-[#0B2A27] backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-white dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer overflow-hidden flex items-center justify-between gap-1.5"
      >
        {/* Subtle decorative glow orb */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#0D3B36]/5 dark:bg-[#DCA134]/10 rounded-full blur-xl group-hover:bg-[#0D3B36]/10 dark:group-hover:bg-[#DCA134]/20 transition-all pointer-events-none" />

        <div className="space-y-1 relative z-10 min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[9px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              SHOP REVENUE
            </span>
          </div>

          <div className="font-['Outfit'] font-black text-sm xs:text-base sm:text-2xl text-[#0D3B36] dark:text-emerald-300 tracking-tight truncate">
            GH₵ {stats.shopRevenue.toLocaleString('en-US')}
          </div>

          <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-500/20 dark:border-emerald-500/30">
            <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 dark:text-emerald-300 shrink-0" />
            <span className="truncate">Active Earnings</span>
          </div>
        </div>

        {/* Icon Box */}
        <div className="hidden md:flex w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0D3B36] dark:bg-[#12423D] text-[#DCA134] items-center justify-center font-bold shadow-md shrink-0 group-hover:scale-105 transition-transform relative z-10 border border-white/10">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#DCA134]" />
        </div>
      </div>

      {/* 2. Unpaid Deposits Card */}
      <div
        onClick={() => onOpenCollectDeposit()}
        className="group relative bg-gradient-to-br from-white via-white to-amber-50/70 dark:from-[#0B2A27] dark:via-[#19241F] dark:to-[#1A2518] backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-white dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer overflow-hidden flex items-center justify-between gap-1.5"
      >
        {/* Subtle decorative glow orb */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#DCA134]/10 rounded-full blur-xl group-hover:bg-[#DCA134]/20 transition-all pointer-events-none" />

        <div className="space-y-1 relative z-10 min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-[9px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              UNPAID DEPOSITS
            </span>
          </div>

          <div className="font-['Outfit'] font-black text-sm xs:text-base sm:text-2xl text-[#C98A2B] dark:text-[#DCA134] tracking-tight truncate">
            GH₵ {totalUnpaidAmount.toLocaleString('en-US')}
          </div>

          <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/20 px-1.5 py-0.5 rounded-full border border-amber-500/20 dark:border-amber-500/30">
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#C98A2B] dark:text-amber-300 shrink-0" />
            <span className="flex items-center gap-0.5 truncate">
              <span>{unpaidDeposits.length} Pending</span>
              <ChevronRight className="w-2.5 h-2.5 opacity-60 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </span>
          </div>
        </div>

        {/* Icon Box */}
        <div className="hidden md:flex w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 text-[#DCA134] items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform shrink-0 relative z-10">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-[#DCA134]" />
        </div>
      </div>
    </div>
  );
};
