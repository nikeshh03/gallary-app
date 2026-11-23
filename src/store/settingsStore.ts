import { create } from 'zustand';
import { getSetting, setSetting } from '../services/database';
import { calculateStorageUsage, getCachedStorageUsage } from '../services/storage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type GridColumns = 3 | 4;

export interface SettingsState {
  themeMode: ThemeMode;
  gridColumns: GridColumns;
  storageUsage: string;
  loadSettings: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setGridColumns: (cols: GridColumns) => Promise<void>;
  refreshStorage: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  themeMode: 'system',
  gridColumns: 3,
  storageUsage: getCachedStorageUsage(),

  loadSettings: async () => {
    try {
      const savedTheme = (await getSetting('themeMode', 'system')) as ThemeMode;
      const savedCols = parseInt(await getSetting('gridColumns', '3'), 10) as GridColumns;
      const validCols: GridColumns = savedCols === 4 ? 4 : 3;

      set({
        themeMode: ['light', 'dark', 'system'].includes(savedTheme) ? savedTheme : 'system',
        gridColumns: validCols,
      });

      const usage = await calculateStorageUsage();
      set({ storageUsage: usage });
    } catch (error) {
      console.error('[settingsStore] loadSettings error:', error);
    }
  },

  setThemeMode: async (mode: ThemeMode) => {
    set({ themeMode: mode });
    await setSetting('themeMode', mode);
  },

  setGridColumns: async (cols: GridColumns) => {
    set({ gridColumns: cols });
    await setSetting('gridColumns', String(cols));
  },

  refreshStorage: async () => {
    const usage = await calculateStorageUsage();
    set({ storageUsage: usage });
  },
}));
