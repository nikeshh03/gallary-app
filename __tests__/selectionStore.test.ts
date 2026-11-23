import { useSelectionStore } from '../src/store/selectionStore';

describe('Selection Store', () => {
  beforeEach(() => {
    useSelectionStore.getState().exitSelectionMode();
  });

  it('enters and exits selection mode', () => {
    expect(useSelectionStore.getState().isSelecting).toBe(false);
    useSelectionStore.getState().enterSelectionMode();
    expect(useSelectionStore.getState().isSelecting).toBe(true);

    useSelectionStore.getState().exitSelectionMode();
    expect(useSelectionStore.getState().isSelecting).toBe(false);
    expect(useSelectionStore.getState().selectedIds.size).toBe(0);
  });

  it('toggles item selection', () => {
    useSelectionStore.getState().toggleSelection('photo-1');
    expect(useSelectionStore.getState().selectedIds.has('photo-1')).toBe(true);
    expect(useSelectionStore.getState().isSelecting).toBe(true);

    useSelectionStore.getState().toggleSelection('photo-2');
    expect(useSelectionStore.getState().selectedIds.size).toBe(2);

    useSelectionStore.getState().toggleSelection('photo-1');
    expect(useSelectionStore.getState().selectedIds.has('photo-1')).toBe(false);
    expect(useSelectionStore.getState().selectedIds.size).toBe(1);
  });

  it('selects all given ids and clears selection', () => {
    useSelectionStore.getState().selectAll(['photo-1', 'photo-2', 'photo-3']);
    expect(useSelectionStore.getState().selectedIds.size).toBe(3);
    expect(useSelectionStore.getState().isSelecting).toBe(true);

    useSelectionStore.getState().clearSelection();
    expect(useSelectionStore.getState().selectedIds.size).toBe(0);
  });
});
