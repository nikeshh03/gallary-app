import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../navigation/types';
import { useTrashStore } from '../../store/trashStore';
import { useGalleryStore } from '../../store/galleryStore';
import { getAssetsByIds } from '../../services/media';
import { PhotoAsset } from '../../types/photo';
import { Header } from '../../components/Header';
import { PhotoGrid } from '../../components/PhotoGrid';
import { EmptyState } from '../../components/EmptyState';
import { SelectionBar } from '../../components/SelectionBar';
import { useTheme } from '../../theme/ThemeContext';
import { fontSizes, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Trash'>;

export function TrashScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const trashItems = useTrashStore((state) => state.trashItems);
  const restorePhotos = useTrashStore((state) => state.restorePhotos);
  const permanentlyDelete = useTrashStore((state) => state.permanentlyDelete);
  const galleryPhotos = useGalleryStore((state) => state.photos);

  const [trashedPhotos, setTrashedPhotos] = useState<PhotoAsset[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Load photo asset objects corresponding to trashed IDs
  const loadTrashedAssets = useCallback(async () => {
    if (trashItems.length === 0) {
      setTrashedPhotos([]);
      return;
    }

    const ids = trashItems.map((item) => item.assetId);

    // First check memory from gallery store
    const inStoreMap = new Map(galleryPhotos.map((p) => [p.id, p]));
    const missingIds: string[] = [];
    const found: PhotoAsset[] = [];

    for (const id of ids) {
      const match = inStoreMap.get(id);
      if (match) {
        found.push(match);
      } else {
        missingIds.push(id);
      }
    }

    // Fetch any missing from media library
    if (missingIds.length > 0) {
      const fetched = await getAssetsByIds(missingIds);
      found.push(...fetched);
    }

    setTrashedPhotos(found);
  }, [trashItems, galleryPhotos]);

  useEffect(() => {
    loadTrashedAssets();
  }, [loadTrashedAssets]);

  const handleToggleSelect = useCallback((photo: PhotoAsset) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(photo.id)) {
        next.delete(photo.id);
      } else {
        next.add(photo.id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = () => {
    if (selectedIds.size === trashedPhotos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(trashedPhotos.map((p) => p.id)));
    }
  };

  const handleRestoreSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    await restorePhotos(ids);
    setSelectedIds(new Set());
  };

  const handleDeletePermanently = () => {
    const count = selectedIds.size;
    if (count === 0) return;

    Alert.alert(
      'Delete permanently?',
      `${count} ${count === 1 ? 'photo' : 'photos'} will be permanently deleted. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: async () => {
            const ids = Array.from(selectedIds);
            await permanentlyDelete(ids);
            setSelectedIds(new Set());
          },
        },
      ],
    );
  };

  const headerTitle =
    selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Trash';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={headerTitle}
        leftAction={{
          icon: 'chevron-back',
          onPress: () => navigation.goBack(),
          accessibilityLabel: 'Back to settings',
        }}
        rightActions={
          trashedPhotos.length > 0
            ? [
                {
                  icon:
                    selectedIds.size === trashedPhotos.length
                      ? 'close'
                      : 'checkmark-done-outline',
                  onPress: handleSelectAll,
                  accessibilityLabel: 'Select all',
                },
              ]
            : undefined
        }
        showBottomBorder
      />

      {/* Subtitle notice */}
      <View
        style={[
          styles.noticeBar,
          {
            backgroundColor: colors.surfaceAlt,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
          Photos are deleted permanently after 30 days
        </Text>
      </View>

      <PhotoGrid
        photos={trashedPhotos}
        onPhotoPress={handleToggleSelect}
        selectedIds={selectedIds}
        isSelectMode={true}
        ListEmptyComponent={
          <EmptyState
            title="Trash is empty"
            message="Deleted photos will appear here for 30 days."
          />
        }
      />

      {selectedIds.size > 0 && (
        <SelectionBar
          count={selectedIds.size}
          actions={[
            {
              label: 'Restore',
              icon: 'refresh-outline',
              variant: 'primary',
              onPress: handleRestoreSelected,
              accessibilityLabel: 'Restore selected photos',
            },
            {
              label: 'Delete Forever',
              icon: 'trash-outline',
              variant: 'danger',
              onPress: handleDeletePermanently,
              accessibilityLabel: 'Permanently delete selected photos',
            },
          ]}
          onCancel={() => setSelectedIds(new Set())}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noticeBar: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  noticeText: {
    fontSize: fontSizes.caption,
  },
});
