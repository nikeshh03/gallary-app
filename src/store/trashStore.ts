import { create } from 'zustand';
import {
  getTrashItems,
  addToTrash,
  removeFromTrash,
  getExpiredTrashItems,
} from '../services/database';
import { deleteAssets } from '../services/media';

export interface TrashItem {
  assetId: string;
  deletedAt: number;
}

export interface TrashState {
  trashedIds: Set<string>;
  trashItems: TrashItem[];
  isLoading: boolean;
  loadTrash: () => Promise<void>;
  trashPhotos: (assetIds: string[]) => Promise<void>;
  restorePhotos: (assetIds: string[]) => Promise<void>;
  permanentlyDelete: (assetIds: string[]) => Promise<void>;
  cleanupExpired: () => Promise<number>;
}

export const useTrashStore = create<TrashState>((set, get) => ({
  trashedIds: new Set<string>(),
  trashItems: [],
  isLoading: false,

  loadTrash: async () => {
    try {
      set({ isLoading: true });
      const items = await getTrashItems();
      const ids = new Set(items.map((i) => i.assetId));
      set({
        trashItems: items,
        trashedIds: ids,
        isLoading: false,
      });
    } catch (error) {
      console.error('[trashStore] loadTrash error:', error);
      set({ isLoading: false });
    }
  },

  trashPhotos: async (assetIds: string[]) => {
    if (assetIds.length === 0) return;
    try {
      await addToTrash(assetIds);
      const nextIds = new Set(get().trashedIds);
      const now = Date.now();
      const newItems: TrashItem[] = [];

      for (const id of assetIds) {
        nextIds.add(id);
        newItems.push({ assetId: id, deletedAt: now });
      }

      set({
        trashedIds: nextIds,
        trashItems: [...newItems, ...get().trashItems.filter((i) => !nextIds.has(i.assetId))],
      });
      await get().loadTrash();
    } catch (error) {
      console.error('[trashStore] trashPhotos error:', error);
    }
  },

  restorePhotos: async (assetIds: string[]) => {
    if (assetIds.length === 0) return;
    try {
      await removeFromTrash(assetIds);
      const nextIds = new Set(get().trashedIds);
      for (const id of assetIds) {
        nextIds.delete(id);
      }
      set({
        trashedIds: nextIds,
        trashItems: get().trashItems.filter((i) => !assetIds.includes(i.assetId)),
      });
      await get().loadTrash();
    } catch (error) {
      console.error('[trashStore] restorePhotos error:', error);
    }
  },

  permanentlyDelete: async (assetIds: string[]) => {
    if (assetIds.length === 0) return;
    try {
      await deleteAssets(assetIds);
      await removeFromTrash(assetIds);
      const nextIds = new Set(get().trashedIds);
      for (const id of assetIds) {
        nextIds.delete(id);
      }
      set({
        trashedIds: nextIds,
        trashItems: get().trashItems.filter((i) => !assetIds.includes(i.assetId)),
      });
      await get().loadTrash();
    } catch (error) {
      console.error('[trashStore] permanentlyDelete error:', error);
    }
  },

  cleanupExpired: async () => {
    try {
      const expired = await getExpiredTrashItems(30);
      if (expired.length > 0) {
        const expiredIds = expired.map((e) => e.assetId);
        await deleteAssets(expiredIds);
        await removeFromTrash(expiredIds);
        await get().loadTrash();
        return expired.length;
      }
      return 0;
    } catch (error) {
      console.error('[trashStore] cleanupExpired error:', error);
      return 0;
    }
  },
}));
