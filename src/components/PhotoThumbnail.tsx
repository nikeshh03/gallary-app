import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { radii } from '../theme/tokens';

export interface PhotoThumbnailProps {
  uri: string;
  size: number;
  onPress: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
  isSelectMode?: boolean;
  accessibilityLabel: string;
}

export const PhotoThumbnail = memo(function PhotoThumbnail({
  uri,
  size,
  onPress,
  onLongPress,
  isSelected = false,
  isSelectMode = false,
  accessibilityLabel,
}: PhotoThumbnailProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.container,
        {
          width: size,
          height: size,
          margin: 1,
          borderRadius: radii.xs,
          backgroundColor: colors.surfaceAlt,
          borderColor: isSelected ? colors.accent : 'transparent',
          borderWidth: isSelected ? 2 : 0,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isSelected }}
    >
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: radii.xs }}
        contentFit="cover"
        transition={100}
        priority="high"
      />

      {isSelectMode && (
        <View style={styles.badgeContainer}>
          {isSelected ? (
            <View style={[styles.checkCircle, { backgroundColor: colors.accent }]}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
          ) : (
            <View style={styles.unselectedCircle} />
          )}
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  badgeContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: radii.round,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});
