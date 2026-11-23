import { capturePhoto, requestCameraPermission } from '../src/services/camera';
import { Camera } from 'expo-camera';

jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  },
  CameraView: jest.fn(),
}));

describe('Camera Service', () => {
  it('requests camera permissions and returns granted status', async () => {
    const granted = await requestCameraPermission();
    expect(granted).toBe(true);
    expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
  });

  it('captures photo through camera ref', async () => {
    const mockTakePicture = jest.fn().mockResolvedValue({
      uri: 'file:///data/user/0/com.gallery.mobileapp/cache/camera_123.jpg',
      width: 1920,
      height: 1080,
    });

    const mockRef = {
      current: {
        takePictureAsync: mockTakePicture,
      },
    } as any;

    const result = await capturePhoto(mockRef, { quality: 0.85 });

    expect(result).not.toBeNull();
    expect(result?.uri).toBe('file:///data/user/0/com.gallery.mobileapp/cache/camera_123.jpg');
    expect(result?.width).toBe(1920);
    expect(result?.height).toBe(1080);
    expect(mockTakePicture).toHaveBeenCalledWith({ quality: 0.85 });
  });

  it('returns null if camera ref is null', async () => {
    const mockRef = { current: null };
    const result = await capturePhoto(mockRef as any);
    expect(result).toBeNull();
  });
});
