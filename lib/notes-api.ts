import { request } from './api';

export type Note = {
  id: string;
  title: string;
};

type PostDto = {
  id: number;
  title: string;
};

// JSONPlaceholder is a public fake-REST-API used purely as a real remote
// endpoint to exercise the networking layer against — not app data.
const NOTES_BASE_URL = 'https://jsonplaceholder.typicode.com/posts';
const NOTES_URL = `${NOTES_BASE_URL}?_limit=10`;

export async function fetchNotes(): Promise<Note[]> {
  const posts = await request<PostDto[]>(NOTES_URL);
  // JSONPlaceholder's titles are Latin filler text; the network round-trip is
  // the point of this drill, not the content, so display a plain label instead.
  return posts.map((post) => ({ id: String(post.id), title: `Note ${post.id}` }));
}

export async function createNote(title: string): Promise<Note> {
  // JSONPlaceholder fakes the write: it always answers with id 101 and never
  // actually persists anything. Good enough to exercise the write-queue sync
  // path without a real backend.
  const created = await request<PostDto>(NOTES_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ title, userId: 1 }),
  });
  return { id: String(created.id), title };
}
