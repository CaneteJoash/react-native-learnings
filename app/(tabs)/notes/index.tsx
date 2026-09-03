import { Link, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NOTES } from '@/constants/notes';

export default function NotesListScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={NOTES}
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
