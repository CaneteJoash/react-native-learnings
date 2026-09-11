// Pure state-transition and formatting logic extracted out of write-queue.ts
// and use-notes.ts so it's testable without AsyncStorage, NetInfo, or React.

import type { Note } from './notes-api';
import type { QueuedNote } from './write-queue';

export function markSyncing(queue: QueuedNote[], clientId: string, now: number): QueuedNote[] {
  return queue.map((entry) =>
    entry.clientId === clientId ? { ...entry, status: 'syncing', updatedAt: now } : entry
  );
}

export function resolveSyncSuccess(queue: QueuedNote[], clientId: string): QueuedNote[] {
  return queue.filter((entry) => entry.clientId !== clientId);
}

export function resolveSyncFailure(
  queue: QueuedNote[],
  clientId: string,
  error: unknown,
  maxAttempts: number,
  now: number
): QueuedNote[] {
  return queue.map((entry) => {
    if (entry.clientId !== clientId) return entry;
    const attempts = entry.attempts + 1;
    const failed = attempts >= maxAttempts;
    return {
      ...entry,
      status: failed ? 'failed' : 'pending',
      attempts,
      lastError: error instanceof Error ? error.message : String(error),
      updatedAt: now,
    };
  });
}

export type MergedNote = Note & { syncStatus?: QueuedNote['status']; updatedAt?: number };

// Queue ordering + conflict resolution: locally queued notes render above the
// server's page (most recent activity first), and a queued note is dropped
// once the server reports a note with the same title — the server's synced
// copy wins over the stale local placeholder.
export function mergeNoteList(pending: QueuedNote[], remote: Note[]): MergedNote[] {
  const remoteTitles = new Set(remote.map((note) => note.title));
  const unresolved = pending.filter((item) => !remoteTitles.has(item.title));
  const pendingItems: MergedNote[] = unresolved.map((item) => ({
    id: item.clientId,
    title: item.title,
    syncStatus: item.status,
    updatedAt: item.updatedAt,
  }));
  return [...pendingItems, ...remote];
}

export function formatRelativeTime(fromMs: number, nowMs: number = Date.now()): string {
  const diffSec = Math.round((nowMs - fromMs) / 1000);
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.round(diffHour / 24);
  return `${diffDay}d ago`;
}
