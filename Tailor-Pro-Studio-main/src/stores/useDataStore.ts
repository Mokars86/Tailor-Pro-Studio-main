import { create } from 'zustand';
import { Apprentice, ApprenticeTask, Client, InventoryItem, LedgerTransaction, RunwaySession, ShopStats, StudioSettings, StudioSubscription, UnpaidDeposit } from '../types';
import { storageService } from '../services/storageService';
import {
  defaultStudioSettings,
  initialClients,
  initialApprentices,
  initialUnpaidDeposits,
  initialRunwaySessions,
  initialLedgerTransactions,
  initialInventoryItems
} from '../data/mockData';
import { generateMasterWorkshopCode, validateWorkshopCode } from '../utils/workshopCode';
import { getStudioSubscription } from '../services/subscriptionService';
import {
  fetchClientsFromSupabase,
  fetchApprenticesFromSupabase,
  fetchApprenticeTasksFromSupabase,
  fetchUnpaidDepositsFromSupabase,
  fetchRunwaySessionsFromSupabase,
  fetchLedgerTransactionsFromSupabase,
  fetchInventoryItemsFromSupabase,
  fetchStudioSettingsFromSupabase,
  fetchUserAccountsFromSupabase,
  upsertClientToSupabase,
  upsertApprenticeToSupabase,
  upsertApprenticeTaskToSupabase,
  upsertUnpaidDepositToSupabase,
  upsertRunwaySessionToSupabase,
  upsertLedgerTransactionToSupabase,
  upsertInventoryItemToSupabase,
  upsertStudioSettingsToSupabase,
  deleteClientFromSupabase,
  seedInitialSupabaseData,
  supabase
} from '../services/supabaseService';
import { flushOfflineQueue, queueOfflineAction } from '../services/offlineSyncService';
import { syncUserAccountsFromSupabase } from '../services/licenseService';
import { parseCleanNumber, sanitizeClient, sanitizeTransaction, sanitizeDeposit } from '../utils/numeric';

const isMockId = (id?: string) =>
  ['cli-1', 'cli-2', 'cli-3', 'cli-4', 'app-1', 'app_raeesa_mubarick', 'app_raeesa_mohammed', 'dep-1', 'dep-2', 'tx-1', 'tx-2', 'inv-1', 'inv-2', 'inv-3', 'run-1', 'run-2'].includes(id || '');

function loadInitialStudioSettings(): StudioSettings {
  try {
    const saved = storageService.getItemSync<StudioSettings | null>('tailor_studio_settings', null);
    if (saved && typeof saved === 'object') {
      const settings: StudioSettings = { ...defaultStudioSettings, ...saved };
      if (!settings.pairCode || !validateWorkshopCode(settings.pairCode).isValid) {
        settings.pairCode = generateMasterWorkshopCode(settings.studioName || 'TAILOR PRO STUDIO');
        storageService.setItem('tailor_studio_settings', settings);
      }
      return settings;
    }
  } catch (e) {
    console.error('Error loading studio settings:', e);
  }
  const fallback = { ...defaultStudioSettings };
  if (!fallback.pairCode) {
    fallback.pairCode = generateMasterWorkshopCode(fallback.studioName);
  }
  return fallback;
}

interface DataState {
  // Data Records
  clients: Client[];
  apprentices: Apprentice[];
  unpaidDeposits: UnpaidDeposit[];
  sessions: RunwaySession[];
  transactions: LedgerTransaction[];
  inventory: InventoryItem[];
  apprenticeTasks: ApprenticeTask[];
  studioSettings: StudioSettings;
  studioSub: StudioSubscription;

  // Sync & Status
  supabaseStatus: 'connected' | 'syncing' | 'offline';
  offlineNotice: string | null;
  isSyncing: boolean;

  // Actions
  hydrateFromStorage: () => Promise<void>;
  setClients: (clients: Client[] | ((prev: Client[]) => Client[])) => void;
  updateClient: (updatedClient: Client) => void;
  deleteClient: (clientId: string) => void;
  setApprentices: (apprentices: Apprentice[] | ((prev: Apprentice[]) => Apprentice[])) => void;
  setUnpaidDeposits: (deposits: UnpaidDeposit[] | ((prev: UnpaidDeposit[]) => UnpaidDeposit[])) => void;
  setSessions: (sessions: RunwaySession[] | ((prev: RunwaySession[]) => RunwaySession[])) => void;
  setTransactions: (transactions: LedgerTransaction[] | ((prev: LedgerTransaction[]) => LedgerTransaction[])) => void;
  setInventory: (inventory: InventoryItem[] | ((prev: InventoryItem[]) => InventoryItem[])) => void;
  setApprenticeTasks: (tasks: ApprenticeTask[] | ((prev: ApprenticeTask[]) => ApprenticeTask[])) => void;
  setStudioSettings: (settings: StudioSettings | ((prev: StudioSettings) => StudioSettings)) => void;
  setStudioSub: (sub: StudioSubscription) => void;
  setSupabaseStatus: (status: 'connected' | 'syncing' | 'offline') => void;
  setOfflineNotice: (notice: string | null) => void;

