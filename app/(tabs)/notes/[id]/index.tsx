import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Note {id}</ThemedText>
      <ThemedText>This is a placeholder detail screen for note {id}.</ThemedText>

      <Link href={{ pathname: '/notes/[id]/edit', params: { id } }} asChild>
        <ThemedText type="link" style={styles.action}>
          Edit note
        </ThemedText>
      </Link>

      <ThemedText type="link" style={styles.action} onPress={() => router.push('/compose')}>
        Compose new note
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  action: {
    marginTop: 8,
  },
});
