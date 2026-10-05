import { AppSettings, CalculationHistoryItem, ExportData, SavedRate } from '../types';

const DB_NAME = 'taraju_db';
const DB_VERSION = 1;

const STORES = {
  HISTORY: 'calculation_history',
  SAVED_RATES: 'saved_rates',
  SETTINGS: 'app_settings',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  currency: '₹',
  defaultWeightUnit: 'g',
  defaultRateUnit: 'per_kg',
  decimalPrecision: 2,
  hapticFeedback: true,
  soundFeedback: true,
  theme: 'system',
  compactMode: false,
  defaultCalcMode: 'PRICE_TO_WEIGHT',
  rememberLastRate: true,
  lastUsedRate: 80,
  lastUsedRateUnit: 'per_kg',
  enableShortcuts: true,
  showBreakdownByDefault: false,
  showKeypad: true,
};

const INITIAL_SAVED_RATES: SavedRate[] = [
  { id: 'rate-1', name: 'Rice (चावल)', rate: 60, rateUnit: 'per_kg', updatedAt: Date.now() - 40000 },
  { id: 'rate-2', name: 'Sugar (चीनी)', rate: 45, rateUnit: 'per_kg', updatedAt: Date.now() - 30000 },
  { id: 'rate-3', name: 'Toor Dal (दाल)', rate: 140, rateUnit: 'per_kg', updatedAt: Date.now() - 20000 },
  { id: 'rate-4', name: 'Potato (आलू)', rate: 30, rateUnit: 'per_kg', updatedAt: Date.now() - 10000 },
  { id: 'rate-5', name: 'Onion (प्याज़)', rate: 40, rateUnit: 'per_kg', updatedAt: Date.now() },
];

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isIndexedDBAvailable: boolean;

  constructor() {
    this.isIndexedDBAvailable = typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private openDB(): Promise<IDBDatabase> {
    if (!this.isIndexedDBAvailable) {
      return Promise.reject(new Error('IndexedDB not supported'));
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORES.HISTORY)) {
            const historyStore = db.createObjectStore(STORES.HISTORY, { keyPath: 'id' });
            historyStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
          if (!db.objectStoreNames.contains(STORES.SAVED_RATES)) {
            const ratesStore = db.createObjectStore(STORES.SAVED_RATES, { keyPath: 'id' });
            ratesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          }
          if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
            db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(request.error);
        };
      } catch (err) {
        reject(err);
      }
    });

    return this.dbPromise;
  }

  // Fallback storage helpers
  private getLocal<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(`taraju_${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  private setLocal<T>(key: string, val: T): void {
    try {
      localStorage.setItem(`taraju_${key}`, JSON.stringify(val));
    } catch (e) {
      console.warn('localStorage setItem failed', e);
    }
  }

  // --- HISTORY METHODS ---
  async getHistory(): Promise<CalculationHistoryItem[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.HISTORY, 'readonly');
        const store = tx.objectStore(STORES.HISTORY);
        const request = store.getAll();
        request.onsuccess = () => {
          const items = (request.result || []) as CalculationHistoryItem[];
          items.sort((a, b) => b.timestamp - a.timestamp);
          resolve(items);
        };
        request.onerror = () => {
          resolve(this.getLocal<CalculationHistoryItem[]>('history', []));
        };
      });
    } catch {
      return this.getLocal<CalculationHistoryItem[]>('history', []);
    }
  }

  async addHistory(item: CalculationHistoryItem): Promise<void> {
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.HISTORY, 'readwrite');
        const store = tx.objectStore(STORES.HISTORY);
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const existing = this.getLocal<CalculationHistoryItem[]>('history', []);
      this.setLocal('history', [item, ...existing]);
    }
  }

  async deleteHistoryItem(id: string): Promise<void> {
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.HISTORY, 'readwrite');
        const store = tx.objectStore(STORES.HISTORY);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const existing = this.getLocal<CalculationHistoryItem[]>('history', []);
      this.setLocal('history', existing.filter((item) => item.id !== id));
    }
  }

  async clearHistory(): Promise<void> {
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.HISTORY, 'readwrite');
        const store = tx.objectStore(STORES.HISTORY);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.setLocal('history', []);
    }
  }

  // --- SAVED RATES METHODS ---
  async getSavedRates(): Promise<SavedRate[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.SAVED_RATES, 'readonly');
        const store = tx.objectStore(STORES.SAVED_RATES);
        const request = store.getAll();
        request.onsuccess = () => {
          let items = (request.result || []) as SavedRate[];
          if (items.length === 0) {
            // Check if seeded in localStorage or needs seeding
            const local = this.getLocal<SavedRate[] | null>('saved_rates_seeded', null);
            if (!local) {
              // Seed initial items once
              items = INITIAL_SAVED_RATES;
              this.seedInitialRates(items);
            }
          }
          items.sort((a, b) => b.updatedAt - a.updatedAt);
          resolve(items);
        };
        request.onerror = () => {
          resolve(this.getLocal<SavedRate[]>('saved_rates', INITIAL_SAVED_RATES));
        };
      });
    } catch {
      return this.getLocal<SavedRate[]>('saved_rates', INITIAL_SAVED_RATES);
    }
  }

  private async seedInitialRates(items: SavedRate[]) {
    try {
      this.setLocal('saved_rates_seeded', true);
      const db = await this.openDB();
      const tx = db.transaction(STORES.SAVED_RATES, 'readwrite');
      const store = tx.objectStore(STORES.SAVED_RATES);
      items.forEach((item) => store.put(item));
    } catch {
      this.setLocal('saved_rates', items);
    }
  }

  async saveRate(rate: SavedRate): Promise<void> {
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.SAVED_RATES, 'readwrite');
        const store = tx.objectStore(STORES.SAVED_RATES);
        const req = store.put(rate);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const existing = this.getLocal<SavedRate[]>('saved_rates', []);
      const index = existing.findIndex((r) => r.id === rate.id);
      if (index >= 0) {
        existing[index] = rate;
      } else {
        existing.unshift(rate);
      }
      this.setLocal('saved_rates', existing);
    }
  }

  async deleteSavedRate(id: string): Promise<void> {
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.SAVED_RATES, 'readwrite');
        const store = tx.objectStore(STORES.SAVED_RATES);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const existing = this.getLocal<SavedRate[]>('saved_rates', []);
      this.setLocal('saved_rates', existing.filter((r) => r.id !== id));
    }
  }

  // --- SETTINGS METHODS ---
  async getSettings(): Promise<AppSettings> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.SETTINGS, 'readonly');
        const store = tx.objectStore(STORES.SETTINGS);
        const request = store.get('current');
        request.onsuccess = () => {
          if (request.result && request.result.value) {
            resolve({ ...DEFAULT_SETTINGS, ...request.result.value });
          } else {
            const fallback = this.getLocal<AppSettings>('settings', DEFAULT_SETTINGS);
            resolve(fallback);
          }
        };
        request.onerror = () => {
          resolve(this.getLocal<AppSettings>('settings', DEFAULT_SETTINGS));
        };
      });
    } catch {
      return this.getLocal<AppSettings>('settings', DEFAULT_SETTINGS);
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    this.setLocal('settings', settings);
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.SETTINGS, 'readwrite');
        const store = tx.objectStore(STORES.SETTINGS);
        const req = store.put({ key: 'current', value: settings });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('saveSettings to IDB failed, fallback used', e);
    }
  }

  async resetSettings(): Promise<AppSettings> {
    const fresh = { ...DEFAULT_SETTINGS };
    await this.saveSettings(fresh);
    return fresh;
  }

  // --- EXPORT & IMPORT ---
  async exportAllData(): Promise<ExportData> {
    const [calculationHistory, savedRates, appSettings] = await Promise.all([
      this.getHistory(),
      this.getSavedRates(),
      this.getSettings(),
    ]);

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      calculationHistory,
      savedRates,
      appSettings,
    };
  }

  async importAllData(
    jsonData: string,
    mode: 'replace' | 'merge'
  ): Promise<{ success: boolean; message: string }> {
    try {
      const parsed = JSON.parse(jsonData) as Partial<ExportData>;

      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Invalid backup file format' };
      }

      if (
        !Array.isArray(parsed.calculationHistory) &&
        !Array.isArray(parsed.savedRates) &&
        !parsed.appSettings
      ) {
        return {
          success: false,
          message: 'The file does not contain valid Taraju backup data.',
        };
      }

      // Handle Settings
      if (parsed.appSettings && typeof parsed.appSettings === 'object') {
        const mergedSettings = { ...DEFAULT_SETTINGS, ...parsed.appSettings };
        await this.saveSettings(mergedSettings);
      }

      // Handle Saved Rates
      if (Array.isArray(parsed.savedRates)) {
        if (mode === 'replace') {
          // Clear and set
          const existing = await this.getSavedRates();
          for (const item of existing) {
            await this.deleteSavedRate(item.id);
          }
          for (const item of parsed.savedRates) {
            if (item.id && item.name && typeof item.rate === 'number') {
              await this.saveRate(item);
            }
          }
        } else {
          // Merge
          for (const item of parsed.savedRates) {
            if (item.id && item.name && typeof item.rate === 'number') {
              await this.saveRate(item);
            }
          }
        }
      }

      // Handle History
      if (Array.isArray(parsed.calculationHistory)) {
        if (mode === 'replace') {
          await this.clearHistory();
          for (const item of parsed.calculationHistory) {
            if (item.id && item.mode && typeof item.rate === 'number') {
              await this.addHistory(item);
            }
          }
        } else {
          // Merge avoiding ID collisions
          const existingHistory = await this.getHistory();
          const existingIds = new Set(existingHistory.map((h) => h.id));
          for (const item of parsed.calculationHistory) {
            if (item.id && !existingIds.has(item.id)) {
              await this.addHistory(item);
            }
          }
        }
      }

      return {
        success: true,
        message: `Backup data successfully imported (${mode === 'replace' ? 'replaced' : 'merged'}).`,
      };
    } catch (err) {
      return {
        success: false,
        message: `Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      };
    }
  }
}

export const storage = new StorageService();
