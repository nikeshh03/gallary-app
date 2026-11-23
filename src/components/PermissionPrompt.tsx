import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EmptyState } from './EmptyState';

export interface PermissionPromptProps {
  title: string;
  message: string;
  buttonLabel: string;
  onPress: () => void;
}

export function PermissionPrompt({
  title,
  message,
  buttonLabel,
  onPress,
}: PermissionPromptProps) {
  return (
    <View style={styles.container}>
      <EmptyState
        title={title}
        message={message}
        actionLabel={buttonLabel}
        onAction={onPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

