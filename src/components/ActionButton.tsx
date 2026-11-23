import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { fontSizes, radii, spacing } from '../theme/tokens';

export interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel: string;
  style?: ViewStyle;
}

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
}: ActionButtonProps) {
  const { colors } = useTheme();

  const isInteractive = !disabled && !loading;

  let backgroundColor: string;
  let textColor: string;
  let borderColor: string | undefined;

  switch (variant) {
    case 'secondary':
      backgroundColor = 'transparent';
      textColor = colors.accent;
      borderColor = colors.accent;
      break;
    case 'danger':
      backgroundColor = colors.danger;
      textColor = '#FFFFFF';
      borderColor = undefined;
      break;
    case 'primary':
    default:
      backgroundColor = colors.accent;
      textColor = '#FFFFFF';
      borderColor = undefined;
      break;
  }

  const buttonStyle: ViewStyle = {
    backgroundColor,
    borderRadius: radii.sm,
    borderColor,
    borderWidth: borderColor ? 1 : 0,
    opacity: disabled ? 0.4 : 1,
  };

  const textStyle: TextStyle = {
    color: textColor,
    fontSize: fontSizes.subtitle,
    fontWeight: '600',
  };

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      style={({ pressed }) => [
        styles.button,
        buttonStyle,
        pressed && isInteractive && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' ? colors.accent : '#FFFFFF'}
        />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

