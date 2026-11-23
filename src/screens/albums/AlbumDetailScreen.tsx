import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlbumStackParamList } from '../../navigation/types';
import { PhotoAsset } from '../../types/photo';
import {
  getAlbumPhotos,
  addPhotosToAlbum,
  removePhotosFromAlbum,
  getAllFavoriteIds,
} from '../../services/database';
import { getAssetsByIds, pickPhotosFromDevice } from '../../services/media';
import { useAlbumStore } from '../../store/albumStore';
import { PhotoGrid } from '../../components/PhotoGrid';
import { Header } from '../../components/Header';
import { EmptyState } from '../../components/EmptyState';
import { ActionButton } from '../../components/ActionButton';
import { SelectionBar } from '../../components/SelectionBar';
import { BottomSheet } from '../../components/BottomSheet';
import { AddPhotosToAlbumModal } from './AddPhotosToAlbumModal';
import { useTheme } from '../../theme/ThemeContext';
import { fontSizes, radii, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<AlbumStackParamList, 'AlbumDetail'>;

export function AlbumDetailScreen({ route, navigation }: Props) {
  const { albumId, albumName } = route.params;
  const { colors } = useTheme();

  const [currentName, setCurrentName] = useState(albumName);
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameText, setRenameText] = useState(albumName);

  const deleteAlbum = useAlbumStore((state) => state.deleteAlbum);
  const renameAlbum = useAlbumStore((state) => state.renameAlbum);

  const isFavorites = albumId === '__favorites__';

  const loadPhotos = useCallback(async () => {
    if (isFavorites) {
      const favoriteIds = await getAllFavoriteIds();
      if (favoriteIds.length === 0) {
        setPhotos([]);
        return;
      }
      const fetched = await getAssetsByIds(favoriteIds);
      setPhotos(fetched);
      return;
    }

    const records = await getAlbumPhotos(albumId);
    if (records.length === 0) {
      setPhotos([]);
      return;
    }

    const assetIds = records.map((r) => r.assetId);
    // Fetch asset details
    const fetched = await getAssetsByIds(assetIds);
    // Combine with stored URIs for picked items
    const recordMap = new Map(records.map((r) => [r.assetId, r.uri]));

    const mapped: PhotoAsset[] = records.map((r) => {
      const match = fetched.find((f) => f.id === r.assetId);
      if (match) return match;
      return {
        id: r.assetId,
        filename: 'Photo.jpg',
        uri: r.uri || '',
        mediaType: 'photo',
        width: 0,
        height: 0,
        creationTime: r.addedAt,
        modificationTime: r.addedAt,
      };
    });

    setPhotos(mapped.filter((p) => !!p.uri));
  }, [albumId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handlePhotoPress = useCallback(
    (photo: PhotoAsset) => {
      if (isSelectMode) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(photo.id)) {
            next.delete(photo.id);
            if (next.size === 0) setIsSelectMode(false);
          } else {
            next.add(photo.id);
          }
          return next;
        });
      } else {
        navigation.navigate('PhotoViewer', { assetId: photo.id, contextPhotos: photos });
      }
    },
    [isSelectMode, navigation, photos],
  );

  const handlePhotoLongPress = useCallback((photo: PhotoAsset) => {
    setIsSelectMode(true);
    setSelectedIds(new Set([photo.id]));
  }, []);

  const handleAddPhotos = async (newPhotos: PhotoAsset[]) => {
    await addPhotosToAlbum(
      albumId,
      newPhotos.map((p) => ({ assetId: p.id, uri: p.uri })),
    );
    await loadPhotos();
    useAlbumStore.getState().loadAlbums();
  };

  const handleRemoveSelected = async () => {
    const ids = Array.from(selectedIds);
    await removePhotosFromAlbum(albumId, ids);
    setSelectedIds(new Set());
    setIsSelectMode(false);
    await loadPhotos();
    useAlbumStore.getState().loadAlbums();
  };

  const handleDeleteAlbum = () => {
    setShowMenu(false);
    Alert.alert(
      'Delete album?',
      'Photos will not be deleted from your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteAlbum(albumId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handlePickDirectFromDevice = async () => {
    const picked = await pickPhotosFromDevice();
    if (picked.length > 0) {
      await handleAddPhotos(picked);
    }
  };

  const handleConfirmRename = async () => {
    if (renameText.trim()) {
      await renameAlbum(albumId, renameText.trim());
      setCurrentName(renameText.trim());
      setShowRenameModal(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={currentName}
        leftAction={{
          icon: 'chevron-back',
          onPress: () => navigation.goBack(),
          accessibilityLabel: 'Back to albums',
        }}
        rightActions={
          isFavorites
            ? undefined
            : [
                {
                  icon: 'add-outline',
                  onPress: () => setShowAddModal(true),
                  accessibilityLabel: 'Add photos to album',
                },
                {
                  icon: 'ellipsis-horizontal',
                  onPress: () => setShowMenu(true),
                  accessibilityLabel: 'Album options',
                },
              ]
        }
        showBottomBorder
      />

      <PhotoGrid
        photos={photos}
        onPhotoPress={handlePhotoPress}
        onPhotoLongPress={handlePhotoLongPress}
        selectedIds={selectedIds}
        isSelectMode={isSelectMode}
        ListEmptyComponent={
          <EmptyState
            title={isFavorites ? 'No favorites' : 'No photos in this album'}
            message={
              isFavorites
                ? 'Tap the heart on any photo to add it here.'
                : 'Tap the add button to add photos.'
            }
            actionLabel={isFavorites ? undefined : 'Add Photos'}
            onAction={isFavorites ? undefined : () => setShowAddModal(true)}
          />
        }
      />

      {isSelectMode && (
        <SelectionBar
          count={selectedIds.size}
          actions={[
            {
              label: 'Remove',
              icon: 'trash-outline',
              variant: 'danger',
              onPress: handleRemoveSelected,
              accessibilityLabel: 'Remove selected photos from album',
            },
          ]}
          onCancel={() => {
            setSelectedIds(new Set());
            setIsSelectMode(false);
          }}
        />
      )}

      {/* Add Photos Modal */}
      <AddPhotosToAlbumModal
        isVisible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddPhotos={handleAddPhotos}
      />

      {/* Album Options Menu */}
      <BottomSheet isVisible={showMenu} onClose={() => setShowMenu(false)}>
        <View style={styles.menuContent}>
          <Pressable
            onPress={() => {
              setShowMenu(false);
              setRenameText(currentName);
              setShowRenameModal(true);
            }}
            style={styles.menuItem}
          >
            <Text style={[styles.menuText, { color: colors.text }]}>
              Rename Album
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setShowMenu(false);
              handlePickDirectFromDevice();
            }}
            style={styles.menuItem}
          >
            <Text style={[styles.menuText, { color: colors.text }]}>
              Add from Device Storage
            </Text>
          </Pressable>

          <Pressable onPress={handleDeleteAlbum} style={styles.menuItem}>
            <Text style={[styles.menuText, { color: colors.danger }]}>
              Delete Album
            </Text>
          </Pressable>
        </View>
      </BottomSheet>

      {/* Rename Modal */}
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
  menuContent: {
    paddingVertical: spacing.sm,
  },
  menuItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  menuText: {
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

