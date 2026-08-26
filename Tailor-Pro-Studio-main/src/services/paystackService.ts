declare global {
  interface Window {
    PaystackPop?: any;
  }
}

export interface PaystackPaymentOptions {
  email: string;
  amountGHS: number;
  referencePrefix?: string;
  metadata?: any;
  onSuccess: (reference: string) => void;
  onCancel?: () => void;
  onError?: (err: any) => void;
}

// Fallback public key if environment variable is not defined
export const PAYSTACK_PUBLIC_KEY =
  (import.meta.env && import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) || 'pk_live_ab1bdb953e81c8def7dd5c531400cdc67e1d59e2';

/**
 * Preloads Paystack Inline JS into the head if not present.
 */
function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.PaystackPop) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="paystack"]');
    if (existingScript) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.PaystackPop) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts >= 20) {
          clearInterval(interval);
          resolve(!!window.PaystackPop);
        }
      }, 150);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.async = true;
    script.onload = () => {
      resolve(!!window.PaystackPop);
    };
    script.onerror = () => {
      // Fallback attempt to v1 if v2 fails to load
      const fallbackScript = document.createElement('script');
      fallbackScript.src = 'https://js.paystack.co/v1/inline.js';
      fallbackScript.async = true;
      fallbackScript.onload = () => resolve(!!window.PaystackPop);
      fallbackScript.onerror = () => resolve(false);
      document.head.appendChild(fallbackScript);
    };
    document.head.appendChild(script);
  });
}

/**
 * Injects CSS rules so Paystack iframe/dialogs are elevated to top z-index on mobile devices
 * without hiding or breaking pointer events on underlying React modals.
 */
function applyPaystackMobileStyles(): void {
  if (typeof document === 'undefined' || document.getElementById('paystack-mobile-fix-style')) {
    return;
  }
  const style = document.createElement('style');
  style.id = 'paystack-mobile-fix-style';
  style.innerHTML = `
    iframe[src*="paystack"],
    iframe[name*="paystack"],
    #paystack-iframe,
    .paystack-modal,
    div[id*="paystack"],
    div[class*="paystack"],
    body > div[style*="z-index"] {
      z-index: 2147483647 !important;
      pointer-events: auto !important;
      opacity: 1 !important;
      visibility: visible !important;
      max-width: 100vw !important;
    }
  `;
  document.head.appendChild(style);
}

function setPaystackActive(active: boolean): void {
  if (typeof document === 'undefined') return;
  if (active) {
    document.body.classList.add('paystack-active');
  } else {
    document.body.classList.remove('paystack-active');
  }
}

/**
 * Synchronously or asynchronously attempts to trigger Paystack Checkout popup.
 * Preserves user gesture context on mobile devices by executing synchronously if Paystack SDK is preloaded.
 */
export async function initializePaystackCheckout(options: PaystackPaymentOptions): Promise<void> {
  const { email, amountGHS, referencePrefix = 'PAYSTACK', metadata = {}, onSuccess, onCancel, onError } = options;

  // Check if device is offline before attempting payment
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const offlineMsg = 'Internet connection required to process online payment. You are currently offline. Please connect to the internet and try again.';
    console.warn('Paystack checkout aborted: Device is offline.');
    if (onError) onError({ message: offlineMsg, isOffline: true });
    else if (onCancel) onCancel();
    return;
  }

  const generatedReference = `${referencePrefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const amountInPesewas = Math.round(amountGHS * 100);

  applyPaystackMobileStyles();

  const handleSuccess = (res: any) => {
    setPaystackActive(false);
    const ref = res?.reference || res?.trxref || generatedReference;
    console.log('Paystack Payment Verified:', ref);
    onSuccess(ref);
  };

  const handleCancel = () => {
    setPaystackActive(false);
    console.log('Paystack Checkout closed by user');
    if (onCancel) onCancel();
  };

  const handleError = (err: any) => {
    setPaystackActive(false);
    console.warn('Paystack transaction notice:', err);
    if (onError) onError(err);
    else if (onCancel) onCancel();
  };

  const config = {
    key: PAYSTACK_PUBLIC_KEY,
    email: email || 'billing@tailorprostudio.com',
    amount: amountInPesewas,
    currency: 'GHS',
    ref: generatedReference,
    reference: generatedReference,
    channels: ['mobile_money', 'card', 'bank_transfer'],
    metadata,
    onSuccess: handleSuccess,
    callback: handleSuccess,
    onCancel: handleCancel,
    onClose: handleCancel,
    onError: handleError
  };

  // Helper function to attempt launch with loaded PaystackPop
  const triggerPaystackPop = (): boolean => {
    if (!window.PaystackPop) return false;

    try {
      // 1. Try PaystackPop.setup (Works in v1 and v2 legacy wrapper)
      if (typeof window.PaystackPop.setup === 'function') {
        const handler = window.PaystackPop.setup(config);
        if (handler && typeof handler.openIframe === 'function') {
          setPaystackActive(true);
          handler.openIframe();
          return true;
        }
      }

      // 2. Try modern new PaystackPop() constructor
      if (typeof window.PaystackPop === 'function') {
        const paystack = new window.PaystackPop();
        if (typeof paystack.newTransaction === 'function') {
          setPaystackActive(true);
          paystack.newTransaction(config);
          return true;
        }
        if (typeof paystack.checkout === 'function') {
          setPaystackActive(true);
          paystack.checkout(config);
          return true;
        }
      }
    } catch (err) {
      console.warn('Direct PaystackPop invocation error:', err);
    }
    return false;
  };

  // Try immediate synchronous execution (preserves mobile touch/click gesture)
  if (typeof window !== 'undefined' && window.PaystackPop) {
    const started = triggerPaystackPop();
    if (started) return;
  }

  // If script not loaded yet, await script load and try again
  const loaded = await loadPaystackScript();
  if (loaded && window.PaystackPop) {
    const started = triggerPaystackPop();
    if (started) return;
  }

  // Failed to initialize Paystack SDK (offline, script blocked, or network failure)
  setPaystackActive(false);
  const failureMsg = 'Unable to load payment gateway. Please verify your internet connection and try again.';
  console.warn('Paystack SDK failed to initialize:', failureMsg);
  handleError({ message: failureMsg, isOffline: typeof navigator !== 'undefined' && !navigator.onLine });
}

