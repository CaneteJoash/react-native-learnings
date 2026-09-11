import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNotes } from '@/hooks/use-notes';

export default function ComposeScreen() {
  const router = useRouter();
  const { createNote } = useNotes();
  const [draftTitle, setDraftTitle] = useState('');

  const canSave = draftTitle.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    createNote(draftTitle.trim());
    router.back();
  };

  return (
    <ThemedView style={styles.container} accessibilityViewIsModal>
      <ThemedText type="title">Compose</ThemedText>
      <ThemedText>Saved offline first — it syncs once you&apos;re back online.</ThemedText>

      <TextInput
        value={draftTitle}
        onChangeText={setDraftTitle}
        placeholder="Note title"
        style={styles.input}
        autoFocus
        onSubmitEditing={handleSave}
        returnKeyType="done"
      />

      <Pressable style={styles.action} onPress={handleSave}>
        <ThemedText type="link">Save</ThemedText>
      </Pressable>

      <ThemedText type="link" style={styles.action} onPress={() => router.back()}>
        Dismiss
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  input: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  action: {
    marginTop: 8,
  },
});
