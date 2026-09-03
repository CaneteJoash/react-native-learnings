import { Stack } from 'expo-router';

export default function NotesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Notes' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Note' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Note', presentation: 'card' }} />
    </Stack>
  );
}
