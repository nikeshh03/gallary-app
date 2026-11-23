import { useSettingsStore } from '../src/store/settingsStore';
import * as database from '../src/services/database';
import * as storage from '../src/services/storage';

jest.mock('../src/services/database', () => ({
  getSetting: jest.fn().mockImplementation((key: string, defaultVal: string) => {
    if (key === 'themeMode') return Promise.resolve('dark');
    if (key === 'gridColumns') return Promise.resolve('4');
    return Promise.resolve(defaultVal);
  }),
  setSetting: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/storage', () => ({
  calculateStorageUsage: jest.fn().mockResolvedValue('1.2 GB'),
  getCachedStorageUsage: jest.fn().mockReturnValue('1.2 GB'),
}));

describe('Settings Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads settings and storage usage from database', async () => {
    await useSettingsStore.getState().loadSettings();
    expect(database.getSetting).toHaveBeenCalledWith('themeMode', 'system');
    expect(database.getSetting).toHaveBeenCalledWith('gridColumns', '3');
    expect(useSettingsStore.getState().themeMode).toBe('dark');
    expect(useSettingsStore.getState().gridColumns).toBe(4);
    expect(useSettingsStore.getState().storageUsage).toBe('1.2 GB');
  });

  it('updates theme mode and persists to database', async () => {
    await useSettingsStore.getState().setThemeMode('light');
    expect(useSettingsStore.getState().themeMode).toBe('light');
    expect(database.setSetting).toHaveBeenCalledWith('themeMode', 'light');
  });

  it('updates grid columns and persists to database', async () => {
    await useSettingsStore.getState().setGridColumns(3);
    expect(useSettingsStore.getState().gridColumns).toBe(3);
    expect(database.setSetting).toHaveBeenCalledWith('gridColumns', '3');
  });
});
