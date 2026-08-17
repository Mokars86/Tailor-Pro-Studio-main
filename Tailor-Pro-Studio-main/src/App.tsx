import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { TabType, Client, Apprentice, UnpaidDeposit, RunwaySession, LedgerTransaction, InventoryItem, ShopStats, StudioSettings, UserRole, RunwayStage, GarmentMeasurements, ApprenticeTask, ApprenticeTaskStatus } from './types';
import {
  initialClients,
  initialApprentices,
  initialUnpaidDeposits,
  initialRunwaySessions,
  initialLedgerTransactions,
  initialInventoryItems,
  initialStats,
  defaultStudioSettings
} from './data/mockData';
import { generateMasterWorkshopCode, validateWorkshopCode } from './utils/workshopCode';
import {
  fetchClientsFromSupabase,
  upsertClientToSupabase,
  fetchApprenticesFromSupabase,
  upsertApprenticeToSupabase,
  deleteApprenticeFromSupabase,
  fetchApprenticeTasksFromSupabase,
  upsertApprenticeTaskToSupabase,
  fetchUnpaidDepositsFromSupabase,
  upsertUnpaidDepositToSupabase,
  deleteUnpaidDepositFromSupabase,
  fetchRunwaySessionsFromSupabase,
  upsertRunwaySessionToSupabase,
  fetchLedgerTransactionsFromSupabase,
  upsertLedgerTransactionToSupabase,
  fetchInventoryItemsFromSupabase,
  upsertInventoryItemToSupabase,
  fetchStudioSettingsFromSupabase,
  upsertStudioSettingsToSupabase,
  seedInitialSupabaseData,
  signUpSupabaseUser,
  signInSupabaseUser
} from './services/supabaseService';
import {
  subscribeNetworkStatus,
  queueOfflineAction,
  flushOfflineQueue
} from './services/offlineSyncService';


import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { ApprenticeRegistry } from './components/ApprenticeRegistry';
import { SearchBarAndFilters } from './components/SearchBarAndFilters';
import { CustomerDirectory } from './components/CustomerDirectory';
import { BottomNav } from './components/BottomNav';
import { RunwayView } from './components/RunwayView';
import { LedgerView } from './components/LedgerView';
import { InventoryView } from './components/InventoryView';

import { SignInView } from './components/auth/SignInView';
import { RegisterStudioView } from './components/auth/RegisterStudioView';

import { AddClientModal } from './components/modals/AddClientModal';
import { CollectDepositModal } from './components/modals/CollectDepositModal';
import { AddApprenticeModal } from './components/modals/AddApprenticeModal';
import { BookSessionModal } from './components/modals/BookSessionModal';
import { LogTransactionModal } from './components/modals/LogTransactionModal';

import { CustomerTrackingModal } from './components/modals/CustomerTrackingModal';
import { StudioSettingsModal } from './components/modals/StudioSettingsModal';
import { GarmentMeasurementsModal } from './components/modals/GarmentMeasurementsModal';
import { SpecSheetModal } from './components/modals/SpecSheetModal';
import { AddMaterialModal } from './components/modals/AddMaterialModal';
import { CustomTaskModal } from './components/modals/CustomTaskModal';
import { InvoiceModal } from './components/modals/InvoiceModal';
import { ClientProfileModal } from './components/modals/ClientProfileModal';
import { ApprenticeCertificateModal } from './components/modals/ApprenticeCertificateModal';
import { MasterCertificateModal } from './components/modals/MasterCertificateModal';
import { ApprenticeMasterGraduationModal } from './components/modals/ApprenticeMasterGraduationModal';
import { FullMeasurementsModal } from './components/modals/FullMeasurementsModal';
import { FabricColorScannerModal } from './components/modals/FabricColorScannerModal';
import { LogoutConfirmationModal } from './components/modals/LogoutConfirmationModal';
import { InstallAppModal } from './components/modals/InstallAppModal';

