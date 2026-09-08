export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'sync',
    question: 'Why does a note show "pending" after I save it offline?',
    answer:
      'FieldKit queues writes locally and flushes them once connectivity returns. "Pending" means it is still in that queue, not lost.',
  },
  {
    id: 'conflict',
    question: 'What happens if two devices edit the same note?',
    answer:
      'The last successful sync wins. There is no field-level merge yet — that is tracked as a follow-up, not a bug.',
  },
  {
    id: 'storage',
    question: 'Where is the auth token stored?',
    answer:
      'In SecureStore, backed by Keystore on Android and Keychain on iOS — never in AsyncStorage, which is plaintext on disk.',
  },
];
