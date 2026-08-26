import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Laptop,
  Info,
  Share2,
  PlusSquare,
  Globe,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../../utils/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { deferredPrompt, isInstallable, isInstalled, isIOS, isAndroid, triggerInstall } = usePWAInstall();

  // Smart initial tab based on device detection
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>('android');
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isIOS) {
      setActiveTab('ios');
    } else if (isAndroid) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }
  }, [isIOS, isAndroid]);

  if (!isOpen) return null;

  const handleClose = () => {
    sessionStorage.setItem('tailor_pwa_prompt_dismissed', 'true');
    onClose();
  };

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      const success = await triggerInstall();
      if (success) {
        setInstallSuccess(true);
      }
    } else {
      // Fallback instruction
      alert(
        "To install Tailor Pro as a browser app:\n\n" +
        "1. Open your browser menu (top-right 3 dots ⋮ or share button).\n" +
        "2. Tap 'Add to Home screen' or 'Install app'.\n" +
        "3. An app shortcut will be added to your device!"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#EBF5F0] dark:bg-[#061E1B] border border-[#0D3B36]/20 dark:border-[#DCA134]/30 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0D3B36] text-white p-5 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#DCA134]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#061E1B] border-2 border-[#DCA134] overflow-hidden shadow-md flex items-center justify-center shrink-0">
              <img src="/tailor_pro_logo.jpg" alt="Tailor Pro Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-['Outfit'] font-extrabold text-lg sm:text-xl text-amber-300 tracking-wide">
                Install Tailor Pro App
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                Add to your iPhone, Android, or Desktop browser
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#0D3B36]/10 dark:border-white/10 bg-white/50 dark:bg-black/20 p-1.5 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'android'
                ? 'bg-[#0D3B36] text-amber-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span>Android Phone / Tablet</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ios'
                ? 'bg-[#0D3B36] text-amber-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Share2 className="w-4 h-4 text-blue-400" />
            <span>iPhone / iPad (iOS)</span>
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'desktop'
                ? 'bg-[#0D3B36] text-amber-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Laptop className="w-4 h-4 text-amber-400" />
            <span>Desktop (PC/Mac)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* ANDROID TAB */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-[#0D3B36]/10 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-8 h-8 text-[#0D3B36] dark:text-[#DCA134] shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#0D3B36] dark:text-amber-300">
                      Install on Android Device
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Install directly from Chrome or Samsung Internet for full-screen offline access.
                    </p>
                  </div>
                </div>

                {isInstalled ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tailor Pro is already installed on this Android device!</span>
                  </div>
                ) : installSuccess ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Installation prompt triggered! Check your device screen.</span>
                  </div>
                ) : (
                  <button
                    onClick={handleTriggerInstall}
                    className="w-full py-3.5 px-4 bg-[#0D3B36] hover:bg-[#082824] text-amber-300 font-extrabold rounded-2xl border border-amber-400/40 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>{isInstallable ? 'Install Android App Now' : 'Install Android PWA via Browser'}</span>
                  </button>
                )}
              </div>

              {/* Android Step-by-Step */}
              <div className="bg-emerald-500/10 dark:bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-bold text-[#0D3B36] dark:text-amber-300">
                  <Info className="w-4 h-4 text-emerald-500" />
                  <span>How to Install on Android Chrome / Edge:</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 pl-1 text-[11px] sm:text-xs">
                  <li>Tap the <strong>Install Android App Now</strong> button above.</li>
                  <li>
                    If no prompt appears, tap the <strong>3 dots menu (⋮)</strong> at the top right of Chrome.
                  </li>
                  <li>
                    Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.
                  </li>
                  <li>Confirm installation to launch Tailor Pro like a native app anytime!</li>
                </ol>
              </div>

              {/* Direct APK Option */}
              <div className="pt-2 border-t border-[#0D3B36]/10 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-[#0D3B36] dark:text-amber-300">Prefer Native APK File?</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Download direct Android APK installer (6.6 MB)</p>
                </div>
                <button
                  onClick={handleDownloadApk}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-[#0D3B36] dark:text-slate-200 text-xs font-extrabold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>APK (6.6 MB)</span>
                </button>
              </div>
            </div>
          )}

          {/* IOS (IPHONE / IPAD) TAB */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-[#0D3B36]/10 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <Share2 className="w-8 h-8 text-blue-500 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#0D3B36] dark:text-amber-300">
                      Install on iPhone & iPad (Safari)
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Apple requires adding web apps to Home Screen via Safari's Share button.
                    </p>
                  </div>
                </div>

                {isInstalled && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tailor Pro is already running in Home Screen app mode!</span>
                  </div>
                )}
              </div>

              {/* Step by step for iOS */}
              <div className="bg-blue-500/10 dark:bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 text-xs space-y-3 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-black text-blue-800 dark:text-blue-300 text-sm">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>Follow these 4 Easy Steps on iPhone / iPad:</span>
                </div>

                <div className="space-y-2.5 text-[11px] sm:text-xs">
                  <div className="flex items-start gap-2.5 p-2 bg-white/70 dark:bg-slate-800/80 rounded-xl border border-blue-400/20">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                    <div>
                      Open this <strong>Netlify link</strong> in <strong>Safari browser</strong> on your iPhone or iPad.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 bg-white/70 dark:bg-slate-800/80 rounded-xl border border-blue-400/20">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                    <div>
                      Tap the <strong>Share icon</strong> <Share2 className="w-4 h-4 text-blue-500 inline mx-1" /> located at the bottom menu bar of Safari.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 bg-white/70 dark:bg-slate-800/80 rounded-xl border border-blue-400/20">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                    <div>
                      Scroll down the popup list and tap <strong>"Add to Home Screen"</strong> <PlusSquare className="w-4 h-4 text-emerald-500 inline mx-1" />.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 bg-white/70 dark:bg-slate-800/80 rounded-xl border border-blue-400/20">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">4</span>
                    <div>
                      Tap <strong>"Add"</strong> in the top right corner. The <strong>Tailor Pro</strong> icon will appear on your iPhone screen!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DESKTOP TAB */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-[#0D3B36]/10 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <Laptop className="w-8 h-8 text-[#0D3B36] dark:text-[#DCA134] shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#0D3B36] dark:text-amber-300">
                      Standalone Desktop Application
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Runs full screen, offline capable, creates Desktop & Start menu shortcut icon.
                    </p>
                  </div>
                </div>

                {isInstalled ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tailor Pro is already installed on this computer!</span>
                  </div>
                ) : installSuccess ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Installation started! Check your Desktop or Taskbar.</span>
                  </div>
                ) : (
                  <button
                    onClick={handleTriggerInstall}
                    className="w-full py-3.5 px-4 bg-[#0D3B36] hover:bg-[#082824] text-amber-300 font-extrabold rounded-2xl border border-amber-400/40 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>{isInstallable ? 'Install Desktop App Now' : 'Install Desktop App via Browser'}</span>
                  </button>
                )}
              </div>

              {/* Desktop Instructions */}
              <div className="bg-amber-500/10 dark:bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-bold text-[#0D3B36] dark:text-amber-300">
                  <Info className="w-4 h-4 text-[#DCA134]" />
                  <span>How to Install on Desktop (Chrome / Edge / Brave):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] sm:text-xs">
                  <li>Click the <strong>Install Desktop App</strong> button above.</li>
                  <li>If prompted by Chrome or Edge, click <strong>"Install"</strong> in the browser dialog.</li>
                  <li>Alternatively, click the <strong>3 dots (⋮)</strong> menu top-right -&gt; <strong>Save and share -&gt; Install page as app</strong>.</li>
                  <li>An icon named <strong>Tailor Pro</strong> will automatically appear on your Desktop!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/70 dark:bg-black/40 border-t border-[#0D3B36]/10 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-[#DCA134]" />
            <span>Netlify Cloud & Cross-Device PWA Sync</span>
          </div>
          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
