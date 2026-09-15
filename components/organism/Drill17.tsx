import { useRouter } from 'expo-router';
import { Profiler, type ProfilerOnRenderCallback, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, type ListRenderItemInfo } from 'react-native';

import { AppButton } from '@/components/molecule/AppButton';
import { ThemedText } from '@/components/themed-text';
import { styles } from '@/constants/styles';
import { useJsFps } from '@/hooks/use-js-fps';
import { FIELD_ROWS, FIXED_ROW_HEIGHT, noteTextFor, type FieldRow } from '@/lib/drill17-list-data';
import { blockJsThreadFor } from '@/lib/drill17-perf';

// ---------- 1. The two-thread model ----------

function TwoThreadSection() {
  const jsFps = useJsFps();

  const triggerBlock = () => {
    blockJsThreadFor(200);
  };

  return (
    <View>
      <ThemedText>
        JS FPS (measured here via requestAnimationFrame): <ThemedText type="defaultSemiBold">{jsFps}</ThemedText>
      </ThemedText>
      <ThemedText style={drillStyles.hint}>
        Open the dev-menu Perf Monitor for the real dual reading, then scroll the list in section 2
        while tapping the button below. The list keeps scrolling at native speed (UI thread —
        untouched by JS stalls) while this in-app JS FPS reading — and the Perf Monitor&apos;s JS
        row — drop or freeze for ~200ms. That split is the whole diagnosis.
      </ThemedText>
      <AppButton title="Block JS thread for 200ms (simulated root setState)" variant="danger" onPress={triggerBlock} />
    </View>
  );
}

// ---------- 2. FlatList tuning matrix ----------

const INITIAL_NUM_PRESETS = [5, 10, 20] as const;
const WINDOW_SIZE_PRESETS = [5, 21, 41] as const;
const BATCH_PRESETS = [5, 10, 20] as const;

function cycle<T>(preset: readonly T[], current: T): T {
  return preset[(preset.indexOf(current) + 1) % preset.length];
}

const tuningKeyExtractor = (item: FieldRow) => item.id;

type TuningRowProps = { row: FieldRow; selected: boolean; onPress: (id: string) => void };

function TuningRow({ row, selected, onPress }: TuningRowProps) {
  return (
    <Pressable onPress={() => onPress(row.id)} style={[drillStyles.tuningRow, selected && drillStyles.tuningRowSelected]}>
      <ThemedText>
        {row.title} — {row.readingC}°C
      </ThemedText>
    </Pressable>
  );
}

function TuningMatrixSection() {
  const [initialNumToRender, setInitialNumToRender] = useState<(typeof INITIAL_NUM_PRESETS)[number]>(10);
  const [windowSize, setWindowSize] = useState<(typeof WINDOW_SIZE_PRESETS)[number]>(21);
  const [maxToRenderPerBatch, setMaxToRenderPerBatch] = useState<(typeof BATCH_PRESETS)[number]>(10);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const pressStartRef = useRef<number | null>(null);

  const handleRowPress = useCallback((id: string) => {
    pressStartRef.current = Date.now();
    setSelectedId(id);
  }, []);

  useEffect(() => {
    if (selectedId !== null && pressStartRef.current !== null) {
      setLatencyMs(Date.now() - pressStartRef.current);
    }
  }, [selectedId]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FieldRow>) => (
      <TuningRow row={item} selected={item.id === selectedId} onPress={handleRowPress} />
    ),
    [selectedId, handleRowPress],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({ length: FIXED_ROW_HEIGHT, offset: FIXED_ROW_HEIGHT * index, index }),
    [],
  );

  return (
    <View>
      <ThemedText style={drillStyles.hint}>
        10,000 fixed-height rows. Cycle each knob, then scroll fast (watch for blank cells) and tap
        a row (watch the latency reading). Attach Android Studio Profiler → Memory to watch
        allocation while you scroll. There is no single right answer here — record what you observe
        for a few combinations and write down which one you&apos;d ship and why.
      </ThemedText>

      <View style={drillStyles.knobRow}>
        <AppButton
          title={`initialNumToRender: ${initialNumToRender}`}
          variant="secondary"
          onPress={() => setInitialNumToRender((v) => cycle(INITIAL_NUM_PRESETS, v))}
        />
        <AppButton
          title={`maxToRenderPerBatch: ${maxToRenderPerBatch}`}
          variant="secondary"
          onPress={() => setMaxToRenderPerBatch((v) => cycle(BATCH_PRESETS, v))}
        />
        <AppButton
          title={`windowSize: ${windowSize}`}
          variant="secondary"
          onPress={() => setWindowSize((v) => cycle(WINDOW_SIZE_PRESETS, v))}
        />
      </View>

      <ThemedText style={drillStyles.hint}>
        Press latency (tap → committed highlight): {latencyMs !== null ? `${latencyMs}ms` : '—'}
      </ThemedText>

      <FlatList
        data={FIELD_ROWS}
        keyExtractor={tuningKeyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={initialNumToRender}
        maxToRenderPerBatch={maxToRenderPerBatch}
        windowSize={windowSize}
        removeClippedSubviews
        style={drillStyles.tuningList}
      />
    </View>
  );
}

