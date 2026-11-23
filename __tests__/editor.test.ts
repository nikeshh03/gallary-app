import {
  cropImage,
  rotateImage,
  flipImage,
  saveEditedImage,
} from '../src/services/editor';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import * as mediaService from '../src/services/media';

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockResolvedValue({
    uri: 'file:///mock_manipulated.jpg',
    width: 800,
    height: 600,
  }),
  FlipType: {
    Horizontal: 'horizontal',
    Vertical: 'vertical',
  },
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  },
}));

jest.mock('../src/services/media', () => ({
  createAsset: jest.fn().mockResolvedValue({
    id: 'new_edited_asset',
    uri: 'file:///mock_manipulated.jpg',
    filename: 'Photo_new.jpg',
    mediaType: 'photo',
    width: 800,
    height: 600,
    creationTime: 1700000000,
    modificationTime: 1700000000,
  }),
}));

describe('Photo Editor Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rotates image by specified degrees', async () => {
    const result = await rotateImage('file:///input.jpg', 90);
    expect(result).toBe('file:///mock_manipulated.jpg');
    expect(manipulateAsync).toHaveBeenCalledWith(
      'file:///input.jpg',
      [{ rotate: 90 }],
      { compress: 0.9, format: SaveFormat.JPEG },
    );
  });

  it('flips image horizontally and vertically', async () => {
    await flipImage('file:///input.jpg', 'horizontal');
    expect(manipulateAsync).toHaveBeenCalledWith(
      'file:///input.jpg',
      [{ flip: FlipType.Horizontal }],
      { compress: 0.9, format: SaveFormat.JPEG },
    );

    await flipImage('file:///input.jpg', 'vertical');
    expect(manipulateAsync).toHaveBeenCalledWith(
      'file:///input.jpg',
      [{ flip: FlipType.Vertical }],
      { compress: 0.9, format: SaveFormat.JPEG },
    );
  });

  it('crops image with origin and dimensions', async () => {
    const result = await cropImage('file:///input.jpg', {
      originX: 10,
      originY: 20,
      width: 100,
      height: 150,
    });
    expect(result).toBe('file:///mock_manipulated.jpg');
    expect(manipulateAsync).toHaveBeenCalledWith(
      'file:///input.jpg',
      [{ crop: { originX: 10, originY: 20, width: 100, height: 150 } }],
      { compress: 0.9, format: SaveFormat.JPEG },
    );
  });

  it('saves edited image as a new asset in media library', async () => {
    const asset = await saveEditedImage('file:///mock_manipulated.jpg');
    expect(asset).not.toBeNull();
    expect(asset?.id).toBe('new_edited_asset');
    expect(mediaService.createAsset).toHaveBeenCalledWith('file:///mock_manipulated.jpg');
  });
});
