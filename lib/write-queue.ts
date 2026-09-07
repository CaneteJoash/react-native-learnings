import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AppState, type AppStateStatus } from 'react-native';

import { createNote as createNoteRequest } from './notes-api';

// A durable mutation queue: notes created offline are appended here first, then
// drained whenever the network is plausibly back. Non-sensitive and small, so
// plain AsyncStorage is the right home for it (see the security rule).
export type QueuedNote = {
  clientId: string;
  title: string;
  status: 'pending' | 'syncing' | 'failed';
  attempts: number;
  lastError?: string;
};

const QUEUE_KEY = 'fieldkit.write-queue.notes';
const MAX_ATTEMPTS = 5;

type Listener = (queue: QueuedNote[]) => void;

let queue: QueuedNote[] = [];
let hydrated: Promise<void> | null = null;
let flushing = false;
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) listener(queue);
}

async function persist() {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function hydrate(): Promise<void> {
  if (!hydrated) {
    hydrated = AsyncStorage.getItem(QUEUE_KEY).then((raw) => {
      queue = raw ? (JSON.parse(raw) as QueuedNote[]) : [];
      notify();
    });
  }
  return hydrated;
}

export async function flushWriteQueue(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    await hydrate();
    for (const item of [...queue]) {
      if (item.status !== 'pending') continue;

      queue = queue.map((entry) =>
        entry.clientId === item.clientId ? { ...entry, status: 'syncing' } : entry
      );
      notify();

      try {
        await createNoteRequest(item.title);
        queue = queue.filter((entry) => entry.clientId !== item.clientId);
      } catch (error) {
        const attempts = item.attempts + 1;
        const failed = attempts >= MAX_ATTEMPTS;
        queue = queue.map((entry) =>
          entry.clientId === item.clientId
            ? {
                ...entry,
                status: failed ? 'failed' : 'pending',
                attempts,
                lastError: error instanceof Error ? error.message : String(error),
              }
            : entry
        );
      }
      await persist();
      notify();
    }
  } finally {
    flushing = false;
  }
}

export async function enqueueNote(title: string): Promise<QueuedNote> {
  await hydrate();
  const item: QueuedNote = {
    clientId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    status: 'pending',
    attempts: 0,
  };
  queue = [...queue, item];
  await persist();
  notify();
  flushWriteQueue();
  return item;
}

export async function retryNote(clientId: string): Promise<void> {
  await hydrate();
  queue = queue.map((entry) =>
    entry.clientId === clientId
      ? { ...entry, status: 'pending', attempts: 0, lastError: undefined }
      : entry
  );
  await persist();
  notify();
  flushWriteQueue();
}

export function subscribeToWriteQueue(listener: Listener): () => void {
  listeners.add(listener);
  hydrate().then(() => listener(queue));
  return () => listeners.delete(listener);
}

// Drain automatically once the network is plausibly back...
NetInfo.addEventListener((state) => {
  if (state.isConnected && state.isInternetReachable !== false) {
    flushWriteQueue();
  }
});

// ...and make one last attempt before the app is frozen in the background.
AppState.addEventListener('change', (status: AppStateStatus) => {
  if (status === 'background') {
    flushWriteQueue();
  }
});

// Pick up anything left queued from a previous session.
hydrate().then(() => flushWriteQueue());