  // Domain Actions
  addMaterial: (item: InventoryItem) => void;
  performFullCloudSync: () => Promise<void>;
  getStats: () => ShopStats;
}

export const useDataStore = create<DataState>((set, get) => ({
  clients: (() => {
    try {
      const parsed = storageService.getItemSync<Client[]>('tailor_clients', []);
      return Array.isArray(parsed) ? parsed.filter((c) => c && !isMockId(c.id)).map(sanitizeClient) : [];
    } catch {
      return [];
    }
  })(),
  apprentices: (() => {
    try {
      const parsed = storageService.getItemSync<Apprentice[]>('tailor_apprentices', []);
      return Array.isArray(parsed) ? parsed.filter((a) => a && !isMockId(a.id)) : [];
    } catch {
      return [];
    }
  })(),
  unpaidDeposits: (() => {
    const parsed = storageService.getItemSync<UnpaidDeposit[]>('tailor_deposits', []);
    return Array.isArray(parsed) ? parsed.filter((d) => !isMockId(d.id)).map(sanitizeDeposit) : [];
  })(),
  sessions: (() => {
    const parsed = storageService.getItemSync<RunwaySession[]>('tailor_sessions', []);
    return Array.isArray(parsed) ? parsed.filter((s) => !isMockId(s.id)) : [];
  })(),
  transactions: (() => {
    const parsed = storageService.getItemSync<LedgerTransaction[]>('tailor_transactions', []);
    return Array.isArray(parsed) ? parsed.filter((t) => !isMockId(t.id)).map(sanitizeTransaction) : [];
  })(),
  inventory: (() => {
    const parsed = storageService.getItemSync<InventoryItem[]>('tailor_inventory', []);
    return Array.isArray(parsed) ? parsed.filter((i) => !isMockId(i.id)) : [];
  })(),
  apprenticeTasks: (() => {
    try {
      const parsed = storageService.getItemSync<ApprenticeTask[]>('tailor_apprentice_tasks', []);
      return Array.isArray(parsed) ? parsed.filter((t) => t && !isMockId(t.id)) : [];
    } catch {
      return [];
    }
  })(),
  studioSettings: loadInitialStudioSettings(),
  studioSub: getStudioSubscription(),

  supabaseStatus: 'connected',
  offlineNotice: null,
  isSyncing: false,

  hydrateFromStorage: async () => {
    try {
      await storageService.init();
      
      const storedClients = await storageService.getItem<Client[]>('tailor_clients', []);
      if (Array.isArray(storedClients) && storedClients.length > 0) {
        const clean = storedClients.filter((c) => c && !isMockId(c.id)).map(sanitizeClient);
        if (clean.length >= get().clients.length) {
          set({ clients: clean });
        }
      }

      const storedSettings = await storageService.getItem<StudioSettings | null>('tailor_studio_settings', null);
      if (storedSettings && typeof storedSettings === 'object') {
        set((state) => ({
          studioSettings: {
            ...defaultStudioSettings,
            ...state.studioSettings,
            ...storedSettings
          }
        }));
      }

      const storedApprentices = await storageService.getItem<Apprentice[]>('tailor_apprentices', []);
      if (Array.isArray(storedApprentices) && storedApprentices.length > 0) {
        const clean = storedApprentices.filter((a) => a && !isMockId(a.id));
        if (clean.length >= get().apprentices.length) {
          set({ apprentices: clean });
        }
      }

      const storedDeposits = await storageService.getItem<UnpaidDeposit[]>('tailor_deposits', []);
      if (Array.isArray(storedDeposits) && storedDeposits.length > 0) {
        set({ unpaidDeposits: storedDeposits.filter((d) => !isMockId(d.id)).map(sanitizeDeposit) });
      }

      const storedSessions = await storageService.getItem<RunwaySession[]>('tailor_sessions', []);
      if (Array.isArray(storedSessions) && storedSessions.length > 0) {
        set({ sessions: storedSessions.filter((s) => !isMockId(s.id)) });
      }

      const storedTx = await storageService.getItem<LedgerTransaction[]>('tailor_transactions', []);
      if (Array.isArray(storedTx) && storedTx.length > 0) {
        set({ transactions: storedTx.filter((t) => !isMockId(t.id)).map(sanitizeTransaction) });
      }

      const storedInv = await storageService.getItem<InventoryItem[]>('tailor_inventory', []);
      if (Array.isArray(storedInv) && storedInv.length > 0) {
        set({ inventory: storedInv.filter((i) => !isMockId(i.id)) });
      }

      const storedTasks = await storageService.getItem<ApprenticeTask[]>('tailor_apprentice_tasks', []);
      if (Array.isArray(storedTasks) && storedTasks.length > 0) {
        set({ apprenticeTasks: storedTasks.filter((t) => !isMockId(t.id)) });
      }
    } catch (e) {
      console.warn('[DataStore] Storage hydration note:', e);
    }
  },

  setClients: (updater) => {
    const rawNext = typeof updater === 'function' ? updater(get().clients) : updater;
    const next = (Array.isArray(rawNext) ? rawNext : []).map(sanitizeClient);
    set({ clients: next });
    storageService.setItem('tailor_clients', next);
  },

  updateClient: (updatedClient) => {
    const clean = sanitizeClient(updatedClient);
    const next = get().clients.map((c) => (c.id === clean.id ? clean : sanitizeClient(c)));
    set({ clients: next });
    storageService.setItem('tailor_clients', next);
    upsertClientToSupabase(clean);
    queueOfflineAction('client', clean);
  },

  deleteClient: (clientId) => {
    const next = get().clients.filter((c) => c.id !== clientId);
    set({ clients: next });
    storageService.setItem('tailor_clients', next);
    deleteClientFromSupabase(clientId);
  },

  setApprentices: (updater) => {
    const next = typeof updater === 'function' ? updater(get().apprentices) : updater;
    set({ apprentices: next });
    storageService.setItem('tailor_apprentices', next);
  },

  setUnpaidDeposits: (updater) => {
    const rawNext = typeof updater === 'function' ? updater(get().unpaidDeposits) : updater;
    const next = (Array.isArray(rawNext) ? rawNext : []).map(sanitizeDeposit);
    set({ unpaidDeposits: next });
    storageService.setItem('tailor_deposits', next);
  },

  setSessions: (updater) => {
    const next = typeof updater === 'function' ? updater(get().sessions) : updater;
    set({ sessions: next });
    storageService.setItem('tailor_sessions', next);
  },

  setTransactions: (updater) => {
    const rawNext = typeof updater === 'function' ? updater(get().transactions) : updater;
    const next = (Array.isArray(rawNext) ? rawNext : []).map(sanitizeTransaction);
    set({ transactions: next });
    storageService.setItem('tailor_transactions', next);
  },

  setInventory: (updater) => {
    const next = typeof updater === 'function' ? updater(get().inventory) : updater;
    set({ inventory: next });
    storageService.setItem('tailor_inventory', next);
  },

  setApprenticeTasks: (updater) => {
    const next = typeof updater === 'function' ? updater(get().apprenticeTasks) : updater;
    set({ apprenticeTasks: next });
    storageService.setItem('tailor_apprentice_tasks', next);
  },

  setStudioSettings: (updater) => {
    const next = typeof updater === 'function' ? updater(get().studioSettings) : updater;
    set({ studioSettings: next });
    storageService.setItem('tailor_studio_settings', next);
    upsertStudioSettingsToSupabase(next);
    queueOfflineAction('settings', next);
  },

  setStudioSub: (sub) => set({ studioSub: sub }),
  setSupabaseStatus: (status) => set({ supabaseStatus: status }),
  setOfflineNotice: (notice) => set({ offlineNotice: notice }),

  addMaterial: (item) => {
    const next = [item, ...get().inventory];
    set({ inventory: next });
    storageService.setItem('tailor_inventory', next);
    upsertInventoryItemToSupabase(item);
    queueOfflineAction('inventory', item);
  },

  performFullCloudSync: async () => {
    if (get().isSyncing) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      set({ supabaseStatus: 'offline' });
      return;
    }

    set({ isSyncing: true, supabaseStatus: 'syncing' });

    try {
      // 1. Flush offline queue first
      await flushOfflineQueue();

      // 2. Seed initial data if DB tables are empty
      await seedInitialSupabaseData(
        initialClients,
        initialApprentices,
        initialUnpaidDeposits,
        initialRunwaySessions,
        initialLedgerTransactions,
        initialInventoryItems,
        defaultStudioSettings
      );

      // 3. Sync Clients
      const currentClients = get().clients.filter((c) => c && !isMockId(c.id));
      const storedClients = (storageService.getItemSync<Client[]>('tailor_clients', []) || []).filter((c) => c && !isMockId(c.id));
      const localClientMap = new Map<string, Client>();
      storedClients.forEach((c) => localClientMap.set(c.id, c));
      currentClients.forEach((c) => localClientMap.set(c.id, c));
      const combinedLocalClients = Array.from(localClientMap.values());

      const dbClients = await fetchClientsFromSupabase();
      if (dbClients !== null) {
        if (dbClients.length === 0 && combinedLocalClients.length > 0) {
          // DB is empty but we have local clients -> push local to Supabase
          for (const loc of combinedLocalClients) {
            upsertClientToSupabase(loc);
          }
          set({ clients: combinedLocalClients });
          storageService.setItem('tailor_clients', combinedLocalClients);
        } else {
          const remoteMap = new Map(dbClients.map((c) => [c.id, c]));
          const merged: Client[] = [...dbClients.filter((c) => !isMockId(c.id))];

          for (const loc of combinedLocalClients) {
            if (!loc || isMockId(loc.id)) continue;
            if (!remoteMap.has(loc.id)) {
              merged.unshift(loc);
              upsertClientToSupabase(loc);
            }
          }

          set({ clients: merged });
          storageService.setItem('tailor_clients', merged);
        }
      }

      // 4. Sync Apprentices & Users
      const currentApprentices = get().apprentices.filter((a) => a && !isMockId(a.id));
      const dbApprentices = await fetchApprenticesFromSupabase();
      const dbUsers = await fetchUserAccountsFromSupabase();
      let combinedApprentices: Apprentice[] = dbApprentices && dbApprentices.length > 0 
        ? [...dbApprentices.filter((a) => !isMockId(a.id))] 
        : [...currentApprentices];

      if (dbUsers) {
        const apprenticeUsers = dbUsers.filter((u) => u.role && u.role.startsWith('Apprentice'));
        for (const u of apprenticeUsers) {
          const rawName = u.fullName && u.fullName.trim() ? u.fullName.trim() : u.email.split('@')[0];
          const appName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
          const emailTag = u.email.split('@')[0].toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
          const synthId = `app_${emailTag}`;

          const exists = combinedApprentices.some(
            (a) => a.id === synthId || a.name.toLowerCase() === appName.toLowerCase()
          );

          if (!exists) {
            const initials = appName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AT';
            const synthRecord: Apprentice = {
              id: synthId,
              name: appName,
              initials,
              role: 'Apprentice Trainee',
              mentor: get().studioSettings.ownerName || 'Master Atelier',
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
            combinedApprentices.push(synthRecord);
          }
        }
      }

      if (combinedApprentices.length > 0) {
        const remoteMap = new Map(combinedApprentices.map((a) => [a.id, a]));
        const nameMap = new Map(combinedApprentices.map((a) => [a.name.toLowerCase(), a]));
        const merged: Apprentice[] = [...combinedApprentices];

        for (const loc of currentApprentices) {
          if (!loc || isMockId(loc.id)) continue;
          if (!remoteMap.has(loc.id) && !nameMap.has(loc.name.toLowerCase())) {
            merged.unshift(loc);
            upsertApprenticeToSupabase(loc);
          }
        }
        set({ apprentices: merged });
        storageService.setItem('tailor_apprentices', merged);
      }

      // 5. Sync Tasks
      const currentTasks = get().apprenticeTasks.filter((t) => t && !isMockId(t.id));
      const dbTasks = await fetchApprenticeTasksFromSupabase();
      if (dbTasks !== null) {
        if (dbTasks.length === 0 && currentTasks.length > 0) {
          for (const loc of currentTasks) {
            upsertApprenticeTaskToSupabase(loc);
          }
          set({ apprenticeTasks: currentTasks });
          storageService.setItem('tailor_apprentice_tasks', currentTasks);
        } else {
          const remoteMap = new Map(dbTasks.map((t) => [t.id, t]));
          const merged: ApprenticeTask[] = [...dbTasks.filter((t) => !isMockId(t.id))];
          for (const loc of currentTasks) {
            if (!loc || isMockId(loc.id)) continue;
            if (!remoteMap.has(loc.id)) {
              merged.unshift(loc);
              upsertApprenticeTaskToSupabase(loc);
            }
          }
          set({ apprenticeTasks: merged });
          storageService.setItem('tailor_apprentice_tasks', merged);
        }
      }

      // 6. Sync Deposits
      const currentDeposits = get().unpaidDeposits.filter((d) => d && !isMockId(d.id));
      const dbDeposits = await fetchUnpaidDepositsFromSupabase();
      if (dbDeposits !== null) {
        if (dbDeposits.length === 0 && currentDeposits.length > 0) {
          for (const loc of currentDeposits) {
            upsertUnpaidDepositToSupabase(loc);
          }
          set({ unpaidDeposits: currentDeposits });
          storageService.setItem('tailor_deposits', currentDeposits);
        } else {
          const remoteMap = new Map(dbDeposits.map((d) => [d.id, d]));
          const merged: UnpaidDeposit[] = [...dbDeposits.filter((d) => !isMockId(d.id))];
          for (const loc of currentDeposits) {
            if (!loc || isMockId(loc.id)) continue;
            if (!remoteMap.has(loc.id)) {
              merged.unshift(loc);
              upsertUnpaidDepositToSupabase(loc);
            }
          }
          set({ unpaidDeposits: merged });
          storageService.setItem('tailor_deposits', merged);
        }
      }

      // 7. Sync Sessions
      const currentSessions = get().sessions.filter((s) => s && !isMockId(s.id));
      const dbSessions = await fetchRunwaySessionsFromSupabase();
      if (dbSessions !== null) {
        if (dbSessions.length === 0 && currentSessions.length > 0) {
          for (const loc of currentSessions) {
            upsertRunwaySessionToSupabase(loc);
          }
          set({ sessions: currentSessions });
          storageService.setItem('tailor_sessions', currentSessions);
        } else {
          const remoteMap = new Map(dbSessions.map((s) => [s.id, s]));
          const merged: RunwaySession[] = [...dbSessions.filter((s) => !isMockId(s.id))];
          for (const loc of currentSessions) {
            if (!loc || isMockId(loc.id)) continue;
            if (!remoteMap.has(loc.id)) {
              merged.unshift(loc);
              upsertRunwaySessionToSupabase(loc);
            }
          }
          set({ sessions: merged });
          storageService.setItem('tailor_sessions', merged);
        }
      }

      // 8. Sync Transactions
      const currentTx = get().transactions.filter((t) => t && !isMockId(t.id));
      const dbTx = await fetchLedgerTransactionsFromSupabase();
      if (dbTx !== null) {
        if (dbTx.length === 0 && currentTx.length > 0) {
          for (const loc of currentTx) {
            upsertLedgerTransactionToSupabase(loc);
          }
          set({ transactions: currentTx });
          storageService.setItem('tailor_transactions', currentTx);
        } else {
          const remoteMap = new Map(dbTx.map((t) => [t.id, t]));
          const merged: LedgerTransaction[] = [...dbTx.filter((t) => !isMockId(t.id))];
          for (const loc of currentTx) {
            if (!loc || isMockId(loc.id)) continue;
            if (!remoteMap.has(loc.id)) {
              merged.unshift(loc);
              upsertLedgerTransactionToSupabase(loc);
            }
          }
          set({ transactions: merged });
          storageService.setItem('tailor_transactions', merged);
        }
      }

      // 9. Sync Inventory
      const currentInv = get().inventory.filter((i) => i && !isMockId(i.id));
      const dbInv = await fetchInventoryItemsFromSupabase();
      if (dbInv !== null) {
        if (dbInv.length === 0 && currentInv.length > 0) {
          for (const loc of currentInv) {
            upsertInventoryItemToSupabase(loc);
          }
          set({ inventory: currentInv });
          storageService.setItem('tailor_inventory', currentInv);
        } else {
          const remoteMap = new Map(dbInv.map((i) => [i.id, i]));
          const merged: InventoryItem[] = [...dbInv.filter((i) => !isMockId(i.id))];
          for (const loc of currentInv) {
            if (!loc || isMockId(loc.id)) continue;
            if (!remoteMap.has(loc.id)) {
              merged.unshift(loc);
              upsertInventoryItemToSupabase(loc);
            }
          }
          set({ inventory: merged });
          storageService.setItem('tailor_inventory', merged);
        }
      }

      // 10. Sync Settings (Safely merge to avoid overwriting local settings with blank defaults)
      const currentLocalSettings = get().studioSettings;
      const dbSettings = await fetchStudioSettingsFromSupabase();
      if (dbSettings) {
        const mergedSettings: StudioSettings = {
          ...defaultStudioSettings,
          ...currentLocalSettings,
          ...dbSettings,
          studioName: (dbSettings.studioName && dbSettings.studioName !== 'TAILOR PRO STUDIO')
            ? dbSettings.studioName
            : (currentLocalSettings.studioName || defaultStudioSettings.studioName),
          ownerName: dbSettings.ownerName?.trim() || currentLocalSettings.ownerName || '',
          email: dbSettings.email?.trim() || currentLocalSettings.email || '',
          logoUrl: dbSettings.logoUrl?.trim() || currentLocalSettings.logoUrl || '',
          pairCode: dbSettings.pairCode?.trim() || currentLocalSettings.pairCode || generateMasterWorkshopCode(currentLocalSettings.studioName),
          momoNumber: dbSettings.momoNumber?.trim() || currentLocalSettings.momoNumber || '',
          momoHolderName: dbSettings.momoHolderName?.trim() || currentLocalSettings.momoHolderName || '',
          safetyPin: dbSettings.safetyPin?.trim() || currentLocalSettings.safetyPin || '8888',
          theme: currentLocalSettings.theme || dbSettings.theme || 'light'
        };

        if (
          (currentLocalSettings.ownerName && !dbSettings.ownerName) ||
          (currentLocalSettings.momoNumber && !dbSettings.momoNumber) ||
          (currentLocalSettings.logoUrl && !dbSettings.logoUrl)
        ) {
          upsertStudioSettingsToSupabase(mergedSettings);
        }

        set({ studioSettings: mergedSettings });
        storageService.setItem('tailor_studio_settings', mergedSettings);
      } else if (currentLocalSettings.ownerName || currentLocalSettings.momoNumber || currentLocalSettings.logoUrl) {
        upsertStudioSettingsToSupabase(currentLocalSettings);
      }

      await syncUserAccountsFromSupabase();
      set({ supabaseStatus: 'connected' });
    } catch (err) {
      console.warn('[Supabase Sync] Operating in local mode:', err);
      set({ supabaseStatus: 'offline' });
    } finally {
      set({ isSyncing: false });
    }
  },

  getStats: () => {
    const { clients, transactions, unpaidDeposits } = get();
    const cleanClients = (Array.isArray(clients) ? clients : []).map(sanitizeClient);
    const cleanTx = (Array.isArray(transactions) ? transactions : []).map(sanitizeTransaction);
    const cleanDeposits = (Array.isArray(unpaidDeposits) ? unpaidDeposits : []).map(sanitizeDeposit);

    const clientRevenue = cleanClients.reduce((sum, c) => sum + (c.depositPaid || 0), 0);
    const extraRevenue = cleanTx
      .filter((t) => (t.type === 'deposit' || t.type === 'revenue') && t.status === 'cleared' && !t.clientOrVendor)
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const shopRevenue = clientRevenue + extraRevenue;
    const clientUnpaidBalance = cleanClients
      .filter((c) => (c.balanceDue || 0) > 0)
      .reduce((sum, c) => sum + (c.balanceDue || 0), 0);

    const depositListAmount = cleanDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    const unpaidDepositsAmount = clientUnpaidBalance > 0 ? clientUnpaidBalance : depositListAmount;

    const totalCostAll = cleanClients.reduce((sum, c) => sum + (c.totalCost || 0), 0);
    const paidAll = cleanClients.reduce((sum, c) => sum + (c.depositPaid || 0), 0);
    const rawRate = totalCostAll > 0 ? Math.round((paidAll / totalCostAll) * 100) : 0;
    const collectionRate = isNaN(rawRate) ? 0 : Math.min(100, Math.max(0, rawRate));
    const completedCount = cleanClients.filter((c) => c.runwayStage === 'COMPLETED' || c.runwayStage === 'DELIVERED').length;

    return {
      shopRevenue: parseCleanNumber(shopRevenue),
      unpaidDeposits: parseCleanNumber(unpaidDepositsAmount),
      cashReceived: parseCleanNumber(shopRevenue),
      jobsCompletedTotal: cleanClients.length,
      jobsCompletedCount: completedCount,
      paymentCollectionRate: collectionRate
    };
  }
}));
