import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ActionButton } from '../../components/ActionButton';
import { fontSizes, radii, spacing } from '../../theme/tokens';

export interface CreateAlbumModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function CreateAlbumModal({
  isVisible,
  onClose,
  onCreate,
}: CreateAlbumModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim());
      setName('');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.title, { color: colors.text }]}>
                  New Album
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Enter a name for this album.
                </Text>

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Album name"
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.background,
                      borderColor: isFocused ? colors.accent : colors.border,
                    },
                  ]}
                />

                <View style={styles.buttonRow}>
                  <ActionButton
                    label="Cancel"
                    variant="secondary"
                    onPress={handleClose}
                    accessibilityLabel="Cancel creating album"
                    style={styles.actionBtn}
                  />
                  <ActionButton
                    label="Create"
                    variant="primary"
                    disabled={!name.trim()}
                    onPress={handleCreate}
                    accessibilityLabel="Create album"
                    style={styles.actionBtn}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  keyboardContainer: {
    width: '100%',
    maxWidth: 360,
  },
  card: {
    width: '100%',
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.body,
    marginBottom: spacing.md,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.body,
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    minWidth: 0,
  },
});

