import React from 'react';
import { Scissors, Moon, Sun, Settings, Ruler, ShieldCheck, UserCircle2, Bell } from 'lucide-react';
import { Client } from '../../types';
import { useTranslation } from '../../i18n/useTranslation';

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
  unreadNotificationCount?: number;
  onOpenNotificationCenter?: () => void;
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
  onSwitchRoleToMaster,
  unreadNotificationCount = 0,
  onOpenNotificationCenter
}) => {
  const { t } = useTranslation();
  const displayBrandName = studioName && studioName !== 'My Atelier Studio' ? studioName : 'MOKARS STITCHES STUDIO';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 md:pl-64 pt-[max(8px,calc(env(safe-area-inset-top,0px)+4px))] sm:pt-3 pb-1 sm:pb-1.5 px-1.5 sm:px-6 bg-[#EBF5F0]/95 dark:bg-[#061E1B]/95 backdrop-blur-md border-b border-[#0D3B36]/10 dark:border-white/10 shadow-xs transition-all duration-200">
      <div className="max-w-4xl mx-auto space-y-2 sm:space-y-3">
        {/* Master Link Card */}
        <div className="bg-white/90 dark:bg-[#061E1B]/95 backdrop-blur-md rounded-xl sm:rounded-3xl p-2.5 sm:p-4 border-2 border-[#DCA134] shadow-md flex items-center justify-between gap-2.5 sm:gap-4">
          {/* Left Logo + Titles */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-[#061E1B] border-2 border-[#DCA134] overflow-hidden shadow-md shrink-0 flex items-center justify-center ring-2 ring-[#DCA134]/20 hover:scale-105 transition-transform duration-200">
              <img src={studioLogoUrl || '/tailor_pro_logo.jpg'} alt="Master Brand Logo" className="w-full h-full object-cover" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[9px] xs:text-[10px] font-black uppercase tracking-wider text-[#DCA134] flex items-center gap-0.5 truncate">
                  <span>★ {t('linkedMasterAtelier')}</span>
                </span>
              </div>
              <h1 className="font-['Outfit'] font-black text-sm xs:text-base sm:text-xl md:text-2xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight leading-tight uppercase truncate max-w-[190px] xs:max-w-[260px] sm:max-w-none">
                {displayBrandName}
              </h1>
              <p className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 truncate mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{t('master')}:</span>
                <span className="text-[#0D3B36] dark:text-emerald-300 font-extrabold truncate">{masterName}</span>
              </p>
            </div>
          </div>

          {/* Right Action Controls: Notification Bell, Theme & Settings */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenNotificationCenter && (
              <button
                type="button"
                onClick={onOpenNotificationCenter}
                className="relative px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#0D3B36] border border-slate-200 text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                title="Studio Alerts & Notifications"
              >
                <Bell className="w-3.5 h-3.5 text-[#0D3B36]" />
                <span className="hidden xs:inline">Alerts</span>
                {unreadNotificationCount > 0 && (
                  <span className="px-1.5 py-0.2 min-w-[16px] h-[16px] rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </span>
                )}
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
