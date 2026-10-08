/**
 * Tailor Pro Studio - High-Performance Hybrid Storage Engine
 * 
 * Features:
 * 1. Synchronous dual-layer caching (Memory Cache + localStorage) for instantaneous reads.
 * 2. Asynchronous IndexedDB storage for unlimited capacity, media & large datasets.
 * 3. Automatic bidirectional hydration between localStorage and IndexedDB.
 * 4. Safe quota-error handling.
 */

const DB_NAME = 'TailorProDB';
const DB_VERSION = 1;
const STORE_NAME = 'atelier_kv_store';

// In-memory hot cache to allow synchronous reads during React component initialization
const memoryCache = new Map<string, any>();
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

let dbPromise: Promise<IDBDatabase> | null = null;
let isInitialized = false;

/**
 * Open or retrieve the IndexedDB database instance
 */
function getDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.warn('[Storage] IndexedDB open error, falling back to localStorage/memory:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Helper to safely write to localStorage
 */
function writeToLocalStorage(key: string, value: any): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (err) {
    console.warn(`[Storage] localStorage quota reached or write error for "${key}":`, err);
  }
}

/**
 * Populate initial hot memory cache from localStorage synchronously (fast first paint)
 */
function seedMemoryCacheFromLocalStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('tailor_') || key.startsWith('tps_') || key.startsWith('atelier_'))) {
        try {
          const raw = localStorage.getItem(key);
          if (raw !== null) {
            try {
              memoryCache.set(key, JSON.parse(raw));
            } catch {
              memoryCache.set(key, raw);
            }
          }
        } catch (e) {
          console.warn(`[Storage] Error reading key "${key}" from localStorage:`, e);
        }
      }
    }
  } catch (e) {
    console.warn('[Storage] Could not seed cache from localStorage:', e);
  }
}

// Seed cache immediately upon module evaluation
seedMemoryCacheFromLocalStorage();

/**
 * Hydrate memoryCache and localStorage from IndexedDB
 */
export async function hydrateFromIndexedDB(): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) return;

  try {
    const db = await getDatabase();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const cursorRequest = store.openCursor();

    await new Promise<void>((resolve) => {
      cursorRequest.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const key = cursor.key as string;
          const val = cursor.value;

          // If memoryCache doesn't have it or IndexedDB has it, populate memoryCache
          if (val !== undefined && val !== null) {
            // If memoryCache had empty array/object and IndexedDB has populated data, use IndexedDB
            const existingMem = memoryCache.get(key);
            const isMemEmpty = Array.isArray(existingMem) ? existingMem.length === 0 : !existingMem;
            const isValPopulated = Array.isArray(val) ? val.length > 0 : Boolean(val);

            if (!memoryCache.has(key) || (isMemEmpty && isValPopulated)) {
              memoryCache.set(key, val);
              writeToLocalStorage(key, val);
            }
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      cursorRequest.onerror = () => resolve();
    });

    isInitialized = true;
  } catch (err) {
    console.warn('[Storage] IndexedDB hydration note:', err);
  }
}

// Auto-run hydration on startup
if (typeof window !== 'undefined') {
  hydrateFromIndexedDB();
}

/**
 * Storage Service public API
 */
