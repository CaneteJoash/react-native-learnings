import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// The real home for the auth token: iOS Keychain / Android Keystore-backed
// Encrypted Shared Preferences via expo-secure-store. See the security rule —
// this is the only place a token, secret, or API key should live.
const TOKEN_KEY = 'fieldkit.auth-token';

export async function saveAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// Insecure sibling used ONLY by Drill 8's demonstration (components/organism/Drill8.tsx)
// to prove the same token written to AsyncStorage is stored in the clear. Never
// call this outside of that demonstration.
export async function insecurelyMirrorTokenForDemo(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function readInsecureMirrorForDemo(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearInsecureMirrorForDemo(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await deleteAuthToken();
}
