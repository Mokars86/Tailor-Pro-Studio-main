import React, { useState } from 'react';
import { X, Download, Monitor, Smartphone, CheckCircle2, Sparkles, ShieldCheck, ArrowRight, Laptop, Globe, Info } from 'lucide-react';
import { usePWAInstall } from '../../utils/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { deferredPrompt, isInstallable, isInstalled, triggerInstall } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleInstallDesktop = async () => {
    if (deferredPrompt) {
      const success = await triggerInstall();
      if (success) {
        setInstallSuccess(true);
      }
    } else {
      // Fallback instruction
      alert(
        "To install Tailor Pro as a Desktop App on Chrome/Edge:\n\n" +
        "1. Look at your browser address bar or the top-right 3 dots menu (⋮).\n" +
        "2. Click 'Install Tailor Pro...' or 'Save and share > Install page as app'.\n" +
        "3. A standalone desktop app icon will be added to your Desktop & Start Menu!"
      );
    }
  };

  const handleDownloadApk = () => {
    const link = document.createElement('a');
    link.href = '/TailorPro.apk';
    link.download = 'TailorPro.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#EBF5F0] dark:bg-[#061E1B] border border-[#0D3B36]/20 dark:border-[#DCA134]/30 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0D3B36] text-white p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#DCA134]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#061E1B] border border-[#DCA134]/50 flex items-center justify-center shadow-md shrink-0">
              <Download className="w-6 h-6 text-[#DCA134] animate-bounce" />
            </div>
            <div>
              <h2 className="font-['Outfit'] font-extrabold text-lg sm:text-xl text-amber-300 tracking-wide">
                Download & Install Tailor Pro
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                Get the Desktop App or Mobile APK for your atelier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#0D3B36]/10 dark:border-white/10 bg-white/50 dark:bg-black/20 p-1.5">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-[#0D3B36] text-amber-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Desktop App (Windows / Mac)</span>
          </button>
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'mobile'
                ? 'bg-[#0D3B36] text-amber-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android Mobile APK</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'desktop' ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-[#0D3B36]/10 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <Monitor className="w-8 h-8 text-[#0D3B36] dark:text-[#DCA134]" />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#0D3B36] dark:text-amber-300">
                      Standalone Desktop Application
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Runs in full screen, offline capable, creates desktop shortcut icon.
                    </p>
                  </div>
                </div>

                {isInstalled ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tailor Pro is already installed on this device!</span>
                  </div>
                ) : installSuccess ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Installation started! Check your Desktop or Taskbar.</span>
                  </div>
                ) : (
                  <button
                    onClick={handleInstallDesktop}
                    className="w-full py-3.5 px-4 bg-[#0D3B36] hover:bg-[#082824] text-amber-300 font-extrabold rounded-2xl border border-amber-400/40 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>{isInstallable ? 'Install Desktop App Now' : 'Install Desktop App via Browser'}</span>
                  </button>
                )}
              </div>

              {/* Instructions list */}
              <div className="bg-amber-500/10 dark:bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-bold text-[#0D3B36] dark:text-amber-300">
                  <Info className="w-4 h-4 text-[#DCA134]" />
                  <span>How to Install on Desktop (Chrome / Edge / Brave):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] sm:text-xs">
                  <li>Click the <strong>Install Desktop App</strong> button above.</li>
                  <li>If prompted by Chrome or Edge, click <strong>"Install"</strong> in the popup window.</li>
                  <li>An icon named <strong>Tailor Pro</strong> will automatically appear on your Desktop.</li>
                  <li>You can now launch Tailor Pro directly from your Desktop anytime!</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-[#0D3B36]/10 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-8 h-8 text-[#0D3B36] dark:text-[#DCA134]" />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#0D3B36] dark:text-amber-300">
                      TailorPro Android App (APK File)
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Direct APK installer for Android tablets and smartphones. (Version 1.0 — 6.6 MB)
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadApk}
                  className="w-full py-3.5 px-4 bg-[#0D3B36] hover:bg-[#082824] text-amber-300 font-extrabold rounded-2xl border border-amber-400/40 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Download TailorPro.apk (6.6 MB)</span>
                </button>
              </div>

              <div className="bg-emerald-500/10 dark:bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-bold text-[#0D3B36] dark:text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Android Installation Instructions:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] sm:text-xs">
                  <li>Tap <strong>Download TailorPro.apk</strong> above.</li>
                  <li>When downloaded, open the APK file from your phone downloads.</li>
                  <li>If prompted, allow <strong>"Install from unknown sources"</strong> in phone settings.</li>
                  <li>Tap <strong>Install</strong> to add Tailor Pro to your phone apps!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/70 dark:bg-black/40 border-t border-[#0D3B36]/10 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-[#DCA134]" />
            <span>Multi-Device Atelier Sync</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
