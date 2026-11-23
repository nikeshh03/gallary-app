import { useTrashStore } from '../src/store/trashStore';
import * as database from '../src/services/database';
import * as media from '../src/services/media';

let mockItems = [{ assetId: 'trashed-1', deletedAt: 1700000000 }];

jest.mock('../src/services/database', () => ({
  getTrashItems: jest.fn().mockImplementation(() => Promise.resolve([...mockItems])),
  addToTrash: jest.fn().mockImplementation((ids: string[]) => {
    ids.forEach((id) => mockItems.push({ assetId: id, deletedAt: Date.now() }));
    return Promise.resolve();
  }),
  removeFromTrash: jest.fn().mockImplementation((ids: string[]) => {
    mockItems = mockItems.filter((i) => !ids.includes(i.assetId));
    return Promise.resolve();
  }),
  getExpiredTrashItems: jest.fn().mockResolvedValue([
    { assetId: 'expired-1', deletedAt: 1600000000 },
  ]),
}));

jest.mock('../src/services/media', () => ({
  deleteAssets: jest.fn().mockResolvedValue(true),
}));

describe('Trash Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads trash from database', async () => {
    await useTrashStore.getState().loadTrash();
    expect(database.getTrashItems).toHaveBeenCalled();
    expect(useTrashStore.getState().trashedIds.has('trashed-1')).toBe(true);
  });

  it('trashes photos and updates store', async () => {
    await useTrashStore.getState().trashPhotos(['photo-10', 'photo-11']);
    expect(database.addToTrash).toHaveBeenCalledWith(['photo-10', 'photo-11']);
    expect(useTrashStore.getState().trashedIds.has('photo-10')).toBe(true);
  });

  it('restores photos from trash', async () => {
    await useTrashStore.getState().restorePhotos(['photo-10']);
    expect(database.removeFromTrash).toHaveBeenCalledWith(['photo-10']);
  });

  it('permanently deletes photos', async () => {
    await useTrashStore.getState().permanentlyDelete(['photo-11']);
    expect(media.deleteAssets).toHaveBeenCalledWith(['photo-11']);
    expect(database.removeFromTrash).toHaveBeenCalledWith(['photo-11']);
  });

  it('cleans up expired trash items', async () => {
    const count = await useTrashStore.getState().cleanupExpired();
    expect(database.getExpiredTrashItems).toHaveBeenCalledWith(30);
    expect(media.deleteAssets).toHaveBeenCalledWith(['expired-1']);
    expect(database.removeFromTrash).toHaveBeenCalledWith(['expired-1']);
    expect(count).toBe(1);
  });
});
