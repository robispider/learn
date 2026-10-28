import { createJSONStorage, type StateStorage } from 'zustand/middleware';

/**
 * localStorage that never throws: private windows, blocked site data and quota errors fall back
 * to an in-memory map so the app keeps working (progress just won't survive a reload).
 */
const memory = new Map<string, string>();

export const safeStorage: StateStorage = {
  getItem: (key) => {
    try {
      return globalThis.localStorage?.getItem(key) ?? memory.get(key) ?? null;
    } catch {
      return memory.get(key) ?? null;
    }
  },
  setItem: (key, value) => {
    memory.set(key, value);
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      /* keep the in-memory copy */
    }
  },
  removeItem: (key) => {
    memory.delete(key);
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const jsonStorage = createJSONStorage(() => safeStorage);

export const STORAGE_PREFIX = 'khelaghor:';
