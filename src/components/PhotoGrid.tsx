import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
  View,
} from 'react-native';
import { PhotoAsset } from '../types/photo';
import { PhotoThumbnail } from './PhotoThumbnail';
import { getGridItemSize } from '../utils/layout';
import { formatDate } from '../utils/format';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../store/settingsStore';

export interface PhotoGridProps {
  photos: PhotoAsset[];
  numColumns?: number;
  onPhotoPress: (photo: PhotoAsset, index: number) => void;
  onPhotoLongPress?: (photo: PhotoAsset) => void;
  onEndReached?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  selectedIds?: Set<string>;
  isSelectMode?: boolean;
  ListEmptyComponent?: React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
}

export function PhotoGrid({
  photos,
  numColumns,
  onPhotoPress,
  onPhotoLongPress,
  onEndReached,
  onRefresh,
  isRefreshing = false,
  selectedIds = new Set(),
  isSelectMode = false,
  ListEmptyComponent,
  ListHeaderComponent,
}: PhotoGridProps) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const storeColumns = useSettingsStore((state) => state.gridColumns);
  const activeColumns = numColumns ?? storeColumns ?? 3;

  const itemSize = useMemo(() => {
    return getGridItemSize(width, activeColumns, 2);
  }, [width, activeColumns]);

  const renderItem = useCallback(
    ({ item, index }: { item: PhotoAsset; index: number }) => {
      const isSelected = selectedIds.has(item.id);
      const dateText = formatDate(item.creationTime);
      const accessibilityLabel = `Photo ${index + 1} from ${dateText}`;

      return (
        <PhotoThumbnail
          uri={item.uri}
          size={itemSize}
          isSelected={isSelected}
          isSelectMode={isSelectMode}
          accessibilityLabel={accessibilityLabel}
          onPress={() => onPhotoPress(item, index)}
          onLongPress={() => onPhotoLongPress?.(item)}
        />
      );
    },
    [itemSize, selectedIds, isSelectMode, onPhotoPress, onPhotoLongPress],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={photos}
        key={activeColumns}
        numColumns={activeColumns}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={2}
        initialNumToRender={18}
        maxToRenderPerBatch={18}
        windowSize={7}
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          photos.length === 0 && styles.emptyContainer,
        ]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          ) : undefined
        }
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  emptyContainer: {
    flexGrow: 1,
  },
});
