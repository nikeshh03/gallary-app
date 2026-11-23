import { PhotoAsset } from '../src/types/photo';

function resolveActiveViewerPhotos(
  contextPhotos: PhotoAsset[] | undefined,
  galleryPhotos: PhotoAsset[],
  trashedIds: Set<string>,
): { activePhotos: PhotoAsset[]; initialIndex: number } {
  const source = contextPhotos || galleryPhotos;
  const activePhotos = source.filter((p) => !trashedIds.has(p.id));
  return {
    activePhotos,
    initialIndex: 0,
  };
}

describe('Photo Viewer Navigation & Swipe Logic', () => {
  const mockPhotos: PhotoAsset[] = [
    {
      id: 'photo-1',
      filename: 'IMG_001.jpg',
      uri: 'file:///photo1.jpg',
      mediaType: 'photo',
      width: 1920,
      height: 1080,
      creationTime: 1000,
      modificationTime: 1000,
    },
    {
      id: 'photo-2',
      filename: 'IMG_002.jpg',
      uri: 'file:///photo2.jpg',
      mediaType: 'photo',
      width: 1920,
      height: 1080,
      creationTime: 2000,
      modificationTime: 2000,
    },
    {
      id: 'photo-3',
      filename: 'IMG_003.jpg',
      uri: 'file:///photo3.jpg',
      mediaType: 'photo',
      width: 1920,
      height: 1080,
      creationTime: 3000,
      modificationTime: 3000,
    },
  ];

  it('uses contextual album photos when provided', () => {
    const albumPhotos = [mockPhotos[1]];
    const trashedIds = new Set<string>();

    const { activePhotos } = resolveActiveViewerPhotos(albumPhotos, mockPhotos, trashedIds);
    expect(activePhotos).toHaveLength(1);
    expect(activePhotos[0].id).toBe('photo-2');
  });

  it('filters out soft-deleted trashed photos during swipe navigation', () => {
    const trashedIds = new Set<string>(['photo-2']);

    const { activePhotos } = resolveActiveViewerPhotos(undefined, mockPhotos, trashedIds);
    expect(activePhotos).toHaveLength(2);
    expect(activePhotos.map((p) => p.id)).toEqual(['photo-1', 'photo-3']);
    expect(activePhotos.some((p) => p.id === 'photo-2')).toBe(false);
  });

  it('resolves correct initialIndex for tapped asset', () => {
    const trashedIds = new Set<string>();
    const { activePhotos } = resolveActiveViewerPhotos(undefined, mockPhotos, trashedIds);

    const targetId = 'photo-3';
    const initialIndex = Math.max(
      0,
      activePhotos.findIndex((p) => p.id === targetId),
    );

    expect(initialIndex).toBe(2);
    expect(activePhotos[initialIndex].id).toBe('photo-3');
  });
});
