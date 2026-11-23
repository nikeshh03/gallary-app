import { useGalleryStore } from '../src/store/galleryStore';

describe('Gallery Store', () => {
  it('manages photo list and removal cleanly', () => {
    const initialPhotos = [
      {
        id: 'photo-1',
        filename: 'IMG_001.jpg',
        uri: 'file:///photo-1.jpg',
        mediaType: 'photo',
        width: 1920,
        height: 1080,
        creationTime: 1700000000,
        modificationTime: 1700000000,
      },
      {
        id: 'photo-2',
        filename: 'IMG_002.jpg',
        uri: 'file:///photo-2.jpg',
        mediaType: 'photo',
        width: 1920,
        height: 1080,
        creationTime: 1700000001,
        modificationTime: 1700000001,
      },
    ];

    useGalleryStore.setState({ photos: initialPhotos });

    expect(useGalleryStore.getState().photos).toHaveLength(2);

    useGalleryStore.getState().removePhotos(['photo-1']);
    const remaining = useGalleryStore.getState().photos;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('photo-2');
  });
});
