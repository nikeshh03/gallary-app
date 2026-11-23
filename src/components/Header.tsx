import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { fontSizes, spacing } from '../theme/tokens';

export interface HeaderAction {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
}

export interface HeaderProps {
  title: string;
  leftAction?: {
    icon?: keyof typeof Ionicons.glyphMap;
    label?: string;
    onPress: () => void;
    accessibilityLabel: string;
  };
  rightActions?: HeaderAction[];
  showBottomBorder?: boolean;
}

export function Header({
  title,
  leftAction,
  rightActions,
  showBottomBorder = false,
}: HeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Add status bar inset on top. On Android we always add it; on iOS it comes from the inset.
  const topPadding = insets.top > 0 ? insets.top : Platform.OS === 'android' ? 24 : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          borderBottomWidth: showBottomBorder ? 1 : 0,
          paddingTop: topPadding,
          height: 56 + topPadding,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.sideContainer}>
          {leftAction && (
            <Pressable
              onPress={leftAction.onPress}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={leftAction.accessibilityLabel}
            >
              {leftAction.icon ? (
                <Ionicons name={leftAction.icon} size={24} color={colors.icon} />
              ) : (
                <Text style={[styles.textButton, { color: colors.accent }]}>
                  {leftAction.label}
                </Text>
              )}
            </Pressable>
          )}
        </View>

        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </View>

        <View style={[styles.sideContainer, styles.rightContainer]}>
          {rightActions?.map((action, index) => (
            <Pressable
              key={index}
              onPress={action.onPress}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel}
            >
              <Ionicons name={action.icon} size={24} color={colors.icon} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
  },
  row: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideContainer: {
    minWidth: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rightContainer: {
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSizes.subtitle,
    fontWeight: '600',
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  textButton: {
    fontSize: fontSizes.subtitle,
    fontWeight: '600',
  },
});
