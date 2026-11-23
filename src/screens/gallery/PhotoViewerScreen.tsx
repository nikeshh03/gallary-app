import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { GalleryStackParamList } from '../../navigation/types';
import { useGalleryStore } from '../../store/galleryStore';
import { useTrashStore } from '../../store/trashStore';
import { isFavorite, toggleFavorite } from '../../services/database';
import { FullScreenImage } from '../../components/FullScreenImage';
import { formatDateTime } from '../../utils/format';
import { useTheme } from '../../theme/ThemeContext';
import { fontSizes, radii, spacing } from '../../theme/tokens';
import { PhotoAsset } from '../../types/photo';

type Props = NativeStackScreenProps<GalleryStackParamList, 'PhotoViewer'>;

export function PhotoViewerScreen({ route, navigation }: Props) {
  const { assetId, contextPhotos } = route.params;
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const galleryPhotos = useGalleryStore((state) => state.photos);
  const trashedIds = useTrashStore((state) => state.trashedIds);
  const trashPhotos = useTrashStore((state) => state.trashPhotos);

  // Use contextual photos (from Album/Search/Favorites) if provided, otherwise filter gallery photos
  const sourcePhotos = contextPhotos || galleryPhotos;
  const activePhotos = useMemo(() => {
    return sourcePhotos.filter((p) => !trashedIds.has(p.id));
  }, [sourcePhotos, trashedIds]);

  const initialIndex = useMemo(() => {
    const idx = activePhotos.findIndex((p) => p.id === assetId);
    return Math.max(0, idx);
  }, [activePhotos, assetId]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showOverlays, setShowOverlays] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const currentPhoto = activePhotos[currentIndex] || activePhotos[0];

  // Check favorite status for current photo
  useEffect(() => {
    if (currentPhoto) {
      isFavorite(currentPhoto.id).then(setIsFav);
    }
  }, [currentPhoto]);

  const toggleOverlays = useCallback(() => {
    setShowOverlays((prev) => !prev);
  }, []);

  const handleToggleFavorite = async () => {
    if (!currentPhoto) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const nextState = await toggleFavorite(currentPhoto.id);
    setIsFav(nextState);
  };

  const handleShare = async () => {
    if (!currentPhoto) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(currentPhoto.uri);
      }
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  const handleEdit = () => {
    if (!currentPhoto) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    navigation.navigate('PhotoEditor', { uri: currentPhoto.uri });
  };

  const handleDelete = () => {
    if (!currentPhoto) return;
    Alert.alert(
      'Move to trash?',
      'This photo will be moved to trash. It will be permanently deleted after 30 days.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to trash',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {}
            const photoId = currentPhoto.id;
            await trashPhotos([photoId]);
            if (activePhotos.length <= 1) {
              navigation.goBack();
            } else {
              const nextIndex = Math.min(currentIndex, activePhotos.length - 2);
              setCurrentIndex(Math.max(0, nextIndex));
            }
          },
        },
      ],
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      const newIndex = viewableItems[0].index;
      setCurrentIndex(newIndex);
      try {
        Haptics.selectionAsync();
      } catch {}
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: PhotoAsset }) => {
      return (
        <FullScreenImage
          uri={item.uri}
          onTap={toggleOverlays}
          accessibilityLabel={item.filename || 'Full screen photo'}
        />
      );
    },
    [toggleOverlays],
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={activePhotos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        windowSize={3}
        maxToRenderPerBatch={2}
        removeClippedSubviews
      />

      {showOverlays && (
        <>
          {/* Top Header Floating Overlay */}
          <View
            style={[
              styles.headerOverlay,
              {
                paddingTop: insets.top + spacing.xs,
              },
            ]}
          >
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.hudButton,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Back to gallery"
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </Pressable>

            <View style={styles.headerRight}>
              <Pressable
                onPress={handleToggleFavorite}
                style={({ pressed }) => [
                  styles.hudButton,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Ionicons
                  name={isFav ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFav ? colors.danger : '#FFFFFF'}
                />
              </Pressable>

              <Pressable
                onPress={handleShare}
                style={({ pressed }) => [
                  styles.hudButton,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Share photo"
              >
                <Ionicons name="share-outline" size={22} color="#FFFFFF" />
              </Pressable>

              <Pressable
                onPress={handleEdit}
                style={({ pressed }) => [
                  styles.hudButton,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Edit photo"
              >
                <Ionicons name="create-outline" size={22} color="#FFFFFF" />
              </Pressable>

              <Pressable
                onPress={handleDelete}
                style={({ pressed }) => [
                  styles.hudButton,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Delete photo"
              >
                <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          {/* Bottom Footer Info Floating Overlay */}
          {currentPhoto && (
            <View
              style={[
                styles.footerOverlay,
                {
                  paddingBottom: Math.max(insets.bottom, spacing.md),
                },
              ]}
            >
              <View style={styles.footerCard}>
                <Text
                  style={styles.filename}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {currentPhoto.filename}
                </Text>
                <Text style={styles.metadata}>
                  {formatDateTime(currentPhoto.creationTime)}
                  {currentPhoto.width && currentPhoto.height
                    ? `  •  ${currentPhoto.width} × ${currentPhoto.height}`
                    : ''}
                </Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  hudButton: {
    width: 44,
    height: 44,
    borderRadius: radii.round,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  footerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
  },
  footerCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filename: {
    color: '#FFFFFF',
    fontSize: fontSizes.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  metadata: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: fontSizes.caption,
  },
});
