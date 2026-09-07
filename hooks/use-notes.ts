import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchNotes, type Note } from '@/lib/notes-api';
import {
  enqueueNote,
  flushWriteQueue,
  retryNote,
  subscribeToWriteQueue,
  type QueuedNote,
} from '@/lib/write-queue';

export const NOTES_QUERY_KEY = ['notes'];

export type NoteListItem = Note & { syncStatus?: QueuedNote['status'] };

export function useNotes() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: NOTES_QUERY_KEY, queryFn: fetchNotes });
  const [pending, setPending] = useState<QueuedNote[]>([]);

  useEffect(() => subscribeToWriteQueue(setPending), []);

  const pendingItems: NoteListItem[] = pending.map((item) => ({
    id: item.clientId,
    title: item.title,
    syncStatus: item.status,
  }));

  const notes: NoteListItem[] = [...pendingItems, ...(query.data ?? [])];

  return {
    notes,
    // Only the very first fetch with nothing cached should show a spinner —
    // once there's data (even stale, even offline) render it instead.
    isLoading: query.isLoading,
    // Offline with no cache yet: the query is paused, not failed.
    isPaused: query.isPending && query.fetchStatus === 'paused',
    isError: query.isError && !query.data,
    error: query.error,
    pendingCount: pending.filter((item) => item.status !== 'failed').length,
    failedCount: pending.filter((item) => item.status === 'failed').length,
    createNote: (title: string) => enqueueNote(title),
    retryFailedNotes: () => {
      pending
        .filter((item) => item.status === 'failed')
        .forEach((item) => retryNote(item.clientId));
    },
    refetch: () => {
      flushWriteQueue();
      return queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  };
}
