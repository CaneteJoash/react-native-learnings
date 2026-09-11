import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  formatRelativeTime,
  markSyncing,
  mergeNoteList,
  resolveSyncFailure,
  resolveSyncSuccess,
} from '../write-queue-logic.ts';
import type { QueuedNote } from '../write-queue.ts';

function queuedNote(overrides: Partial<QueuedNote> = {}): QueuedNote {
  return {
    clientId: 'local-1',
    title: 'Buy milk',
    status: 'pending',
    attempts: 0,
    updatedAt: 0,
    ...overrides,
  };
}

// -- queue ordering / transitions --

test('markSyncing flips only the matching entry to syncing', () => {
  const queue = [queuedNote({ clientId: 'a' }), queuedNote({ clientId: 'b' })];
  const result = markSyncing(queue, 'a', 100);
  assert.equal(result[0].status, 'syncing');
  assert.equal(result[0].updatedAt, 100);
  assert.equal(result[1].status, 'pending');
});

test('resolveSyncSuccess removes the synced entry from the queue', () => {
  const queue = [queuedNote({ clientId: 'a' }), queuedNote({ clientId: 'b' })];
  const result = resolveSyncSuccess(queue, 'a');
  assert.deepEqual(
    result.map((entry) => entry.clientId),
    ['b']
  );
});

test('resolveSyncFailure retries below the attempt ceiling', () => {
  const queue = [queuedNote({ clientId: 'a', attempts: 1 })];
  const result = resolveSyncFailure(queue, 'a', new Error('network down'), 5, 200);
  assert.equal(result[0].status, 'pending');
  assert.equal(result[0].attempts, 2);
  assert.equal(result[0].lastError, 'network down');
});

test('resolveSyncFailure marks failed once attempts reach the ceiling', () => {
  const queue = [queuedNote({ clientId: 'a', attempts: 4 })];
  const result = resolveSyncFailure(queue, 'a', new Error('still down'), 5, 300);
  assert.equal(result[0].status, 'failed');
  assert.equal(result[0].attempts, 5);
});

test('mergeNoteList puts queued notes ahead of the server page', () => {
  const pending = [queuedNote({ clientId: 'local-1', title: 'Local only' })];
  const remote = [{ id: '9', title: 'Remote note' }];
  const merged = mergeNoteList(pending, remote);
  assert.deepEqual(
    merged.map((note) => note.title),
    ['Local only', 'Remote note']
  );
});

// -- conflict resolution --

test('mergeNoteList drops a queued note once the server has a same-title note', () => {
  const pending = [queuedNote({ clientId: 'local-1', title: 'Buy milk' })];
  const remote = [{ id: '9', title: 'Buy milk' }];
  const merged = mergeNoteList(pending, remote);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].id, '9');
});

// -- relative-time formatting --

test('formatRelativeTime renders sub-minute and minute-scale offsets', () => {
  const now = 1_000_000;
  assert.equal(formatRelativeTime(now - 2_000, now), 'just now');
  assert.equal(formatRelativeTime(now - 45_000, now), '45s ago');
  assert.equal(formatRelativeTime(now - 3 * 60_000, now), '3m ago');
});

test('formatRelativeTime renders hour and day-scale offsets', () => {
  const now = 1_000_000_000;
  assert.equal(formatRelativeTime(now - 5 * 3_600_000, now), '5h ago');
  assert.equal(formatRelativeTime(now - 2 * 86_400_000, now), '2d ago');
});
