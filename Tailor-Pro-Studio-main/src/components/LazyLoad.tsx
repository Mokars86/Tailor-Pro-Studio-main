import React, { lazy, Suspense, useEffect, useState } from 'react';

/**
 * Code-splitting helpers.
 *
 * Screens and modals are loaded on demand with React.lazy so the first paint only
 * ships the code needed for the splash / sign-in / main dashboard. After the app is
 * idle, every lazy chunk is prefetched in the background so that:
 *  - opening a modal later is instant, and
 *  - the service worker caches every chunk for offline (PWA) use.
 */

type AnyComponent = React.ComponentType<any>;

const preloaders: Array<() => Promise<unknown>> = [];

/**
 * React.lazy for named exports (all components in this project use named exports).
 * Keeps full prop type-checking and exposes a `preload()` function.
 */
export function lazyNamed<M extends Record<K, AnyComponent>, K extends keyof M>(
  loader: () => Promise<M>,
  name: K
) {
  let promise: Promise<M> | null = null;
  const load = () => {
    if (!promise) {
      promise = loader().catch((err) => {
        promise = null; // allow retry (e.g. flaky network on first visit)
        throw err;
      });
    }
    return promise;
  };
  preloaders.push(load);
  const LazyComponent = lazy(() => load().then((m) => ({ default: m[name] })));
  return Object.assign(LazyComponent, { preload: load });
}

/**
 * Downloads every lazy chunk during browser idle time, one at a time so it never
 * competes with user-triggered network requests.
 */
export function prefetchLazyChunks(delayMs = 2500) {
  let cancelled = false;
  const idle = (cb: () => void) =>
    'requestIdleCallback' in window
      ? (window as any).requestIdleCallback(cb, { timeout: 3000 })
      : setTimeout(cb, 200);

  const timer = setTimeout(() => {
    let i = 0;
    const next = () => {
      if (cancelled || i >= preloaders.length) return;
      const load = preloaders[i++];
      load()
        .catch(() => { /* offline / failed chunk: ignore, will load on demand */ })
        .finally(() => idle(next));
    };
    idle(next);
  }, delayMs);

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}

const Spinner: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <div
    role="status"
    aria-label="Loading"
    className="rounded-full border-4 border-[#DCA134]/30 border-t-[#DCA134] animate-spin"
    style={{ width: size, height: size }}
  />
);

/** Fallback shown over the current screen while a modal's code downloads. */
export const ModalFallback: React.FC = () => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
    <div className="rounded-2xl bg-white dark:bg-[#0D3B36] p-5 shadow-2xl">
      <Spinner />
    </div>
  </div>
);

/** Fallback for an in-page section / tab. */
export const ViewFallback: React.FC<{ minHeight?: string }> = ({ minHeight = '40vh' }) => (
  <div className="flex w-full items-center justify-center" style={{ minHeight }}>
    <Spinner />
  </div>
);

/** Fallback for a full-screen view (auth screens, apprentice app, tracker). */
export const ScreenFallback: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#EBF5F0] dark:bg-[#061E1B]">
    <Spinner size={44} />
  </div>
);

/**
 * For modals that are always rendered and toggle themselves via an `isOpen` prop.
 * The modal's code is not downloaded until it is first opened; after that it stays
 * mounted exactly as before, so internal state and close-side-effects (e.g. stopping
 * the camera in the fabric scanner) keep working unchanged.
 */
export const DeferredMount: React.FC<{ when: boolean; children: React.ReactNode }> = ({
  when,
  children
}) => {
  const [hasOpened, setHasOpened] = useState(when);

  useEffect(() => {
    if (when) setHasOpened(true);
  }, [when]);

  if (!when && !hasOpened) return null;
  return <Suspense fallback={when ? <ModalFallback /> : null}>{children}</Suspense>;
};

