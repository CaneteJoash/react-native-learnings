import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ConfirmSheetProps } from './confirm-sheet.types';

export function ConfirmSheetSplit({ visible, title, message, options, cancelLabel = 'Cancel', onSelect, onCancel }: ConfirmSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <View style={styles.sheet}>
          <ThemedText type="subtitle">{title}</ThemedText>
          {message && <ThemedText style={styles.message}>{message}</ThemedText>}
          {options.map((option, index) => (
            <Pressable
              key={option.label}
              style={styles.row}
              android_ripple={{ color: '#00000022' }}
              onPress={() => onSelect(index)}
            >
              <ThemedText style={option.destructive && styles.destructive}>{option.label}</ThemedText>
            </Pressable>
          ))}
          <Pressable style={styles.row} android_ripple={{ color: '#00000022' }} onPress={onCancel}>
            <ThemedText>{cancelLabel}</ThemedText>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000055',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 4,
  },
  row: {
    paddingVertical: 14,
  },
  message: {
    marginBottom: 8,
  },
  destructive: {
    color: '#d92d20',
  },
});
