import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, CameraType, FlashMode } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { CameraStackParamList } from '../../navigation/types';
import { usePermission } from '../../hooks/usePermission';
import { capturePhoto } from '../../services/camera';
import { Header } from '../../components/Header';
import { PermissionPrompt } from '../../components/PermissionPrompt';
import { useTheme } from '../../theme/ThemeContext';
import { radii, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<CameraStackParamList, 'Camera'>;

export function CameraScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { status, requestPermission, openSettings } = usePermission('camera');

  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('auto');
  const [isCapturing, setIsCapturing] = useState(false);

  // Shutter flash animation
  const flashOpacity = useSharedValue(0);

  const animatedFlashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const triggerShutterFlash = () => {
    flashOpacity.value = withSequence(
      withTiming(0.8, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  };

  const handleToggleFacing = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const handleCycleFlash = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setFlash((prev) => {
      if (prev === 'auto') return 'on';
      if (prev === 'on') return 'off';
      return 'auto';
    });
  };

  const getFlashIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (flash) {
      case 'on':
        return 'flash';
      case 'off':
        return 'flash-off-outline';
      case 'auto':
      default:
        return 'flash-outline';
    }
  };

  const handleCapture = async () => {
    if (isCapturing) return;

    try {
      setIsCapturing(true);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
      triggerShutterFlash();

      const photo = await capturePhoto(cameraRef, { quality: 0.85 });
      if (photo && photo.uri) {
        navigation.navigate('Preview', { uri: photo.uri });
      }
    } catch (error) {
      console.error('[CameraScreen] Capture error:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  // Permission not granted
  if (status !== 'granted') {
    const isDenied = status === 'denied';
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Camera" />
        <PermissionPrompt
          title="Camera access needed"
          message="Allow camera access to take photos."
          buttonLabel={isDenied ? 'Open Settings' : 'Grant access'}
          onPress={isDenied ? openSettings : requestPermission}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Live Viewfinder */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      />

      {/* Shutter flash animation overlay */}
      <Animated.View
        pointerEvents="none"
        style={[styles.flashOverlay, animatedFlashStyle]}
      />

      {/* Bottom Controls Gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.6)']}
        style={[
          styles.controlsContainer,
          { paddingBottom: Math.max(insets.bottom, spacing.xl) },
        ]}
      >
        <View style={styles.controlsRow}>
          {/* Flip camera button */}
          <Pressable
            onPress={handleToggleFacing}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Switch camera"
          >
            <Ionicons name="camera-reverse-outline" size={28} color="#FFFFFF" />
          </Pressable>

          {/* Shutter button: 72x72 rect, radii.md (8px), inner 44x44 rect radii.sm (4px) */}
          <Pressable
            onPress={handleCapture}
            disabled={isCapturing}
            style={({ pressed }) => [
              styles.shutterOuter,
              pressed && styles.shutterOuterPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
          >
            <View style={styles.shutterInner} />
          </Pressable>

          {/* Flash button */}
          <Pressable
            onPress={handleCycleFlash}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Flash mode: ${flash}`}
          >
            <Ionicons name={getFlashIcon()} size={28} color="#FFFFFF" />
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    zIndex: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: radii.round,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.92 }],
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: radii.round,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shutterOuterPressed: {
    transform: [{ scale: 0.95 }],
    borderColor: '#E5E5E5',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: radii.round,
    backgroundColor: '#FFFFFF',
  },
});
