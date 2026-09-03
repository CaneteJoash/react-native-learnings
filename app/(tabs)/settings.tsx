import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import Drill2 from '@/components/organism/Drill2';
import Drill3 from '@/components/organism/Drill3';
import Drill4 from '@/components/organism/Drill4';
import Drill5 from '@/components/organism/Drill5';
import { ThemedText } from '@/components/themed-text';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title">Settings</ThemedText>
      <ThemedText>Placeholder screen — no real content for this drill.</ThemedText>

      <ThemedText type="link" style={styles.action} onPress={() => router.push('/compose')}>
        Compose
      </ThemedText>

      <ThemedText type="subtitle" style={styles.section}>
        Previous drills
      </ThemedText>
      <ThemedText>=====================================</ThemedText>
      <Drill2 />
      <ThemedText>=====================================</ThemedText>
      <Drill3 />
      <ThemedText>=====================================</ThemedText>
      <Drill4 />
      <ThemedText>=====================================</ThemedText>
      <Drill5 />
      <ThemedText>=====================================</ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  action: {
    marginTop: 8,
  },
  section: {
    marginTop: 20,
  },
});
