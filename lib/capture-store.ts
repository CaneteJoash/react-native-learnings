import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

export type CaptureCoords = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export type Capture = {
  id: string;
  noteId: string;
  uri: string;
  createdAt: number;
  coords: CaptureCoords | null;
};

const STORE_KEY = 'fieldkit.captures';
const CAPTURES_DIR_NAME = 'fieldkit-captures';

type Listener = (captures: Capture[]) => void;

let captures: Capture[] = [];
let hydrated: Promise<void> | null = null;
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) listener(captures);
}

async function persist() {
  await AsyncStorage.setItem(STORE_KEY, JSON.stringify(captures));
}

function hydrate(): Promise<void> {
  if (!hydrated) {
    hydrated = AsyncStorage.getItem(STORE_KEY).then((raw) => {
      captures = raw ? (JSON.parse(raw) as Capture[]) : [];
      notify();
    });
  }
  return hydrated;
}

function capturesDirectory(): Directory {
  const dir = new Directory(Paths.document, CAPTURES_DIR_NAME);
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

// CameraView writes the original JPEG to its own cache location, which the OS
// can reclaim at any time — copying (not moving) into fieldkit-captures/ is
// what actually makes the attachment durable.
export async function saveCapture(
  noteId: string,
  sourceUri: string,
  coords: CaptureCoords | null,
): Promise<Capture> {
  await hydrate();

  const source = new File(sourceUri);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const destination = new File(capturesDirectory(), filename);
  await source.copy(destination);

  const capture: Capture = {
    id: filename,
    noteId,
    uri: destination.uri,
    createdAt: Date.now(),
    coords,
  };
  captures = [capture, ...captures];
  await persist();
  notify();
  return capture;
}

export function subscribeToCaptures(listener: Listener): () => void {
  listeners.add(listener);
  hydrate().then(() => listener(captures));
  return () => listeners.delete(listener);
}