export const storageService = {
  /**
   * Initialize and ensure storage layers are synced
   */
  async init(): Promise<void> {
    await hydrateFromIndexedDB();
  },

  /**
   * Synchronous get from memory cache or localStorage (instant zero-delay)
   */
  getItemSync<T>(key: string, defaultValue?: T): T {
    if (memoryCache.has(key)) {
      const val = memoryCache.get(key);
      if (val !== undefined && val !== null) {
        return val as T;
      }
    }
    // Fallback check in localStorage if not in memory cache
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) {
          try {
            const parsed = JSON.parse(raw);
            memoryCache.set(key, parsed);
            return parsed as T;
          } catch {
            memoryCache.set(key, raw);
            return raw as unknown as T;
          }
        }
      } catch (e) {}
    }
    return defaultValue as T;
  },

  /**
   * Async get directly from IndexedDB with cache refresh
   */
  async getItem<T>(key: string, defaultValue?: T): Promise<T> {
    try {
      const db = await getDatabase();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      return await new Promise<T>((resolve) => {
        request.onsuccess = () => {
          if (request.result !== undefined && request.result !== null) {
            memoryCache.set(key, request.result);
            writeToLocalStorage(key, request.result);
            resolve(request.result as T);
          } else {
            resolve(this.getItemSync(key, defaultValue));
          }
        };
        request.onerror = () => {
          resolve(this.getItemSync(key, defaultValue));
        };
      });
    } catch {
      return this.getItemSync(key, defaultValue);
    }
  },

  /**
   * Dual-layer save: synchronous memory + localStorage write, plus debounced/async IndexedDB persistence
   */
  setItem<T>(key: string, value: T, debounceMs: number = 100): void {
    // 1. Update hot in-memory cache immediately
    memoryCache.set(key, value);

    // 2. Write to localStorage synchronously so next refresh has it immediately
    writeToLocalStorage(key, value);

    // 3. Clear previous pending debounce timer for this key
    if (debounceTimers.has(key)) {
      clearTimeout(debounceTimers.get(key));
    }

    // 4. Schedule asynchronous durable write to IndexedDB
    const timer = setTimeout(async () => {
      debounceTimers.delete(key);
      try {
        const db = await getDatabase();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(value, key);
      } catch (err) {
        console.warn(`[Storage] IndexedDB write notice for "${key}":`, err);
      }
    }, debounceMs);

    debounceTimers.set(key, timer);
  },

  /**
   * Immediate, non-debounced dual-layer write (used during explicit saves, imports, or backups)
   */
  async setItemImmediate<T>(key: string, value: T): Promise<void> {
    memoryCache.set(key, value);
    writeToLocalStorage(key, value);

    if (debounceTimers.has(key)) {
      clearTimeout(debounceTimers.get(key));
      debounceTimers.delete(key);
    }

    try {
      const db = await getDatabase();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn(`[Storage] setItemImmediate IndexedDB notice for "${key}":`, err);
    }
  },

  /**
   * Remove item from memory, localStorage, and IndexedDB
   */
  async removeItem(key: string): Promise<void> {
    memoryCache.delete(key);
    if (debounceTimers.has(key)) {
      clearTimeout(debounceTimers.get(key));
      debounceTimers.delete(key);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }

    try {
      const db = await getDatabase();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(key);
    } catch (err) {
      console.warn(`[Storage] removeItem notice for "${key}":`, err);
    }
  },

  /**
   * Get all atelier keys and values (used by export / data backup utilities)
   */
  async getAll(): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    // 1. Fill from localStorage & memory cache
    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('tailor_') || k.startsWith('tps_') || k.startsWith('atelier_'))) {
          result[k] = this.getItemSync(k);
        }
      }
    }

    memoryCache.forEach((value, key) => {
      result[key] = value;
    });

    // 2. Supplement from IndexedDB
    try {
      const db = await getDatabase();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const cursorRequest = store.openCursor();

      await new Promise<void>((resolve) => {
        cursorRequest.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            result[cursor.key as string] = cursor.value;
            cursor.continue();
          } else {
            resolve();
          }
        };
        cursorRequest.onerror = () => resolve();
      });
    } catch {}

    return result;
  },

  /**
   * Clear all atelier data
   */
  async clearAll(): Promise<void> {
    memoryCache.clear();
    debounceTimers.forEach((t) => clearTimeout(t));
    debounceTimers.clear();

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('tailor_') || k.startsWith('tps_') || k.startsWith('atelier_'))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {}
    }

    try {
      const db = await getDatabase();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
    } catch (err) {
      console.warn('[Storage] clearAll warning:', err);
    }
  }
};
