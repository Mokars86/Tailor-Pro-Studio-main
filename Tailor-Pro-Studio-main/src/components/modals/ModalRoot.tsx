import React, { Suspense, useMemo } from 'react';
import { useDataStore, useModalStore, useUIStore } from '../../stores';
import {
  DeferredMount,
  ScreenFallback,
  ModalFallback,
  LazyAddClientModal as AddClientModal,
  LazyCollectDepositModal as CollectDepositModal,
  LazyAddApprenticeModal as AddApprenticeModal,
  LazyBookSessionModal as BookSessionModal,
  LazyLogTransactionModal as LogTransactionModal,
  LazyCustomerTrackingModal as CustomerTrackingModal,
  LazyStudioSettingsModal as StudioSettingsModal,
  LazyGarmentMeasurementsModal as GarmentMeasurementsModal,
  LazyInvoiceModal as InvoiceModal,
  LazySpecSheetModal as SpecSheetModal,
  LazyFullMeasurementsModal as FullMeasurementsModal,
  LazyClientProfileModal as ClientProfileModal,
  LazyAddMaterialModal as AddMaterialModal,
  LazyFabricColorScannerModal as FabricColorScannerModal,
  LazySubscriptionPlansModal as SubscriptionPlansModal,
  LazyGraduationPaymentModal as GraduationPaymentModal,
  LazyCustomTaskModal as CustomTaskModal,
  LazyMasterCertificateModal as MasterCertificateModal,
  LazyLogoutConfirmationModal as LogoutConfirmationModal,
  LazyInstallAppModal as InstallAppModal,
  LazyNotificationCenterModal as NotificationCenterModal,
  LazySuperAdminPortal as SuperAdminPortal,
  LazyLicenseKeyVerificationModal as LicenseKeyVerificationModal,
  LazyApprenticeMasterGraduationModal as ApprenticeMasterGraduationModal,
  LazyReorderClientModal as ReorderClientModal
} from '../LazyLoad';
import { Client, LedgerTransaction, RunwaySession, InventoryItem, Apprentice, ApprenticeTask, GarmentMeasurements, SpecSheetGarment, ClientOrder, UnpaidDeposit, RunwayStage } from '../../types';
import { canAddClientProfile, canAddMaterial, canLinkApprentice } from '../../services/subscriptionService';
import {
  upsertClientToSupabase,
  upsertLedgerTransactionToSupabase,
  upsertRunwaySessionToSupabase,
  upsertApprenticeToSupabase,
  upsertApprenticeTaskToSupabase,
  upsertStudioSettingsToSupabase,
  upsertInventoryItemToSupabase,
  deleteClientFromSupabase,
  upsertUnpaidDepositToSupabase,
  deleteUnpaidDepositFromSupabase
} from '../../services/supabaseService';
import { queueOfflineAction } from '../../services/offlineSyncService';
import { markAllNotificationsAsRead, clearAllNotifications } from '../../services/pushNotificationService';
import { parseCleanNumber, sanitizeClient, sanitizeTransaction, sanitizeDeposit } from '../../utils/numeric';

