import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type Props = {
  pendingCount: number;
  failedCount: number;
  onRetryFailed: () => void;
};

export function SyncIndicator({ pendingCount, failedCount, onRetryFailed }: Props) {
  if (pendingCount === 0 && failedCount === 0) return null;

  const parts: string[] = [];
  if (pendingCount > 0) parts.push(`${pendingCount} note${pendingCount === 1 ? '' : 's'} syncing`);
  if (failedCount > 0) parts.push(`${failedCount} failed to sync`);

  return (
    <View style={[styles.bar, failedCount > 0 && styles.failed]}>
      <ThemedText style={styles.text}>{parts.join(' · ')}</ThemedText>
      {failedCount > 0 && (
        <Pressable onPress={onRetryFailed}>
          <ThemedText type="link" style={styles.retry}>
            Retry
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FEF3C7',
  },
  failed: {
    backgroundColor: '#FEE2E2',
  },
  text: {
    fontSize: 13,
    color: '#1f2937',
  },
  retry: {
    fontSize: 13,
    lineHeight: 18,
  },
});