// ---------- 3. Variable-height inline renderItem -> fixed height + getItemLayout ----------

const COMPARISON_ROWS = FIELD_ROWS.slice(0, 500);

function JankyRow({ row }: { row: FieldRow }) {
  return (
    <View style={drillStyles.jankyRow}>
      <ThemedText type="defaultSemiBold">{row.title}</ThemedText>
      <ThemedText>{noteTextFor(row)}</ThemedText>
    </View>
  );
}

function FixedRow({ row }: { row: FieldRow }) {
  return (
    <View style={drillStyles.fixedRow}>
      <ThemedText type="defaultSemiBold">{row.title}</ThemedText>
      <ThemedText numberOfLines={1}>{noteTextFor(row)}</ThemedText>
    </View>
  );
}

// Module-scope and referentially stable for the app's lifetime — this is
// "hoisted", the strongest form of it. The janky sibling below defines its
// renderItem inline in JSX instead, which is exactly the mistake being drilled.
const fixedKeyExtractor = (item: FieldRow) => item.id;
const fixedRenderItem = ({ item }: ListRenderItemInfo<FieldRow>) => <FixedRow row={item} />;
const fixedGetItemLayout = (_: unknown, index: number) => ({
  length: FIXED_ROW_HEIGHT,
  offset: FIXED_ROW_HEIGHT * index,
  index,
});

function ProfiledListLabel({ id, stats }: { id: string; stats: { phase: string; ms: number } | null }) {
  return (
    <ThemedText style={drillStyles.hint}>
      {id} last commit: {stats ? `${stats.phase} — ${stats.ms.toFixed(1)}ms` : 'not yet rendered'}
    </ThemedText>
  );
}

function ComparisonSection() {
  const [renderTick, setRenderTick] = useState(0);
  const [jankyStats, setJankyStats] = useState<{ phase: string; ms: number } | null>(null);
  const [fixedStats, setFixedStats] = useState<{ phase: string; ms: number } | null>(null);

  const onJankyRender: ProfilerOnRenderCallback = useCallback((_id, phase, actualDuration) => {
    setJankyStats({ phase, ms: actualDuration });
  }, []);

  const onFixedRender: ProfilerOnRenderCallback = useCallback((_id, phase, actualDuration) => {
    setFixedStats({ phase, ms: actualDuration });
  }, []);

  return (
    <View>
      <ThemedText style={drillStyles.hint}>
        Same 500 rows, two implementations. Janky: inline renderItem (recreated every render — the
        FlatList cells re-render because the prop identity changed), variable height, no memo().
        Fixed: fixed height + getItemLayout + hoisted keyExtractor/renderItem + memo(). Tap bump a
        few times and compare the two commit durations below — React&apos;s own Profiler API, no
        extra tooling required.
      </ThemedText>
      <AppButton title={`Bump parent re-render (×${renderTick})`} onPress={() => setRenderTick((t) => t + 1)} />

      <ThemedText type="subtitle" style={drillStyles.subsection}>
        Janky — variable height, inline renderItem
      </ThemedText>
      <ProfiledListLabel id="janky" stats={jankyStats} />
      <Profiler id="drill17-janky" onRender={onJankyRender}>
        <View key={renderTick}>
          <FlatList
            data={COMPARISON_ROWS}
            keyExtractor={(item) => item.id}
            renderItem={(info) => <JankyRow row={info.item} />}
            style={drillStyles.comparisonList}
            nestedScrollEnabled
          />
        </View>
      </Profiler>

      <ThemedText type="subtitle" style={drillStyles.subsection}>
        Fixed — getItemLayout + hoisted renderItem + memo()
      </ThemedText>
      <ProfiledListLabel id="fixed" stats={fixedStats} />
      <Profiler id="drill17-fixed" onRender={onFixedRender}>
        <View key={renderTick}>
          <FlatList
            data={COMPARISON_ROWS}
            keyExtractor={fixedKeyExtractor}
            renderItem={fixedRenderItem}
            getItemLayout={fixedGetItemLayout}
            style={drillStyles.comparisonList}
            nestedScrollEnabled
          />
        </View>
      </Profiler>
    </View>
  );
}

