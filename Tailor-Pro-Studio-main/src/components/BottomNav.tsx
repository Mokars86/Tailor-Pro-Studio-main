import React from 'react';
import { Users, Calendar, PieChart, Package, Plus, Sparkles, KeyRound, Settings, UserCircle2 } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenQuickAdd: () => void;
  onOpenStudioSettings?: () => void;
  studioName?: string;
  ownerName?: string;
  pairCode?: string;
  studioLogoUrl?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickAdd,
  onOpenStudioSettings,
  studioName = 'TAILOR PRO STUDIO',
  ownerName,
  pairCode,
  studioLogoUrl
}) => {
  const tabs = [
    { id: 'clients' as TabType, label: 'Clients', icon: Users, badge: 'Directory' },
    { id: 'runway' as TabType, label: 'Runway', icon: Calendar, badge: 'Stage' },
    { id: 'ledger' as TabType, label: 'Ledger', icon: PieChart, badge: 'Financials' },
    { id: 'inventory' as TabType, label: 'Inventory', icon: Package, badge: 'Materials' }
  ];

  return (
    <>
      {/* 1. MOBILE BOTTOM NAVIGATION (Visible on phone screens < md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 sm:px-4 pb-[max(12px,env(safe-area-inset-bottom))] sm:pb-4 pointer-events-none flex items-center justify-center font-['Outfit']">
        <div className="max-w-md w-full bg-white dark:bg-[#061E1B] rounded-full p-1.5 sm:p-2 flex items-center justify-between gap-0.5 sm:gap-1 shadow-2xl border-2 border-[#0D3B36]/15 dark:border-white/20 pointer-events-auto">
          {tabs.slice(0, 2).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 sm:px-3 rounded-full transition-all duration-200 cursor-pointer min-w-0 ${
                  isActive
                    ? 'bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] font-bold shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 shrink-0 ${isActive ? 'text-emerald-300 dark:text-[#0D3B36]' : ''}`} />
                <span className="text-[10px] sm:text-[11px] leading-none truncate max-w-[60px] sm:max-w-none">{tab.label}</span>
              </button>
            );
          })}

          {/* Center Dark Green Pill FAB */}
          <div className="relative -top-2.5 sm:-top-3 px-0.5 shrink-0">
            <button
              onClick={onOpenQuickAdd}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0D3B36] dark:bg-amber-400 text-emerald-300 dark:text-[#0D3B36] flex items-center justify-center fab-shadow hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white dark:border-slate-800 cursor-pointer shadow-lg"
              title="Quick Action Menu"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300 dark:text-[#0D3B36]" />
            </button>
          </div>

          {tabs.slice(2, 4).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 sm:px-3 rounded-full transition-all duration-200 cursor-pointer min-w-0 ${
                  isActive
                    ? 'bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] font-bold shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 shrink-0 ${isActive ? 'text-emerald-300 dark:text-[#0D3B36]' : ''}`} />
                <span className="text-[10px] sm:text-[11px] leading-none truncate max-w-[60px] sm:max-w-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DESKTOP SIDEBAR NAVIGATION TAB (Visible on desktop screens >= md) */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-[#061E1B] text-white border-r-2 border-[#DCA134]/30 z-50 p-4 font-['Outfit'] shadow-2xl overflow-y-auto">
        {/* Brand Header & Atelier Badge */}
        <div className="flex items-center gap-3 pb-5 border-b border-white/10 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0D3B36] border-2 border-[#DCA134] overflow-hidden shadow-md flex items-center justify-center shrink-0">
            {studioLogoUrl ? (
              <img src={studioLogoUrl} alt="Studio Brand Logo" className="w-full h-full object-cover" />
            ) : (
              <UserCircle2 className="w-7 h-7 text-[#DCA134]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-extrabold text-sm uppercase tracking-tight text-white truncate">
              {studioName}
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] text-amber-300/90 font-bold uppercase tracking-wider truncate">
                {ownerName ? ownerName : 'Master Atelier'}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Desktop Action Button (+ Quick Add) */}
        <div className="my-5">
          <button
            onClick={onOpenQuickAdd}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#DCA134] via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-600 text-[#061E1B] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-amber-300/50"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Quick Add Client</span>
          </button>
        </div>

        {/* Section Title */}
        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest px-3 mb-2">
          Atelier Navigation Tabs
        </div>

        {/* Nav Tabs */}
        <nav className="space-y-2 flex-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-200 cursor-pointer font-bold text-xs ${
                  isActive
                    ? 'bg-[#0D3B36] text-white border-2 border-[#DCA134] shadow-lg transform translate-x-1'
                    : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-[#DCA134] text-[#061E1B]' : 'bg-white/10 text-amber-300'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="tracking-wide text-sm block leading-tight">{tab.label}</span>
                    <span className="text-[9px] font-medium text-white/50 block leading-tight">{tab.badge}</span>
                  </div>
                </div>
                {isActive && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black border border-emerald-500/40 uppercase">
                    Active
                  </span>
                )}
              </button>
            );
          })}
          {onOpenStudioSettings && (
            <button
              onClick={onOpenStudioSettings}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-200 cursor-pointer font-bold text-xs text-white/80 hover:text-white hover:bg-white/10 border border-white/10 hover:border-amber-400/50 mt-3 shadow-xs"
              title="Open Master Studio Settings"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="tracking-wide text-sm block leading-tight">Master Settings</span>
                  <span className="text-[9px] font-medium text-amber-300/80 block leading-tight">Branding & Unbind</span>
                </div>
              </div>
              <span className="text-amber-400 font-bold text-xs">⚙</span>
            </button>
          )}
        </nav>

        {/* Master Workshop Sync Key Display Card */}
        {pairCode && (
          <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
            <div className="p-3.5 rounded-2xl bg-[#082824] border border-[#DCA134]/40 shadow-inner space-y-1">
              <div className="flex items-center justify-between text-[9px] font-black text-amber-300 uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-[#DCA134]" />
                  Workshop Key
                </span>
                <span className="text-emerald-400 font-bold">● Active</span>
              </div>
              <p className="font-mono text-xs font-black text-white tracking-wider">
                {pairCode}
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
