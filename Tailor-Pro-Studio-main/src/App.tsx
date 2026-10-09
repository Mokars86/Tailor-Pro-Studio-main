import React, { useState, useEffect, useMemo, Suspense, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { SearchBarAndFilters } from './components/SearchBarAndFilters';
import { CustomerDirectory } from './components/CustomerDirectory';
import { BottomNav } from './components/BottomNav';
import { SignInView } from './components/auth/SignInView';
import { SplashScreen } from './components/SplashScreen';
import { App as CapacitorApp } from '@capacitor/app';
import {
  ViewFallback,
  ScreenFallback,
  LazyRunwayView as RunwayView,
  LazyLedgerView as LedgerView,
  LazyInventoryView as InventoryView,
  LazyApprenticeRegistry as ApprenticeRegistry,
  LazyApprenticeAppView as ApprenticeAppView,
  LazyRegisterStudioView as RegisterStudioView,
  prefetchLazyChunks
} from './components/LazyLoad';
import { ModalRoot } from './components/modals/ModalRoot';
import {
  Client,
  GarmentMeasurements,
  RunwayStage,
  UserRole,
  Apprentice,
  UnpaidDeposit
} from './types';
import {
  getUserAccountRecords,
  saveUserAccountRecords,
  registerUserAccount,
  setWorkspaceActivated,
  syncUserAccountsFromSupabase
} from './services/licenseService';
import {
  upsertClientToSupabase,
  upsertApprenticeToSupabase,
  deleteUnpaidDepositFromSupabase,
  deleteClientFromSupabase,
  signUpSupabaseUser,
  supabase,
  deleteApprenticeFromSupabase,
  syncApprenticeWorkshopCodeToSupabase
} from './services/supabaseService';
import {
  subscribeNetworkStatus,
  flushOfflineQueue,
  queueOfflineAction
} from './services/offlineSyncService';
import {
  initPushNotificationService,
  subscribeToNotificationEvents,
  getStoredNotifications,
  notifyGarmentStageUpdated,
  notifyMeasurementRecorded,
  notifyApprenticeLinked
} from './services/pushNotificationService';
import { canAddClientProfile, canAddMaterial } from './services/subscriptionService';
import { generateMasterWorkshopCode } from './utils/workshopCode';
import { parseCleanNumber, sanitizeClient, sanitizeTransaction } from './utils/numeric';
import { NotificationToastBanner } from './components/notifications/NotificationToastBanner';
import { PushPermissionBanner } from './components/notifications/PushPermissionBanner';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { PullToRefreshIndicator } from './components/common/PullToRefreshIndicator';
import { UndoDeleteToast } from './components/common/UndoDeleteToast';
import { usePullToRefresh } from './hooks/usePullToRefresh';
import { useDataStore, useModalStore, useUIStore } from './stores';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [deletedClientBuffer, setDeletedClientBuffer] = useState<Client | null>(null);
  const deleteTimeoutRef = useRef<any>(null);

  // Data Store
  const clients = useDataStore((s) => s.clients);
  const setClients = useDataStore((s) => s.setClients);
  const apprentices = useDataStore((s) => s.apprentices);
  const setApprentices = useDataStore((s) => s.setApprentices);
  const unpaidDeposits = useDataStore((s) => s.unpaidDeposits);
  const setUnpaidDeposits = useDataStore((s) => s.setUnpaidDeposits);
  const transactions = useDataStore((s) => s.transactions);
  const setTransactions = useDataStore((s) => s.setTransactions);
  const inventory = useDataStore((s) => s.inventory);
  const setInventory = useDataStore((s) => s.setInventory);
  const apprenticeTasks = useDataStore((s) => s.apprenticeTasks);
  const setApprenticeTasks = useDataStore((s) => s.setApprenticeTasks);
  const studioSettings = useDataStore((s) => s.studioSettings);
  const setStudioSettings = useDataStore((s) => s.setStudioSettings);
  const studioSub = useDataStore((s) => s.studioSub);
  const supabaseStatus = useDataStore((s) => s.supabaseStatus);
  const setSupabaseStatus = useDataStore((s) => s.setSupabaseStatus);
  const offlineNotice = useDataStore((s) => s.offlineNotice);
  const setOfflineNotice = useDataStore((s) => s.setOfflineNotice);
  const performFullCloudSync = useDataStore((s) => s.performFullCloudSync);
  const hydrateFromStorage = useDataStore((s) => s.hydrateFromStorage);
  const getStats = useDataStore((s) => s.getStats);

  // UI Store
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const selectedFilter = useUIStore((s) => s.selectedFilter);
  const setSelectedFilter = useUIStore((s) => s.setSelectedFilter);
  const selectedArtistFilter = useUIStore((s) => s.selectedArtistFilter);
  const setSelectedArtistFilter = useUIStore((s) => s.setSelectedArtistFilter);
  const notifications = useUIStore((s) => s.notifications);
  const setNotifications = useUIStore((s) => s.setNotifications);
  const activeToastNotification = useUIStore((s) => s.activeToastNotification);
  const setActiveToastNotification = useUIStore((s) => s.setActiveToastNotification);
  const unreadNotificationCount = useUIStore((s) => s.getUnreadNotificationCount());
  const authScreen = useUIStore((s) => s.authScreen);
  const setAuthScreen = useUIStore((s) => s.setAuthScreen);
  const userRole = useUIStore((s) => s.userRole);
  const setUserRole = useUIStore((s) => s.setUserRole);
  const activeUserEmail = useUIStore((s) => s.activeUserEmail);
  const setActiveUserEmail = useUIStore((s) => s.setActiveUserEmail);
  const activeUserFullName = useUIStore((s) => s.activeUserFullName);
  const setActiveUserFullName = useUIStore((s) => s.setActiveUserFullName);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  // Modal Store Actions
  const {
    openAddClient,
    openCollectDeposit,
    openBookSession,
    openFabricScanner,
    setStudioSettingsOpen,
    setAddApprenticeOpen,
    setLogTransactionOpen,
    setCustomerTrackerOpen,
    setMeasurementClient,
    setFullMeasurementsClient,
    setSpecSheetClient,
    setInvoiceClient,
    setProfileClient,
    setAddMaterialOpen,
    setCustomTaskOpen,
    setMasterCertOpen,
    setLogoutConfirmOpen,
    setInstallAppOpen,
    setSubscriptionModalOpen,
    setGraduationPaymentApprentice,
    setAdminPortalOpen,
    setLicensePromptOpen,
    setGraduationPromptOpen,
    setNotificationCenterOpen,
    closeActiveModalOrReturn
  } = useModalStore();

  const stats = useMemo(() => getStats(), [clients, transactions, unpaidDeposits, getStats]);

  // Derived list of studio tailors & designers
  const artistsList = useMemo(() => {
    const owner = studioSettings.ownerName || studioSettings.studioName || 'Master Atelier';
    const list = [
      owner,
      'Master Atelier',
      ...apprentices.map((a) => a.name),
      ...clients.map((c) => c.assignedDesigner).filter((d): d is string => Boolean(d))
    ];
    return Array.from(new Set(list)).filter(Boolean);
  }, [studioSettings.ownerName, studioSettings.studioName, apprentices, clients]);

  // Filtered clients for Customer Directory
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = client.name.toLowerCase().includes(q);
        const garmentTagMatch = client.garmentTag.toLowerCase().includes(q);
        const emailMatch = client.email.toLowerCase().includes(q);
        const phoneMatch = client.phone.includes(q);
        if (!nameMatch && !garmentTagMatch && !emailMatch && !phoneMatch) return false;
      }
      if (selectedFilter !== 'all') {
        if (selectedFilter === 'VIP' && client.status !== 'VIP') return false;
        if (selectedFilter === 'Pending Deposit' && client.status !== 'Pending Deposit') return false;
        if (selectedFilter === 'Active' && client.status !== 'Active') return false;
      }
      if (selectedArtistFilter !== 'all' && client.assignedDesigner !== selectedArtistFilter) {
        return false;
      }
      return true;
    });
  }, [clients, searchQuery, selectedFilter, selectedArtistFilter]);

  // Push Notifications Listener
  useEffect(() => {
    const role = userRole.startsWith('Apprentice') ? 'apprentice' : 'master';
    const userName = activeUserFullName || (activeUserEmail ? activeUserEmail.split('@')[0] : '');
    const cleanup = initPushNotificationService(role, userName);
    const unsubscribeEvents = subscribeToNotificationEvents((incomingNotif) => {
      setNotifications(getStoredNotifications());
      setActiveToastNotification(incomingNotif);
    });
    return () => {
      cleanup();
      unsubscribeEvents();
    };
  }, [userRole, activeUserFullName, activeUserEmail, setNotifications, setActiveToastNotification]);

  // Offline Network & Auto-Sync Listener
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
  }, [setSupabaseStatus, setOfflineNotice]);

  // Cloud Sync on Mount, Visibility & Realtime Changes
  useEffect(() => {
    hydrateFromStorage().then(() => {
      performFullCloudSync();
    });
    const handleFocus = () => performFullCloudSync();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') performFullCloudSync();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    const channel = supabase
      .channel('public-cloud-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        performFullCloudSync();
      })
      .subscribe();

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      supabase.removeChannel(channel);
    };
  }, [hydrateFromStorage, performFullCloudSync]);

  // Hardware / Native Back Button Handler
  useEffect(() => {
    const handleBackButton = () => {
      const modalClosed = closeActiveModalOrReturn();
      if (modalClosed) return;

      if (activeTab !== 'clients') {
        setActiveTab('clients');
        return;
      }

      CapacitorApp.minimizeApp();
    };

    let backListener: any = null;
    CapacitorApp.addListener('backButton', handleBackButton).then((l) => {
      backListener = l;
    });

    const handlePopState = () => handleBackButton();
    window.addEventListener('popstate', handlePopState);

    return () => {
      if (backListener) backListener.remove();
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTab, setActiveTab, closeActiveModalOrReturn]);

  // Apprentice Graduation Check
  useEffect(() => {
    if (authScreen === 'app' && userRole.startsWith('Apprentice')) {
      const activeApp = (apprentices || []).find((a) => a && a.isLinked) || (apprentices || [])[0];
      if (activeApp && activeApp.handshakeLocked === false && activeApp.hasCert) {
        const dismissed = sessionStorage.getItem('tailor_graduation_dismissed');
        if (!dismissed) {
          setGraduationPromptOpen(true);
        }
      }
    }
  }, [authScreen, userRole, apprentices, setGraduationPromptOpen]);

  // Pull to Refresh Hook
  const { pullDistance, isRefreshing, progress } = usePullToRefresh({
    onRefresh: performFullCloudSync,
    disabled: authScreen !== 'app'
  });

  // Undo Delete Handlers
  const handleDeleteClientWithUndo = (clientId: string) => {
    const target = clients.find((c) => c.id === clientId);
    if (!target) return;

    setClients((prev) => prev.filter((c) => c.id !== clientId));
    setDeletedClientBuffer(target);

    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
    }

    deleteTimeoutRef.current = setTimeout(() => {
      deleteClientFromSupabase(clientId);
      setDeletedClientBuffer(null);
    }, 6000);
  };

  const handleUndoDeleteClient = () => {
    if (!deletedClientBuffer) return;
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
    }
    const restored = deletedClientBuffer;
    setClients((prev) => [restored, ...prev]);
    upsertClientToSupabase(restored);
    setDeletedClientBuffer(null);
  };

  const handleDismissUndo = () => {
    if (deletedClientBuffer) {
      deleteClientFromSupabase(deletedClientBuffer.id);
    }
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
    }
    setDeletedClientBuffer(null);
  };

  // Handlers
  const handleTriggerAddClient = () => {
    const check = canAddClientProfile(clients.length);
    if (!check.allowed) {
      alert(check.reason || `Free Tier limit reached (${check.limit} client profiles). Upgrade to Tailor Pro Master for unlimited client profiles!`);
      setSubscriptionModalOpen(true);
      return;
    }
    openAddClient(null);
  };

  const handleTriggerAddMaterial = () => {
    const check = canAddMaterial(inventory.length);
    if (!check.allowed) {
      alert(check.reason || `Free Tier limit reached (${check.limit} materials max). Upgrade to Tailor Pro Master for unlimited inventory materials!`);
      setSubscriptionModalOpen(true);
      return;
    }
    setAddMaterialOpen(true);
  };

  const handleAdvanceRunwayStage = (clientId: string, newStage: RunwayStage) => {
    setClients((prev) => {
      const updatedList = prev.map((c) => {
        if (c && c.id === clientId) return { ...c, runwayStage: newStage };
        return c;
      });
      const target = updatedList.find((c) => c && c.id === clientId);
      if (target) {
        upsertClientToSupabase(target);
        queueOfflineAction('client', target);

        if (userRole.startsWith('Apprentice')) {
          const rawAppName = activeUserFullName || (activeUserEmail ? activeUserEmail.split('@')[0] : 'Apprentice Trainee');
          const appName = rawAppName.trim().charAt(0).toUpperCase() + rawAppName.trim().slice(1);
          notifyGarmentStageUpdated({
            clientName: target.name,
            newStage,
            apprenticeName: appName,
            masterName: studioSettings.ownerName || 'Master Atelier',
            clientId
          });
        }
      }
      return updatedList;
    });
  };

  const handleMarkPaidDirectly = (clientId: string, paymentMethod: string = 'Cash') => {
    const rawClient = clients.find((c) => c.id === clientId);
    if (!rawClient) return;
    const client = sanitizeClient(rawClient);
    const clientTotal = parseCleanNumber(client.totalCost);
    const clientPaid = parseCleanNumber(client.depositPaid);
    const clientBal = parseCleanNumber(client.balanceDue);
    const remainingAmount = clientBal > 0 ? clientBal : Math.max(0, clientTotal - clientPaid);

    const matchingDep = unpaidDeposits.find((d) => d.clientId === clientId);
    setUnpaidDeposits((prev) => prev.filter((d) => d.clientId !== clientId && d.id !== `dep-${clientId}`));
    if (matchingDep) {
      deleteUnpaidDepositFromSupabase(matchingDep.id);
    } else {
      deleteUnpaidDepositFromSupabase(`dep-${clientId}`);
      deleteUnpaidDepositFromSupabase(clientId);
    }

    const updatedClient: Client = sanitizeClient({
      ...client,
      depositPaid: clientTotal > 0 ? clientTotal : clientPaid + remainingAmount,
      balanceDue: 0,
      status: 'Active'
    });
    setClients((prev) => prev.map((c) => (c.id === clientId ? updatedClient : sanitizeClient(c))));
    upsertClientToSupabase(updatedClient);
    queueOfflineAction('client', updatedClient);

    if (remainingAmount > 0) {
      const settlementTx = sanitizeTransaction({
        id: `tx-settle-${clientId}-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'revenue' as const,
        category: 'Remaining Balance Settlement',
        description: `Full Settlement Paid - ${client.name} (${client.garmentTag || 'Custom Order'})`,
        amount: remainingAmount,
        clientOrVendor: client.name,
        status: 'cleared' as const,
        method: (paymentMethod || 'Cash') as any
      });
      setTransactions((prev) => [settlementTx, ...prev]);
      queueOfflineAction('transaction', settlementTx);
    }
  };

  const handleRestockInventoryItem = (id: string, amount: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stockLevel + amount);
          const updated = {
            ...item,
            stockLevel: newStock,
            status: (newStock > item.minThreshold ? 'In Stock' : 'Low Stock') as any
          };
          queueOfflineAction('inventory', updated);
          return updated;
        }
        return item;
      })
    );
  };

  const handleAssignCurriculumTask = (apprenticeName: string, taskTitle: string) => {
    const newTask = {
      id: `curr_task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: taskTitle,
      assignedTo: apprenticeName || 'all',
      isCompleted: false,
      status: 'in_progress' as const,
      category: 'Curriculum Skills Unit',
      masterNotes: 'Master Atelier skills curriculum assignment.',
      createdAt: new Date().toISOString()
    };
    setApprenticeTasks((prev) => [newTask, ...prev]);
    queueOfflineAction('task', newTask);
  };

  const handleToggleApprenticeHandshake = (id: string) => {
    setApprentices((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const nextLocked = !app.handshakeLocked;
          const updated = { ...app, handshakeLocked: nextLocked, hasCert: true };
          upsertApprenticeToSupabase(updated);
          queueOfflineAction('apprentice', updated);
          return updated;
        }
        return app;
      })
    );
  };

  const handlePassTask = (taskId: string) => {
    const targetTask = apprenticeTasks.find((t) => t.id === taskId);
    setApprenticeTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: true, status: 'passed' as const, passedAt: new Date().toISOString().split('T')[0] } : t))
    );
    if (targetTask) {
      setApprentices((appPrev) =>
        appPrev.map((a) => {
          if (!targetTask.assignedTo || targetTask.assignedTo === 'all' || targetTask.assignedTo === a.id || targetTask.assignedTo === a.name) {
            return { ...a, tasksCount: (a.tasksCount || 0) + 1 };
          }
          return a;
        })
      );
    }
  };

  const handleUnlinkApprentice = (apprenticeId: string) => {
    setApprentices((prev) => prev.filter((a) => a.id !== apprenticeId));
    deleteApprenticeFromSupabase(apprenticeId);
  };

  const handleSignInSuccess = (email: string, selectedRole?: UserRole) => {
    setSearchQuery('');
    setSelectedFilter('all');
    setSelectedArtistFilter('all');
    const userEmail = email.trim() || 'master@tailorpro.com';
    setActiveUserEmail(userEmail);

    const isApprenticeEmail =
      userEmail.toLowerCase().includes('apprentice') ||
      userEmail.toLowerCase().includes('trainee') ||
      userEmail.toLowerCase().includes('scholar');
    const resolvedRole: UserRole = selectedRole || (isApprenticeEmail ? 'Apprentice (Trainee & CAD Blueprint View)' : 'Master (Studio Owner & Financial Control)');

    setWorkspaceActivated(true);
    setUserRole(resolvedRole);
    setLicensePromptOpen(false);
    setAuthScreen('app');

    const users = getUserAccountRecords();
    const user = users.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
    if (user) {
      user.status = 'approved';
      if (selectedRole) user.role = selectedRole;
      saveUserAccountRecords(users);
      if (user.fullName && user.fullName.trim() && !user.fullName.includes('@')) {
        setActiveUserFullName(user.fullName.trim());
      }
    } else {
      registerUserAccount({
        email: userEmail,
        fullName: activeUserFullName || userEmail.split('@')[0] || 'Atelier Master',
        studioName: studioSettings.studioName || 'TAILOR PRO STUDIO',
        role: resolvedRole
      });
    }

    setTimeout(() => {
      syncUserAccountsFromSupabase();
      performFullCloudSync();
    }, 50);
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
    try {
      const userEmail = email.trim() || 'designer@tailorpro.com';
      const masterBrandName = studioName && studioName.trim() ? studioName.trim() : 'TAILOR PRO STUDIO';

      const isApprentice = role.startsWith('Apprentice');
      const newPairCode = isApprentice
        ? (masterWorkshopCode && masterWorkshopCode.trim() ? masterWorkshopCode.trim() : (studioSettings.pairCode || generateMasterWorkshopCode(masterBrandName)))
        : generateMasterWorkshopCode(masterBrandName);

      if (password && userEmail) {
        signUpSupabaseUser(userEmail, password, {
          fullName: fullName || 'Atelier Designer',
          role,
          studioName: masterBrandName,
          masterWorkshopCode: isApprentice ? newPairCode : undefined
        }).catch((err) => console.warn('[Supabase Auth] Sign up warning:', err));
      }

      const updatedSettings = { ...studioSettings, studioName: masterBrandName, pairCode: newPairCode };
      setStudioSettings(updatedSettings);

      setUserRole(role);
      setActiveUserEmail(userEmail);
      if (fullName && fullName.trim()) setActiveUserFullName(fullName.trim());

      registerUserAccount({
        email: userEmail,
        fullName: fullName || 'Atelier Designer',
        studioName: masterBrandName,
        role,
        licenseKey: isApprentice ? newPairCode : licenseKey
      });

      if (isApprentice) {
        const rawName = (fullName && fullName.trim()) || userEmail.split('@')[0] || 'Apprentice Scholar';
        const apprenticeName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        const initials = apprenticeName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AS';
        const emailTag = userEmail.split('@')[0].toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
        const apprenticeId = `app_${Date.now()}_${emailTag}`;

        const newApprenticeRecord: Apprentice = {
          id: apprenticeId,
          name: apprenticeName,
          initials,
          role: 'Apprentice Trainee',
          mentor: masterBrandName || studioSettings.ownerName || 'Master Atelier',
          isLinked: true,
          handshakeLocked: true,
          hasCert: false,
          hoursCompleted: 0,
          totalRequiredHours: 120,
          certifications: ['Pattern Drafting & Garment Construction'],
          tasksCount: 0,
          status: 'On Track',
          specialty: 'Couture Assembly & Garment Construction',
          workshopCode: newPairCode,
          email: userEmail
        };

        setApprentices((prev) => {
          const exists = prev.some((a) => a.name.toLowerCase() === apprenticeName.toLowerCase() || a.id === apprenticeId);
          if (exists) {
            return prev.map((a) => (a.name.toLowerCase() === apprenticeName.toLowerCase() ? { ...a, isLinked: true, mentor: newApprenticeRecord.mentor, workshopCode: newPairCode } : a));
          }
          return [newApprenticeRecord, ...prev];
        });

        // Clear any old cached milestones so new apprentice starts afresh
        storageService.removeItem(`tailor_apprentice_milestones_${apprenticeId.toLowerCase()}`);
        storageService.removeItem(`tailor_apprentice_milestones_${apprenticeName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
        storageService.removeItem('tailor_apprentice_milestones_default');

        upsertApprenticeToSupabase(newApprenticeRecord);
        syncApprenticeWorkshopCodeToSupabase(newPairCode, apprenticeName);
        notifyApprenticeLinked({
          apprenticeName,
          masterName: studioSettings.ownerName || masterBrandName || 'Master Atelier',
          workshopCode: newPairCode
        });
      }

      setWorkspaceActivated(true);
      setLicensePromptOpen(false);
      setAuthScreen('app');
    } catch (err) {
      console.error('Registration processing failed:', err);
      setWorkspaceActivated(true);
      setLicensePromptOpen(false);
      setAuthScreen('app');
    }
  };

  const handleSyncNewWorkshopCode = (newCode: string) => {
    setStudioSettings((prev) => ({ ...prev, pairCode: newCode }));
    const rawName = activeUserFullName || (activeUserEmail ? activeUserEmail.split('@')[0] : 'Apprentice Scholar');
    const apprenticeName = rawName.trim().charAt(0).toUpperCase() + rawName.trim().slice(1);
    const initials = apprenticeName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AS';
    const emailTag = (activeUserEmail ? activeUserEmail.split('@')[0] : 'app').toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    const apprenticeId = `app_${Date.now()}_${emailTag}`;

    const linkedApprentice: Apprentice = {
      id: apprenticeId,
      name: apprenticeName,
      initials,
      role: 'Apprentice Trainee',
      mentor: studioSettings.ownerName || studioSettings.studioName || 'Master Atelier',
      isLinked: true,
      handshakeLocked: true,
      hasCert: false,
      hoursCompleted: 0,
      totalRequiredHours: 120,
      certifications: ['Pattern Drafting & Garment Construction'],
      tasksCount: 0,
      status: 'On Track',
      specialty: 'Couture Assembly & Garment Construction',
      workshopCode: newCode,
      email: activeUserEmail
    };

    setApprentices((prev) => {
      const exists = prev.some((a) => a.name.toLowerCase() === linkedApprentice.name.toLowerCase() || a.id === apprenticeId);
      if (exists) {
        return prev.map((a) => (a.name.toLowerCase() === linkedApprentice.name.toLowerCase() ? { ...a, isLinked: true, mentor: linkedApprentice.mentor, workshopCode: newCode } : a));
      }
      return [linkedApprentice, ...prev];
    });

    // Clear any old cached milestones so synced apprentice starts afresh
    storageService.removeItem(`tailor_apprentice_milestones_${apprenticeId.toLowerCase()}`);
    storageService.removeItem(`tailor_apprentice_milestones_${apprenticeName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
    storageService.removeItem('tailor_apprentice_milestones_default');

    upsertApprenticeToSupabase(linkedApprentice);
    syncApprenticeWorkshopCodeToSupabase(newCode, apprenticeName);
    notifyApprenticeLinked({
      apprenticeName,
      masterName: studioSettings.ownerName || 'Master Atelier',
      workshopCode: newCode
    });
  };

  // Splash Screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Sign In Screen
  if (authScreen === 'signin') {
    return (
      <>
        <PWAInstallBanner onOpenInstallModal={() => setInstallAppOpen(true)} />
        <SignInView
          onSignInSuccess={handleSignInSuccess}
          onGoToRegister={() => setAuthScreen('register')}
          onOpenCustomerTracker={() => setCustomerTrackerOpen(true)}
          onOpenAdminPortal={() => setAdminPortalOpen(true)}
          onOpenInstallApp={() => setInstallAppOpen(true)}
        />
        <ModalRoot />
      </>
    );
  }

  // Register Screen
  if (authScreen === 'register') {
    return (
      <>
        <Suspense fallback={<ScreenFallback />}>
          <RegisterStudioView
            onRegisterSuccess={handleRegisterSuccess}
            onGoToSignIn={() => setAuthScreen('signin')}
          />
        </Suspense>
        <ModalRoot />
      </>
    );
  }

  // Apprentice App View
  if (authScreen === 'app' && userRole.startsWith('Apprentice')) {
    const targetName = (activeUserFullName || '').trim();
    const safeAppList = (apprentices || []).filter(Boolean);
    const matchedAppRecord = targetName
      ? safeAppList.find((a) => a?.name && a.name.toLowerCase() === targetName.toLowerCase())
      : (activeUserEmail ? safeAppList.find((a) => (a?.id && a.id.toLowerCase().includes(activeUserEmail.split('@')[0].toLowerCase())) || (a?.name && a.name.toLowerCase() === activeUserEmail.split('@')[0].toLowerCase())) : undefined);

    const activeAppRecord = matchedAppRecord || safeAppList.find((a) => a?.isLinked) || safeAppList[0];
    const resolvedAppName = targetName || (activeAppRecord?.name && !activeAppRecord.name.includes('@') ? activeAppRecord.name : '') || (activeUserEmail ? activeUserEmail.split('@')[0] : 'Apprentice Trainee');

    return (
      <>
        <Suspense fallback={<ScreenFallback />}>
          <ApprenticeAppView
            clients={clients}
            apprentices={apprentices}
            tasks={apprenticeTasks}
            studioName={studioSettings.studioName && studioSettings.studioName !== 'My Atelier Studio' ? studioSettings.studioName : 'MOKARS STITCHES STUDIO'}
            masterName={studioSettings.ownerName || 'Mubarik Tuahir Ali'}
            studioLogoUrl={studioSettings.logoUrl}
            workshopCode={studioSettings.pairCode}
            onSyncNewWorkshopCode={handleSyncNewWorkshopCode}
            apprenticeName={resolvedAppName}
            onUpdateApprenticeName={(newName) => {
              const cleanName = newName.trim();
              if (!cleanName) return;
              setActiveUserFullName(cleanName);
            }}
            theme={theme}
            onToggleTheme={toggleTheme}
            onAdvanceStage={handleAdvanceRunwayStage}
            onOpenMeasurementsForClient={(client) => setMeasurementClient(client)}
            onOpenAddNewClient={() => openAddClient(null)}
            onSwitchRoleToMaster={() => setUserRole('Master (Studio Owner & Financial Control)')}
            onLogout={() => setLogoutConfirmOpen(true)}
            onCompleteTask={(taskId) => {
              setApprenticeTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, isCompleted: true, status: 'review_pending' as const } : t)));
            }}
            unreadNotificationCount={unreadNotificationCount}
            onOpenNotificationCenter={() => setNotificationCenterOpen(true)}
          />
        </Suspense>

        <NotificationToastBanner
          notification={activeToastNotification}
          onClose={() => setActiveToastNotification(null)}
          onClickNotification={() => setNotificationCenterOpen(true)}
        />
        <PushPermissionBanner />
        <ModalRoot />
      </>
    );
  }

  // Master Studio Dashboard
  return (
    <div className={`min-h-screen md:pl-64 pt-[max(112px,calc(102px+env(safe-area-inset-top,0px)))] sm:pt-36 md:pt-40 pb-32 sm:pb-36 transition-colors duration-300 font-['Plus_Jakarta_Sans',sans-serif] ${
      theme === 'dark' ? 'bg-[#061E1B] text-slate-100 dark' : 'bg-[#EBF5F0] text-[#0D3B36]'
    }`}>
      <PWAInstallBanner onOpenInstallModal={() => setInstallAppOpen(true)} />

      {offlineNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0D3B36] text-white px-5 py-2.5 rounded-full shadow-2xl border-2 border-[#DCA134] text-xs font-black flex items-center gap-2 animate-bounce max-w-sm text-center">
          <span>{offlineNotice}</span>
        </div>
      )}

      {/* App Header */}
      <Header
        studioSettings={studioSettings}
        onOpenStudioSettings={() => setStudioSettingsOpen(true)}
        onOpenAddClient={handleTriggerAddClient}
        onOpenBookSession={() => openBookSession(null)}
        activeTab={activeTab}
        onOpenMasterCertificate={() => {
          if (studioSub.tier === 'FREE') {
            alert('Master Certificate is locked on Tailor Pro Free 👑. Upgrade to Tailor Pro Master (GHS 35/mo) to unlock your official Master Atelier Certificate!');
            setSubscriptionModalOpen(true);
            return;
          }
          setMasterCertOpen(true);
        }}
        onOpenSubscriptionModal={() => setSubscriptionModalOpen(true)}
        subscriptionTier={studioSub.tier}
        onOpenInstallApp={() => setInstallAppOpen(true)}
        onOpenAdminPortal={() => setAdminPortalOpen(true)}
        onManualSync={performFullCloudSync}
        theme={theme}
        onToggleTheme={toggleTheme}
        supabaseStatus={supabaseStatus}
        unreadNotificationCount={unreadNotificationCount}
        onOpenNotificationCenter={() => setNotificationCenterOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-2.5 sm:px-6">
        {activeTab === 'clients' && (
          <div className="animate-fade-in space-y-2">
            <MetricCards
              stats={stats}
              unpaidDeposits={unpaidDeposits}
              clients={clients}
              onOpenCollectDeposit={(dep) => openCollectDeposit(dep || null)}
              onOpenLedger={() => setActiveTab('ledger')}
              onOpenRunway={() => setActiveTab('runway')}
            />

            <Suspense fallback={<ViewFallback minHeight="200px" />}>
              <ApprenticeRegistry
                apprentices={apprentices}
                tasks={apprenticeTasks}
                pairCode={studioSettings.pairCode}
                studioLogoUrl={studioSettings.logoUrl}
                studioName={studioSettings.studioName}
                masterTrainer={studioSettings.ownerName}
                onRefreshApprentices={performFullCloudSync}
                onOpenCustomTaskModal={() => setCustomTaskOpen(true)}
                onAssignCurriculumTask={handleAssignCurriculumTask}
                onToggleHandshake={handleToggleApprenticeHandshake}
                onPassTask={handlePassTask}
                onUnlinkApprentice={handleUnlinkApprentice}
                onOpenGraduationPaymentModal={(app) => setGraduationPaymentApprentice(app)}
                onTriggerUpgradeModal={() => setSubscriptionModalOpen(true)}
              />
            </Suspense>

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

            <CustomerDirectory
              clients={filteredClients}
              unpaidDeposits={unpaidDeposits}
              onOpenCollectDeposit={(dep) => openCollectDeposit(dep || null)}
              onOpenBookSessionForClient={(client) => openBookSession(client)}
              onEditClient={(client) => openAddClient(client)}
              onOpenMeasurements={(client) => setMeasurementClient(client)}
              onOpenFullMeasurements={(client) => setFullMeasurementsClient(client)}
              onOpenSpecSheet={(client) => setSpecSheetClient(client)}
              onOpenInvoice={(client) => setInvoiceClient(client)}
              onOpenNewConsult={handleTriggerAddClient}
              onSelectClient={(client) => setProfileClient(client)}
              onDeleteClient={handleDeleteClientWithUndo}
              onAssignDuty={() => setCustomTaskOpen(true)}
            />
          </div>
        )}

        {activeTab === 'runway' && (
          <div className="animate-fade-in">
            <Suspense fallback={<ViewFallback minHeight="300px" />}>
              <RunwayView
                clients={clients}
                onAdvanceStage={handleAdvanceRunwayStage}
                onOpenBookSession={() => openBookSession(null)}
                onOpenSpecSheet={(client) => setSpecSheetClient(client)}
              />
            </Suspense>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="animate-fade-in">
            <Suspense fallback={<ViewFallback minHeight="300px" />}>
              <LedgerView
                transactions={transactions}
                clients={clients}
                onOpenLogTransaction={() => setLogTransactionOpen(true)}
                onOpenInvoice={(client) => setInvoiceClient(client)}
                onOpenCollectDeposit={(client) => {
                  const dep: UnpaidDeposit = unpaidDeposits.find((d) => d.clientId === client.id) || {
                    id: `dep-${client.id}`,
                    clientId: client.id,
                    clientName: client.name,
                    garmentTag: client.garmentTag || 'Custom Order',
                    amount: client.balanceDue,
                    dueDate: 'Today',
                    phone: client.phone
                  };
                  openCollectDeposit(dep);
                }}
                onOpenFittingSession={(client) => openBookSession(client)}
                onAdvanceStage={handleAdvanceRunwayStage}
                onMarkPaidDirectly={handleMarkPaidDirectly}
              />
            </Suspense>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="animate-fade-in">
            <Suspense fallback={<ViewFallback minHeight="300px" />}>
              <InventoryView
                items={inventory}
                studioSettings={studioSettings}
                onRestockItem={handleRestockInventoryItem}
                onOpenAddMaterialModal={handleTriggerAddMaterial}
                onOpenFabricScanner={(tab) => openFabricScanner(tab || 'sides')}
                onRemoveItem={(id) => setInventory((prev) => prev.filter((item) => item.id !== id))}
                onTriggerUpgradeModal={() => setSubscriptionModalOpen(true)}
              />
            </Suspense>
          </div>
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickAdd={handleTriggerAddClient}
        onOpenStudioSettings={() => setStudioSettingsOpen(true)}
        studioName={studioSettings.studioName}
        ownerName={studioSettings.ownerName}
        pairCode={studioSettings.pairCode}
        studioLogoUrl={studioSettings.logoUrl}
      />

      <NotificationToastBanner
        notification={activeToastNotification}
        onClose={() => setActiveToastNotification(null)}
        onClickNotification={() => setNotificationCenterOpen(true)}
      />

      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        progress={progress}
      />

      <UndoDeleteToast
        deletedClient={deletedClientBuffer}
        onUndo={handleUndoDeleteClient}
        onDismiss={handleDismissUndo}
      />

      <PushPermissionBanner />
      <ModalRoot />
    </div>
  );
}

export default App;
