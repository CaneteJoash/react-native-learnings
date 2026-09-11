import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type Props = {
  pendingCount: number;
  failedCount: number;
  onRetryFailed: () => void;
};

function describeSyncState(pendingCount: number, failedCount: number): string {
  const segments = [
    pendingCount > 0 ? `${pendingCount} note${pendingCount === 1 ? '' : 's'} syncing` : null,
    failedCount > 0 ? `${failedCount} failed to sync` : null,
  ].filter((segment): segment is string => segment !== null);
  return segments.join(' · ');
}

export function SyncIndicator({ pendingCount, failedCount, onRetryFailed }: Props) {
  const hasWork = pendingCount > 0 || failedCount > 0;
  const hasFailures = failedCount > 0;

  if (!hasWork) return null;

  return (
    <View style={[styles.bar, hasFailures && styles.failed]}>
      <ThemedText style={styles.text}>{describeSyncState(pendingCount, failedCount)}</ThemedText>
      {hasFailures && (
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
