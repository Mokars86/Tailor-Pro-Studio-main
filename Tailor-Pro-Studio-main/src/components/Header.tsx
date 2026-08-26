import React from 'react';
import { Settings, Award, Sun, Moon, Palette, UserCircle2, Download, RefreshCw, Crown, Smartphone } from 'lucide-react';
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
  onOpenSubscriptionModal?: () => void;
  subscriptionTier?: string;
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
  onOpenSubscriptionModal,
  subscriptionTier = 'FREE',
  onOpenInstallApp,
  onManualSync,
  theme = 'light',
  onToggleTheme,
  supabaseStatus = 'connected'
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 lg:pl-64 pt-[max(2px,env(safe-area-inset-top))] sm:pt-2.5 pb-1 sm:pb-2 px-1.5 sm:px-6 bg-[#EBF5F0]/95 dark:bg-[#061E1B]/95 backdrop-blur-md border-b border-[#0D3B36]/10 dark:border-white/10 shadow-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto glass-card rounded-xl sm:rounded-3xl p-1.5 xs:p-2 sm:p-3 flex flex-col md:flex-row items-center justify-between gap-1.5 md:gap-3">
        {/* Left: Branding & Studio Title */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2 md:gap-3 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-10 md:w-12 sm:h-10 md:h-12 rounded-lg sm:rounded-2xl bg-[#061E1B] border-2 border-[#DCA134] overflow-hidden shadow-md shrink-0 flex items-center justify-center">
              <img
                src={studioSettings.logoUrl || '/tailor_pro_logo.jpg'}
                alt="Studio Brand Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="font-['Outfit'] font-black text-xs sm:text-base md:text-lg lg:text-xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight uppercase leading-snug truncate max-w-[180px] xs:max-w-[240px] sm:max-w-[320px] md:max-w-[260px] lg:max-w-none">
                {studioSettings.studioName || 'MOKARS STITCHES STUDIO'}
              </h1>
              <p className="text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold block leading-none mt-0.5 truncate">
                {studioSettings.ownerName ? `Master: ${studioSettings.ownerName}` : 'Master Atelier Platform'}
              </p>
            </div>
          </div>

          {/* Mobile Right: Supabase Synced Badge */}
          <div className="flex items-center gap-1 sm:hidden shrink-0">
            <button
              type="button"
              onClick={onManualSync}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border transition-all cursor-pointer ${
                supabaseStatus === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-300/60'
                  : supabaseStatus === 'syncing'
                  ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300/60'
                  : 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/60'
              }`}
              title="Tap to sync cloud data"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${supabaseStatus === 'syncing' ? 'animate-spin text-amber-500' : 'text-emerald-500'}`} />
              <span>{supabaseStatus === 'connected' ? 'Cloud' : supabaseStatus === 'syncing' ? 'Sync...' : 'Local'}</span>
            </button>
          </div>
        </div>

        {/* Right: Badges & Settings (Responsive for Tablet & Mobile) */}
        <div className="flex items-center justify-start md:justify-end w-full md:w-auto gap-1 xs:gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 md:py-0 border-t md:border-t-0 border-slate-200/40 dark:border-slate-800/40 shrink-0">
          {/* Subscription Tier Badge & Upgrade Button */}
          {onOpenSubscriptionModal && (
            <button
              type="button"
              onClick={onOpenSubscriptionModal}
              className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black border transition-all shadow-2xs cursor-pointer shrink-0 ${
                subscriptionTier === 'MASTER' || subscriptionTier === 'ENTERPRISE'
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30'
                  : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/25'
              }`}
              title="View & Upgrade SaaS Subscription Plan"
            >
              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
              <span>
                {subscriptionTier === 'MASTER' ? '👑 Master' : subscriptionTier === 'ENTERPRISE' ? '🏛️ Enterprise' : '🟢 Free'}
              </span>
            </button>
          )}

          {/* Snap Fabric AI & Inspector Button */}
          {onOpenFabricScanner && (
            <button
              type="button"
              onClick={onOpenFabricScanner}
              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#0D3B36] hover:bg-[#082824] text-amber-300 text-[10px] sm:text-xs font-black border border-amber-400/40 transition-all shadow-2xs cursor-pointer shrink-0"
              title="Snap Fabric AI & Right/Wrong Side Inspector"
            >
              <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 shrink-0" />
              <span className="hidden xs:inline">Fabric AI</span>
            </button>
          )}

          {/* Supabase Synced Badge (Desktop/Tablet) */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onManualSync}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold border transition-all cursor-pointer ${
                supabaseStatus === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 hover:bg-emerald-500/20'
                  : supabaseStatus === 'syncing'
                  ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300/60 hover:bg-amber-500/20'
                  : 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/60 hover:bg-slate-500/20'
              }`}
              title="Click to refresh and sync latest data from Supabase Cloud"
            >
              <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${supabaseStatus === 'syncing' ? 'animate-spin text-amber-500' : 'text-emerald-500'}`} />
              <span className="hidden md:inline">{supabaseStatus === 'connected' ? 'Supabase Live' : supabaseStatus === 'syncing' ? 'Syncing...' : 'Local Cache'}</span>
            </button>
          </div>

          {/* Single Theme Toggle Button */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={() => onToggleTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-1.5 sm:p-2.5 rounded-full bg-white/80 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-[#0D3B36] dark:text-amber-300 border border-white/90 dark:border-slate-700 transition-all shadow-2xs flex items-center justify-center cursor-pointer shrink-0"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
              ) : (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
              )}
            </button>
          )}

          {/* Master Certificate Button */}
          {onOpenMasterCertificate && (
            <button
              type="button"
              disabled={subscriptionTier === 'FREE'}
              onClick={onOpenMasterCertificate}
              className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all shrink-0 ${
                subscriptionTier === 'FREE'
                  ? 'bg-slate-200 text-slate-400 dark:bg-slate-900 dark:text-slate-500 border border-slate-300 dark:border-slate-800 opacity-60 cursor-not-allowed'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-[#0D3B36] dark:text-amber-300 border border-[#DCA134] cursor-pointer'
              }`}
              title={
                subscriptionTier === 'FREE'
                  ? 'Master Certificate Locked 👑: Upgrade to Master Pro (GHS 35/mo) to unlock your official Master Atelier Certificate.'
                  : 'View & Print Official Master Atelier Certificate 📜'
              }
            >
              <Award className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${subscriptionTier === 'FREE' ? 'text-slate-400' : 'text-[#DCA134]'}`} />
              <span className="hidden xs:inline">{subscriptionTier === 'FREE' ? 'Cert 🔒' : 'Cert 📜'}</span>
            </button>
          )}

          {/* Install App Button */}
          {onOpenInstallApp && (
            <button
              type="button"
              onClick={onOpenInstallApp}
              className="p-1.5 sm:px-3 sm:py-2 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-[#0D3B36] dark:text-amber-300 border border-amber-400/50 transition-all shadow-2xs flex items-center gap-1 text-[10px] sm:text-xs font-black cursor-pointer shrink-0"
              title="Install Tailor Pro App on Android, iPhone, or Desktop"
            >
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Studio Settings Gear Button */}
          <button
            type="button"
            onClick={onOpenStudioSettings}
            className="p-1.5 sm:p-2.5 rounded-full bg-white/80 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-[#0D3B36] dark:text-slate-200 border border-white/90 dark:border-slate-700 transition-all shadow-2xs flex items-center gap-1 text-[10px] sm:text-xs font-bold cursor-pointer shrink-0"
            title="Studio Settings"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D3B36] dark:text-amber-300 shrink-0" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};

