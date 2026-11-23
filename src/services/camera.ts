import { RefObject } from 'react';
import { Camera, CameraView, CameraPictureOptions } from 'expo-camera';

export interface CapturedPhoto {
  uri: string;
  width: number;
  height: number;
}

export async function requestCameraPermission(): Promise<boolean> {
  try {
    const res = await Camera.requestCameraPermissionsAsync();
    return res.granted;
  } catch (error) {
    console.error('[camera.ts] requestCameraPermission error:', error);
    return false;
  }
}

export async function capturePhoto(
  cameraRef: RefObject<CameraView | null>,
  options: CameraPictureOptions = { quality: 0.85 },
): Promise<CapturedPhoto | null> {
  if (!cameraRef.current) {
    console.warn('[camera.ts] cameraRef is null');
    return null;
  }

  try {
    const photo = await cameraRef.current.takePictureAsync(options);
    if (!photo || !photo.uri) {
      return null;
    }

    return {
      uri: photo.uri,
      width: photo.width || 0,
      height: photo.height || 0,
    };
  } catch (error) {
    console.error('[camera.ts] capturePhoto error:', error);
    return null;
  }
}
