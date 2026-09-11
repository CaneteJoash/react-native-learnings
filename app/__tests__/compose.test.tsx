import { fireEvent, render } from '@testing-library/react-native';

import ComposeScreen from '../compose';

const mockBack = jest.fn();
const mockCreateNote = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: jest.fn() }),
}));

jest.mock('@/hooks/use-notes', () => ({
  useNotes: () => ({ createNote: mockCreateNote }),
}));

beforeEach(() => {
  mockBack.mockClear();
  mockCreateNote.mockClear();
});

test('saving a title queues the note and dismisses the screen', async () => {
  const { getByPlaceholderText, getByText } = await render(<ComposeScreen />);

  await fireEvent.changeText(getByPlaceholderText('Note title'), 'Buy milk');
  await fireEvent.press(getByText('Save'));

  expect(mockCreateNote).toHaveBeenCalledWith('Buy milk');
  expect(mockBack).toHaveBeenCalledTimes(1);
});

test('blank title is ignored: nothing is queued and the screen stays open', async () => {
  const { getByText } = await render(<ComposeScreen />);

  await fireEvent.press(getByText('Save'));

  expect(mockCreateNote).not.toHaveBeenCalled();
  expect(mockBack).not.toHaveBeenCalled();
});
