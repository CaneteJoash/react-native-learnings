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
const NOTES_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=10';

export async function fetchNotes(): Promise<Note[]> {
  const posts = await request<PostDto[]>(NOTES_URL);
  // JSONPlaceholder's titles are Latin filler text; the network round-trip is
  // the point of this drill, not the content, so display a plain label instead.
  return posts.map((post) => ({ id: String(post.id), title: `Note ${post.id}` }));
}