// ---------- 4. Janky transition, for a Perfetto capture ----------

function TransitionJankSection() {
  const router = useRouter();

  return (
    <View>
      <ThemedText style={drillStyles.hint}>
        Release build only. Start a systrace/Perfetto capture (Android Studio Profiler → System
        Activities → export → open in Perfetto), tap below, stop the capture, then find the
        over-budget frame and name its owning thread from the marker. Full steps in
        docs/drill-17-measured-fix.md.
      </ThemedText>
      <AppButton
        title="Trigger janky push transition"
        variant="danger"
        onPress={() => {
          blockJsThreadFor(200);
          router.push('/modal');
        }}
      />
    </View>
  );
}

// ---------- 5. console.* cost ----------

function ConsoleSpamSection() {
  const [firedCount, setFiredCount] = useState(0);

  const fireSpam = () => {
    for (let i = 0; i < 2000; i += 1) {
      console.log('[drill17] spam log', i, FIELD_ROWS[i % FIELD_ROWS.length]);
    }
    setFiredCount((c) => c + 1);
  };

  return (
    <View>
      <ThemedText style={drillStyles.hint}>
        babel.config.js now strips console.* in production builds (babel-plugin-transform-remove-
        console, env.production only — dev keeps full logging). Fire the spam below in dev to feel
        the JS-thread cost, then follow docs/drill-17-measured-fix.md for the release-build,
        five-cold-starts TTI and app-size comparison with the plugin on vs off.
      </ThemedText>
      <AppButton title={`Fire 2,000 console.log calls (×${firedCount})`} variant="secondary" onPress={fireSpam} />
    </View>
  );
}

export default function Drill17() {
  return (
    <View>
      <ThemedText style={drillStyles.drillTitle}>Drill 17 — The measured fix</ThemedText>
      <ThemedText>
        Five objectives, one screen: attribute a dropped frame to a thread and a cause, then prove
        a fix with numbers. The release-build/Perfetto/cold-start parts can&apos;t run from a
        chat session — see docs/drill-17-measured-fix.md for those.
      </ThemedText>

      <ThemedText type="subtitle" style={drillStyles.section}>
        1. The two-thread model
      </ThemedText>
      <TwoThreadSection />

      <ThemedText type="subtitle" style={drillStyles.section}>
        2. FlatList tuning matrix
      </ThemedText>
      <TuningMatrixSection />

      <ThemedText type="subtitle" style={drillStyles.section}>
        3. Variable height → fixed height + getItemLayout, proven with the Profiler
      </ThemedText>
      <ComparisonSection />

      <ThemedText type="subtitle" style={drillStyles.section}>
        4. A janky transition to trace in Perfetto
      </ThemedText>
      <TransitionJankSection />

      <ThemedText type="subtitle" style={drillStyles.section}>
        5. console.* cost, dev vs stripped release
      </ThemedText>
      <ConsoleSpamSection />
    </View>
  );
}

const drillStyles = StyleSheet.create({
  drillTitle: styles.drillTitle,
  section: {
    marginTop: 20,
  },
  subsection: {
    marginTop: 12,
  },
  hint: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  knobRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tuningList: {
    marginTop: 8,
    height: 280,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  tuningRow: {
    height: FIXED_ROW_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  tuningRowSelected: {
    backgroundColor: '#DBEAFE',
  },
  comparisonList: {
    marginTop: 4,
    height: 220,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  jankyRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  fixedRow: {
    height: FIXED_ROW_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
});
