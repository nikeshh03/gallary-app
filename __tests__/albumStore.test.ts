import { useAlbumStore } from '../src/store/albumStore';
import * as database from '../src/services/database';

jest.mock('../src/services/database', () => ({
  getAllAlbums: jest.fn().mockResolvedValue([]),
  createAlbum: jest.fn(),
  renameAlbum: jest.fn(),
  deleteAlbum: jest.fn(),
}));

describe('Album Store', () => {
  beforeEach(() => {
    useAlbumStore.setState({ albums: [], isLoading: false, error: null });
    jest.clearAllMocks();
  });

  it('manages album list and creation state', async () => {
    const sampleAlbum = {
      id: 'test_album_1',
      name: 'Vacation',
      coverAssetId: null,
      coverUri: null,
      photoCount: 5,
      createdAt: 1700000000,
      updatedAt: 1700000000,
    };

    useAlbumStore.setState({ albums: [sampleAlbum] });

    const state = useAlbumStore.getState().albums;
    expect(state).toHaveLength(1);
    expect(state[0].name).toBe('Vacation');
    expect(state[0].photoCount).toBe(5);
  });

  it('calls createAlbum service when creating an album', async () => {
    const newAlbum = {
      id: 'album_123',
      name: 'Family',
      coverAssetId: null,
      coverUri: null,
      photoCount: 0,
      createdAt: 1700000000,
      updatedAt: 1700000000,
    };

    (database.createAlbum as jest.Mock).mockResolvedValueOnce(newAlbum);
    (database.getAllAlbums as jest.Mock).mockResolvedValueOnce([newAlbum]);

    const created = await useAlbumStore.getState().createAlbum('Family');
    expect(database.createAlbum).toHaveBeenCalledWith('Family');
    expect(created?.name).toBe('Family');
    expect(useAlbumStore.getState().albums).toHaveLength(1);
  });
});
