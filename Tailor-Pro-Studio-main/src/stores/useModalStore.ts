import { create } from 'zustand';
import { Apprentice, Client, UnpaidDeposit } from '../types';

interface ModalState {
  // Add/Edit Client Modal
  isAddClientOpen: boolean;
  editingClient: Client | null;
  openAddClient: (client?: Client | null) => void;
  closeAddClient: () => void;

  // Collect Deposit Modal
  isCollectDepositOpen: boolean;
  targetDeposit: UnpaidDeposit | null;
  openCollectDeposit: (deposit?: UnpaidDeposit | null) => void;
  closeCollectDeposit: () => void;

  // Add Apprentice Modal
  isAddApprenticeOpen: boolean;
  setAddApprenticeOpen: (open: boolean) => void;

  // Book Fitting Session Modal
  isBookSessionOpen: boolean;
  preselectedBookingClient: Client | null;
  openBookSession: (client?: Client | null) => void;
  closeBookSession: () => void;

  // Log Transaction Modal
  isLogTransactionOpen: boolean;
  setLogTransactionOpen: (open: boolean) => void;

  // Customer Tracker Modal
  isCustomerTrackerOpen: boolean;
  setCustomerTrackerOpen: (open: boolean) => void;

  // Studio Settings Modal
  isStudioSettingsOpen: boolean;
  setStudioSettingsOpen: (open: boolean) => void;

  // Measurement Modal
  measurementClient: Client | null;
  setMeasurementClient: (client: Client | null) => void;

  // Invoice Modal
  invoiceClient: Client | null;
  setInvoiceClient: (client: Client | null) => void;

  // Spec Sheet Modal
  specSheetClient: Client | null;
  setSpecSheetClient: (client: Client | null) => void;

  // Full Measurements Modal
  fullMeasurementsClient: Client | null;
  setFullMeasurementsClient: (client: Client | null) => void;

  // Client Profile Modal
  profileClient: Client | null;
  setProfileClient: (client: Client | null) => void;

  // Reorder Client Modal
  reorderClient: Client | null;
  openReorderClient: (client: Client) => void;
  closeReorderClient: () => void;

  // Add Material Modal
  isAddMaterialOpen: boolean;
  setAddMaterialOpen: (open: boolean) => void;

  // Custom Task Modal
  isCustomTaskOpen: boolean;
  setCustomTaskOpen: (open: boolean) => void;

  // Master Certificate Modal
  isMasterCertOpen: boolean;
  setMasterCertOpen: (open: boolean) => void;

  // Fabric Scanner Modal
  isFabricScannerOpen: boolean;
  fabricScannerTab: 'color' | 'sides' | 'saved';
  openFabricScanner: (tab?: 'color' | 'sides' | 'saved') => void;
  closeFabricScanner: () => void;

  // Logout Confirm Modal
  isLogoutConfirmOpen: boolean;
  setLogoutConfirmOpen: (open: boolean) => void;

  // Install App Modal
  isInstallAppOpen: boolean;
  setInstallAppOpen: (open: boolean) => void;

  // Subscription Modal
  isSubscriptionModalOpen: boolean;
  setSubscriptionModalOpen: (open: boolean) => void;

  // Graduation Payment Modal
  graduationPaymentApprentice: Apprentice | null;
  setGraduationPaymentApprentice: (apprentice: Apprentice | null) => void;

  // Admin & License Modals
  isAdminPortalOpen: boolean;
  setAdminPortalOpen: (open: boolean) => void;
  isLicensePromptOpen: boolean;
  setLicensePromptOpen: (open: boolean) => void;
  isGraduationPromptOpen: boolean;
  setGraduationPromptOpen: (open: boolean) => void;

  // Notification Center
  isNotificationCenterOpen: boolean;
  setNotificationCenterOpen: (open: boolean) => void;

  // Global close all modals (for phone hardware back button)
  closeActiveModalOrReturn: () => boolean;
}

