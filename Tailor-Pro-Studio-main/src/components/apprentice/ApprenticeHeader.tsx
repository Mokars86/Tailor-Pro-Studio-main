import React from 'react';
import { Scissors, Moon, Sun, Settings, Ruler, ShieldCheck, UserCircle2 } from 'lucide-react';
import { Client } from '../../types';

interface ApprenticeHeaderProps {
  clients: Client[];
  masterName?: string;
  studioName?: string;
  studioLogoUrl?: string;
  workshopCode?: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenTakeTape: () => void;
  onSwitchRoleToMaster?: () => void;
}

export const ApprenticeHeader: React.FC<ApprenticeHeaderProps> = ({
  clients,
  masterName = 'Kausar Mohammed',
  studioName = 'MOKARS STITCHES STUDIO',
  studioLogoUrl,
  workshopCode,
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenTakeTape,
  onSwitchRoleToMaster
}) => {
  const displayBrandName = studioName && studioName !== 'My Atelier Studio' ? studioName : 'MOKARS STITCHES STUDIO';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 md:pl-64 pt-[max(4px,env(safe-area-inset-top))] sm:pt-4 pb-1.5 sm:pb-2 px-1.5 sm:px-6 bg-[#EBF5F0]/95 dark:bg-[#061E1B]/95 backdrop-blur-md border-b border-[#0D3B36]/10 dark:border-white/10 shadow-xs transition-all duration-200">
      <div className="max-w-4xl mx-auto space-y-2 sm:space-y-3">
        {/* Master Link Card */}
        <div className="bg-white/90 dark:bg-[#061E1B]/95 backdrop-blur-md rounded-xl sm:rounded-3xl p-2 sm:p-4 border-2 border-[#DCA134] shadow-md flex items-center justify-between gap-2 sm:gap-3">
          {/* Left Logo + Titles */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#061E1B] border-2 border-[#DCA134] overflow-hidden shadow-sm shrink-0">
              <img src={studioLogoUrl || '/tailor_pro_logo.jpg'} alt="Master Brand Logo" className="w-full h-full object-cover" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#DCA134] flex items-center gap-0.5 truncate">
                  <span>★ LINKED MASTER ATELIER</span>
                </span>
              </div>
              <h1 className="font-['Outfit'] font-black text-xs sm:text-xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight leading-tight uppercase truncate max-w-[170px] xs:max-w-[240px] sm:max-w-none">
                {displayBrandName}
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 truncate">
                <span>Master:</span>
                <span className="text-[#0D3B36] dark:text-emerald-300 font-extrabold truncate">{masterName}</span>
              </p>
            </div>
          </div>

          {/* Right Action Controls: Theme, Master View Switcher & Settings */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onSwitchRoleToMaster && (
              <button
                onClick={onSwitchRoleToMaster}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#0D3B36] text-xs font-bold border border-[#DCA134] transition-all"
                title="Switch to Master View"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#DCA134]" />
                <span className="hidden xs:inline">Master View</span>
              </button>
            )}

            <button
              onClick={onToggleTheme}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0D3B36] border border-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
              title="Toggle Theme Mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden xs:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#0D3B36]" />
                  <span className="hidden xs:inline">Dark</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenSettings}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#0D3B36] border border-slate-200 text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
              title="Apprentice Settings"
            >
              <Settings className="w-3.5 h-3.5 text-[#0D3B36]" />
              <span className="hidden xs:inline">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
