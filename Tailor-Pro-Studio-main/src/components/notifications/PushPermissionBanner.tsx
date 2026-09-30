import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, X } from 'lucide-react';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission
} from '../../services/pushNotificationService';

export const PushPermissionBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only prompt if permission is 'default' and user hasn't dismissed in this session
    const status = getNotificationPermissionStatus();
    const isDismissed = sessionStorage.getItem('tailor_push_banner_dismissed');
    if (status === 'default' && !isDismissed) {
      const timer = setTimeout(() => setShowBanner(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!showBanner) return null;

  const handleEnable = async () => {
    await requestNotificationPermission();
    setShowBanner(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('tailor_push_banner_dismissed', 'true');
    setShowBanner(false);
  };

  return (
    <aside
      aria-label="Push Notifications Setup"
      className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-[#0D3B36] text-white p-3.5 sm:p-4 rounded-3xl border-2 border-amber-400/80 shadow-2xl backdrop-blur-xl animate-fade-in font-['Outfit']"
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h4 className="font-black text-xs sm:text-sm text-amber-300">
              Enable Mobile Push Notifications?
            </h4>
            <p className="text-[11px] text-slate-200 font-medium leading-tight mt-0.5">
              Get instant phone alerts when duties are assigned, passed, or measurements are recorded.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleEnable}
          className="flex-1 py-2 px-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#0D3B36] font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Allow Phone Alerts</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="py-2 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
        >
          Later
        </button>
      </div>
    </aside>
  );
};
