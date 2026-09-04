import { Link, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNotes } from '@/hooks/use-notes';

export default function NotesListScreen() {
  const router = useRouter();
  const { state, retry } = useNotes();

  return (
    <ThemedView style={styles.container}>
      {state.status === 'loading' && (
        <ThemedView style={styles.center}>
          <ActivityIndicator />
          <ThemedText>Loading notes…</ThemedText>
        </ThemedView>
      )}

      {state.status === 'error' && (
        <ThemedView style={styles.center}>
          <ThemedText type="defaultSemiBold">Couldn&apos;t load notes</ThemedText>
          <ThemedText style={styles.errorDetail}>{state.error.message}</ThemedText>
          <Pressable style={styles.retryButton} onPress={retry}>
            <ThemedText type="link">Retry</ThemedText>
          </Pressable>
        </ThemedView>
      )}

      {state.status === 'success' && (
        <FlatList
          data={state.notes}
          keyExtractor={(note) => note.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Link href={{ pathname: '/notes/[id]', params: { id: item.id } }} asChild>
              <Pressable style={styles.row}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
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