export const ModalRoot: React.FC = () => {
  // Modal Store
  const {
    isAddClientOpen,
    editingClient,
    closeAddClient,
    openAddClient,

    isCollectDepositOpen,
    targetDeposit,
    closeCollectDeposit,

    isAddApprenticeOpen,
    setAddApprenticeOpen,

    isBookSessionOpen,
    preselectedBookingClient,
    closeBookSession,

    isLogTransactionOpen,
    setLogTransactionOpen,

    isCustomerTrackerOpen,
    setCustomerTrackerOpen,

    isStudioSettingsOpen,
    setStudioSettingsOpen,

    measurementClient,
    setMeasurementClient,

    invoiceClient,
    setInvoiceClient,

    specSheetClient,
    setSpecSheetClient,

    fullMeasurementsClient,
    setFullMeasurementsClient,

    profileClient,
    setProfileClient,

    reorderClient,
    openReorderClient,
    closeReorderClient,

    isAddMaterialOpen,
    setAddMaterialOpen,

    isCustomTaskOpen,
    setCustomTaskOpen,

    isMasterCertOpen,
    setMasterCertOpen,

    isFabricScannerOpen,
    fabricScannerTab,
    closeFabricScanner,

    isLogoutConfirmOpen,
    setLogoutConfirmOpen,

    isInstallAppOpen,
    setInstallAppOpen,

    isSubscriptionModalOpen,
    setSubscriptionModalOpen,

    graduationPaymentApprentice,
    setGraduationPaymentApprentice,

    isAdminPortalOpen,
    setAdminPortalOpen,

    isLicensePromptOpen,
    setLicensePromptOpen,

    isGraduationPromptOpen,
    setGraduationPromptOpen,

    isNotificationCenterOpen,
    setNotificationCenterOpen
  } = useModalStore();

  // Data Store
  const clients = useDataStore((s) => s.clients);
  const setClients = useDataStore((s) => s.setClients);
  const apprentices = useDataStore((s) => s.apprentices);
  const setApprentices = useDataStore((s) => s.setApprentices);
  const unpaidDeposits = useDataStore((s) => s.unpaidDeposits);
  const setUnpaidDeposits = useDataStore((s) => s.setUnpaidDeposits);
  const sessions = useDataStore((s) => s.sessions);
  const setSessions = useDataStore((s) => s.setSessions);
  const transactions = useDataStore((s) => s.transactions);
  const setTransactions = useDataStore((s) => s.setTransactions);
  const inventory = useDataStore((s) => s.inventory);
  const setInventory = useDataStore((s) => s.setInventory);
  const apprenticeTasks = useDataStore((s) => s.apprenticeTasks);
  const setApprenticeTasks = useDataStore((s) => s.setApprenticeTasks);
  const studioSettings = useDataStore((s) => s.studioSettings);
  const setStudioSettings = useDataStore((s) => s.setStudioSettings);
  const studioSub = useDataStore((s) => s.studioSub);
  const setStudioSub = useDataStore((s) => s.setStudioSub);

  // UI Store
  const userRole = useUIStore((s) => s.userRole);
  const setUserRole = useUIStore((s) => s.setUserRole);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const setAuthScreen = useUIStore((s) => s.setAuthScreen);
  const setActiveUserEmail = useUIStore((s) => s.setActiveUserEmail);
  const setActiveUserFullName = useUIStore((s) => s.setActiveUserFullName);
  const clearSession = useUIStore((s) => s.clearSession);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const setSelectedFilter = useUIStore((s) => s.setSelectedFilter);
  const setSelectedArtistFilter = useUIStore((s) => s.setSelectedArtistFilter);
  const notifications = useUIStore((s) => s.notifications);
  const setNotifications = useUIStore((s) => s.setNotifications);

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

  // Handlers
  const handleSaveClient = (savedClient: Client) => {
    const isNewClient = !clients.some((c) => c.id === savedClient.id);
    if (isNewClient) {
      const check = canAddClientProfile(clients.length);
      if (!check.allowed) {
        closeAddClient();
        setSubscriptionModalOpen(true);
        alert(check.reason || `Free Tier Limit Reached: You have reached the maximum limit of ${check.limit} client profiles on the Free Tier.`);
        return;
      }
    }

    const cleanClient = sanitizeClient(savedClient);
    setClients((prev) => {
      const exists = prev.some((c) => c.id === cleanClient.id);
      if (exists) {
        return prev.map((c) => (c.id === cleanClient.id ? cleanClient : sanitizeClient(c)));
      } else {
        return [cleanClient, ...prev.map(sanitizeClient)];
      }
    });
    upsertClientToSupabase(cleanClient);
    queueOfflineAction('client', cleanClient);

    if (cleanClient.depositPaid > 0) {
      const consultTx: LedgerTransaction = sanitizeTransaction({
        id: `tx-consult-${cleanClient.id}`,
        date: cleanClient.timestamp ? cleanClient.timestamp.split('T')[0] : new Date().toISOString().split('T')[0],
        type: 'deposit',
        category: 'Consultation Deposit',
        description: `Consult Deposit Paid - ${cleanClient.name} (${cleanClient.garmentTag || 'Custom Order'})`,
        amount: cleanClient.depositPaid,
        clientOrVendor: cleanClient.name,
        status: 'cleared',
        method: 'Cash'
      });
      setTransactions((prev) => {
        const exists = prev.some((t) => t.id === consultTx.id || t.description.includes(cleanClient.name));
        if (exists) return prev;
        upsertLedgerTransactionToSupabase(consultTx);
        queueOfflineAction('transaction', consultTx);
        return [consultTx, ...prev];
      });
    }

    closeAddClient();
  };

  const handleProcessDepositCollection = (
    depositId: string,
    amountOrMethod?: number | string,
    paymentMethodOrNotes?: string,
    notesOrSMS?: string | boolean,
    _sendReceiptSMS?: boolean
  ) => {
    let clientName = 'Client';
    let targetClientId: string | null = null;
    let garmentTag = 'Custom Order';

    let explicitAmount: number | null = null;
    let resolvedMethod: string = 'Cash';
    let resolvedNotes: string = '';

    if (typeof amountOrMethod === 'number') {
      explicitAmount = parseCleanNumber(amountOrMethod);
      if (typeof paymentMethodOrNotes === 'string') resolvedMethod = paymentMethodOrNotes;
      if (typeof notesOrSMS === 'string') resolvedNotes = notesOrSMS;
    } else if (typeof amountOrMethod === 'string') {
      resolvedMethod = amountOrMethod;
    }

    if (depositId.startsWith('dep-')) {
      targetClientId = depositId.replace('dep-', '');
      const client = clients.find((c) => c.id === targetClientId);
      if (client) {
        clientName = client.name;
        garmentTag = client.garmentTag || 'Custom Order';
        if (explicitAmount === null || explicitAmount === 0) {
          explicitAmount = parseCleanNumber(client.balanceDue) || Math.max(0, parseCleanNumber(client.totalCost) - parseCleanNumber(client.depositPaid));
        }
      }
    } else {
      const d = unpaidDeposits.find((item) => item.id === depositId);
      if (d) {
        clientName = d.clientName;
        targetClientId = d.clientId;
        garmentTag = d.garmentTag || 'Custom Order';
        if (explicitAmount === null || explicitAmount === 0) {
          explicitAmount = parseCleanNumber(d.amount);
        }
      }
    }

    const finalAmount = explicitAmount !== null ? explicitAmount : 0;

    const newTx: LedgerTransaction = sanitizeTransaction({
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'deposit',
      category: 'Client Deposit Settlement',
      description: `Deposit Collected for ${clientName}${resolvedNotes ? ` (${resolvedNotes})` : ''}`,
      amount: finalAmount,
      clientOrVendor: clientName,
      status: 'cleared',
      method: (resolvedMethod || 'Cash') as any
    });

    setTransactions((prev) => [newTx, ...prev]);
    upsertLedgerTransactionToSupabase(newTx);
    queueOfflineAction('transaction', newTx);

    setUnpaidDeposits((prev) => prev.filter((d) => d.id !== depositId && d.clientId !== targetClientId));

    if (targetClientId) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === targetClientId) {
            const currentPaid = parseCleanNumber(c.depositPaid);
            const totalCost = parseCleanNumber(c.totalCost);
            const newPaid = currentPaid + finalAmount;
            const newBal = totalCost > 0 ? Math.max(0, totalCost - newPaid) : 0;
            const updated = sanitizeClient({
              ...c,
              depositPaid: newPaid,
              balanceDue: newBal,
              status: newBal === 0 ? ('Active' as const) : c.status
            });
            upsertClientToSupabase(updated);
            queueOfflineAction('client', updated);
            return updated;
          }
          return sanitizeClient(c);
        })
      );
    }

    closeCollectDeposit();
  };

  const handleConfirmReorder = (
    clientId: string,
    newOrderData: {
      garmentTag: string;
      totalCost: number;
      depositPaid: number;
      paymentMethod: string;
      fittingDate?: string;
      runwayStage: RunwayStage;
      assignedDesigner?: string;
      notes?: string;
    }
  ) => {
    const rawTarget = clients.find((c) => c.id === clientId) || (profileClient?.id === clientId ? profileClient : null);
    if (!rawTarget) return;
    const target = sanitizeClient(rawTarget);

    const numTotal = parseCleanNumber(newOrderData.totalCost);
    const numPaid = parseCleanNumber(newOrderData.depositPaid);
    const numBal = Math.max(0, numTotal - numPaid);

    // 1. Archive the previous active garment order into order history
    const prevOrder: ClientOrder = {
      id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderNumber: `ORD-${Date.now().toString().slice(-4)}`,
      garmentTag: target.garmentTag || 'Custom Order',
      orderDate: target.timestamp || new Date().toISOString().split('T')[0],
      completionDate: new Date().toISOString().split('T')[0],
      totalCost: parseCleanNumber(target.totalCost),
      depositPaid: parseCleanNumber(target.depositPaid),
      balanceDue: parseCleanNumber(target.balanceDue),
      runwayStage: target.runwayStage || 'DELIVERED',
      status: target.balanceDue === 0 ? 'completed' : 'archived',
      fittingDate: target.fittingDate,
      notes: target.notes,
      assignedDesigner: target.assignedDesigner
    };

    const nextOrderHistory = [prevOrder, ...(target.orderHistory || [])];

    // 2. Build updated client with new active order, resetting Runway pipeline and financial state
    const updatedClient: Client = sanitizeClient({
      ...target,
      garmentTag: newOrderData.garmentTag,
      timestamp: 'Just now',
      totalCost: numTotal,
      depositPaid: numPaid,
      balanceDue: numBal,
      runwayStage: newOrderData.runwayStage || 'CUTTING',
      status: numBal > 0 && numPaid === 0 ? 'Pending Deposit' : 'Active',
      fittingDate: newOrderData.fittingDate || undefined,
      assignedDesigner: newOrderData.assignedDesigner || target.assignedDesigner || 'Master Atelier',
      notes: newOrderData.notes || '',
      orderHistory: nextOrderHistory
    });

    setClients((prev) => prev.map((c) => (c.id === clientId ? updatedClient : sanitizeClient(c))));
    upsertClientToSupabase(updatedClient);
    queueOfflineAction('client', updatedClient);

    if (profileClient?.id === clientId) {
      setProfileClient(updatedClient);
    }

    // 3. Financial & Ledger Integration
    if (numPaid > 0) {
      const reorderTx: LedgerTransaction = sanitizeTransaction({
        id: `tx-reorder-${clientId}-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'deposit',
        category: 'Consultation Deposit',
        description: `Re-Order Deposit Paid - ${target.name} (${newOrderData.garmentTag})`,
        amount: numPaid,
        clientOrVendor: target.name,
        status: 'cleared',
        method: (newOrderData.paymentMethod || 'Cash') as any
      });
      setTransactions((prev) => [reorderTx, ...prev]);
      upsertLedgerTransactionToSupabase(reorderTx);
      queueOfflineAction('transaction', reorderTx);
    }

    // 4. Update or clear Unpaid Deposits
    if (numBal > 0) {
      const newDepositItem: UnpaidDeposit = sanitizeDeposit({
        id: `dep-${clientId}`,
        clientId,
        clientName: target.name,
        garmentTag: newOrderData.garmentTag,
        amount: numBal,
        dueDate: newOrderData.fittingDate || 'Scheduled Fitting',
        phone: target.phone || ''
      });
      setUnpaidDeposits((prev) => {
        const filtered = prev.filter((d) => d.clientId !== clientId && d.id !== `dep-${clientId}`);
        return [newDepositItem, ...filtered];
      });
      upsertUnpaidDepositToSupabase(newDepositItem);
      queueOfflineAction('deposit', newDepositItem);
    } else {
      setUnpaidDeposits((prev) => prev.filter((d) => d.clientId !== clientId && d.id !== `dep-${clientId}`));
      deleteUnpaidDepositFromSupabase(`dep-${clientId}`);
    }
  };

  const handleSaveApprentice = (newApprentice: Apprentice) => {
    const check = canLinkApprentice(apprentices.length);
    if (!check.allowed) {
      setAddApprenticeOpen(false);
      setSubscriptionModalOpen(true);
      alert(check.reason || `Upgrade to Tailor Pro Master to mentor more than ${check.limit} apprentices.`);
      return;
    }
    setApprentices((prev) => [newApprentice, ...prev]);
    upsertApprenticeToSupabase(newApprentice);
    queueOfflineAction('apprentice', newApprentice);
    setAddApprenticeOpen(false);
  };

  const handleBookSession = (newSession: RunwaySession) => {
    setSessions((prev) => [newSession, ...prev]);
    upsertRunwaySessionToSupabase(newSession);
    queueOfflineAction('session', newSession);
    closeBookSession();
  };

  const handleSaveTransaction = (newTx: LedgerTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    upsertLedgerTransactionToSupabase(newTx);
    queueOfflineAction('transaction', newTx);
    setLogTransactionOpen(false);
  };

  const handleUpdateMeasurements = (clientIdOrClient: string | Client, measurements?: GarmentMeasurements) => {
    let updatedClient: Client | undefined;
    if (typeof clientIdOrClient === 'string') {
      const targetClient = clients.find((c) => c.id === clientIdOrClient) || (measurementClient?.id === clientIdOrClient ? measurementClient : null);
      if (targetClient) {
        updatedClient = {
          ...targetClient,
          measurements: {
            ...targetClient.measurements,
            ...measurements
          }
        };
      }
    } else {
      updatedClient = clientIdOrClient;
    }

    if (updatedClient) {
      setClients((prev) => prev.map((c) => (c.id === updatedClient!.id ? updatedClient! : c)));
      upsertClientToSupabase(updatedClient);
      queueOfflineAction('client', updatedClient);
      if (profileClient && profileClient.id === updatedClient.id) {
        setProfileClient(updatedClient);
      }
    }
    setMeasurementClient(null);
  };

  const handleSaveSpecSheet = (clientId: string, garments: SpecSheetGarment[]) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const combinedNotes = garments.map((g) => g.notes).filter(Boolean).join(' | ');
          const updated = {
            ...c,
            notes: combinedNotes || c.notes
          };
          upsertClientToSupabase(updated);
          queueOfflineAction('client', updated);
          if (profileClient && profileClient.id === clientId) {
            setProfileClient(updated);
          }
          return updated;
        }
        return c;
      })
    );
  };

  const handleSaveMaterial = (item: InventoryItem) => {
    const check = canAddMaterial(inventory.length);
    if (!check.allowed) {
      setAddMaterialOpen(false);
      setSubscriptionModalOpen(true);
      alert(check.reason || `Free Tier limit reached (${check.limit} materials max). Upgrade to Tailor Pro Master for unlimited inventory materials!`);
      return;
    }
    setInventory((prev) => [item, ...prev]);
    upsertInventoryItemToSupabase(item);
    queueOfflineAction('inventory', item);
    setAddMaterialOpen(false);
  };

  const handleAddMaterialToInventory = (name: string, unit: string, amount: number) => {
    const check = canAddMaterial(inventory.length);
    if (!check.allowed) {
      alert(check.reason || `Free Tier limit reached (${check.limit} materials max). Upgrade to Tailor Pro Master for unlimited inventory materials!`);
      setSubscriptionModalOpen(true);
      return;
    }
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
    queueOfflineAction('inventory', newItem);
  };

  const handleSaveTask = (taskData: Omit<ApprenticeTask, 'id'>) => {
    const newTask: ApprenticeTask = {
      ...taskData,
      id: `task_${Date.now()}`
    };
    setApprenticeTasks((prev) => [newTask, ...prev]);
    upsertApprenticeTaskToSupabase(newTask);
    queueOfflineAction('task', newTask);
    setCustomTaskOpen(false);
  };

  const handleConfirmLogout = () => {
    setLogoutConfirmOpen(false);
    setStudioSettingsOpen(false);
    setLicensePromptOpen(false);
    setSearchQuery('');
    setSelectedFilter('all');
    setSelectedArtistFilter('all');
    document.documentElement.classList.remove('dark');
    clearSession();
  };

  const handleUnlinkApprentice = (apprenticeId: string) => {
    setApprentices((prev) => prev.filter((a) => a.id !== apprenticeId));
  };

  const handleGraduateToMasterStudio = (newStudioName: string, ownerName: string, newWorkshopCode: string) => {
    setStudioSettings((prev) => ({
      ...prev,
      studioName: newStudioName,
      ownerName: ownerName,
      pairCode: newWorkshopCode
    }));
    setUserRole('Master (Studio Owner & Financial Control)');
    setGraduationPromptOpen(false);
    sessionStorage.setItem('tailor_graduation_dismissed', 'true');
  };

  return (
    <>
      <DeferredMount when={isAddClientOpen}>
        <AddClientModal
          isOpen={isAddClientOpen}
          onClose={closeAddClient}
          onSaveClient={handleSaveClient}
          editingClient={editingClient}
          artistsList={artistsList}
        />
      </DeferredMount>

      <DeferredMount when={isCollectDepositOpen}>
        <CollectDepositModal
          isOpen={isCollectDepositOpen}
          onClose={closeCollectDeposit}
          deposit={targetDeposit}
          unpaidDepositsList={
            unpaidDeposits.length > 0
              ? unpaidDeposits
              : clients
                  .filter((c) => (c.balanceDue || 0) > 0)
                  .map((c) => ({
                    id: `dep-${c.id}`,
                    clientId: c.id,
                    clientName: c.name,
                    garmentType: c.garmentTag || 'Custom Order',
                    amount: c.balanceDue,
                    date: 'Today',
                    phone: c.phone
                  }))
          }
          onProcessCollection={handleProcessDepositCollection}
        />
      </DeferredMount>

      <DeferredMount when={isAddApprenticeOpen}>
        <AddApprenticeModal
          isOpen={isAddApprenticeOpen}
          onClose={() => setAddApprenticeOpen(false)}
          onSaveApprentice={handleSaveApprentice}
          mentorsList={artistsList}
        />
      </DeferredMount>

      <DeferredMount when={isBookSessionOpen}>
        <BookSessionModal
          isOpen={isBookSessionOpen}
          onClose={closeBookSession}
          clientsList={clients}
          preselectedClient={preselectedBookingClient}
          artistsList={artistsList}
          onBookSession={handleBookSession}
        />
      </DeferredMount>

      <DeferredMount when={isLogTransactionOpen}>
        <LogTransactionModal
          isOpen={isLogTransactionOpen}
          onClose={() => setLogTransactionOpen(false)}
          onSaveTransaction={handleSaveTransaction}
        />
      </DeferredMount>

      {isCustomerTrackerOpen && (
        <Suspense fallback={<ScreenFallback />}>
          <CustomerTrackingModal
            clients={clients}
            studioSettings={studioSettings}
            onClose={() => setCustomerTrackerOpen(false)}
          />
        </Suspense>
      )}

      {isStudioSettingsOpen && (
        <Suspense fallback={<ModalFallback />}>
          <StudioSettingsModal
            settings={studioSettings}
            onSave={(updated) => {
              setStudioSettings(updated);
              if (updated.theme) {
                setTheme(updated.theme);
              }
              upsertStudioSettingsToSupabase(updated);
            }}
            onToggleTheme={toggleTheme}
            onLogout={() => setLogoutConfirmOpen(true)}
            onClose={() => setStudioSettingsOpen(false)}
            apprentices={apprentices}
            onUnlinkApprentice={handleUnlinkApprentice}
            userRole={userRole}
          />
        </Suspense>
      )}

      {measurementClient && (
        <Suspense fallback={<ModalFallback />}>
          <GarmentMeasurementsModal
            client={measurementClient}
            studioSettings={studioSettings}
            onSave={handleUpdateMeasurements}
            onClose={() => setMeasurementClient(null)}
          />
        </Suspense>
      )}

      {invoiceClient && (
        <Suspense fallback={<ModalFallback />}>
          <InvoiceModal
            client={invoiceClient}
            onClose={() => setInvoiceClient(null)}
            studioSettings={studioSettings}
            studioName={studioSettings.studioName}
            momoNumber={studioSettings.momoNumber}
            momoHolderName={studioSettings.momoHolderName}
            studioLogoUrl={studioSettings.logoUrl}
          />
        </Suspense>
      )}

      {specSheetClient && (
        <Suspense fallback={<ModalFallback />}>
          <SpecSheetModal
            client={specSheetClient}
            studioSettings={studioSettings}
            onClose={() => setSpecSheetClient(null)}
            onSaveSpecSheet={handleSaveSpecSheet}
          />
        </Suspense>
      )}

      {fullMeasurementsClient && (
        <Suspense fallback={<ModalFallback />}>
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
                    queueOfflineAction('client', updated);
                    return updated;
                  }
                  return c;
                })
              );
            }}
          />
        </Suspense>
      )}

      {profileClient && (
        <Suspense fallback={<ModalFallback />}>
          <ClientProfileModal
            isOpen={!!profileClient}
            client={profileClient}
            studioSettings={studioSettings}
            onClose={() => setProfileClient(null)}
            onEditClient={(clientToEdit) => {
              setProfileClient(null);
              openAddClient(clientToEdit);
            }}
            onUpdateClient={(updatedClient) => {
              setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
              upsertClientToSupabase(updatedClient);
              queueOfflineAction('client', updatedClient);
              setProfileClient(updatedClient);
            }}
            onDeleteClient={(clientId) => {
              setClients((prev) => prev.filter((c) => c.id !== clientId));
              deleteClientFromSupabase(clientId);
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
            onOpenReorder={(clientToReorder) => {
              openReorderClient(clientToReorder);
            }}
            onUpdateNotes={(clientId, newNotes) => {
              setClients((prev) =>
                prev.map((c) => {
                  if (c.id === clientId) {
                    const updated = { ...c, notes: newNotes };
                    upsertClientToSupabase(updated);
                    queueOfflineAction('client', updated);
                    return updated;
                  }
                  return c;
                })
              );
              if (profileClient && profileClient.id === clientId) {
                setProfileClient({ ...profileClient, notes: newNotes });
              }
            }}
          />
        </Suspense>
      )}

      {reorderClient && (
        <Suspense fallback={<ModalFallback />}>
          <ReorderClientModal
            isOpen={!!reorderClient}
            onClose={() => closeReorderClient()}
            client={clients.find((c) => c.id === reorderClient.id) || reorderClient}
            artistsList={artistsList}
            onConfirmReorder={handleConfirmReorder}
            onOpenInvoice={(clientToInvoice) => setInvoiceClient(clientToInvoice)}
          />
        </Suspense>
      )}

      <DeferredMount when={isAddMaterialOpen}>
        <AddMaterialModal
          isOpen={isAddMaterialOpen}
          onClose={() => setAddMaterialOpen(false)}
          onSaveMaterial={handleSaveMaterial}
        />
      </DeferredMount>

      <DeferredMount when={isFabricScannerOpen}>
        <FabricColorScannerModal
          isOpen={isFabricScannerOpen}
          onClose={closeFabricScanner}
          initialTab={fabricScannerTab}
          onAddMaterialToInventory={handleAddMaterialToInventory}
        />
      </DeferredMount>

      <DeferredMount when={isSubscriptionModalOpen}>
        <SubscriptionPlansModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setSubscriptionModalOpen(false)}
          onSubscriptionUpdated={(newSub) => setStudioSub(newSub)}
        />
      </DeferredMount>

      {graduationPaymentApprentice && (
        <Suspense fallback={<ModalFallback />}>
          <GraduationPaymentModal
            isOpen={!!graduationPaymentApprentice}
            onClose={() => setGraduationPaymentApprentice(null)}
            apprentice={graduationPaymentApprentice}
          />
        </Suspense>
      )}

      <DeferredMount when={isCustomTaskOpen}>
        <CustomTaskModal
          isOpen={isCustomTaskOpen}
          onClose={() => setCustomTaskOpen(false)}
          onSaveTask={handleSaveTask}
          apprentices={apprentices}
          tasks={apprenticeTasks}
        />
      </DeferredMount>

      {isMasterCertOpen && (
        <Suspense fallback={<ModalFallback />}>
          <MasterCertificateModal
            isOpen={isMasterCertOpen}
            onClose={() => setMasterCertOpen(false)}
            studioName={studioSettings.studioName || 'MOKARS STITCHES STUDIO'}
            masterTrainer={studioSettings.ownerName || 'Mubarik Tuahir Ali'}
            ceoName="MUBARIK TUAHIR ALI"
            studioLogoUrl={studioSettings.logoUrl}
            subscriptionTier={studioSub.tier}
            onOpenSubscriptionModal={() => setSubscriptionModalOpen(true)}
          />
        </Suspense>
      )}

      <DeferredMount when={isLogoutConfirmOpen}>
        <LogoutConfirmationModal
          isOpen={isLogoutConfirmOpen}
          onClose={() => setLogoutConfirmOpen(false)}
          onConfirm={handleConfirmLogout}
        />
      </DeferredMount>

      <DeferredMount when={isInstallAppOpen}>
        <InstallAppModal
          isOpen={isInstallAppOpen}
          onClose={() => setInstallAppOpen(false)}
        />
      </DeferredMount>

      {/* Push Notification History & Controls Modal */}
      <DeferredMount when={isNotificationCenterOpen}>
        <NotificationCenterModal
          isOpen={isNotificationCenterOpen}
          onClose={() => setNotificationCenterOpen(false)}
          notifications={notifications}
          onMarkAllRead={() => setNotifications(markAllNotificationsAsRead())}
          onClearAll={() => setNotifications(clearAllNotifications())}
          currentUserRole={userRole}
          onSelectNotification={(notif) => {
            setNotifications(notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
          }}
        />
      </DeferredMount>

      {/* Super Admin Key Management Portal */}
      <DeferredMount when={isAdminPortalOpen}>
        <SuperAdminPortal
          isOpen={isAdminPortalOpen}
          onClose={() => setAdminPortalOpen(false)}
        />
      </DeferredMount>

      {/* Legacy License Key Modal */}
      <DeferredMount when={isLicensePromptOpen}>
        <LicenseKeyVerificationModal
          isOpen={isLicensePromptOpen}
          onClose={() => setLicensePromptOpen(false)}
          onVerified={() => setLicensePromptOpen(false)}
        />
      </DeferredMount>

      {/* Master Graduation Ceremony Modal */}
      {isGraduationPromptOpen && (
        <Suspense fallback={<ModalFallback />}>
          <ApprenticeMasterGraduationModal
            isOpen={isGraduationPromptOpen}
            onClose={() => {
              setGraduationPromptOpen(false);
              sessionStorage.setItem('tailor_graduation_dismissed', 'true');
            }}
            apprenticeName={(apprentices || []).find((a) => a && a.isLinked)?.name || 'Master Trainee'}
            masterName={studioSettings.ownerName || 'Master Atelier'}
            onGraduateToMasterStudio={handleGraduateToMasterStudio}
          />
        </Suspense>
      )}
    </>
  );
};
