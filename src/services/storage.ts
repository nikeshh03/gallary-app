import * as FileSystem from 'expo-file-system';
import { formatBytes } from '../utils/format';
import { useGalleryStore } from '../store/galleryStore';

let cachedStorageUsage: string | null = null;

export async function calculateStorageUsage(): Promise<string> {
  const photos = useGalleryStore.getState().photos;
  if (photos.length === 0) {
    cachedStorageUsage = '0 B';
    return cachedStorageUsage;
  }

  try {
    let totalBytes = 0;
    // Sample or inspect up to 50 photos to get exact or estimated size
    const sampleSize = Math.min(photos.length, 20);
    let sampleBytes = 0;
    let sampleCount = 0;

    for (let i = 0; i < sampleSize; i++) {
      const uri = photos[i].uri;
      if (uri.startsWith('file://')) {
        try {
          const info = await FileSystem.getInfoAsync(uri);
          if (info.exists && info.size) {
            sampleBytes += info.size;
            sampleCount++;
          }
        } catch {
          // ignore individual file errors
        }
      }
    }

    if (sampleCount > 0) {
      const averageBytesPerPhoto = sampleBytes / sampleCount;
      totalBytes = Math.round(averageBytesPerPhoto * photos.length);
    } else {
      // Conservative estimate based on typical 12MP-48MP mobile photos (~2.5 MB each)
      totalBytes = photos.length * 2.5 * 1024 * 1024;
    }

    cachedStorageUsage = formatBytes(totalBytes);
    return cachedStorageUsage;
  } catch (error) {
    console.error('[storage.ts] calculateStorageUsage error:', error);
    return cachedStorageUsage || 'Calculating...';
  }
}

export function getCachedStorageUsage(): string {
  return cachedStorageUsage || '0 B';
}
