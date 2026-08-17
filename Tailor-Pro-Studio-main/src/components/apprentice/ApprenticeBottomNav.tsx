import React from 'react';
import { Layers, Ruler, ShoppingBag, Sparkles, KeyRound, UserCircle2 } from 'lucide-react';

export type ApprenticeTab = 'production' | 'take_tape' | 'portfolio' | 'milestones';

interface ApprenticeBottomNavProps {
  activeTab: ApprenticeTab;
  onTabChange: (tab: ApprenticeTab) => void;
  onTriggerTakeTape: () => void;
  studioName?: string;
  masterName?: string;
  workshopCode?: string;
  studioLogoUrl?: string;
}

export const ApprenticeBottomNav: React.FC<ApprenticeBottomNavProps> = ({
  activeTab,
  onTabChange,
  onTriggerTakeTape,
  studioName = 'TAILOR PRO STUDIO',
  masterName = 'Master Trainer',
  workshopCode,
  studioLogoUrl
}) => {
  const leftTabs = [
    { id: 'production' as ApprenticeTab, label: 'Production', icon: Layers },
    { id: 'portfolio' as ApprenticeTab, label: 'Portfolio', icon: ShoppingBag }
  ];

  const rightTabs = [
    { id: 'take_tape' as ApprenticeTab, label: 'Take Tape', icon: Ruler },
    { id: 'milestones' as ApprenticeTab, label: 'Milestones', icon: Sparkles }
  ];

  const allTabs = [
    { id: 'production' as ApprenticeTab, label: 'Production Orders', icon: Layers, badge: 'CAD Specs' },
    { id: 'take_tape' as ApprenticeTab, label: 'Take Tape', icon: Ruler, badge: 'Measurements' },
    { id: 'portfolio' as ApprenticeTab, label: 'Scholar Portfolio', icon: ShoppingBag, badge: 'Garments' },
    { id: 'milestones' as ApprenticeTab, label: 'Curriculum & Duties', icon: Sparkles, badge: 'Progress' }
  ];

  const handleTabClick = (tabId: ApprenticeTab) => {
    if (tabId === 'take_tape') {
      onTriggerTakeTape();
    } else {
      onTabChange(tabId);
    }
  };

  return (
    <>
      {/* 1. MOBILE BOTTOM NAVIGATION (< md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 sm:px-4 pb-[max(12px,env(safe-area-inset-bottom))] sm:pb-4 pointer-events-none flex items-center justify-center font-['Outfit']">
        <div className="max-w-md w-full bg-white dark:bg-[#061E1B] rounded-full p-1.5 sm:p-2 flex items-center justify-between gap-0.5 sm:gap-1 shadow-2xl border-2 border-[#0D3B36]/15 dark:border-white/20 pointer-events-auto">
          {leftTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 sm:px-3 rounded-full transition-all duration-200 cursor-pointer min-w-0 ${
                  isActive
                    ? 'bg-[#0D3B36] text-white font-bold shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 shrink-0 ${isActive ? 'text-emerald-300' : ''}`} />
                <span className="text-[10px] sm:text-[11px] leading-none truncate max-w-[60px] sm:max-w-none">{tab.label}</span>
              </button>
            );
          })}

          {/* Center Dark Green Pill FAB */}
          <div className="relative -top-2.5 sm:-top-3 px-0.5 shrink-0">
            <button
              onClick={onTriggerTakeTape}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0D3B36] text-emerald-300 flex items-center justify-center fab-shadow hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white dark:border-slate-800 cursor-pointer shadow-lg"
              title="Take Client Measurement (Tape)"
            >
              <Ruler className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
            </button>
          </div>

          {rightTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 sm:px-3 rounded-full transition-all duration-200 cursor-pointer min-w-0 ${
                  isActive
                    ? 'bg-[#0D3B36] text-white font-bold shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 shrink-0 ${isActive ? 'text-emerald-300' : ''}`} />
                <span className="text-[10px] sm:text-[11px] leading-none truncate max-w-[60px] sm:max-w-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DESKTOP SIDEBAR NAVIGATION (>= md) */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-[#061E1B] text-white border-r-2 border-[#DCA134]/30 z-50 p-4 font-['Outfit'] shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-white/10 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0D3B36] border-2 border-[#DCA134] overflow-hidden shadow-md flex items-center justify-center shrink-0">
            {studioLogoUrl ? (
              <img src={studioLogoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <UserCircle2 className="w-7 h-7 text-[#DCA134]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-extrabold text-sm uppercase tracking-tight text-white truncate">
              {studioName}
            </h2>
            <p className="text-[10px] text-amber-300/90 font-bold uppercase tracking-wider truncate">
              Apprentice Trainee Hub
            </p>
          </div>
        </div>

        {/* Action Button: Take Tape */}
        <div className="my-5">
          <button
            onClick={onTriggerTakeTape}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#DCA134] via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-600 text-[#061E1B] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-amber-300/50"
          >
            <Ruler className="w-4 h-4 stroke-[3]" />
            <span>+ Take Client Tape</span>
          </button>
        </div>

        {/* Section Label */}
        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest px-3 mb-2">
          Apprentice Navigation Tabs
        </div>

        {/* Tabs List */}
        <nav className="space-y-2 flex-1">
          {allTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
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
        </nav>

        {/* Workshop Key Footer */}
        {workshopCode && (
          <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
            <div className="p-3.5 rounded-2xl bg-[#082824] border border-[#DCA134]/40 shadow-inner space-y-1">
              <div className="flex items-center justify-between text-[9px] font-black text-amber-300 uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-[#DCA134]" />
                  Workshop Key
                </span>
                <span className="text-emerald-400 font-bold">● Synced</span>
              </div>
              <p className="font-mono text-xs font-black text-white tracking-wider">
                {workshopCode}
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
