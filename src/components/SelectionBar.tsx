import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { fontSizes, radii, spacing } from '../theme/tokens';

export interface SelectionAction {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'secondary';
  accessibilityLabel: string;
}

export interface SelectionBarProps {
  count: number;
  actions: SelectionAction[];
  onCancel: () => void;
}

export function SelectionBar({ count, actions, onCancel }: SelectionBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          <Pressable
            onPress={onCancel}
            style={styles.cancelButton}
            accessibilityRole="button"
            accessibilityLabel="Cancel selection"
          >
            <Ionicons name="close" size={24} color={colors.icon} />
          </Pressable>
          <Text style={[styles.countText, { color: colors.text }]}>
            {count} selected
          </Text>
        </View>

        <View style={styles.actions}>
          {actions.map((action, index) => {
            const isDanger = action.variant === 'danger';
            const color = isDanger ? colors.danger : colors.accent;

            return (
              <Pressable
                key={index}
                onPress={action.onPress}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={action.accessibilityLabel}
              >
                {action.icon && (
                  <Ionicons name={action.icon} size={20} color={color} />
                )}
                <Text style={[styles.actionText, { color }]}>{action.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  content: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cancelButton: {
    width: 44,
    height: 44,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: fontSizes.subtitle,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    gap: 4,
  },
  actionText: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});

