import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  StyleSheet,
  FlatList,
  Pressable,
  useWindowDimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlbumStackParamList } from '../../navigation/types';
import { Album } from '../../types/album';
import { useAlbumStore } from '../../store/albumStore';
import { getAllFavoriteIds } from '../../services/database';
import { useDebounce } from '../../hooks/useDebounce';
import { Header } from '../../components/Header';
import { EmptyState } from '../../components/EmptyState';
import { ActionButton } from '../../components/ActionButton';
import { BottomSheet } from '../../components/BottomSheet';
import { CreateAlbumModal } from './CreateAlbumModal';
import { useTheme } from '../../theme/ThemeContext';
import { fontSizes, radii, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<AlbumStackParamList, 'Albums'>;

export function AlbumsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const albums = useAlbumStore((state) => state.albums);
  const isLoading = useAlbumStore((state) => state.isLoading);
  const loadAlbums = useAlbumStore((state) => state.loadAlbums);
  const createAlbum = useAlbumStore((state) => state.createAlbum);
  const renameAlbum = useAlbumStore((state) => state.renameAlbum);
  const deleteAlbum = useAlbumStore((state) => state.deleteAlbum);

  const [favoriteCount, setFavoriteCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameText, setRenameText] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const refreshAll = useCallback(async () => {
    loadAlbums();
    const favs = await getAllFavoriteIds();
    setFavoriteCount(favs.length);
  }, [loadAlbums]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const cardWidth = useMemo(() => {
    return Math.floor((width - spacing.md * 3) / 2);
  }, [width]);

  // Combined albums list: permanent Favorites album at top + filtered custom albums
  const displayedAlbums = useMemo(() => {
    let list = albums;
    const query = debouncedSearch.trim().toLowerCase();

    if (query) {
      list = albums.filter((a) => a.name.toLowerCase().includes(query));
    }

    const favCard: Album = {
      id: '__favorites__',
      name: 'Favorites',
      coverAssetId: null,
      coverUri: null,
      photoCount: favoriteCount,
      createdAt: 0,
      updatedAt: Date.now(),
    };

    if (query) {
      if ('favorites'.includes(query)) {
        return [favCard, ...list];
      }
      return list;
    }

    return [favCard, ...list];
  }, [albums, favoriteCount, debouncedSearch]);

  const handleAlbumPress = useCallback(
    (album: Album) => {
      navigation.navigate('AlbumDetail', {
        albumId: album.id,
        albumName: album.name,
      });
    },
    [navigation],
  );

  const handleAlbumLongPress = useCallback((album: Album) => {
    if (album.id === '__favorites__') return; // cannot delete or rename favorites
    setSelectedAlbum(album);
    setRenameText(album.name);
    setShowActionSheet(true);
  }, []);

  const handleOpenRename = () => {
    setShowActionSheet(false);
    setShowRenameModal(true);
  };

  const handleConfirmRename = async () => {
    if (selectedAlbum && renameText.trim()) {
      await renameAlbum(selectedAlbum.id, renameText.trim());
      setShowRenameModal(false);
      setSelectedAlbum(null);
    }
  };

  const handleDeleteAlbum = () => {
    if (!selectedAlbum) return;
    const albumToDelete = selectedAlbum;
    setShowActionSheet(false);

    Alert.alert(
      'Delete album?',
      `Delete "${albumToDelete.name}"? Photos will not be deleted from your device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAlbum(albumToDelete.id),
        },
      ],
    );
  };

  const renderItem = useCallback(
    ({ item }: { item: Album }) => {
      const isFav = item.id === '__favorites__';
      const photoCountText =
        item.photoCount === 1 ? '1 photo' : `${item.photoCount} photos`;

      return (
        <Pressable
          onPress={() => handleAlbumPress(item)}
          onLongPress={isFav ? undefined : () => handleAlbumLongPress(item)}
          style={[
            styles.card,
            {
              width: cardWidth,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${photoCountText}`}
        >
          <View
            style={[
              styles.coverContainer,
              {
                width: cardWidth - 2,
                height: cardWidth - 2,
                backgroundColor: colors.surfaceAlt,
              },
            ]}
          >
            {isFav ? (
              <View style={styles.emptyCover}>
                <Ionicons name="heart" size={36} color={colors.danger} />
              </View>
            ) : item.coverUri ? (
              <Image
                source={{ uri: item.coverUri }}
                style={styles.coverImage}
                contentFit="cover"
                transition={100}
              />
            ) : (
              <View style={styles.emptyCover}>
                <Ionicons
                  name="folder-outline"
                  size={32}
                  color={colors.iconMuted}
                />
              </View>
            )}
          </View>

          <View style={styles.cardInfo}>
            <Text
              style={[styles.albumTitle, { color: colors.text }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
            <Text style={[styles.photoCount, { color: colors.textSecondary }]}>
              {photoCountText}
            </Text>
          </View>
        </Pressable>
      );
    },
    [cardWidth, colors, handleAlbumPress, handleAlbumLongPress],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Albums"
        rightActions={[
          {
            icon: 'search',
            onPress: () => setShowSearch((prev) => !prev),
            accessibilityLabel: 'Search albums',
          },
          {
            icon: 'add',
            onPress: () => setShowCreateModal(true),
            accessibilityLabel: 'Create new album',
          },
        ]}
        showBottomBorder
      />

      {/* Search Bar Input */}
      {showSearch && (
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
            placeholder="Search albums"
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

      <FlatList
        data={displayedAlbums}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={[
          styles.listContent,
          displayedAlbums.length === 0 && styles.emptyContainer,
        ]}
        columnWrapperStyle={
          displayedAlbums.length > 0 ? styles.columnWrapper : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshAll}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No results"
            message="No albums match your search."
          />
        }
      />

      {/* Floating Action Button (FAB) */}
      <Pressable
        onPress={() => setShowCreateModal(true)}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.accent },
          pressed && styles.fabPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Create new album"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      {/* Create Album Modal */}
      <CreateAlbumModal
        isVisible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createAlbum}
      />

      {/* Album Options Bottom Sheet */}
      <BottomSheet
        isVisible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
      >
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>
            {selectedAlbum?.name}
          </Text>
          <Pressable onPress={handleOpenRename} style={styles.sheetAction}>
            <Ionicons name="create-outline" size={22} color={colors.icon} />
            <Text style={[styles.sheetActionText, { color: colors.text }]}>
              Rename
            </Text>
          </Pressable>
          <Pressable onPress={handleDeleteAlbum} style={styles.sheetAction}>
            <Ionicons name="trash-outline" size={22} color={colors.danger} />
            <Text style={[styles.sheetActionText, { color: colors.danger }]}>
              Delete
            </Text>
          </Pressable>
        </View>
      </BottomSheet>

      {/* Rename Album Modal */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowRenameModal(false)}>
          <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalKeyboard}
            >
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View
                  style={[
                    styles.modalCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Rename Album
                  </Text>
                  <TextInput
                    value={renameText}
                    onChangeText={setRenameText}
                    placeholder="Album name"
                    placeholderTextColor={colors.textTertiary}
                    autoFocus
                    style={[
                      styles.modalInput,
                      {
                        color: colors.text,
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                  />
                  <View style={styles.modalButtonRow}>
                    <ActionButton
                      label="Cancel"
                      variant="secondary"
                      onPress={() => setShowRenameModal(false)}
                      accessibilityLabel="Cancel renaming album"
                      style={styles.modalActionBtn}
                    />
                    <ActionButton
                      label="Save"
                      variant="primary"
                      disabled={!renameText.trim()}
                      onPress={handleConfirmRename}
                      accessibilityLabel="Save album name"
                      style={styles.modalActionBtn}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  listContent: {
    padding: spacing.md,
    paddingBottom: 88,
  },
  columnWrapper: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  coverContainer: {
    borderTopLeftRadius: radii.md - 1,
    borderTopRightRadius: radii.md - 1,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  emptyCover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    padding: spacing.sm,
  },
  albumTitle: {
    fontSize: fontSizes.subtitle,
    fontWeight: '600',
    marginBottom: 2,
  },
  photoCount: {
    fontSize: fontSizes.caption,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  sheetContent: {
    paddingVertical: spacing.sm,
  },
  sheetTitle: {
    fontSize: fontSizes.title,
    fontWeight: '600',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  sheetActionText: {
    fontSize: fontSizes.subtitle,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalKeyboard: {
    width: '100%',
    maxWidth: 360,
  },
  modalCard: {
    width: '100%',
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSizes.title,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.body,
    marginBottom: spacing.lg,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalActionBtn: {
    flex: 1,
    minWidth: 0,
  },
});
