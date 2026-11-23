import { PhotoAsset } from '../types/photo';

export type GalleryStackParamList = {
  Gallery: undefined;
  PhotoViewer: {
    assetId: string;
    contextPhotos?: PhotoAsset[];
  };
  PhotoEditor: { uri: string };
};

export type AlbumStackParamList = {
  Albums: undefined;
  AlbumDetail: { albumId: string; albumName: string };
  PhotoViewer: {
    assetId: string;
    contextPhotos?: PhotoAsset[];
  };
  PhotoEditor: { uri: string };
};

export type CameraStackParamList = {
  Camera: undefined;
  Preview: { uri: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
  Trash: undefined;
};

export type RootTabParamList = {
  GalleryTab: undefined;
  AlbumsTab: undefined;
  CameraTab: undefined;
  SettingsTab: undefined;
};
