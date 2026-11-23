import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraStackParamList } from '../../navigation/types';
import { createAsset } from '../../services/media';
import { useGalleryStore } from '../../store/galleryStore';
import { ActionButton } from '../../components/ActionButton';
import { fontSizes, radii, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<CameraStackParamList, 'Preview'>;

export function PreviewScreen({ route, navigation }: Props) {
  const { uri } = route.params;
  const insets = useSafeAreaInsets();
  const addPhotos = useGalleryStore((state) => state.addPhotos);

  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleRetake = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const newAsset = await createAsset(uri);

      if (newAsset) {
        addPhotos([newAsset]);
        setFeedbackMessage('Photo saved');

        // Dismiss feedback and navigate back after 2 seconds per Design.md
        setTimeout(() => {
          navigation.goBack();
        }, 1200);
      } else {
        setFeedbackMessage('Could not save photo');
        setTimeout(() => {
          setFeedbackMessage(null);
          setIsSaving(false);
        }, 3000);
      }
    } catch (error) {
      console.error('[PreviewScreen] Save error:', error);
      setFeedbackMessage('Could not save photo');
      setTimeout(() => {
        setFeedbackMessage(null);
        setIsSaving(false);
      }, 3000);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Captured Image Preview */}
      <Image
        source={{ uri }}
        style={styles.image}
        contentFit="contain"
        accessibilityLabel="Captured photo preview"
      />

      {/* Top Header Overlay with Back Icon */}
      <View
        style={[
          styles.headerOverlay,
          {
            paddingTop: insets.top,
            height: 56 + insets.top,
          },
        ]}
      >
        <Pressable
          onPress={handleRetake}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Back to camera"
        >
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Feedback Message */}
      {feedbackMessage && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{feedbackMessage}</Text>
        </View>
      )}

      {/* Bottom Actions Overlay */}
      <View
        style={[
          styles.footerOverlay,
          {
            paddingBottom: Math.max(insets.bottom, spacing.md),
          },
        ]}
      >
        <ActionButton
          label="Retake"
          variant="secondary"
          onPress={handleRetake}
          disabled={isSaving}
          accessibilityLabel="Retake photo"
          style={styles.actionButton}
        />
        <ActionButton
          label="Save"
          variant="primary"
          onPress={handleSave}
          loading={isSaving}
          accessibilityLabel="Save photo to library"
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackContainer: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
    zIndex: 30,
  },
  feedbackText: {
    color: '#FFFFFF',
    fontSize: fontSizes.body,
    fontWeight: '500',
  },
  footerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
    zIndex: 10,
  },
  actionButton: {
    flex: 1,
  },
});
