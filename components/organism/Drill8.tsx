import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { styles } from '@/constants/styles';
import {
  clearInsecureMirrorForDemo,
  getAuthToken,
  insecurelyMirrorTokenForDemo,
  readInsecureMirrorForDemo,
  saveAuthToken,
} from '@/lib/secure-token';
import { ThemedText } from '../themed-text';

export default function Drill8() {
  const [token] = useState(() => `demo-token-${Date.now()}`);
  const [secureValue, setSecureValue] = useState<string | null>(null);
  const [insecureValue, setInsecureValue] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await saveAuthToken(token);
    await insecurelyMirrorTokenForDemo(token);
    setSaved(true);
    setSecureValue(null);
    setInsecureValue(null);
  };

  const handleReveal = async () => {
    setSecureValue(await getAuthToken());
    setInsecureValue(await readInsecureMirrorForDemo());
  };

  const handleClear = async () => {
    await clearInsecureMirrorForDemo();
    setSaved(false);
    setSecureValue(null);
    setInsecureValue(null);
  };

  return (
    <View>
      <ThemedText style={styles.drillTitle}>Drill 8 — SecureStore vs AsyncStorage</ThemedText>
      <ThemedText>Demo token: {token}</ThemedText>

      <Pressable onPress={handleSave}>
        <ThemedText type="link">Save token to SecureStore + AsyncStorage</ThemedText>
      </Pressable>

      {saved && (
        <Pressable onPress={handleReveal}>
          <ThemedText type="link">Read both back</ThemedText>
        </Pressable>
      )}

      {secureValue !== null && (
        <ThemedText>
          SecureStore.getItemAsync() → &quot;{secureValue}&quot; (only reachable through this API,
          backed by Keychain/Keystore)
        </ThemedText>
      )}

      {insecureValue !== null && (
        <ThemedText>
          AsyncStorage.getItem() → &quot;{insecureValue}&quot; — the exact plaintext bytes a
          `run-as` / simulator file dump would show, no decryption required
        </ThemedText>
      )}

      {(saved || secureValue !== null) && (
        <Pressable onPress={handleClear}>
          <ThemedText type="link">Clear demo token</ThemedText>
        </Pressable>
      )}
    </View>
  );
}
