import { useEffect, useState } from 'react';

import {
  saveCapture,
  subscribeToCaptures,
  type Capture,
  type CaptureCoords,
} from '@/lib/capture-store';

export function useCaptures(noteId: string | null) {
  const [allCaptures, setAllCaptures] = useState<Capture[]>([]);

  useEffect(() => subscribeToCaptures(setAllCaptures), []);

  return {
    captures: noteId ? allCaptures.filter((capture) => capture.noteId === noteId) : [],
    attach: (sourceUri: string, coords: CaptureCoords | null) => {
      if (!noteId) throw new Error('No note selected to attach this capture to');
      return saveCapture(noteId, sourceUri, coords);
    },
  };
}
