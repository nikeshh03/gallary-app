import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeContext';
import { useTrashStore } from '../../store/trashStore';
import { useSettingsStore, ThemeMode } from '../../store/settingsStore';
import { fontSizes, radii, spacing } from '../../theme/tokens';
import { Header } from '../../components/Header';
import { BottomSheet } from '../../components/BottomSheet';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const themeMode = useSettingsStore((state) => state.themeMode);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);
  const gridColumns = useSettingsStore((state) => state.gridColumns);
  const setGridColumns = useSettingsStore((state) => state.setGridColumns);
  const storageUsage = useSettingsStore((state) => state.storageUsage);
  const refreshStorage = useSettingsStore((state) => state.refreshStorage);
  const trashItems = useTrashStore((state) => state.trashItems);

  const [showThemeSheet, setShowThemeSheet] = useState(false);

  useEffect(() => {
    refreshStorage();
  }, [refreshStorage]);

  const handleToggleGridColumns = () => {
    const nextCols = gridColumns === 3 ? 4 : 3;
    setGridColumns(nextCols);
  };

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
      default:
        return 'System default';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Settings" showBottomBorder />

      <ScrollView contentContainerStyle={styles.content}>
        {/* PREFERENCES SECTION */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          PREFERENCES
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Appearance Row */}
          <Pressable
            onPress={() => setShowThemeSheet(true)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityRole="button"
            accessibilityLabel={`Appearance, currently ${getThemeLabel(themeMode)}`}
          >
            <View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                Appearance
              </Text>
              <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                {getThemeLabel(themeMode)}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.iconMuted}
            />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Grid Columns Row */}
          <Pressable
            onPress={handleToggleGridColumns}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityRole="button"
            accessibilityLabel={`Grid columns, currently ${gridColumns} columns. Tap to switch.`}
          >
            <View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                Grid Columns
              </Text>
              <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                {gridColumns} columns
              </Text>
            </View>
            <Text style={[styles.switchChip, { color: colors.accent }]}>
              Switch to {gridColumns === 3 ? '4' : '3'}
            </Text>
          </Pressable>
        </View>

        {/* DATA & STORAGE SECTION */}
        <Text
          style={[
            styles.sectionTitle,
            styles.sectionSpacing,
            { color: colors.textSecondary },
          ]}
        >
          DATA
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Trash Row */}
          <Pressable
            onPress={() => navigation.navigate('Trash')}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityRole="button"
            accessibilityLabel={`Trash, ${trashItems.length} photos`}
          >
            <View style={styles.navRowLeft}>
              <Ionicons name="trash-outline" size={20} color={colors.icon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                Trash
              </Text>
            </View>

            <View style={styles.navRowRight}>
              <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                {trashItems.length === 1
                  ? '1 photo'
                  : `${trashItems.length} photos`}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.iconMuted}
              />
            </View>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Storage Used Row */}
          <View style={styles.row}>
            <View style={styles.navRowLeft}>
              <Ionicons name="pie-chart-outline" size={20} color={colors.icon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                Storage Used
              </Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
              {storageUsage}
            </Text>
          </View>
        </View>

        {/* INFO SECTION */}
        <Text
          style={[
            styles.sectionTitle,
            styles.sectionSpacing,
            { color: colors.textSecondary },
          ]}
        >
          INFO
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              App Name
            </Text>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
              Gallery
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Version</Text>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
              1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Appearance Selection Bottom Sheet */}
      <BottomSheet
        isVisible={showThemeSheet}
        onClose={() => setShowThemeSheet(false)}
      >
        <View style={styles.themeSheetContent}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>
            Appearance
          </Text>

          {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => {
            const isSelected = themeMode === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => {
                  setThemeMode(mode);
                  setShowThemeSheet(false);
                }}
                style={styles.sheetOption}
                accessibilityRole="button"
                accessibilityLabel={getThemeLabel(mode)}
              >
                <Text
                  style={[
                    styles.sheetOptionText,
                    {
                      color: isSelected ? colors.accent : colors.text,
                      fontWeight: isSelected ? '600' : '400',
                    },
                  ]}
                >
                  {getThemeLabel(mode)}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={20} color={colors.accent} />
                )}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSizes.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  sectionSpacing: {
    marginTop: spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowPressed: {
    opacity: 0.7,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowLabel: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: fontSizes.body,
    marginTop: 2,
  },
  switchChip: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginLeft: spacing.md,
  },
  themeSheetContent: {
    paddingVertical: spacing.sm,
  },
  sheetTitle: {
    fontSize: fontSizes.title,
    fontWeight: '600',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  sheetOptionText: {
    fontSize: fontSizes.subtitle,
  },
});
