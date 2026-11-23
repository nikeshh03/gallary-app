export interface Album {
  id: string;
  name: string;
  coverAssetId?: string | null;
  coverUri?: string | null;
  photoCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface AlbumPhotoRecord {
  albumId: string;
  assetId: string;
  uri?: string | null;
  addedAt: number;
}

