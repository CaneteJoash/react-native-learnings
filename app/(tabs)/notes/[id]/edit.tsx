import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function NoteEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Editing note {id}</ThemedText>
      <ThemedText>Placeholder edit form for note {id}.</ThemedText>

      <ThemedText type="link" style={styles.action} onPress={() => router.back()}>
        Save and go back
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
