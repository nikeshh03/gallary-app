import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import { createAsset } from './media';
import { PhotoAsset } from '../types/photo';

export interface CropDimensions {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export async function cropImage(uri: string, crop: CropDimensions): Promise<string> {
  try {
    // Ensure all values are non-negative integers
    const sanitizedCrop = {
      originX: Math.max(0, Math.round(crop.originX)),
      originY: Math.max(0, Math.round(crop.originY)),
      width: Math.max(1, Math.round(crop.width)),
      height: Math.max(1, Math.round(crop.height)),
    };

    const result = await manipulateAsync(
      uri,
      [{ crop: sanitizedCrop }],
      { compress: 0.9, format: SaveFormat.JPEG },
    );
    return result.uri;
  } catch (error) {
    console.error('[editor.ts] cropImage error:', error);
    throw new Error('Could not crop photo.');
  }
}

export async function rotateImage(uri: string, degrees: number): Promise<string> {
  try {
    const result = await manipulateAsync(
      uri,
      [{ rotate: degrees }],
      { compress: 0.9, format: SaveFormat.JPEG },
    );
    return result.uri;
  } catch (error) {
    console.error('[editor.ts] rotateImage error:', error);
    throw new Error('Could not rotate photo.');
  }
}

export async function flipImage(
  uri: string,
  direction: 'horizontal' | 'vertical',
): Promise<string> {
  try {
    const flipAction =
      direction === 'horizontal' ? FlipType.Horizontal : FlipType.Vertical;

    const result = await manipulateAsync(
      uri,
      [{ flip: flipAction }],
      { compress: 0.9, format: SaveFormat.JPEG },
    );
    return result.uri;
  } catch (error) {
    console.error('[editor.ts] flipImage error:', error);
    throw new Error('Could not flip photo.');
  }
}

export async function saveEditedImage(uri: string): Promise<PhotoAsset | null> {
  try {
    return await createAsset(uri);
  } catch (error) {
    console.error('[editor.ts] saveEditedImage error:', error);
    throw new Error('Could not save edited photo.');
  }
}
