import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles, Share2, Laptop } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenInstallModal: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenInstallModal }) => {
  const { isInstalled, isInstallable, isIOS, isAndroid, isMobile, triggerInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(true);

  useEffect(() => {
    // Show banner if not installed and not dismissed in this session
    const dismissed = sessionStorage.getItem('tailor_pwa_banner_dismissed') === 'true';
    if (!isInstalled && !dismissed) {
      setIsDismissed(false);
    }
  }, [isInstalled]);

  if (isInstalled || isDismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('tailor_pwa_banner_dismissed', 'true');
    setIsDismissed(true);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await triggerInstall();
      if (!success) {
        onOpenInstallModal();
      }
    } else {
      onOpenInstallModal();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#061E1B] via-[#0D3B36] to-[#061E1B] text-white py-2 px-3 sm:px-4 shadow-xl border-b border-[#DCA134]/40 flex items-center justify-between gap-2 animate-slideDown">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#061E1B] border border-[#DCA134] overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
          <img src="/tailor_pro_logo.jpg" alt="Tailor Pro Logo" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-['Outfit'] font-extrabold text-xs sm:text-sm text-amber-300 truncate">
            <span>Install Tailor Pro App</span>
            <span className="hidden xs:inline-block px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 rounded text-[9px] font-bold">
              {isIOS ? 'iPhone / iPad' : isAndroid ? 'Android' : 'Desktop'}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-emerald-100/90 truncate">
            {isIOS
              ? 'Add to iPhone Home Screen for instant offline access'
              : isAndroid
              ? 'Install native-like app on Android phone or tablet'
              : 'Install standalone desktop app on your PC or Mac'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={handleInstallClick}
          className="py-1.5 px-3 sm:px-4 rounded-xl bg-[#DCA134] hover:bg-amber-400 text-[#061E1B] font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {isIOS ? (
            <Share2 className="w-3.5 h-3.5" />
          ) : isAndroid ? (
            <Smartphone className="w-3.5 h-3.5" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>Install App</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
