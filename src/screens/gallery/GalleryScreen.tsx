import React, { useEffect, useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { PhotoAsset } from '../../types/photo';
import { GalleryStackParamList } from '../../navigation/types';
import { usePermission } from '../../hooks/usePermission';
import { useGalleryStore } from '../../store/galleryStore';
import { useSelectionStore } from '../../store/selectionStore';
import { useTrashStore } from '../../store/trashStore';
import { useAlbumStore } from '../../store/albumStore';
import { addFavorites, addPhotosToAlbum } from '../../services/database';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/format';
import { PhotoGrid } from '../../components/PhotoGrid';
import { Header } from '../../components/Header';
import { PermissionPrompt } from '../../components/PermissionPrompt';
import { EmptyState } from '../../components/EmptyState';
import { ActionButton } from '../../components/ActionButton';
import { SelectionBar } from '../../components/SelectionBar';
import { BottomSheet } from '../../components/BottomSheet';
import { useTheme } from '../../theme/ThemeContext';
import { fontSizes, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<GalleryStackParamList, 'Gallery'>;

export function GalleryScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { status, requestPermission, openSettings } = usePermission('mediaLibrary');

  const photos = useGalleryStore((state) => state.photos);
  const isLoading = useGalleryStore((state) => state.isLoading);
  const isRefreshing = useGalleryStore((state) => state.isRefreshing);
  const initialized = useGalleryStore((state) => state.initialized);
  const error = useGalleryStore((state) => state.error);
  const loadInitial = useGalleryStore((state) => state.loadInitial);
  const loadMore = useGalleryStore((state) => state.loadMore);
  const refresh = useGalleryStore((state) => state.refresh);
  const importFromDevice = useGalleryStore((state) => state.importFromDevice);

  // Selection store
  const isSelecting = useSelectionStore((state) => state.isSelecting);
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const enterSelectionMode = useSelectionStore((state) => state.enterSelectionMode);
  const exitSelectionMode = useSelectionStore((state) => state.exitSelectionMode);
  const toggleSelection = useSelectionStore((state) => state.toggleSelection);
  const selectAll = useSelectionStore((state) => state.selectAll);

  // Trash store
  const trashedIds = useTrashStore((state) => state.trashedIds);
  const trashPhotos = useTrashStore((state) => state.trashPhotos);

  // Albums
  const albums = useAlbumStore((state) => state.albums);
  const loadAlbums = useAlbumStore((state) => state.loadAlbums);

  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (status === 'granted') {
      loadInitial();
    }
  }, [status, loadInitial]);

  // Filter out trashed photos from view
  const visiblePhotos = useMemo(() => {
    return photos.filter((p) => !trashedIds.has(p.id));
  }, [photos, trashedIds]);

  // Apply search query filter (matches date or filename)
  const filteredPhotos = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return visiblePhotos;

    return visiblePhotos.filter((p) => {
      if (p.filename && p.filename.toLowerCase().includes(query)) return true;

      const dateStr = formatDate(p.creationTime).toLowerCase();
      if (dateStr.includes(query)) return true;

      const d = new Date(p.creationTime);
      const fullDate = d
        .toLocaleDateString(undefined, {
          month: 'long',
          year: 'numeric',
        })
        .toLowerCase();
      return fullDate.includes(query);
    });
  }, [visiblePhotos, debouncedSearch]);

  const handlePhotoPress = useCallback(
    (photo: PhotoAsset) => {
      if (isSelecting) {
        toggleSelection(photo.id);
      } else {
        navigation.navigate('PhotoViewer', {
          assetId: photo.id,
          contextPhotos: filteredPhotos,
        });
      }
    },
    [isSelecting, toggleSelection, navigation, filteredPhotos],
  );

  const handlePhotoLongPress = useCallback(
    (photo: PhotoAsset) => {
      if (!isSelecting) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {}
        enterSelectionMode();
        toggleSelection(photo.id);
      }
    },
    [isSelecting, enterSelectionMode, toggleSelection],
  );

  const handleShareSelected = async () => {
    const selected = visiblePhotos.filter((p) => selectedIds.has(p.id));
    if (selected.length === 0) return;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(selected[0].uri);
    } catch (err) {
      console.error('[GalleryScreen] Share error:', err);
    }
  };

  const handleOpenAlbumPicker = () => {
    loadAlbums();
    setShowAlbumPicker(true);
  };

  const handleSelectAlbum = async (albumId: string) => {
    const selected = visiblePhotos.filter((p) => selectedIds.has(p.id));
    setShowAlbumPicker(false);

    if (selected.length > 0) {
      await addPhotosToAlbum(
        albumId,
        selected.map((p) => ({ assetId: p.id, uri: p.uri })),
      );
      loadAlbums();
      exitSelectionMode();
    }
  };

  const handleFavoriteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    await addFavorites(ids);
    exitSelectionMode();
  };

  const handleDeleteSelected = () => {
    const count = selectedIds.size;
    if (count === 0) return;

    Alert.alert(
      'Move to trash?',
      `${count} ${count === 1 ? 'photo' : 'photos'} will be moved to trash. They will be permanently deleted after 30 days.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to trash',
          style: 'destructive',
          onPress: async () => {
            const ids = Array.from(selectedIds);
            await trashPhotos(ids);
            exitSelectionMode();
          },
        },
      ],
    );
  };

  // Permission prompt when media permission not yet granted
  if (status !== 'granted') {
    const isDenied = status === 'denied';
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Gallery" />
        <PermissionPrompt
          title="Photo access needed"
          message="Allow photo library access to browse your photos."
          buttonLabel={isDenied ? 'Open Settings' : 'Grant access'}
          onPress={isDenied ? openSettings : requestPermission}
        />
      </View>
    );
  }

  const showSpinner = isLoading && !initialized && visiblePhotos.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header switches layout during selection mode */}
      {isSelecting ? (
        <Header
          title={`${selectedIds.size} selected`}
          leftAction={{
            label: 'Cancel',
            onPress: exitSelectionMode,
            accessibilityLabel: 'Cancel selection',
          }}
          rightActions={[
            {
              icon: 'checkmark-done-outline',
              onPress: () => selectAll(visiblePhotos.map((p) => p.id)),
              accessibilityLabel: 'Select all photos',
            },
          ]}
          showBottomBorder
        />
      ) : (
        <Header
          title="Gallery"
          showBottomBorder
          rightActions={[
            {
              icon: 'search',
              onPress: () => setShowSearch((prev) => !prev),
              accessibilityLabel: 'Search photos by date',
            },
            {
              icon: 'add-outline',
              onPress: importFromDevice,
              accessibilityLabel: 'Select photos from device',
            },
          ]}
        />
      )}

      {/* Search Bar Input */}
      {showSearch && !isSelecting && (
        <View
          style={[
            styles.searchBarContainer,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name="search"
            size={18}
            color={colors.iconMuted}
            style={styles.searchIcon}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by date (e.g., Nov 2026)"
            placeholderTextColor={colors.textTertiary}
            autoFocus
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
              accessibilityRole="button"
              accessibilityLabel="Clear search text"
            >
              <Ionicons name="close-circle" size={18} color={colors.iconMuted} />
            </Pressable>
          )}
        </View>
      )}

      {/* Error banner */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.dangerLight }]}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      )}

      {showSpinner ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <PhotoGrid
          photos={filteredPhotos}
          onPhotoPress={handlePhotoPress}
          onPhotoLongPress={handlePhotoLongPress}
          onEndReached={loadMore}
          onRefresh={refresh}
          isRefreshing={isRefreshing}
          selectedIds={selectedIds}
          isSelectMode={isSelecting}
          ListEmptyComponent={
            debouncedSearch.trim() ? (
              <EmptyState
                title="No results"
                message="No photos match your search."
              />
            ) : (
              <EmptyState
                title="No photos"
                message="Photos on your device will appear here."
                actionLabel="Select Photos"
                onAction={importFromDevice}
              >
                <View style={styles.emptySecondaryAction}>
                  <ActionButton
                    label="Scan Storage"
                    variant="secondary"
                    onPress={refresh}
                    accessibilityLabel="Rescan device storage"
                  />
                </View>
              </EmptyState>
            )
          }
        />
      )}

      {/* Selection Bar appears when selection mode is active */}
      {isSelecting && (
        <SelectionBar
          count={selectedIds.size}
          actions={[
            {
              label: 'Share',
              icon: 'share-outline',
              onPress: handleShareSelected,
              accessibilityLabel: 'Share selected photos',
            },
            {
              label: 'Add to Album',
              icon: 'folder-outline',
              onPress: handleOpenAlbumPicker,
              accessibilityLabel: 'Add selected photos to album',
            },
            {
              label: 'Favorite',
              icon: 'heart-outline',
              onPress: handleFavoriteSelected,
              accessibilityLabel: 'Favorite selected photos',
            },
            {
              label: 'Delete',
              icon: 'trash-outline',
              variant: 'danger',
              onPress: handleDeleteSelected,
              accessibilityLabel: 'Move selected photos to trash',
            },
          ]}
          onCancel={exitSelectionMode}
        />
      )}

      {/* Album Picker Bottom Sheet */}
      <BottomSheet
        isVisible={showAlbumPicker}
        onClose={() => setShowAlbumPicker(false)}
      >
        <View style={styles.albumPickerContent}>
          <Text style={[styles.albumPickerTitle, { color: colors.text }]}>
            Add to Album
          </Text>
          {albums.length === 0 ? (
            <Text
              style={[
                styles.emptyAlbumsText,
                { color: colors.textSecondary },
              ]}
            >
              No albums created yet. Create one in the Albums tab first.
            </Text>
          ) : (
            <ScrollView style={styles.albumList}>
              {albums.map((album) => (
                <Pressable
                  key={album.id}
                  onPress={() => handleSelectAlbum(album.id)}
                  style={styles.albumItem}
                  accessibilityRole="button"
                  accessibilityLabel={`Add to ${album.name}`}
                >
                  <Ionicons name="folder-outline" size={22} color={colors.icon} />
                  <Text style={[styles.albumItemName, { color: colors.text }]}>
                    {album.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 48,
    borderBottomWidth: 1,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: fontSizes.body,
  },
  clearSearchBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorBanner: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  errorText: {
    fontSize: fontSizes.body,
  },
  emptySecondaryAction: {
    marginTop: spacing.sm,
  },
  albumPickerContent: {
    paddingVertical: spacing.sm,
    maxHeight: 300,
  },
  albumPickerTitle: {
    fontSize: fontSizes.title,
    fontWeight: '600',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  emptyAlbumsText: {
    fontSize: fontSizes.body,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  albumList: {
    maxHeight: 220,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  albumItemName: {
    fontSize: fontSizes.subtitle,
    fontWeight: '500',
  },
});
