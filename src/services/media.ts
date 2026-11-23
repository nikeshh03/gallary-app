import * as MediaLibrary from 'expo-media-library/legacy';
import * as ImagePicker from 'expo-image-picker';
import { PhotoAsset } from '../types/photo';

export interface FetchPhotosOptions {
  first?: number;
  after?: string;
  album?: string;
}

export interface FetchPhotosResult {
  assets: PhotoAsset[];
  endCursor: string | null;
  hasNextPage: boolean;
}

export async function requestMediaPermission(): Promise<boolean> {
  const res = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
  return (
    res.granted ||
    res.status === 'granted' ||
    res.accessPrivileges === 'all' ||
    res.accessPrivileges === 'limited'
  );
}

export async function fetchPhotos(options: FetchPhotosOptions = {}): Promise<FetchPhotosResult> {
  const { first = 50, after, album } = options;

  let page: MediaLibrary.PagedInfo<MediaLibrary.Asset>;

  const queryOptions: any = {
    first,
    mediaType: [MediaLibrary.MediaType?.photo || 'photo'],
  };

  if (after) queryOptions.after = after;
  if (album) queryOptions.album = album;

  try {
    // Try with creationTime descending sort
    queryOptions.sortBy = [[MediaLibrary.SortBy?.creationTime || 'creationTime', false]];
    page = await MediaLibrary.getAssetsAsync(queryOptions);
  } catch (sortError) {
    console.warn('[media.ts] Query with sortBy failed, retrying without sortBy:', sortError);
    delete queryOptions.sortBy;
    try {
      page = await MediaLibrary.getAssetsAsync(queryOptions);
    } catch (fallbackError) {
      console.error('[media.ts] Query without sortBy also failed:', fallbackError);
      throw fallbackError;
    }
  }

  console.log('[media.ts] Loaded assets count:', page.assets?.length ?? 0);

  const assets: PhotoAsset[] = (page.assets || []).map((a) => ({
    id: a.id,
    filename: a.filename || `Photo_${a.id}`,
    uri: a.uri,
    mediaType: a.mediaType || 'photo',
    width: a.width || 0,
    height: a.height || 0,
    creationTime: a.creationTime || Date.now(),
    modificationTime: a.modificationTime || Date.now(),
    duration: a.duration,
  }));

  return {
    assets,
    endCursor: page.endCursor ?? null,
    hasNextPage: page.hasNextPage ?? false,
  };
}

export async function pickPhotosFromDevice(): Promise<PhotoAsset[]> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 0,
      quality: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return [];
    }

    return result.assets.map((a, index) => ({
      id: a.assetId || `local_${Date.now()}_${index}`,
      filename: a.fileName || `Photo_${index + 1}.jpg`,
      uri: a.uri,
      mediaType: 'photo',
      width: a.width || 0,
      height: a.height || 0,
      creationTime: Date.now(),
      modificationTime: Date.now(),
      duration: a.duration ?? undefined,
    }));
  } catch (error) {
    console.error('[media.ts] pickPhotosFromDevice error:', error);
    return [];
  }
}

export async function getAssetById(id: string): Promise<PhotoAsset | null> {
  try {
    const asset = await MediaLibrary.getAssetInfoAsync(id);
    if (!asset) return null;
    return {
      id: asset.id,
      filename: asset.filename || `Photo_${asset.id}`,
      uri: asset.localUri || asset.uri,
      mediaType: asset.mediaType || 'photo',
      width: asset.width || 0,
      height: asset.height || 0,
      creationTime: asset.creationTime || Date.now(),
      modificationTime: asset.modificationTime || Date.now(),
      duration: asset.duration,
    };
  } catch (error) {
    console.error(`Failed to get asset ${id}:`, error);
    return null;
  }
}

export async function getAssetsByIds(ids: string[]): Promise<PhotoAsset[]> {
  const results = await Promise.all(ids.map((id) => getAssetById(id)));
  return results.filter((a): a is PhotoAsset => a !== null);
}

export async function createAsset(uri: string): Promise<PhotoAsset | null> {
  try {
    const asset = await MediaLibrary.createAssetAsync(uri);
    return {
      id: asset.id,
      filename: asset.filename || `Photo_${asset.id}.jpg`,
      uri: (asset as any).localUri || asset.uri,
      mediaType: asset.mediaType || 'photo',
      width: asset.width || 0,
      height: asset.height || 0,
      creationTime: asset.creationTime || Date.now(),
      modificationTime: asset.modificationTime || Date.now(),
      duration: asset.duration,
    };
  } catch (error) {
    console.error('Failed to create asset:', error);
    return null;
  }
}

export async function deleteAssets(assetIds: string[]): Promise<boolean> {
  try {
    return await MediaLibrary.deleteAssetsAsync(assetIds);
  } catch (error) {
    console.error('Failed to delete assets:', error);
    return false;
  }
}
