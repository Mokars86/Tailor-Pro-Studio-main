import React from 'react';
import { Settings, Award, Sun, Moon, Palette, UserCircle2, Download, RefreshCw } from 'lucide-react';
import { StudioSettings } from '../types';

interface HeaderProps {
  studioSettings: StudioSettings;
  onOpenStudioSettings: () => void;
  onOpenAddClient?: () => void;
  onOpenBookSession?: () => void;
  activeTab?: string;
  userRole?: string;
  onOpenMasterCertificate?: () => void;
  onOpenFabricScanner?: () => void;
  onOpenInstallApp?: () => void;
  onOpenAdminPortal?: () => void;
  onManualSync?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: (newTheme: 'light' | 'dark') => void;
  supabaseStatus?: 'connected' | 'syncing' | 'offline';
}

export const Header: React.FC<HeaderProps> = ({
  studioSettings,
  onOpenStudioSettings,
  onOpenMasterCertificate,
  onOpenFabricScanner,
  onOpenInstallApp,
  onManualSync,
  theme = 'light',
  onToggleTheme,
  supabaseStatus = 'connected'
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 md:pl-64 pt-[max(10px,env(safe-area-inset-top))] sm:pt-4 pb-2 px-3 sm:px-6 bg-[#EBF5F0]/95 dark:bg-[#061E1B]/95 backdrop-blur-md border-b border-[#0D3B36]/10 dark:border-white/10 shadow-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Branding & Studio Title */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#061E1B] border-2 border-[#DCA134] overflow-hidden shadow-md shrink-0 flex items-center justify-center">
              <img
                src={studioSettings.logoUrl || '/tailor_pro_logo.jpg'}
                alt="Studio Brand Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-['Outfit'] font-black text-xs xs:text-sm sm:text-xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight uppercase leading-snug">
                {studioSettings.studioName || 'MOKARS STITCHES STUDIO'}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold block leading-none mt-0.5">
                {studioSettings.ownerName ? `Master: ${studioSettings.ownerName}` : 'Master Atelier Platform'}
              </p>
            </div>
          </div>

          {/* Mobile Right: Supabase Synced Badge */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={onManualSync}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                supabaseStatus === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 hover:bg-emerald-500/20'
                  : supabaseStatus === 'syncing'
                  ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300/60 hover:bg-amber-500/20'
                  : 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/60 hover:bg-slate-500/20'
              }`}
              title="Tap to sync latest cloud data"
            >
              <RefreshCw className={`w-3 h-3 ${supabaseStatus === 'syncing' ? 'animate-spin text-amber-500' : 'text-emerald-500'}`} />
              <span>{supabaseStatus === 'connected' ? 'Sync Cloud' : supabaseStatus === 'syncing' ? 'Syncing...' : 'Local Cache'}</span>
            </button>
          </div>
        </div>

        {/* Right: Badges & Settings */}
        <div className="flex items-center justify-end w-full sm:w-auto gap-2 flex-wrap sm:flex-nowrap">
          {/* Snap Fabric & Thread Matcher Button */}
          {onOpenFabricScanner && (
            <button
              type="button"
              onClick={onOpenFabricScanner}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0D3B36] hover:bg-[#082824] text-amber-300 text-xs font-black border border-amber-400/40 transition-all shadow-xs cursor-pointer"
              title="Snap Fabric & Thread Matcher"
            >
              <Palette className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Fabric Thread Matcher</span>
            </button>
          )}

          {/* Supabase Synced Badge */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={onManualSync}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                supabaseStatus === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 hover:bg-emerald-500/20'
                  : supabaseStatus === 'syncing'
                  ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300/60 hover:bg-amber-500/20'
                  : 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/60 hover:bg-slate-500/20'
              }`}
              title="Click to refresh and sync latest data from Supabase Cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${supabaseStatus === 'syncing' ? 'animate-spin text-amber-500' : 'text-emerald-500'}`} />
              <span>{supabaseStatus === 'connected' ? 'Supabase Live' : supabaseStatus === 'syncing' ? 'Syncing DB...' : 'Local Cache'}</span>
            </button>
          </div>


          {/* Single Theme Toggle Button */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={() => onToggleTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 sm:p-2.5 rounded-full bg-white/80 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-[#0D3B36] dark:text-amber-300 border border-white/90 dark:border-slate-700 transition-all shadow-2xs flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden xs:inline text-slate-800">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-300" />
                  <span className="hidden xs:inline text-amber-300">Light</span>
                </>
              )}
            </button>
          )}

          {/* Master Certificate Button */}
          {onOpenMasterCertificate && (
            <button
              type="button"
              onClick={onOpenMasterCertificate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-[#0D3B36] dark:text-amber-300 text-xs font-bold border border-[#DCA134] transition-all cursor-pointer"
              title="View Master Certificate"
            >
              <Award className="w-3.5 h-3.5 text-[#DCA134]" />
              <span>Master Certificate</span>
            </button>
          )}

          {/* Studio Settings Gear Button */}
          <button
            type="button"
            onClick={onOpenStudioSettings}
            className="p-2 sm:p-2.5 rounded-full bg-white/80 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-[#0D3B36] dark:text-slate-200 border border-white/90 dark:border-slate-700 transition-all shadow-2xs flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Studio Settings"
          >
            <Settings className="w-4 h-4 text-[#0D3B36] dark:text-amber-300" />
            <span className="hidden xs:inline">Studio Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};

