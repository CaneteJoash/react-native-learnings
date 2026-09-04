import { useCallback, useEffect, useState } from 'react';

import { fetchNotes, type Note } from '@/lib/notes-api';

type NotesState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; notes: Note[] };

export function useNotes() {
  const [state, setState] = useState<NotesState>({ status: 'loading' });

  const load = useCallback(() => {
    setState({ status: 'loading' });
    fetchNotes()
      .then((notes) => setState({ status: 'success', notes }))
      .catch((error: Error) => setState({ status: 'error', error }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { state, retry: load };
}
