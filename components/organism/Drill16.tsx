import { memo, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/molecule/AppButton';
import { ThemedText } from '@/components/themed-text';
import { styles } from '@/constants/styles';
import { crashNow } from '@/lib/drill16-crash';
import { fetchMediumReport, fetchQuickWidget, fetchSlowArchive } from '@/lib/drill16-network';

type BreakpointItem = { id: number; title: string; weightKg: number };

const BREAKPOINT_ITEMS: BreakpointItem[] = Array.from({ length: 100 }, (_, index) => ({
  id: index,
  title: `Row ${index}`,
  weightKg: Math.round(Math.random() * 1000) / 10,
}));

function renderBreakpointRow({ item, index }: { item: BreakpointItem; index: number }) {
  // Conditional breakpoint target: Sources panel -> this line -> right-click ->
  // Add conditional breakpoint -> `index === 42`. When it pauses, add a watch
  // expression on `item` to prove its shape, and capture the call stack.
  const label = `${item.title} — ${item.weightKg}kg`;
  return (
    <View style={drillStyles.breakpointRow}>
      <ThemedText>{label}</ThemedText>
    </View>
  );
}

function BreakpointListSection() {
  return (
    <FlatList
      data={BREAKPOINT_ITEMS}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderBreakpointRow}
      style={drillStyles.breakpointList}
      nestedScrollEnabled
    />
  );
}

type MemoRowItem = { id: number; title: string };

const MEMO_ITEMS: MemoRowItem[] = Array.from({ length: 60 }, (_, index) => ({
  id: index,
  title: `Item ${index}`,
}));

function PlainRow({ item }: { item: MemoRowItem }) {
  return (
    <View style={drillStyles.memoRow}>
      <ThemedText>{item.title}</ThemedText>
    </View>
  );
}

const MemoRow = memo(PlainRow);

function MemoProfilerSection() {
  const [useMemoRow, setUseMemoRow] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Same MEMO_ITEMS reference every render, so PlainRow re-renders purely
  // because the parent did — exactly what memo() is meant to short-circuit.
  const RowComponent = useMemoRow ? MemoRow : PlainRow;

  return (
    <View>
      <ThemedText>Tick: {tick} (re-renders this whole section every second)</ThemedText>
      <AppButton
        title={useMemoRow ? 'Rows wrapped in memo() — tap for plain' : 'Plain rows — tap to wrap in memo()'}
        variant="secondary"
        onPress={() => setUseMemoRow((v) => !v)}
      />
      <View style={drillStyles.memoList}>
        {MEMO_ITEMS.map((item) => (
          <RowComponent key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}

function NetworkInitiatorSection() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const fireAll = async () => {
    setStatus('loading');
    await Promise.allSettled([fetchQuickWidget(), fetchMediumReport(), fetchSlowArchive()]);
    setStatus('done');
  };

  return (
    <View>
      <ThemedText>
        Fires three requests from three different call depths. Open the Network panel first,
        tap below, then open the Initiator tab on the slowest row to identify which module
        issued it — should trace back to lib/drill16-network.ts&apos;s retrieveArchive().
      </ThemedText>
      <AppButton
        title={status === 'loading' ? 'Requests in flight…' : 'Fire requests'}
        onPress={fireAll}
        loading={status === 'loading'}
      />
      {status === 'done' && <ThemedText>All three settled — check the Network panel.</ThemedText>}
    </View>
  );
}

function CrashSection() {
  return (
    <View>
      <ThemedText>
        Only meaningful on a release build — DevTools, LogBox, and the Dev Menu are all disabled
        there. Full loop (build, crash, adb logcat, metro-symbolicate, one-line change, prove the
        commit-matching rule) is in docs/drill-16-symbolication.md.
      </ThemedText>
      <AppButton title="Crash now" variant="danger" onPress={crashNow} />
    </View>
  );
}

export default function Drill16() {
  return (
    <View>
      <ThemedText style={drillStyles.drillTitle}>Drill 16 — Symbolicate a real crash</ThemedText>
      <ThemedText>
        Five objectives, one screen: a conditional breakpoint, a memo() profiler comparison, a
        Network Initiator trace, a release-build crash to symbolicate, and a native breakpoint.
        The last two need a release APK and Android Studio — see docs/drill-16-symbolication.md.
      </ThemedText>

      <ThemedText type="subtitle" style={drillStyles.section}>
        1. Conditional breakpoint on index 42
      </ThemedText>
      <BreakpointListSection />

      <ThemedText type="subtitle" style={drillStyles.section}>
        2. React Profiler — before/after memo()
      </ThemedText>
      <MemoProfilerSection />

      <ThemedText type="subtitle" style={drillStyles.section}>
        3. Network panel — Initiator tab
      </ThemedText>
      <NetworkInitiatorSection />

      <ThemedText type="subtitle" style={drillStyles.section}>
        4. Release crash → symbolicate → prove the commit-matching rule
      </ThemedText>
      <CrashSection />

      <ThemedText type="subtitle" style={drillStyles.section}>
        5. Native breakpoint — Android Studio attach
      </ThemedText>
      <ThemedText>
        No in-app trigger for this one — attach Android Studio (Run → Attach to Process) to a
        running debug build of com.anonymous.hellorn and stop on a breakpoint in
        android/app/src/main/java/com/anonymous/hellorn/MainActivity.kt. Steps in
        docs/drill-16-symbolication.md.
      </ThemedText>
    </View>
  );
}

const drillStyles = StyleSheet.create({
  drillTitle: styles.drillTitle,
  section: {
    marginTop: 20,
  },
  breakpointList: {
    marginTop: 8,
    height: 240,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  breakpointRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  memoList: {
    marginTop: 8,
    maxHeight: 240,
    overflow: 'hidden',
  },
  memoRow: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
});
