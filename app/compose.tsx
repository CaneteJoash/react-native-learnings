import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ComposeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Compose</ThemedText>
      <ThemedText>Placeholder modal — reachable from any tab.</ThemedText>

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
  action: {
    marginTop: 8,
  },
});
