import { Link, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { SyncIndicator } from '@/components/organism/SyncIndicator';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNotes } from '@/hooks/use-notes';

const SYNC_LABEL: Record<'pending' | 'syncing' | 'failed', string> = {
  pending: ' · pending',
  syncing: ' · syncing…',
  failed: ' · failed',
};

export default function NotesListScreen() {
  const router = useRouter();
  const {
    notes,
    isLoading,
    isPaused,
    isError,
    error,
    pendingCount,
    failedCount,
    refetch,
    retryFailedNotes,
  } = useNotes();

  return (
    <ThemedView style={styles.container}>
      <SyncIndicator
        pendingCount={pendingCount}
        failedCount={failedCount}
        onRetryFailed={retryFailedNotes}
      />

      {isLoading && (
        <ThemedView style={styles.center}>
          <ActivityIndicator />
          <ThemedText>Loading notes…</ThemedText>
        </ThemedView>
      )}

      {!isLoading && isPaused && notes.length === 0 && (
        <ThemedView style={styles.center}>
          <ThemedText type="defaultSemiBold">You&apos;re offline</ThemedText>
          <ThemedText style={styles.errorDetail}>
            No cached notes yet — reconnect to load your notes.
          </ThemedText>
        </ThemedView>
      )}

      {!isLoading && isError && notes.length === 0 && (
        <ThemedView style={styles.center}>
          <ThemedText type="defaultSemiBold">Couldn&apos;t load notes</ThemedText>
          <ThemedText style={styles.errorDetail}>{error?.message}</ThemedText>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <ThemedText type="link">Retry</ThemedText>
          </Pressable>
        </ThemedView>
      )}

      {notes.length > 0 && (
        <FlatList
          data={notes}
          keyExtractor={(note) => note.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Link href={{ pathname: '/notes/[id]', params: { id: item.id } }} asChild>
              <Pressable style={styles.row}>
                <ThemedText type="defaultSemiBold">
                  {item.title}
                  {item.syncStatus ? SYNC_LABEL[item.syncStatus] : ''}
                </ThemedText>
              </Pressable>
            </Link>
          )}
        />
      )}

      <Pressable style={styles.composeButton} onPress={() => router.push('/compose')}>
        <ThemedText type="link">Compose</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  errorDetail: {
    textAlign: 'center',
    opacity: 0.7,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  list: {
    padding: 16,
    gap: 8,
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  composeButton: {
    padding: 16,
    alignItems: 'center',
  },
});
