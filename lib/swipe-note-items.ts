export type SwipeNote = {
  id: string;
  title: string;
  snippet: string;
};

export const SWIPE_NOTE_ITEMS: SwipeNote[] = [
  { id: 'n1', title: 'Grocery list', snippet: 'Eggs, oat milk, coffee, spinach' },
  { id: 'n2', title: 'Standup notes', snippet: 'Blocked on API contract for drill 12' },
  { id: 'n3', title: 'Book recs', snippet: 'The Pragmatic Programmer, Clean Architecture' },
  { id: 'n4', title: 'Trip packing', snippet: 'Charger, passport, hiking boots' },
  { id: 'n5', title: 'Recipe idea', snippet: 'Miso butter pasta, 20 min' },
  { id: 'n6', title: 'Gift ideas', snippet: 'Headphones, plant, board game' },
];