export const useModalStore = create<ModalState>((set, get) => ({
  isAddClientOpen: false,
  editingClient: null,
  openAddClient: (client = null) => set({ isAddClientOpen: true, editingClient: client }),
  closeAddClient: () => set({ isAddClientOpen: false, editingClient: null }),

  isCollectDepositOpen: false,
  targetDeposit: null,
  openCollectDeposit: (deposit = null) => set({ isCollectDepositOpen: true, targetDeposit: deposit }),
  closeCollectDeposit: () => set({ isCollectDepositOpen: false, targetDeposit: null }),

  isAddApprenticeOpen: false,
  setAddApprenticeOpen: (open) => set({ isAddApprenticeOpen: open }),

  isBookSessionOpen: false,
  preselectedBookingClient: null,
  openBookSession: (client = null) => set({ isBookSessionOpen: true, preselectedBookingClient: client }),
  closeBookSession: () => set({ isBookSessionOpen: false, preselectedBookingClient: null }),

  isLogTransactionOpen: false,
  setLogTransactionOpen: (open) => set({ isLogTransactionOpen: open }),

  isCustomerTrackerOpen: false,
  setCustomerTrackerOpen: (open) => set({ isCustomerTrackerOpen: open }),

  isStudioSettingsOpen: false,
  setStudioSettingsOpen: (open) => set({ isStudioSettingsOpen: open }),

  measurementClient: null,
  setMeasurementClient: (client) => set({ measurementClient: client }),

  invoiceClient: null,
  setInvoiceClient: (client) => set({ invoiceClient: client }),

  specSheetClient: null,
  setSpecSheetClient: (client) => set({ specSheetClient: client }),

  fullMeasurementsClient: null,
  setFullMeasurementsClient: (client) => set({ fullMeasurementsClient: client }),

  profileClient: null,
  setProfileClient: (client) => set({ profileClient: client }),

  reorderClient: null,
  openReorderClient: (client) => set({ reorderClient: client }),
  closeReorderClient: () => set({ reorderClient: null }),

  isAddMaterialOpen: false,
  setAddMaterialOpen: (open) => set({ isAddMaterialOpen: open }),

  isCustomTaskOpen: false,
  setCustomTaskOpen: (open) => set({ isCustomTaskOpen: open }),

  isMasterCertOpen: false,
  setMasterCertOpen: (open) => set({ isMasterCertOpen: open }),

  isFabricScannerOpen: false,
  fabricScannerTab: 'sides',
  openFabricScanner: (tab = 'sides') => set({ isFabricScannerOpen: true, fabricScannerTab: tab }),
  closeFabricScanner: () => set({ isFabricScannerOpen: false }),

  isLogoutConfirmOpen: false,
  setLogoutConfirmOpen: (open) => set({ isLogoutConfirmOpen: open }),

  isInstallAppOpen: false,
  setInstallAppOpen: (open) => set({ isInstallAppOpen: open }),

  isSubscriptionModalOpen: false,
  setSubscriptionModalOpen: (open) => set({ isSubscriptionModalOpen: open }),

  graduationPaymentApprentice: null,
  setGraduationPaymentApprentice: (apprentice) => set({ graduationPaymentApprentice: apprentice }),

  isAdminPortalOpen: false,
  setAdminPortalOpen: (open) => set({ isAdminPortalOpen: open }),
  isLicensePromptOpen: false,
  setLicensePromptOpen: (open) => set({ isLicensePromptOpen: open }),
  isGraduationPromptOpen: false,
  setGraduationPromptOpen: (open) => set({ isGraduationPromptOpen: open }),

  isNotificationCenterOpen: false,
  setNotificationCenterOpen: (open) => set({ isNotificationCenterOpen: open }),

  closeActiveModalOrReturn: () => {
    const s = get();
    if (s.isLogoutConfirmOpen) { set({ isLogoutConfirmOpen: false }); return true; }
    if (s.isStudioSettingsOpen) { set({ isStudioSettingsOpen: false }); return true; }
    if (s.isAddClientOpen) { set({ isAddClientOpen: false, editingClient: null }); return true; }
    if (s.isCollectDepositOpen) { set({ isCollectDepositOpen: false, targetDeposit: null }); return true; }
    if (s.isAddApprenticeOpen) { set({ isAddApprenticeOpen: false }); return true; }
    if (s.isBookSessionOpen) { set({ isBookSessionOpen: false, preselectedBookingClient: null }); return true; }
    if (s.isLogTransactionOpen) { set({ isLogTransactionOpen: false }); return true; }
    if (s.isCustomerTrackerOpen) { set({ isCustomerTrackerOpen: false }); return true; }
    if (s.measurementClient) { set({ measurementClient: null }); return true; }
    if (s.invoiceClient) { set({ invoiceClient: null }); return true; }
    if (s.specSheetClient) { set({ specSheetClient: null }); return true; }
    if (s.fullMeasurementsClient) { set({ fullMeasurementsClient: null }); return true; }
    if (s.reorderClient) { set({ reorderClient: null }); return true; }
    if (s.profileClient) { set({ profileClient: null }); return true; }
    if (s.isAddMaterialOpen) { set({ isAddMaterialOpen: false }); return true; }
    if (s.isCustomTaskOpen) { set({ isCustomTaskOpen: false }); return true; }
    if (s.isMasterCertOpen) { set({ isMasterCertOpen: false }); return true; }
    if (s.isFabricScannerOpen) { set({ isFabricScannerOpen: false }); return true; }
    if (s.isSubscriptionModalOpen) { set({ isSubscriptionModalOpen: false }); return true; }
    if (s.graduationPaymentApprentice) { set({ graduationPaymentApprentice: null }); return true; }
    if (s.isAdminPortalOpen) { set({ isAdminPortalOpen: false }); return true; }
    if (s.isLicensePromptOpen) { set({ isLicensePromptOpen: false }); return true; }
    if (s.isGraduationPromptOpen) { set({ isGraduationPromptOpen: false }); return true; }
    if (s.isNotificationCenterOpen) { set({ isNotificationCenterOpen: false }); return true; }
    return false;
  }
}));
