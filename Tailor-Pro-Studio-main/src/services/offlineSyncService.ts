import {
  upsertClientToSupabase,
  upsertApprenticeToSupabase,
  upsertApprenticeTaskToSupabase,
  upsertUnpaidDepositToSupabase,
  upsertRunwaySessionToSupabase,
  upsertLedgerTransactionToSupabase,
  upsertInventoryItemToSupabase,
  upsertStudioSettingsToSupabase
} from './supabaseService';

export interface QueuedSyncItem {
  id: string;
  type: 'client' | 'apprentice' | 'task' | 'deposit' | 'session' | 'transaction' | 'inventory' | 'settings';
  payload: any;
  timestamp: number;
}

const QUEUE_STORAGE_KEY = 'tailor_offline_sync_queue';

/**
 * Get all queued offline items from localStorage
 */
export function getOfflineQueue(): QueuedSyncItem[] {
  try {
    const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('[Offline Sync] Failed to parse queue:', e);
    return [];
  }
}

/**
 * Add an item to the offline sync queue
 */
export function queueOfflineAction(type: QueuedSyncItem['type'], payload: any) {
  const queue = getOfflineQueue();
  const id = payload.id ? String(payload.id) : `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  // Replace existing item if same ID and type, else push new
  const existingIdx = queue.findIndex((i) => i.type === type && i.id === id);
  const newItem: QueuedSyncItem = {
    id,
    type,
    payload,
    timestamp: Date.now()
  };

  if (existingIdx >= 0) {
    queue[existingIdx] = newItem;
  } else {
    queue.push(newItem);
  }

  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  console.log(`[Offline Sync] Queued ${type} (${id}) for later sync. Total queued: ${queue.length}`);
}

/**
 * Flush and sync all queued offline items to Supabase DB when online
 */
export async function flushOfflineQueue(): Promise<{ syncedCount: number; errorsCount: number }> {
  if (!navigator.onLine) {
    console.log('[Offline Sync] Device still offline. Skipping flush.');
    return { syncedCount: 0, errorsCount: 0 };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, errorsCount: 0 };
  }

  console.log(`[Offline Sync] Starting queue flush of ${queue.length} items...`);
  const remainingQueue: QueuedSyncItem[] = [];
  let syncedCount = 0;
  let errorsCount = 0;

  for (const item of queue) {
    let success = false;

    try {
      switch (item.type) {
        case 'client':
          success = await upsertClientToSupabase(item.payload);
          break;
        case 'apprentice':
          success = await upsertApprenticeToSupabase(item.payload);
          break;
        case 'task':
          success = await upsertApprenticeTaskToSupabase(item.payload);
          break;
        case 'deposit':
          success = await upsertUnpaidDepositToSupabase(item.payload);
          break;
        case 'session':
          success = await upsertRunwaySessionToSupabase(item.payload);
          break;
        case 'transaction':
          success = await upsertLedgerTransactionToSupabase(item.payload);
          break;
        case 'inventory':
          success = await upsertInventoryItemToSupabase(item.payload);
          break;
        case 'settings':
          success = await upsertStudioSettingsToSupabase(item.payload);
          break;
      }
    } catch (err) {
      console.warn(`[Offline Sync] Error syncing ${item.type} (${item.id}):`, err);
      success = false;
    }

    if (success) {
      syncedCount++;
    } else {
      errorsCount++;
      remainingQueue.push(item);
    }
  }

  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remainingQueue));
  console.log(`[Offline Sync] Flush complete. Synced: ${syncedCount}, Remaining in queue: ${remainingQueue.length}`);
  return { syncedCount, errorsCount };
}

/**
 * Subscribe to online/offline network status changes
 */
export function subscribeNetworkStatus(onChange: (isOnline: boolean, flushedCount?: number) => void) {
  const handleOnline = async () => {
    console.log('[Network Status] Device is ONLINE 🌐. Flushing offline queue...');
    const result = await flushOfflineQueue();
    onChange(true, result.syncedCount);
  };

  const handleOffline = () => {
    console.log('[Network Status] Device is OFFLINE 📶. Operating in local cache mode.');
    onChange(false, 0);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
