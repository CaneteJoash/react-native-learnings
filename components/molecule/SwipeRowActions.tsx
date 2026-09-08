import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export const SWIPE_ACTIONS_WIDTH = 152;

type SwipeRowActionsProps = {
  onArchive: () => void;
  onDelete: () => void;
};

export function SwipeRowActions({ onArchive, onDelete }: SwipeRowActionsProps) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable style={[styles.action, styles.archive]} onPress={onArchive}>
        <ThemedText style={styles.label}>Archive</ThemedText>
      </Pressable>
      <Pressable style={[styles.action, styles.delete]} onPress={onDelete}>
        <ThemedText style={styles.label}>Delete</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  action: {
    width: SWIPE_ACTIONS_WIDTH / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  archive: {
    backgroundColor: '#D97706',
  },
  delete: {
    backgroundColor: '#DC2626',
  },
  label: {
    color: 'white',
    fontWeight: '600',
  },
});
