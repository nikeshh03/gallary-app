import { create } from 'zustand';
import { PhotoAsset } from '../types/photo';
import { fetchPhotos, pickPhotosFromDevice } from '../services/media';

export interface GalleryState {
  photos: PhotoAsset[];
  endCursor: string | null;
  hasNextPage: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  initialized: boolean;
  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setError: (msg: string | null) => void;
  removePhotos: (ids: string[]) => void;
  addPhotos: (newPhotos: PhotoAsset[]) => void;
  importFromDevice: () => Promise<number>;
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  photos: [],
  endCursor: null,
  hasNextPage: true,
  isLoading: false,
  isRefreshing: false,
  error: null,
  initialized: false,

  loadInitial: async () => {
    const { isRefreshing } = get();
    if (isRefreshing) return;

    set({ isLoading: true, error: null });

    try {
      const result = await fetchPhotos({ first: 60 });
      set({
        photos: result.assets,
        endCursor: result.endCursor,
        hasNextPage: result.hasNextPage,
        isLoading: false,
        initialized: true,
        error: null,
      });
    } catch (err: any) {
      console.error('[galleryStore] loadInitial error:', err);
      set({
        isLoading: false,
        initialized: true,
        error: err?.message ? `Failed to load: ${err.message}` : 'Could not access device photos.',
      });
    }
  },

  loadMore: async () => {
    const { hasNextPage, isLoading, isRefreshing, endCursor, photos } = get();
    if (!hasNextPage || isLoading || isRefreshing || !endCursor) return;

    set({ isLoading: true });
    try {
      const result = await fetchPhotos({ first: 60, after: endCursor });
      const existingIds = new Set(photos.map((p) => p.id));
      const newAssets = result.assets.filter((a) => !existingIds.has(a.id));

      set({
        photos: [...photos, ...newAssets],
        endCursor: result.endCursor,
        hasNextPage: result.hasNextPage,
        isLoading: false,
      });
    } catch (err) {
      console.warn('[galleryStore] loadMore error:', err);
      set({ isLoading: false });
    }
  },

  refresh: async () => {
    set({ isRefreshing: true, error: null });
    try {
      const result = await fetchPhotos({ first: 60 });
      set({
        photos: result.assets,
        endCursor: result.endCursor,
        hasNextPage: result.hasNextPage,
        isRefreshing: false,
        initialized: true,
        error: null,
      });
    } catch (err: any) {
      console.error('[galleryStore] refresh error:', err);
      set({
        isRefreshing: false,
        error: err?.message ? `Refresh failed: ${err.message}` : 'Failed to refresh photos.',
      });
    }
  },

  setError: (msg: string | null) => set({ error: msg }),

  removePhotos: (ids: string[]) => {
    const idSet = new Set(ids);
    set((state) => ({
      photos: state.photos.filter((p) => !idSet.has(p.id)),
    }));
  },

  addPhotos: (newPhotos: PhotoAsset[]) => {
    const existingIds = new Set(get().photos.map((p) => p.id));
    const unique = newPhotos.filter((p) => !existingIds.has(p.id));
    set((state) => ({
      photos: [...unique, ...state.photos],
      initialized: true,
    }));
  },

  importFromDevice: async () => {
    try {
      const picked = await pickPhotosFromDevice();
      if (picked.length > 0) {
        get().addPhotos(picked);
        return picked.length;
      }
      return 0;
    } catch (err) {
      console.error('[galleryStore] importFromDevice error:', err);
      return 0;
    }
  },
}));