// Lazy Views
export const LazyRunwayView = lazyNamed(() => import('./RunwayView'), 'RunwayView');
export const LazyLedgerView = lazyNamed(() => import('./LedgerView'), 'LedgerView');
export const LazyInventoryView = lazyNamed(() => import('./InventoryView'), 'InventoryView');
export const LazyApprenticeRegistry = lazyNamed(() => import('./ApprenticeRegistry'), 'ApprenticeRegistry');
export const LazyApprenticeAppView = lazyNamed(() => import('./apprentice/ApprenticeAppView'), 'ApprenticeAppView');
export const LazyRegisterStudioView = lazyNamed(() => import('./auth/RegisterStudioView'), 'RegisterStudioView');

// Lazy Modals
export const LazyAddClientModal = lazyNamed(() => import('./modals/AddClientModal'), 'AddClientModal');
export const LazyCollectDepositModal = lazyNamed(() => import('./modals/CollectDepositModal'), 'CollectDepositModal');
export const LazyAddApprenticeModal = lazyNamed(() => import('./modals/AddApprenticeModal'), 'AddApprenticeModal');
export const LazyBookSessionModal = lazyNamed(() => import('./modals/BookSessionModal'), 'BookSessionModal');
export const LazyLogTransactionModal = lazyNamed(() => import('./modals/LogTransactionModal'), 'LogTransactionModal');
export const LazyCustomerTrackingModal = lazyNamed(() => import('./modals/CustomerTrackingModal'), 'CustomerTrackingModal');
export const LazyStudioSettingsModal = lazyNamed(() => import('./modals/StudioSettingsModal'), 'StudioSettingsModal');
export const LazyGarmentMeasurementsModal = lazyNamed(() => import('./modals/GarmentMeasurementsModal'), 'GarmentMeasurementsModal');
export const LazyInvoiceModal = lazyNamed(() => import('./modals/InvoiceModal'), 'InvoiceModal');
export const LazySpecSheetModal = lazyNamed(() => import('./modals/SpecSheetModal'), 'SpecSheetModal');
export const LazyFullMeasurementsModal = lazyNamed(() => import('./modals/FullMeasurementsModal'), 'FullMeasurementsModal');
export const LazyClientProfileModal = lazyNamed(() => import('./modals/ClientProfileModal'), 'ClientProfileModal');
export const LazyReorderClientModal = lazyNamed(() => import('./modals/ReorderClientModal'), 'ReorderClientModal');
export const LazyAddMaterialModal = lazyNamed(() => import('./modals/AddMaterialModal'), 'AddMaterialModal');
export const LazyFabricColorScannerModal = lazyNamed(() => import('./modals/FabricColorScannerModal'), 'FabricColorScannerModal');
export const LazySubscriptionPlansModal = lazyNamed(() => import('./modals/SubscriptionPlansModal'), 'SubscriptionPlansModal');
export const LazyGraduationPaymentModal = lazyNamed(() => import('./modals/GraduationPaymentModal'), 'GraduationPaymentModal');
export const LazyCustomTaskModal = lazyNamed(() => import('./modals/CustomTaskModal'), 'CustomTaskModal');
export const LazyMasterCertificateModal = lazyNamed(() => import('./modals/MasterCertificateModal'), 'MasterCertificateModal');
export const LazyLogoutConfirmationModal = lazyNamed(() => import('./modals/LogoutConfirmationModal'), 'LogoutConfirmationModal');
export const LazyInstallAppModal = lazyNamed(() => import('./modals/InstallAppModal'), 'InstallAppModal');
export const LazyNotificationCenterModal = lazyNamed(() => import('./notifications/NotificationCenterModal'), 'NotificationCenterModal');
export const LazySuperAdminPortal = lazyNamed(() => import('./admin/SuperAdminPortal'), 'SuperAdminPortal');
export const LazyLicenseKeyVerificationModal = lazyNamed(() => import('./auth/LicenseKeyVerificationModal'), 'LicenseKeyVerificationModal');
export const LazyApprenticeMasterGraduationModal = lazyNamed(() => import('./modals/ApprenticeMasterGraduationModal'), 'ApprenticeMasterGraduationModal');
