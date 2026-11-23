import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  Image as RNImage,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GalleryStackParamList } from '../../navigation/types';
import { EditorTool, AspectRatioPreset } from '../../types/editor';
import {
  cropImage,
  rotateImage,
  flipImage,
  saveEditedImage,
} from '../../services/editor';
import { useGalleryStore } from '../../store/galleryStore';
import { ActionButton } from '../../components/ActionButton';
import { CropOverlay, CropBox } from '../../components/editor/CropOverlay';
import { useTheme } from '../../theme/ThemeContext';
import { fontSizes, radii, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<GalleryStackParamList, 'PhotoEditor'>;

export function PhotoEditorScreen({ route, navigation }: Props) {
  const { uri } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const addPhotos = useGalleryStore((state) => state.addPhotos);

  const [currentUri, setCurrentUri] = useState(uri);
  const [hasEdits, setHasEdits] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTool, setActiveTool] = useState<EditorTool | null>('crop');
  const [cropPreset, setCropPreset] = useState<AspectRatioPreset>('Free');

  // Natural image dimensions in pixels
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Rendered layout bounds for image inside preview container
  const [previewLayout, setPreviewLayout] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  const [cropBox, setCropBox] = useState<CropBox>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Calculate natural image size whenever currentUri changes
  useEffect(() => {
    RNImage.getSize(
      currentUri,
      (w, h) => {
        setImageSize({ width: w, height: h });
      },
      (err) => {
        console.warn('[PhotoEditor] Failed to get image size:', err);
      },
    );
  }, [currentUri]);

  // Adjust preview layout dimensions within the preview container
  const previewMaxHeight = screenHeight - insets.top - insets.bottom - 220;
  const previewMaxWidth = screenWidth - spacing.md * 2;

  useEffect(() => {
    if (imageSize.width > 0 && imageSize.height > 0) {
      const imgRatio = imageSize.width / imageSize.height;
      let displayW = previewMaxWidth;
      let displayH = displayW / imgRatio;

      if (displayH > previewMaxHeight) {
        displayH = previewMaxHeight;
        displayW = displayH * imgRatio;
      }

      setPreviewLayout({ width: displayW, height: displayH });
      setCropBox({
        x: 0,
        y: 0,
        width: displayW,
        height: displayH,
      });
    }
  }, [imageSize, screenWidth, previewMaxHeight, previewMaxWidth]);

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const newAsset = await saveEditedImage(currentUri);
      if (newAsset) {
        addPhotos([newAsset]);
      }
      navigation.goBack();
    } catch (error) {
      console.error('[PhotoEditor] Save failed:', error);
      setIsProcessing(false);
    }
  };

  const handleRotate = async (degrees: number) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const newUri = await rotateImage(currentUri, degrees);
      setCurrentUri(newUri);
      setHasEdits(true);
    } catch (error) {
      console.error('[PhotoEditor] Rotate failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFlip = async (direction: 'horizontal' | 'vertical') => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const newUri = await flipImage(currentUri, direction);
      setCurrentUri(newUri);
      setHasEdits(true);
    } catch (error) {
      console.error('[PhotoEditor] Flip failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyCrop = async () => {
    if (
      isProcessing ||
      previewLayout.width <= 0 ||
      previewLayout.height <= 0 ||
      imageSize.width <= 0 ||
      imageSize.height <= 0
    ) {
      return;
    }

    try {
      setIsProcessing(true);
      const scaleX = imageSize.width / previewLayout.width;
      const scaleY = imageSize.height / previewLayout.height;

      const originX = Math.max(0, Math.round(cropBox.x * scaleX));
      const originY = Math.max(0, Math.round(cropBox.y * scaleY));
      const width = Math.min(
        imageSize.width - originX,
        Math.round(cropBox.width * scaleX),
      );
      const height = Math.min(
        imageSize.height - originY,
        Math.round(cropBox.height * scaleY),
      );

      const newUri = await cropImage(currentUri, {
        originX,
        originY,
        width,
        height,
      });

      setCurrentUri(newUri);
      setHasEdits(true);
    } catch (error) {
      console.error('[PhotoEditor] Crop failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, spacing.xs),
        },
      ]}
    >
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={handleCancel}
          style={styles.cancelButton}
          accessibilityRole="button"
          accessibilityLabel="Cancel editing"
        >
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
            Cancel
          </Text>
        </Pressable>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit</Text>

        <ActionButton
          label="Save"
          variant="primary"
          onPress={handleSave}
          disabled={!hasEdits || isProcessing}
          loading={isProcessing}
          accessibilityLabel="Save edited photo"
          style={styles.saveButton}
        />
      </View>

      {/* Middle Image Preview Area */}
      <View style={styles.previewContainer}>
        {previewLayout.width > 0 && previewLayout.height > 0 ? (
          <View
            style={[
              styles.imageWrapper,
              {
                width: previewLayout.width,
                height: previewLayout.height,
              },
            ]}
          >
            <Image
              source={{ uri: currentUri }}
              style={{
                width: previewLayout.width,
                height: previewLayout.height,
              }}
              contentFit="contain"
              accessibilityLabel="Photo editor preview"
            />

            {activeTool === 'crop' && (
              <CropOverlay
                layoutWidth={previewLayout.width}
                layoutHeight={previewLayout.height}
                preset={cropPreset}
                cropBox={cropBox}
                onCropBoxChange={setCropBox}
              />
            )}
          </View>
        ) : (
          <ActivityIndicator size="large" color={colors.accent} />
        )}

        {isProcessing && (
          <View
            style={[
              styles.processingOverlay,
              { backgroundColor: colors.overlay },
            ]}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Sub-controls for active tool */}
      {activeTool === 'rotate' && (
        <View style={[styles.subControlsBar, { borderTopColor: colors.border }]}>
          <Pressable
            onPress={() => handleRotate(-90)}
            style={[styles.subActionButton, { borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Rotate left 90 degrees"
          >
            <Ionicons name="return-down-back" size={20} color={colors.text} />
            <Text style={[styles.subActionText, { color: colors.text }]}>
              Left
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleRotate(90)}
            style={[styles.subActionButton, { borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Rotate right 90 degrees"
          >
            <Ionicons
              name="return-down-forward"
              size={20}
              color={colors.text}
            />
            <Text style={[styles.subActionText, { color: colors.text }]}>
              Right
            </Text>
          </Pressable>
        </View>
      )}

      {activeTool === 'flip' && (
        <View style={[styles.subControlsBar, { borderTopColor: colors.border }]}>
          <Pressable
            onPress={() => handleFlip('horizontal')}
            style={[styles.subActionButton, { borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Flip horizontal"
          >
            <Ionicons name="swap-horizontal" size={20} color={colors.text} />
            <Text style={[styles.subActionText, { color: colors.text }]}>
              Horizontal
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleFlip('vertical')}
            style={[styles.subActionButton, { borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Flip vertical"
          >
            <Ionicons name="swap-vertical" size={20} color={colors.text} />
            <Text style={[styles.subActionText, { color: colors.text }]}>
              Vertical
            </Text>
          </Pressable>
        </View>
      )}

      {activeTool === 'crop' && (
        <View style={[styles.subControlsBar, { borderTopColor: colors.border }]}>
          <View style={styles.presetsRow}>
            {(['Free', '1:1', '4:3', '16:9'] as AspectRatioPreset[]).map(
              (preset) => {
                const isActive = cropPreset === preset;
                return (
                  <Pressable
                    key={preset}
                    onPress={() => setCropPreset(preset)}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: isActive
                          ? colors.accent
                          : colors.surfaceAlt,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Crop ratio ${preset}`}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        { color: isActive ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {preset}
                    </Text>
                  </Pressable>
                );
              },
            )}
          </View>

          <Pressable
            onPress={handleApplyCrop}
            style={[styles.applyButton, { backgroundColor: colors.accent }]}
            accessibilityRole="button"
            accessibilityLabel="Apply crop"
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </Pressable>
        </View>
      )}

      {/* Bottom Tool Bar */}
      <View
        style={[
          styles.toolBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        {(['crop', 'rotate', 'flip'] as EditorTool[]).map((tool) => {
          const isActive = activeTool === tool;
          let iconName: keyof typeof Ionicons.glyphMap = 'crop';
          let label = 'Crop';

          if (tool === 'rotate') {
            iconName = 'return-down-forward';
            label = 'Rotate';
          } else if (tool === 'flip') {
            iconName = 'swap-horizontal';
            label = 'Flip';
          }

          return (
            <Pressable
              key={tool}
              onPress={() => setActiveTool(tool)}
              style={[
                styles.toolButton,
                isActive && {
                  backgroundColor: colors.accentLight,
                  borderRadius: radii.sm,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${label} tool`}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isActive ? colors.accent : colors.icon}
              />
              <Text
                style={[
                  styles.toolLabel,
                  {
                    color: isActive ? colors.accent : colors.textSecondary,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  cancelButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  cancelText: {
    fontSize: fontSizes.subtitle,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: fontSizes.subtitle,
    fontWeight: '600',
  },
  saveButton: {
    minWidth: 80,
    minHeight: 44,
    borderRadius: radii.sm,
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    overflow: 'hidden',
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subControlsBar: {
    borderTopWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  subActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radii.sm,
  },
  subActionText: {
    fontSize: fontSizes.body,
    fontWeight: '500',
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  presetChip: {
    minHeight: 36,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  presetChipText: {
    fontSize: fontSizes.caption,
    fontWeight: '600',
  },
  applyButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    marginLeft: spacing.sm,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  toolBar: {
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  toolButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: radii.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minWidth: 64,
  },
  toolLabel: {
    fontSize: fontSizes.caption,
    marginTop: 2,
    fontWeight: '500',
  },
});
