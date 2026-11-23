import { create } from 'zustand';

export interface SelectionState {
  isSelecting: boolean;
  selectedIds: Set<string>;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  isSelecting: false,
  selectedIds: new Set<string>(),

  enterSelectionMode: () => {
    set({ isSelecting: true });
  },

  exitSelectionMode: () => {
    set({ isSelecting: false, selectedIds: new Set<string>() });
  },

  toggleSelection: (id: string) => {
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return {
        selectedIds: next,
        isSelecting: next.size > 0 ? true : state.isSelecting,
      };
    });
  },

  selectAll: (ids: string[]) => {
    set({ selectedIds: new Set(ids), isSelecting: true });
  },

  clearSelection: () => {
    set({ selectedIds: new Set<string>() });
  },
}));
