import { create } from 'zustand';
import { Album } from '../types/album';
import {
  getAllAlbums,
  createAlbum,
  renameAlbum,
  deleteAlbum,
} from '../services/database';

export interface AlbumState {
  albums: Album[];
  isLoading: boolean;
  error: string | null;
  loadAlbums: () => Promise<void>;
  createAlbum: (name: string) => Promise<Album | null>;
  renameAlbum: (albumId: string, name: string) => Promise<void>;
  deleteAlbum: (albumId: string) => Promise<void>;
}

export const useAlbumStore = create<AlbumState>((set, get) => ({
  albums: [],
  isLoading: false,
  error: null,

  loadAlbums: async () => {
    set({ isLoading: true, error: null });
    try {
      const albums = await getAllAlbums();
      set({ albums, isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Could not load albums.' });
    }
  },

  createAlbum: async (name: string) => {
    try {
      const album = await createAlbum(name);
      await get().loadAlbums();
      return album;
    } catch {
      return null;
    }
  },

  renameAlbum: async (albumId: string, name: string) => {
    try {
      await renameAlbum(albumId, name);
      await get().loadAlbums();
    } catch (err) {
      console.error('[albumStore] renameAlbum error:', err);
    }
  },

  deleteAlbum: async (albumId: string) => {
    try {
      await deleteAlbum(albumId);
      await get().loadAlbums();
    } catch (err) {
      console.error('[albumStore] deleteAlbum error:', err);
    }
  },
}));

