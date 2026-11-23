import { useState, useEffect, useCallback, useRef } from 'react';
import { Linking, AppState, AppStateStatus, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library/legacy';
import { Camera } from 'expo-camera';

export type PermissionType = 'mediaLibrary' | 'camera';
export type PermissionStatus = 'undetermined' | 'granted' | 'denied';

function isPermissionGranted(res: any): boolean {
  if (!res) return false;
  return (
    res.granted === true ||
    res.status === 'granted' ||
    res.accessPrivileges === 'all' ||
    res.accessPrivileges === 'limited'
  );
}

export function usePermission(type: PermissionType) {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');
  const appState = useRef(AppState.currentState);

  const checkStatus = useCallback(async () => {
    try {
      if (type === 'mediaLibrary') {
        const res =
          Platform.OS === 'android'
            ? await MediaLibrary.getPermissionsAsync(false, ['photo'])
            : await MediaLibrary.getPermissionsAsync(false);

        if (isPermissionGranted(res)) {
          setStatus('granted');
        } else if (res.canAskAgain) {
          setStatus('undetermined');
        } else {
          setStatus('denied');
        }
      } else {
        const res = await Camera.getCameraPermissionsAsync();
        if (res.granted) {
          setStatus('granted');
        } else if (res.canAskAgain) {
          setStatus('undetermined');
        } else {
          setStatus('denied');
        }
      }
    } catch {
      setStatus('undetermined');
    }
  }, [type]);

  // Check on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Re-check when app returns from background / Settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current?.match(/inactive|background/) && nextState === 'active') {
        checkStatus();
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [checkStatus]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (type === 'mediaLibrary') {
        const res =
          Platform.OS === 'android'
            ? await MediaLibrary.requestPermissionsAsync(false, ['photo'])
            : await MediaLibrary.requestPermissionsAsync(false);

        const granted = isPermissionGranted(res);
        setStatus(granted ? 'granted' : res.canAskAgain ? 'undetermined' : 'denied');
        return granted;
      } else {
        const res = await Camera.requestCameraPermissionsAsync();
        const granted = res.granted;
        setStatus(granted ? 'granted' : res.canAskAgain ? 'undetermined' : 'denied');
        return granted;
      }
    } catch {
      setStatus('denied');
      return false;
    }
  }, [type]);

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  return { status, requestPermission, openSettings, refreshStatus: checkStatus };
}
