# AsyncStorage is a plaintext file. SecureStore is not.

Scope: the auth-token half of Drill 8. `components/organism/Drill8.tsx` writes the
same token through `lib/secure-token.ts` to both `expo-secure-store` and
`@react-native-async-storage/async-storage`, then reads both back through their
own APIs. That in-app panel proves the API-level behavior. This doc is the
device-level follow-through: pulling the actual storage file off a running
app and looking at the bytes.

Run the panel first (Settings tab → Drill 8), tap "Save token…", note the demo
token string it prints, then use it below. Substitute `<applicationId>` with the
package id from a prebuild/EAS build (this project is still managed-workflow, so
there's no fixed id yet — check `android/app/build.gradle` or the EAS build
config once one exists).

## Android — SQLite file, readable with `run-as` on a debug build

`@react-native-async-storage/async-storage` backs onto a SQLite database at:

```
/data/data/<applicationId>/databases/RKStorage
```

```sh
adb shell run-as <applicationId> \
  sqlite3 /data/data/<applicationId>/databases/RKStorage \
  "SELECT key, value FROM catalystLocalStorage WHERE key LIKE '%fieldkit%';"
```

Expected output — the token in the clear, no decryption step:

```
fieldkit.auth-token|demo-token-1735900000000
```

`run-as` only works on a debuggable build without root, which is exactly the
point: no special tooling, no jailbreak, just the Android debug bridge every
developer already has.

Now the same query against where SecureStore actually put it — nowhere in this
package's own storage:

```sh
adb shell run-as <applicationId> ls /data/data/<applicationId>/shared_prefs/
# → default preference files only; no plaintext token anywhere.
# SecureStore's Android backend is EncryptedSharedPreferences layered over the
# Keystore, so even a dumped shared_prefs XML holds ciphertext, not the token.
```

## iOS — a JSON manifest under the app's sandboxed Documents dir

On the simulator (no jailbreak needed for this one):

```sh
xcrun simctl get_app_container booted <bundleId> data
# → /Users/you/Library/Developer/CoreSimulator/Devices/<UDID>/data/Containers/Data/Application/<GUID>

cat ".../Documents/RCTAsyncLocalStorage_V1/manifest.json"
```

Expected output:

```json
{ "fieldkit.auth-token": "demo-token-1735900000000" }
```

SecureStore's iOS backend is the Keychain (`kSecClassGenericPassword`), which
isn't a file under the app's Documents directory at all — it's a system service
mediated by the Security framework, gated by the device passcode/biometrics and
the app's Keychain access group. There is no `cat` for it.

## The takeaway

Same token, same device, two outcomes:

| Store | Where it lives | What a file dump shows |
|---|---|---|
| AsyncStorage | SQLite (Android) / JSON manifest (iOS), inside the app sandbox | The token, in the clear |
| SecureStore | Keystore-backed EncryptedSharedPreferences (Android) / Keychain (iOS) | Nothing readable without going through the OS API |

AsyncStorage's own docs are explicit that it is unencrypted and meant for
non-sensitive data — this is that claim, demonstrated rather than taken on
faith.
