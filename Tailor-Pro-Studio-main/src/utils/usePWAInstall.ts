import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  // Platform Detection
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(ua);
  const isMobile = isIOS || isAndroid;

  useEffect(() => {
    // Check if running natively via Capacitor, or in standalone PWA, TWA, or WebView mode
    const isCapacitorNative = Capacitor.isNativePlatform();
    const isCapacitorWeb = Capacitor.getPlatform() !== 'web';
    const isWebView = /wv|Android.*Version\//i.test(ua);
    const isCapacitorProtocol = typeof window !== 'undefined' && (window.location.protocol === 'capacitor:' || window.location.protocol === 'ionic:');
    
    const isStandalone =
      isCapacitorNative ||
      isCapacitorWeb ||
      isWebView ||
      isCapacitorProtocol ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // If already standalone or native, do not prompt
      if (isStandalone) return;
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [ua]);

  const triggerInstall = async (): Promise<boolean> => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
    }
    return false;
  };

  return {
    deferredPrompt,
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    isMobile,
    triggerInstall
  };
}