import { ApprenticeAppView } from './components/apprentice/ApprenticeAppView';
import { SplashScreen } from './components/SplashScreen';
import { SuperAdminPortal } from './components/admin/SuperAdminPortal';
import { LicenseKeyVerificationModal } from './components/auth/LicenseKeyVerificationModal';
import {
  getUserAccountRecords,
  saveUserAccountRecords,
  registerUserAccount,
  isWorkspaceActivated
} from './services/licenseService';

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Authentication & View Screen State (Starts at 'signin' login screen after splash screen)
  const [authScreen, setAuthScreen] = useState<'signin' | 'register' | 'app'>('signin');
  const [userRole, setUserRole] = useState<UserRole>('Master (Studio Owner & Financial Control)');

  // Admin & License Verification State
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);
  const [isLicensePromptOpen, setIsLicensePromptOpen] = useState<boolean>(false);
  const [isGraduationPromptOpen, setIsGraduationPromptOpen] = useState<boolean>(false);
  const [activeUserEmail, setActiveUserEmail] = useState<string>('');

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<TabType>('clients');

  const isMockId = (id?: string) =>
    ['cli-1', 'cli-2', 'cli-3', 'cli-4', 'app-1', 'app_raeesa_mubarick', 'app_raeesa_mohammed', 'dep-1', 'dep-2', 'tx-1', 'tx-2', 'inv-1', 'inv-2', 'inv-3', 'run-1', 'run-2'].includes(id || '');

  // Studio Settings State
  const [studioSettings, setStudioSettings] = useState<StudioSettings>(() => {
    try {
      const saved = localStorage.getItem('tailor_studio_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const settings: StudioSettings = { ...defaultStudioSettings, ...parsed };
          if (!settings.pairCode || !validateWorkshopCode(settings.pairCode).isValid) {
            settings.pairCode = generateMasterWorkshopCode(settings.studioName || 'MOKARS STITCHES STUDIO');
            localStorage.setItem('tailor_studio_settings', JSON.stringify(settings));
          }
          return settings;
        }
      }
    } catch (e) {
      console.error('Error loading studio settings:', e);
    }
    const fallback = { ...defaultStudioSettings };
    if (!fallback.pairCode) {
      fallback.pairCode = generateMasterWorkshopCode(fallback.studioName);
    }
    return fallback;
  });

  // Core app state with LocalStorage persistence (clean real data mode)
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('tailor_clients');
    if (saved) {
      try {
        const parsed: Client[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c) => c && !isMockId(c.id));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [apprentices, setApprentices] = useState<Apprentice[]>(() => {
    const saved = localStorage.getItem('tailor_apprentices');
    if (saved) {
      try {
        const parsed: Apprentice[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((a) => a && !isMockId(a.id));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [unpaidDeposits, setUnpaidDeposits] = useState<UnpaidDeposit[]>(() => {
    const saved = localStorage.getItem('tailor_deposits');
    if (saved) {
      const parsed: UnpaidDeposit[] = JSON.parse(saved);
      return parsed.filter((d) => !isMockId(d.id));
    }
    return [];
  });

  const [sessions, setSessions] = useState<RunwaySession[]>(() => {
    const saved = localStorage.getItem('tailor_sessions');
    if (saved) {
      const parsed: RunwaySession[] = JSON.parse(saved);
      return parsed.filter((s) => !isMockId(s.id));
    }
    return [];
  });

  const [transactions, setTransactions] = useState<LedgerTransaction[]>(() => {
    const saved = localStorage.getItem('tailor_transactions');
    if (saved) {
      const parsed: LedgerTransaction[] = JSON.parse(saved);
      return parsed.filter((t) => !isMockId(t.id));
    }
    return [];
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('tailor_inventory');
    if (saved) {
      const parsed: InventoryItem[] = JSON.parse(saved);
      return parsed.filter((i) => !isMockId(i.id));
    }
    return [];
  });

  const [apprenticeTasks, setApprenticeTasks] = useState<ApprenticeTask[]>(() => {
    const saved = localStorage.getItem('tailor_apprentice_tasks');
    if (saved) {
      try {
        const parsed: ApprenticeTask[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((t) => t && !isMockId(t.id));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Dynamically compute real Shop Stats directly from active user & customer directory records
  const stats: ShopStats = React.useMemo(() => {
    // Total cash collected from all clients in Customer Directory
    const clientRevenue = clients.reduce((sum, c) => sum + (c.depositPaid || 0), 0);
    // Plus any extra non-client cleared revenue in transactions
    const extraRevenue = transactions
      .filter((t) => (t.type === 'deposit' || t.type === 'revenue') && t.status === 'cleared' && !t.clientOrVendor)
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const shopRevenue = clientRevenue + extraRevenue;

    // Total unpaid deposits / balance due directly from active clients in Customer Directory
    const clientUnpaidBalance = clients
      .filter((c) => (c.balanceDue || 0) > 0)
      .reduce((sum, c) => sum + (c.balanceDue || 0), 0);

    const depositListAmount = unpaidDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    const unpaidDepositsAmount = clientUnpaidBalance > 0 ? clientUnpaidBalance : depositListAmount;

    const totalCostAll = clients.reduce((sum, c) => sum + (c.totalCost || 0), 0);
    const paidAll = clients.reduce((sum, c) => sum + (c.depositPaid || 0), 0);
    const collectionRate = totalCostAll > 0 ? Math.round((paidAll / totalCostAll) * 100) : 0;
    const completedCount = clients.filter((c) => c.runwayStage === 'COMPLETED' || c.runwayStage === 'DELIVERED').length;

    return {
      shopRevenue,
      unpaidDeposits: unpaidDepositsAmount,
      cashReceived: shopRevenue,
      jobsCompletedTotal: clients.length,
      jobsCompletedCount: completedCount,
      paymentCollectionRate: collectionRate
    };
  }, [transactions, unpaidDeposits, clients]);

  // Supabase Sync & Network Status
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'syncing' | 'offline'>('syncing');
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  // Offline Network & Background Auto-Sync Listener
  useEffect(() => {
    const unsubscribe = subscribeNetworkStatus((isOnline, flushedCount) => {
      if (isOnline) {
        setSupabaseStatus('connected');
        const msg = flushedCount && flushedCount > 0
          ? `Back Online 🌐 — Synced ${flushedCount} offline change(s) to cloud!`
          : `Back Online 🌐 — Connected to cloud!`;
        setOfflineNotice(msg);
        setTimeout(() => setOfflineNotice(null), 3500);
      } else {
        setSupabaseStatus('offline');
        setOfflineNotice(`Offline Mode 📶 — All changes saved locally and will sync when reconnected.`);
      }
    });

    if (navigator.onLine) {
      flushOfflineQueue().then((res) => {
        if (res.syncedCount > 0) {
          setOfflineNotice(`Synced ${res.syncedCount} offline change(s) to cloud!`);
          setTimeout(() => setOfflineNotice(null), 3500);
        }
      });
    }

    return () => unsubscribe();
  }, []);

  // Initialize Supabase Sync on Mount
  useEffect(() => {
    let isMounted = true;
    async function initSupabaseSync() {
      try {
        setSupabaseStatus('syncing');
        await seedInitialSupabaseData(
          initialClients,
          initialApprentices,
          initialUnpaidDeposits,
          initialRunwaySessions,
          initialLedgerTransactions,
          initialInventoryItems,
          defaultStudioSettings
        );

        const dbClients = await fetchClientsFromSupabase();
        if (dbClients && dbClients.length > 0 && isMounted) {
          setClients(dbClients);
        }

        const dbApprentices = await fetchApprenticesFromSupabase();
        if (dbApprentices && dbApprentices.length > 0 && isMounted) {
          setApprentices(dbApprentices);
        }

        const dbTasks = await fetchApprenticeTasksFromSupabase();
        if (dbTasks && dbTasks.length > 0 && isMounted) {
          setApprenticeTasks(dbTasks);
          localStorage.setItem('tailor_apprentice_tasks', JSON.stringify(dbTasks));
        }

        const dbDeposits = await fetchUnpaidDepositsFromSupabase();
        if (dbDeposits && dbDeposits.length > 0 && isMounted) {
          setUnpaidDeposits(dbDeposits);
        }

        const dbSessions = await fetchRunwaySessionsFromSupabase();
        if (dbSessions && dbSessions.length > 0 && isMounted) {
          setSessions(dbSessions);
        }

        const dbTx = await fetchLedgerTransactionsFromSupabase();
        if (dbTx && dbTx.length > 0 && isMounted) {
          setTransactions(dbTx);
        }

        const dbInv = await fetchInventoryItemsFromSupabase();
        if (dbInv && dbInv.length > 0 && isMounted) {
          setInventory(dbInv);
        }

        const dbSettings = await fetchStudioSettingsFromSupabase();
        if (dbSettings && isMounted) {
          setStudioSettings(dbSettings);
        }

        if (isMounted) {
          setSupabaseStatus('connected');
        }
      } catch (err) {
        console.warn('[Supabase Sync] Operating with local cache:', err);
        if (isMounted) setSupabaseStatus('offline');
      }
    }

    initSupabaseSync();
    return () => {
      isMounted = false;
    };
  }, []);

  // Search & Filter state for Customer Directory
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedArtistFilter, setSelectedArtistFilter] = useState<string>('all');

  // Modal controls
  const [isAddClientOpen, setIsAddClientOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isCollectDepositOpen, setIsCollectDepositOpen] = useState<boolean>(false);
  const [targetDeposit, setTargetDeposit] = useState<UnpaidDeposit | null>(null);

  const [isAddApprenticeOpen, setIsAddApprenticeOpen] = useState<boolean>(false);

  const [isBookSessionOpen, setIsBookSessionOpen] = useState<boolean>(false);
  const [preselectedBookingClient, setPreselectedBookingClient] = useState<Client | null>(null);

  const [isLogTransactionOpen, setIsLogTransactionOpen] = useState<boolean>(false);

  // New Modals State
  const [isCustomerTrackerOpen, setIsCustomerTrackerOpen] = useState<boolean>(false);
  const [isStudioSettingsOpen, setIsStudioSettingsOpen] = useState<boolean>(false);
  const [measurementClient, setMeasurementClient] = useState<Client | null>(null);
  const [invoiceClient, setInvoiceClient] = useState<Client | null>(null);
  const [specSheetClient, setSpecSheetClient] = useState<Client | null>(null);
  const [fullMeasurementsClient, setFullMeasurementsClient] = useState<Client | null>(null);
  const [profileClient, setProfileClient] = useState<Client | null>(null);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState<boolean>(false);
  const [isCustomTaskOpen, setIsCustomTaskOpen] = useState<boolean>(false);
  const [isMasterCertOpen, setIsMasterCertOpen] = useState<boolean>(false);
  const [isFabricScannerOpen, setIsFabricScannerOpen] = useState<boolean>(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState<boolean>(false);
  const [isInstallAppOpen, setIsInstallAppOpen] = useState<boolean>(false);

  // Auto-prompt Desktop PWA install on Chrome when visiting Netlify link
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    const dismissed = sessionStorage.getItem('tailor_pwa_prompt_dismissed');

    if (!isStandalone && !dismissed) {
      const timer = setTimeout(() => {
        setIsInstallAppOpen(true);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, []);

  const handlePromptLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    setIsStudioSettingsOpen(false);
    setIsLicensePromptOpen(false);
    document.documentElement.classList.remove('dark');
    setAuthScreen('signin');
  };

  const handleAddMaterialToInventory = (name: string, unit: string, amount: number) => {
    const newItem: InventoryItem = {
      id: `mat_${Date.now()}`,
      name,
      category: 'THREAD',
      stockLevel: amount,
      minThreshold: 5,
      alertThreshold: 5,
      unit,
      status: amount > 0 ? 'In Stock' : 'Out of Stock'
    };
    setInventory((prev) => [newItem, ...prev]);
    upsertInventoryItemToSupabase(newItem);
  };

  // Sync to LocalStorage & Root DOM Dark Mode class (only active when logged into app view)
  useEffect(() => {
    localStorage.setItem('tailor_studio_settings', JSON.stringify(studioSettings));
    if (studioSettings.theme === 'dark' && authScreen === 'app') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [studioSettings, authScreen]);

  useEffect(() => {
    localStorage.setItem('tailor_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('tailor_apprentices', JSON.stringify(apprentices));
  }, [apprentices]);

  useEffect(() => {
    localStorage.setItem('tailor_deposits', JSON.stringify(unpaidDeposits));
  }, [unpaidDeposits]);

  useEffect(() => {
    localStorage.setItem('tailor_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('tailor_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('tailor_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('tailor_apprentice_tasks', JSON.stringify(apprenticeTasks));
  }, [apprenticeTasks]);

  // Hardware & Phone Back Key Event Handling (Android Back Button & Web PopState)
  useEffect(() => {
    const handleBackButton = () => {
      // 1. Close active modals if open
      if (isLogoutConfirmOpen) { setIsLogoutConfirmOpen(false); return; }
      if (isStudioSettingsOpen) { setIsStudioSettingsOpen(false); return; }
      if (isAddClientOpen) { setIsAddClientOpen(false); setEditingClient(null); return; }
      if (isCollectDepositOpen) { setIsCollectDepositOpen(false); setTargetDeposit(null); return; }
      if (isAddApprenticeOpen) { setIsAddApprenticeOpen(false); return; }
      if (isBookSessionOpen) { setIsBookSessionOpen(false); setPreselectedBookingClient(null); return; }
      if (isLogTransactionOpen) { setIsLogTransactionOpen(false); return; }
      if (isCustomerTrackerOpen) { setIsCustomerTrackerOpen(false); return; }
      if (measurementClient) { setMeasurementClient(null); return; }
      if (invoiceClient) { setInvoiceClient(null); return; }
      if (specSheetClient) { setSpecSheetClient(null); return; }
      if (fullMeasurementsClient) { setFullMeasurementsClient(null); return; }
      if (profileClient) { setProfileClient(null); return; }
      if (isAddMaterialOpen) { setIsAddMaterialOpen(false); return; }
      if (isCustomTaskOpen) { setIsCustomTaskOpen(false); return; }
      if (isMasterCertOpen) { setIsMasterCertOpen(false); return; }
      if (isFabricScannerOpen) { setIsFabricScannerOpen(false); return; }

      // 2. Return to home tab if on a sub-tab
      if (activeTab !== 'clients') {
        setActiveTab('clients');
        return;
      }

      // 3. Otherwise minimize native app on phone
      CapacitorApp.minimizeApp();
    };

    let backListener: any = null;
    CapacitorApp.addListener('backButton', handleBackButton).then((l) => {
      backListener = l;
    });

    const handlePopState = () => {
      handleBackButton();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      if (backListener) backListener.remove();
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    isLogoutConfirmOpen,
    isStudioSettingsOpen,
    isAddClientOpen,
    isCollectDepositOpen,
    isAddApprenticeOpen,
    isBookSessionOpen,
    isLogTransactionOpen,
    isCustomerTrackerOpen,
    measurementClient,
    invoiceClient,
    specSheetClient,
    fullMeasurementsClient,
    profileClient,
    isAddMaterialOpen,
    isCustomTaskOpen,
    isMasterCertOpen,
    isFabricScannerOpen,
    activeTab
  ]);

  // Derived list of studio tailors & designers (dynamic from studio owner & registered apprentices)
  const artistsList = React.useMemo(() => {
    const owner = studioSettings.ownerName || studioSettings.studioName || 'Master Atelier';
    const list = [
      owner,
      'Master Atelier',
      ...apprentices.map((a) => a.name),
      ...clients.map((c) => c.assignedDesigner).filter((d): d is string => Boolean(d))
    ];
    return Array.from(new Set(list)).filter(Boolean);
  }, [studioSettings.ownerName, studioSettings.studioName, apprentices, clients]);

  // Filter clients
  const filteredClients = clients.filter((client) => {
    // Text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = client.name.toLowerCase().includes(q);
      const garmentTagMatch = client.garmentTag.toLowerCase().includes(q);
      const emailMatch = client.email.toLowerCase().includes(q);
      const phoneMatch = client.phone.includes(q);

      if (!nameMatch && !garmentTagMatch && !emailMatch && !phoneMatch) {
        return false;
      }
    }

    // Filter chip
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'VIP' && client.status !== 'VIP') return false;
      if (selectedFilter === 'Pending Deposit' && client.status !== 'Pending Deposit') return false;
      if (selectedFilter === 'Active' && client.status !== 'Active') return false;
    }

    // Designer filter
    if (selectedArtistFilter !== 'all' && client.assignedDesigner !== selectedArtistFilter) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    if (authScreen === 'app' && userRole.startsWith('Apprentice')) {
      const activeApp = apprentices.find((a) => a.isLinked) || apprentices[0];
      if (activeApp && !activeApp.handshakeLocked) {
        const dismissed = sessionStorage.getItem('tailor_graduation_dismissed');
        if (!dismissed) {
          setIsGraduationPromptOpen(true);
        }
      }
    }
  }, [authScreen, userRole, apprentices]);

  const handleGraduateToMasterStudio = (newStudioName: string, ownerName: string, newWorkshopCode: string) => {
    setStudioSettings((prev) => ({
      ...prev,
      studioName: newStudioName,
      ownerName: ownerName,
      pairCode: newWorkshopCode
    }));
    setUserRole('Master (Studio Owner & Financial Control)');
    setIsGraduationPromptOpen(false);
    sessionStorage.setItem('tailor_graduation_dismissed', 'true');
  };



  const handleSaveClient = (savedClient: Client) => {
    setClients((prev) => {
      const exists = prev.some((c) => c.id === savedClient.id);
      if (exists) {
        return prev.map((c) => (c.id === savedClient.id ? savedClient : c));
      }
      return [savedClient, ...prev];
    });
    upsertClientToSupabase(savedClient);
    queueOfflineAction('client', savedClient);
  };

  const handleUpdateMeasurements = (clientId: string, measurements: GarmentMeasurements) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const updated = { ...c, measurements };
          upsertClientToSupabase(updated);
          queueOfflineAction('client', updated);
          return updated;
        }
        return c;
      })
    );
    setProfileClient((prev) =>
      prev && prev.id === clientId ? { ...prev, measurements } : prev
    );
    setFullMeasurementsClient((prev) =>
      prev && prev.id === clientId ? { ...prev, measurements } : prev
    );
  };

  const handleAdvanceRunwayStage = (clientId: string, newStage: RunwayStage) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const updated = { ...c, runwayStage: newStage };
          upsertClientToSupabase(updated);
          queueOfflineAction('client', updated);
          return updated;
        }
        return c;
      })
    );
  };

  const handleUpdateApprenticeHours = (id: string, additionalHours: number) => {
    setApprentices((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const newHours = app.hoursCompleted + additionalHours;
          const updated: Apprentice = {
            ...app,
            hoursCompleted: newHours,
            status: newHours >= 450 ? 'Graduating' : app.status
          };
          upsertApprenticeToSupabase(updated);
          queueOfflineAction('apprentice', updated);
          return updated;
        }
        return app;
      })
    );
  };

  const handleSaveApprentice = (newApprentice: Apprentice) => {
    setApprentices((prev) => [newApprentice, ...prev]);
    upsertApprenticeToSupabase(newApprentice);
    queueOfflineAction('apprentice', newApprentice);
  };

  const handleToggleApprenticeHandshake = (id: string) => {
    setApprentices((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const updated: Apprentice = {
            ...app,
            handshakeLocked: !app.handshakeLocked,
            hasCert: true,
          };
          upsertApprenticeToSupabase(updated);
          queueOfflineAction('apprentice', updated);
          return updated;
        }
        return app;
      })
    );
  };

  const handleProcessDepositCollection = (depositId: string, paymentMethod: string) => {
    const dep = unpaidDeposits.find((d) => d.id === depositId);
    if (!dep) return;

    // Remove from unpaid deposits list & Supabase DB
    setUnpaidDeposits((prev) => prev.filter((d) => d.id !== depositId));
    deleteUnpaidDepositFromSupabase(depositId);

    // Update client balance due & Supabase DB
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === dep.clientId) {
          const updated = {
            ...c,
            depositPaid: c.depositPaid + dep.amount,
            balanceDue: Math.max(0, c.balanceDue - dep.amount)
          };
          upsertClientToSupabase(updated);
          return updated;
        }
        return c;
      })
    );

    // Add transaction to ledger & Supabase DB
    const newTx: LedgerTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'deposit',
      category: 'Client Deposit',
      description: `Deposit Cleared - ${dep.clientName} (${dep.garmentTag})`,
      amount: dep.amount,
      clientOrVendor: dep.clientName,
      status: 'cleared',
      method: paymentMethod as LedgerTransaction['method']
    };

    setTransactions((prev) => [newTx, ...prev]);
    upsertLedgerTransactionToSupabase(newTx);
  };

  const handleBookSession = (newSession: RunwaySession) => {
    setSessions((prev) => [newSession, ...prev]);
    upsertRunwaySessionToSupabase(newSession);
  };

  const handleUpdateSessionStatus = (id: string, newStatus: RunwaySession['status']) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, status: newStatus };
          upsertRunwaySessionToSupabase(updated);
          return updated;
        }
        return s;
      })
    );
  };

  const handleSaveTransaction = (newTx: LedgerTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    upsertLedgerTransactionToSupabase(newTx);
    queueOfflineAction('transaction', newTx);
  };

  const handleRestockInventoryItem = (id: string, amount: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stockLevel + amount);
          const updated = {
            ...item,
            stockLevel: newStock,
            status: newStock > item.minThreshold ? 'In Stock' : 'Low Stock'
          };
          upsertInventoryItemToSupabase(updated);
          queueOfflineAction('inventory', updated);
          return updated;
        }
        return item;
      })
    );
  };

  const handleSaveMaterial = (newItem: InventoryItem) => {
    setInventory((prev) => [newItem, ...prev]);
    upsertInventoryItemToSupabase(newItem);
    queueOfflineAction('inventory', newItem);
  };

  const handleSaveTask = (taskData: string | { title: string; assignedTo?: string; category?: string; masterNotes?: string }) => {
    const title = typeof taskData === 'string' ? taskData : taskData.title;
    const assignedTo = typeof taskData === 'object' && taskData.assignedTo ? taskData.assignedTo : 'all';
    const category = typeof taskData === 'object' && taskData.category ? taskData.category : 'Master Workshop Assignment';
    const masterNotes = typeof taskData === 'object' && taskData.masterNotes ? taskData.masterNotes : 'Assigned by Master Trainer.';

    const newTask: ApprenticeTask = {
      id: `task_${Date.now()}`,
      title,
      assignedTo,
      isCompleted: false,
      status: 'in_progress',
      category,
      masterNotes
    };

    setApprenticeTasks((prev) => {
      const updated = [newTask, ...prev];
      localStorage.setItem('tailor_apprentice_tasks', JSON.stringify(updated));
      return updated;
    });
    upsertApprenticeTaskToSupabase(newTask);
    queueOfflineAction('task', newTask);
  };

  const handleCompleteTask = (taskId: string) => {
    setApprenticeTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          const u = {
            ...t,
            isCompleted: true,
            status: 'review_pending' as ApprenticeTaskStatus,
            completedAt: new Date().toISOString().split('T')[0]
          };
          upsertApprenticeTaskToSupabase(u);
          queueOfflineAction('task', u);
          return u;
        }
        return t;
      });
      localStorage.setItem('tailor_apprentice_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const handlePassTask = (taskId: string) => {
    setApprenticeTasks((prev) => {
      const targetTask = prev.find((t) => t.id === taskId);
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          const u = {
            ...t,
            isCompleted: true,
            status: 'passed' as ApprenticeTaskStatus,
            passedAt: new Date().toISOString().split('T')[0]
          };
          upsertApprenticeTaskToSupabase(u);
          queueOfflineAction('task', u);
          return u;
        }
        return t;
      });
      localStorage.setItem('tailor_apprentice_tasks', JSON.stringify(updated));

      if (targetTask) {
        setApprentices((appPrev) => {
          const appUpdated = appPrev.map((a) => {
            if (!targetTask.assignedTo || targetTask.assignedTo === 'all' || targetTask.assignedTo === a.id || targetTask.assignedTo === a.name) {
              return { ...a, tasksCount: (a.tasksCount || 0) + 1 };
            }
            return a;
          });
          localStorage.setItem('tailor_apprentices', JSON.stringify(appUpdated));
          return appUpdated;
        });
      }
      return updated;
    });
  };

  const handleSyncNewWorkshopCode = (newCode: string) => {
    setStudioSettings((prev) => ({ ...prev, pairCode: newCode }));

    const rawName = activeUserEmail ? activeUserEmail.split('@')[0] : 'Raeesa Mohammed';
    let apprenticeName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    if (apprenticeName.toLowerCase() === 'mubareeq' || apprenticeName.toLowerCase() === 'apprentice trainee' || apprenticeName.toLowerCase() === 'designer') {
      apprenticeName = 'Raeesa Mohammed';
    }
    const apprenticeId = 'app_raeesa_mohammed';
    const initials = 'RM';

    const linkedApprentice: Apprentice = {
      id: apprenticeId,
      name: 'Raeesa Mohammed',
      initials: 'RM',
      role: 'Apprentice Trainee',
      mentor: studioSettings.ownerName || 'Kausar Mohammed',
      isLinked: true,
      handshakeLocked: true,
      hasCert: false,
      hoursCompleted: 0,
      totalRequiredHours: 120,
      certifications: [],
      tasksCount: 0,
      status: 'On Track',
      specialty: 'Couture Assembly & Garment Construction'
    };

    setApprentices((prev) => {
      const exists = prev.some((a) => a.id === linkedApprentice.id || a.name.toLowerCase() === linkedApprentice.name.toLowerCase());
      if (exists) {
        return prev.map((a) =>
          a.id === linkedApprentice.id || a.name.toLowerCase() === linkedApprentice.name.toLowerCase()
            ? { ...a, isLinked: true }
            : a
        );
      }
      return [linkedApprentice, ...prev];
    });

    upsertApprenticeToSupabase(linkedApprentice);
  };

  const handleRefreshApprentices = async () => {
    const local = localStorage.getItem('tailor_apprentices');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setApprentices(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    const dbApprentices = await fetchApprenticesFromSupabase();
    if (dbApprentices && dbApprentices.length > 0) {
      setApprentices(dbApprentices);
    }
  };

  const handleUnlinkApprentice = (apprenticeId: string) => {
    setApprentices((prev) => {
      const updated = prev.filter((a) => a.id !== apprenticeId);
      localStorage.setItem('tailor_apprentices', JSON.stringify(updated));
      return updated;
    });
    deleteApprenticeFromSupabase(apprenticeId);
  };

  // App theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(
    studioSettings.theme || 'light'
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    setStudioSettings((prev) => ({ ...prev, theme: newTheme }));
  };

  const handleSignInSuccess = (email: string, selectedRole?: UserRole) => {
    const userEmail = email.trim() || 'designer@tailorpro.com';
    setActiveUserEmail(userEmail);
    const users = getUserAccountRecords();
    const workspaceActivated = isWorkspaceActivated();

    const isApprenticeEmail =
      userEmail.toLowerCase().includes('apprentice') ||
      userEmail.toLowerCase().includes('trainee') ||
      userEmail.toLowerCase().includes('scholar') ||
      userEmail.toLowerCase().includes('raeesa') ||
      userEmail.toLowerCase().includes('mubarick');

    let resolvedRole: UserRole = selectedRole || (isApprenticeEmail ? 'Apprentice (Trainee & CAD Blueprint View)' : 'Master (Studio Owner & Financial Control)');

    const user = users.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());

    if (user) {
      if (selectedRole) {
        resolvedRole = selectedRole;
        user.role = selectedRole;
      }
      if (workspaceActivated) {
        user.status = 'approved';
      }
      saveUserAccountRecords(users);

      setUserRole(resolvedRole);

      if (user.status === 'approved' || workspaceActivated) {
        setIsLicensePromptOpen(false);
        setAuthScreen('app');
      } else {
        setIsLicensePromptOpen(true);
      }
    } else {
      const registered = registerUserAccount({
        email: userEmail,
        fullName: isApprenticeEmail ? 'Raeesa Mohammed' : 'Atelier Designer',
        studioName: studioSettings.studioName || 'My Atelier Studio',
        role: resolvedRole
      });

      setUserRole(resolvedRole);

      if (registered.status === 'approved' || workspaceActivated) {
        setIsLicensePromptOpen(false);
        setAuthScreen('app');
      } else {
        setIsLicensePromptOpen(true);
      }
    }
  };

  const handleRegisterSuccess = (
    studioName: string,
    role: UserRole,
    email: string,
    licenseKey?: string,
    fullName?: string,
    masterWorkshopCode?: string,
    password?: string
  ) => {
    const userEmail = email.trim() || 'designer@tailorpro.com';
    const masterBrandName = studioName && studioName.trim() ? studioName.trim() : 'TAILOR PRO STUDIO';

    if (password && userEmail) {
      signUpSupabaseUser(userEmail, password, {
        fullName: fullName || 'Atelier Designer',
        role,
        studioName: masterBrandName
      });
    }

    const isApprentice = role.startsWith('Apprentice');
    const newPairCode = isApprentice
      ? (masterWorkshopCode && masterWorkshopCode.trim() ? masterWorkshopCode.trim() : (studioSettings.pairCode || generateMasterWorkshopCode(masterBrandName)))
      : generateMasterWorkshopCode(masterBrandName);

    const updatedSettings: StudioSettings = {
      ...studioSettings,
      studioName: masterBrandName,
      pairCode: newPairCode
    };

    setStudioSettings(updatedSettings);
    localStorage.setItem('tailor_studio_settings', JSON.stringify(updatedSettings));
    upsertStudioSettingsToSupabase(updatedSettings);

    setUserRole(role);
    setActiveUserEmail(userEmail);

    if (role.startsWith('Apprentice')) {
      const rawName = fullName && fullName.trim() ? fullName.trim() : (userEmail ? userEmail.split('@')[0] : 'Raeesa Mohammed');
      let appName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      if (appName.toLowerCase() === 'mubareeq' || appName.toLowerCase() === 'apprentice trainee' || appName.toLowerCase() === 'designer') {
        appName = 'Raeesa Mohammed';
      }
      const initials = appName === 'Raeesa Mohammed' ? 'RM' : (appName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'RM');

      const newApprenticeRecord: Apprentice = {
        id: `app_${appName.toLowerCase().replace(/\s+/g, '_')}`,
        name: appName,
        initials,
        role: 'Apprentice Trainee',
        mentor: studioSettings.ownerName || 'Kausar Mohammed',
        isLinked: true,
        handshakeLocked: true,
        hasCert: false,
        hoursCompleted: 0,
        totalRequiredHours: 120,
        certifications: [],
        tasksCount: 0,
        status: 'On Track',
        specialty: 'Couture Assembly & Garment Construction'
      };

      setApprentices((prev) => {
        const filtered = prev.filter(
          (a) =>
            a.id !== 'app_raeesa_mubarick' &&
            a.name.toLowerCase() !== 'mubareeq' &&
            a.name.toLowerCase() !== appName.toLowerCase()
        );
        const updated = [newApprenticeRecord, ...filtered];
        localStorage.setItem('tailor_apprentices', JSON.stringify(updated));
        upsertApprenticeToSupabase(newApprenticeRecord);
        return updated;
      });
    }

    const registered = registerUserAccount({
      email: userEmail,
      fullName: fullName || 'Atelier Designer',
      studioName: masterBrandName,
      role,
      licenseKey
    });

    if (registered.status === 'approved' || isWorkspaceActivated()) {
      setIsLicensePromptOpen(false);
      setAuthScreen('app');
    } else {
      setIsLicensePromptOpen(true);
    }
  };

  // Render Splash Screen on initial load
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Render Customer Order Status Tracker Screen if opened from signin or app
  if (isCustomerTrackerOpen) {
    return (
      <CustomerTrackingModal
        clients={clients}
        onClose={() => setIsCustomerTrackerOpen(false)}
      />
    );
  }

  // Render Auth Views if not logged in
  if (authScreen === 'signin') {
    return (
      <>
        <SignInView
          onSignInSuccess={handleSignInSuccess}
          onGoToRegister={() => setAuthScreen('register')}
          onOpenCustomerTracker={() => setIsCustomerTrackerOpen(true)}
          onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
          onOpenInstallApp={() => setIsInstallAppOpen(true)}
        />
        <InstallAppModal
          isOpen={isInstallAppOpen}
          onClose={() => setIsInstallAppOpen(false)}
        />
        {isLicensePromptOpen && (
          <LicenseKeyVerificationModal
            userEmail={activeUserEmail}
            onActivated={() => {
              setIsLicensePromptOpen(false);
              setAuthScreen('app');
            }}
            onLogout={() => {
              setIsLicensePromptOpen(false);
              setAuthScreen('signin');
            }}
          />
        )}
        {isAdminPortalOpen && (
          <SuperAdminPortal
            isOpen={isAdminPortalOpen}
            onClose={() => setIsAdminPortalOpen(false)}
          />
        )}
      </>
    );
  }

  if (authScreen === 'register') {
    return (
      <>
        <RegisterStudioView
          onRegisterSuccess={handleRegisterSuccess}
          onGoToSignIn={() => setAuthScreen('signin')}
        />
        {isLicensePromptOpen && (
          <LicenseKeyVerificationModal
            userEmail={activeUserEmail}
            onActivated={() => {
              setIsLicensePromptOpen(false);
              setAuthScreen('app');
            }}
            onLogout={() => {
              setIsLicensePromptOpen(false);
              setAuthScreen('signin');
            }}
          />
        )}
        {isAdminPortalOpen && (
          <SuperAdminPortal
            isOpen={isAdminPortalOpen}
            onClose={() => setIsAdminPortalOpen(false)}
          />
        )}
      </>
    );
  }

  const handleUpdateApprenticeName = (newName: string) => {
    const cleanName = newName.trim();
    if (!cleanName) return;

    setApprentices((prev) => {
      const active = prev.find((a) => a.isLinked) || prev[0];
      const initials = cleanName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AT';
      
      let updatedList: Apprentice[];
      if (active) {
        const updated: Apprentice = {
          ...active,
          name: cleanName,
          initials,
          isLinked: true
        };
        upsertApprenticeToSupabase(updated);
        queueOfflineAction('apprentice', updated);
        updatedList = prev.map((a) => (a.id === active.id ? updated : a));
      } else {
        const newRecord: Apprentice = {
          id: `app_${cleanName.toLowerCase().replace(/\s+/g, '_')}`,
          name: cleanName,
          initials,
          role: 'Apprentice Trainee',
          mentor: studioSettings.ownerName || 'Kausar Mohammed',
          isLinked: true,
          handshakeLocked: true,
          hasCert: false,
          hoursCompleted: 120,
          totalRequiredHours: 120,
          certifications: [],
          tasksCount: 0,
          status: 'On Track',
          specialty: 'Couture Assembly & Garment Construction'
        };
        upsertApprenticeToSupabase(newRecord);
        queueOfflineAction('apprentice', newRecord);
        updatedList = [newRecord, ...prev];
      }

      localStorage.setItem('tailor_apprentices', JSON.stringify(updatedList));
      return updatedList;
    });
  };

  // Render Apprentice View if userRole is Apprentice
  if (userRole.startsWith('Apprentice')) {
    const activeAppRecord = apprentices.find((a) => a.isLinked) || apprentices[0];
    const resolvedAppName = activeAppRecord?.name || (activeUserEmail ? activeUserEmail.split('@')[0] : 'Apprentice Trainee');

    return (
      <>
        <ApprenticeAppView
          clients={clients}
          apprentices={apprentices}
          tasks={apprenticeTasks}
          studioName={
            studioSettings.studioName && studioSettings.studioName !== 'My Atelier Studio'
              ? studioSettings.studioName
              : 'MOKARS STITCHES STUDIO'
          }
          masterName={studioSettings.ownerName || 'Mubarik Tuahir Ali'}
          studioLogoUrl={studioSettings.logoUrl}
          workshopCode={studioSettings.pairCode}
          onSyncNewWorkshopCode={(newCode) => {
            handleSyncNewWorkshopCode(newCode);
          }}
          apprenticeName={resolvedAppName}
          onUpdateApprenticeName={handleUpdateApprenticeName}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onAdvanceStage={handleAdvanceRunwayStage}
          onOpenMeasurementsForClient={(client) => setMeasurementClient(client)}
          onOpenAddNewClient={() => {
            setEditingClient(null);
            setIsAddClientOpen(true);
          }}
          onSwitchRoleToMaster={() =>
            setUserRole('Master (Studio Owner & Financial Control)')
          }
          onLogout={handlePromptLogout}
          onCompleteTask={handleCompleteTask}
        />

        {/* Global Modals for Apprentice Actions */}
        <AddClientModal
          isOpen={isAddClientOpen}
          onClose={() => {
            setIsAddClientOpen(false);
            setEditingClient(null);
          }}
          onSaveClient={handleSaveClient}
          editingClient={editingClient}
          artistsList={artistsList}
        />

        {measurementClient && (
          <GarmentMeasurementsModal
            client={measurementClient}
            onSave={handleUpdateMeasurements}
            onClose={() => setMeasurementClient(null)}
          />
        )}

        <ApprenticeMasterGraduationModal
          isOpen={isGraduationPromptOpen}
          onClose={() => {
            setIsGraduationPromptOpen(false);
            sessionStorage.setItem('tailor_graduation_dismissed', 'true');
          }}
          apprenticeName={activeUserEmail ? activeUserEmail.split('@')[0] : 'Raeesa Mubarick'}
          masterName={studioSettings.ownerName || 'Mubarik Tuahir Ali'}
          onGraduateToMasterStudio={handleGraduateToMasterStudio}
        />

        <LogoutConfirmationModal
          isOpen={isLogoutConfirmOpen}
          onClose={() => setIsLogoutConfirmOpen(false)}
          onConfirm={handleConfirmLogout}
        />
      </>
    );
  }

  return (
    <div className={`min-h-screen md:pl-64 pt-36 sm:pt-32 md:pt-44 pb-32 sm:pb-36 transition-colors duration-300 font-['Plus_Jakarta_Sans',sans-serif] ${
      theme === 'dark'
        ? 'bg-[#061E1B] text-slate-100 dark'
        : 'bg-[#EBF5F0] text-[#0D3B36]'
    }`}>
      {/* Offline / Reconnection Toast Banner */}
      {offlineNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0D3B36] text-white px-5 py-2.5 rounded-full shadow-2xl border-2 border-[#DCA134] text-xs font-black flex items-center gap-2 animate-bounce max-w-sm text-center">
          <span>{offlineNotice}</span>
        </div>
      )}

      {/* App Header */}
      <Header
        studioSettings={studioSettings}
        onOpenStudioSettings={() => setIsStudioSettingsOpen(true)}
        onOpenAddClient={() => {
          setEditingClient(null);
          setIsAddClientOpen(true);
        }}
        onOpenBookSession={() => {
          setPreselectedBookingClient(null);
          setIsBookSessionOpen(true);
        }}
        activeTab={activeTab}
        userRole={userRole}
        onOpenMasterCertificate={() => setIsMasterCertOpen(true)}
        onOpenFabricScanner={() => setIsFabricScannerOpen(true)}
        onOpenInstallApp={() => setIsInstallAppOpen(true)}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        supabaseStatus={supabaseStatus}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-2.5 sm:px-6">
        {/* TAB 1: CLIENTS & MAIN DASHBOARD VIEW */}
        {activeTab === 'clients' && (
          <div className="animate-fade-in space-y-2">
            {/* 1. Metric Cards (Shop Revenue & Unpaid Deposits) */}
            <MetricCards
              stats={stats}
              unpaidDeposits={unpaidDeposits}
              clients={clients}
              onOpenCollectDeposit={(dep) => {
                setTargetDeposit(dep || null);
                setIsCollectDepositOpen(true);
              }}
              onOpenLedger={() => setActiveTab('ledger')}
              onOpenRunway={() => setActiveTab('runway')}
            />

            {/* 2. Apprentice Registry */}
            <ApprenticeRegistry
              apprentices={apprentices}
              tasks={apprenticeTasks}
              pairCode={studioSettings.pairCode}
              studioLogoUrl={studioSettings.logoUrl}
              studioName={studioSettings.studioName}
              masterTrainer={studioSettings.ownerName}
              onRefreshApprentices={handleRefreshApprentices}
              onOpenCustomTaskModal={() => setIsCustomTaskOpen(true)}
              onToggleHandshake={handleToggleApprenticeHandshake}
              onPassTask={handlePassTask}
              onUnlinkApprentice={handleUnlinkApprentice}
            />

            {/* 3. Search Bar & Filter Chips */}
            <SearchBarAndFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
              selectedArtistFilter={selectedArtistFilter}
              onArtistFilterChange={setSelectedArtistFilter}
              artistsList={artistsList}
              totalResultsCount={filteredClients.length}
            />

            {/* 4. Customer Directory */}
            <CustomerDirectory
              clients={filteredClients}
              unpaidDeposits={unpaidDeposits}
              onOpenCollectDeposit={(dep) => {
                setTargetDeposit(dep || null);
                setIsCollectDepositOpen(true);
              }}
              onOpenBookSessionForClient={(client) => {
                setPreselectedBookingClient(client);
                setIsBookSessionOpen(true);
              }}
              onEditClient={(client) => {
                setEditingClient(client);
                setIsAddClientOpen(true);
              }}
              onOpenMeasurements={(client) => setMeasurementClient(client)}
              onOpenFullMeasurements={(client) => setFullMeasurementsClient(client)}
              onOpenInvoice={(client) => setInvoiceClient(client)}
              onOpenNewConsult={() => {
                setEditingClient(null);
                setIsAddClientOpen(true);
              }}
              onSelectClient={(client) => setProfileClient(client)}
              onDeleteClient={(clientId) => {
                setClients((prev) => prev.filter((c) => c.id !== clientId));
              }}
              onAssignDuty={() => setIsCustomTaskOpen(true)}
            />
          </div>
        )}

        {/* TAB 2: RUNWAY VIEW */}
        {activeTab === 'runway' && (
          <div className="animate-fade-in">
            <RunwayView
              clients={clients}
              onAdvanceStage={handleAdvanceRunwayStage}
              onOpenBookSession={() => setIsBookSessionOpen(true)}
            />
          </div>
        )}

        {/* TAB 3: LEDGER VIEW */}
        {activeTab === 'ledger' && (
          <div className="animate-fade-in">
            <LedgerView
              transactions={transactions}
              clients={clients}
              onOpenLogTransaction={() => setIsLogTransactionOpen(true)}
              onOpenInvoice={(client) => setInvoiceClient(client)}
              onOpenCollectDeposit={(client) => {
                const dep = unpaidDeposits.find((d) => d.clientId === client.id) || {
                  id: `dep-${client.id}`,
                  clientId: client.id,
                  clientName: client.name,
                  garmentType: client.garmentTag,
                  amount: client.balanceDue,
                  date: 'Today',
                  phone: client.phone
                };
                setTargetDeposit(dep);
                setIsCollectDepositOpen(true);
              }}
              onOpenFittingSession={(client) => {
                setPreselectedBookingClient(client);
                setIsBookSessionOpen(true);
              }}
              onAdvanceStage={handleAdvanceRunwayStage}
              onMarkPaidDirectly={(clientId) => {
                setClients((prev) =>
                  prev.map((c) => {
                    if (c.id === clientId) {
                      return {
                        ...c,
                        depositPaid: c.totalCost,
                        balanceDue: 0,
                        status: 'Active'
                      };
                    }
                    return c;
                  })
                );
              }}
            />
          </div>
        )}

        {/* TAB 4: INVENTORY VIEW */}
        {activeTab === 'inventory' && (
          <div className="animate-fade-in">
            <InventoryView
              items={inventory}
              onRestockItem={handleRestockInventoryItem}
              onOpenAddMaterialModal={() => setIsAddMaterialOpen(true)}
              onOpenFabricScanner={() => setIsFabricScannerOpen(true)}
              onRemoveItem={(id) => setInventory((prev) => prev.filter((item) => item.id !== id))}
            />
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation Bar (Mobile) & Side Navigation Sidebar (Desktop) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickAdd={() => {
          setEditingClient(null);
          setIsAddClientOpen(true);
        }}
        onOpenStudioSettings={() => setIsStudioSettingsOpen(true)}
        studioName={studioSettings.studioName}
        ownerName={studioSettings.ownerName}
        pairCode={studioSettings.pairCode}
        studioLogoUrl={studioSettings.logoUrl}
      />

      {/* Modals */}
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => {
          setIsAddClientOpen(false);
          setEditingClient(null);
        }}
        onSaveClient={handleSaveClient}
        editingClient={editingClient}
        artistsList={artistsList}
      />

      <CollectDepositModal
        isOpen={isCollectDepositOpen}
        onClose={() => {
          setIsCollectDepositOpen(false);
          setTargetDeposit(null);
        }}
        deposit={targetDeposit}
        unpaidDepositsList={unpaidDeposits}
        onProcessCollection={handleProcessDepositCollection}
      />

      <AddApprenticeModal
        isOpen={isAddApprenticeOpen}
        onClose={() => setIsAddApprenticeOpen(false)}
        onSaveApprentice={handleSaveApprentice}
        mentorsList={artistsList}
      />

      <BookSessionModal
        isOpen={isBookSessionOpen}
        onClose={() => {
          setIsBookSessionOpen(false);
          setPreselectedBookingClient(null);
        }}
        clientsList={clients}
        preselectedClient={preselectedBookingClient}
        artistsList={artistsList}
        onBookSession={handleBookSession}
      />

      <LogTransactionModal
        isOpen={isLogTransactionOpen}
        onClose={() => setIsLogTransactionOpen(false)}
        onSaveTransaction={handleSaveTransaction}
      />

      {isCustomerTrackerOpen && (
        <CustomerTrackingModal
          clients={clients}
          onClose={() => setIsCustomerTrackerOpen(false)}
        />
      )}

      {isStudioSettingsOpen && (
        <StudioSettingsModal
          settings={studioSettings}
          onSave={(updated) => {
            setStudioSettings(updated);
            localStorage.setItem('tailor_studio_settings', JSON.stringify(updated));
            if (updated.theme) {
              setTheme(updated.theme);
            }
            upsertStudioSettingsToSupabase(updated);
          }}
          onToggleTheme={handleToggleTheme}
          onLogout={handlePromptLogout}
          onClose={() => setIsStudioSettingsOpen(false)}
          apprentices={apprentices}
          onUnlinkApprentice={handleUnlinkApprentice}
        />
      )}

      {measurementClient && (
        <GarmentMeasurementsModal
          client={measurementClient}
          studioSettings={studioSettings}
          onSave={handleUpdateMeasurements}
          onClose={() => setMeasurementClient(null)}
        />
      )}

      {invoiceClient && (
        <InvoiceModal
          client={invoiceClient}
          onClose={() => setInvoiceClient(null)}
          studioName={studioSettings.studioName}
          momoNumber={studioSettings.momoNumber}
          momoHolderName={studioSettings.momoHolderName}
          studioLogoUrl={studioSettings.logoUrl}
        />
      )}

      {specSheetClient && (
        <SpecSheetModal
          client={specSheetClient}
          studioSettings={studioSettings}
          onClose={() => setSpecSheetClient(null)}
        />
      )}

      {fullMeasurementsClient && (
        <FullMeasurementsModal
          isOpen={!!fullMeasurementsClient}
          onClose={() => setFullMeasurementsClient(null)}
          client={clients.find((c) => c.id === fullMeasurementsClient.id) || fullMeasurementsClient}
          studioSettings={studioSettings}
          onOpenMeasurements={(clientToMeasure) => {
            setFullMeasurementsClient(null);
            setMeasurementClient(clientToMeasure);
          }}
          onUpdateClientPhoto={(clientId, photoUrl) => {
            setClients((prev) =>
              prev.map((c) => {
                if (c.id === clientId) {
                  const updated = { ...c, avatarUrl: photoUrl };
                  upsertClientToSupabase(updated);
                  return updated;
                }
                return c;
              })
            );
          }}
        />
      )}

      {profileClient && (
        <ClientProfileModal
          isOpen={!!profileClient}
          client={profileClient}
          studioSettings={studioSettings}
          onClose={() => setProfileClient(null)}
          onEditClient={(clientToEdit) => {
            setProfileClient(null);
            setEditingClient(clientToEdit);
            setIsAddClientOpen(true);
          }}
          onUpdateClient={(updatedClient) => {
            setClients((prev) =>
              prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
            );
            setProfileClient(updatedClient);
          }}
          onDeleteClient={(clientId) => {
            setClients((prev) => prev.filter((c) => c.id !== clientId));
            setProfileClient(null);
          }}
          onOpenMeasurements={(clientToMeasure) => {
            setMeasurementClient(clientToMeasure);
          }}
          onOpenSpecSheet={(clientToView) => {
            setSpecSheetClient(clientToView);
          }}
          onOpenInvoice={(clientToInvoice) => {
            setInvoiceClient(clientToInvoice);
          }}
          onUpdateNotes={(clientId, newNotes) => {
            setClients((prev) =>
              prev.map((c) => (c.id === clientId ? { ...c, notes: newNotes } : c))
            );
            setProfileClient((prev) => (prev ? { ...prev, notes: newNotes } : null));
          }}
        />
      )}

      <AddMaterialModal
        isOpen={isAddMaterialOpen}
        onClose={() => setIsAddMaterialOpen(false)}
        onSaveMaterial={handleSaveMaterial}
      />

      <FabricColorScannerModal
        isOpen={isFabricScannerOpen}
        onClose={() => setIsFabricScannerOpen(false)}
        onAddMaterialToInventory={handleAddMaterialToInventory}
      />

      <CustomTaskModal
        isOpen={isCustomTaskOpen}
        onClose={() => setIsCustomTaskOpen(false)}
        onSaveTask={handleSaveTask}
        apprentices={apprentices}
      />

      {isMasterCertOpen && (
        <MasterCertificateModal
          isOpen={isMasterCertOpen}
          onClose={() => setIsMasterCertOpen(false)}
          studioName={studioSettings.studioName || 'MOKARS STITCHES STUDIO'}
          masterTrainer={studioSettings.ownerName || studioSettings.tailorName || 'Mubarik Tuahir Ali'}
          ceoName="MUBARIK TUAHIR ALI"
          studioLogoUrl={studioSettings.logoUrl}
        />
      )}

      <LogoutConfirmationModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
      />

      <InstallAppModal
        isOpen={isInstallAppOpen}
        onClose={() => setIsInstallAppOpen(false)}
      />
    </div>
  );
}
