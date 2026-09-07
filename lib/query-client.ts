import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';

// react-query's default online/focus detection is web-shaped (navigator.onLine,
// window focus events) and does nothing useful in React Native, so both must be
// wired to real RN signals or "refetch on reconnect" and "refetch on foreground"
// silently never fire.
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(state.isConnected === true && state.isInternetReachable !== false);
  });
});

focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
    handleFocus(status === 'active');
  });
  return () => subscription.remove();
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      // Cache lives a full day in AsyncStorage so a cold start in airplane mode
      // still has something to show instead of an error screen.
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnReconnect: true,
    },
  },
});

export const queryCachePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'fieldkit.query-cache',
});
