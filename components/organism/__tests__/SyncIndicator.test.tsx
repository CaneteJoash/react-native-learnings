import { fireEvent, render } from '@testing-library/react-native';
import snapshotDiff from 'snapshot-diff';

import { SyncIndicator } from '../SyncIndicator';

test('renders nothing when there is nothing to sync', async () => {
  const { toJSON } = await render(
    <SyncIndicator pendingCount={0} failedCount={0} onRetryFailed={() => {}} />
  );
  expect(toJSON()).toBeNull();
});

test('shows pending and failed counts, and retries on press', async () => {
  const onRetryFailed = jest.fn();
  const { getByText } = await render(
    <SyncIndicator pendingCount={2} failedCount={1} onRetryFailed={onRetryFailed} />
  );

  expect(getByText('2 notes syncing · 1 failed to sync')).toBeTruthy();

  await fireEvent.press(getByText('Retry'));
  expect(onRetryFailed).toHaveBeenCalledTimes(1);
});

// Snapshot only the rendered message + retry-button presence, not the full
// native element tree (Pressable's prop soup would blow past no-large-snapshots).
async function summarize(pendingCount: number, failedCount: number) {
  const { queryByText } = await render(
    <SyncIndicator pendingCount={pendingCount} failedCount={failedCount} onRetryFailed={() => {}} />
  );
  return {
    message: queryByText(/syncing|failed to sync/)?.props.children ?? null,
    hasRetry: queryByText('Retry') !== null,
  };
}

test('small snapshot: pending-only vs failed state diff stays reviewable', async () => {
  const pendingOnly = await summarize(1, 0);
  const withFailure = await summarize(1, 1);

  expect(snapshotDiff(pendingOnly, withFailure)).toMatchSnapshot();
});
