import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { PhotoAsset } from '../../types/photo';
import { useGalleryStore } from '../../store/galleryStore';
import { PhotoGrid } from '../../components/PhotoGrid';
import { Header } from '../../components/Header';
import { EmptyState } from '../../components/EmptyState';
import { SelectionBar } from '../../components/SelectionBar';
import { useTheme } from '../../theme/ThemeContext';

export interface AddPhotosToAlbumProps {
  isVisible: boolean;
  onClose: () => void;
  onAddPhotos: (photos: PhotoAsset[]) => void;
}

export function AddPhotosToAlbumModal({
  isVisible,
  onClose,
  onAddPhotos,
}: AddPhotosToAlbumProps) {
  const { colors } = useTheme();
  const galleryPhotos = useGalleryStore((state) => state.photos);
  const importFromDevice = useGalleryStore((state) => state.importFromDevice);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const handleConfirm = () => {
    const selected = galleryPhotos.filter((p) => selectedIds.has(p.id));
    onAddPhotos(selected);
    setSelectedIds(new Set());
    onClose();
  };

  const handlePickDevice = async () => {
    const count = await importFromDevice();
    if (count > 0) {
      // Picked photos will be added to galleryPhotos
    }
  };

  if (!isVisible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Add to Album"
        leftAction={{
          label: 'Cancel',
          onPress: onClose,
          accessibilityLabel: 'Cancel adding photos',
        }}
        rightActions={[
          {
            icon: 'folder-open-outline',
            onPress: handlePickDevice,
            accessibilityLabel: 'Select from device storage',
          },
        ]}
        showBottomBorder
      />

      <PhotoGrid
        photos={galleryPhotos}
        onPhotoPress={handleToggleSelect}
        selectedIds={selectedIds}
        isSelectMode={true}
        ListEmptyComponent={
          <EmptyState
            title="No photos in library"
            message="Tap below to select photos from your device storage."
            actionLabel="Browse Device"
            onAction={handlePickDevice}
          />
        }
      />

      {selectedIds.size > 0 && (
        <SelectionBar
          count={selectedIds.size}
          actions={[
            {
              label: 'Add',
              icon: 'add-circle-outline',
              variant: 'primary',
              onPress: handleConfirm,
              accessibilityLabel: `Add ${selectedIds.size} photos to album`,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
});
