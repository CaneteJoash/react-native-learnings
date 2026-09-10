import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';

import { styles } from '@/constants/styles';
import { useNotes } from '@/hooks/use-notes';
import { ThemedText } from '@/components/themed-text';

const SLIDER_MIN = 0;
const SLIDER_MAX = 10;

function CheckboxRow() {
  const [checked, setChecked] = useState(false);

  return (
    <Pressable
      accessible
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityHint="Marks this note as reviewed"
      onPress={() => setChecked((c) => !c)}
      hitSlop={8}
      style={drillStyles.checkboxRow}
    >
      <View style={[drillStyles.checkboxBox, checked && drillStyles.checkboxBoxChecked]}>
        {checked && <ThemedText style={drillStyles.checkboxMark}>✓</ThemedText>}
      </View>
      <ThemedText>Reviewed</ThemedText>
    </Pressable>
  );
}

function AdjustableSlider() {
  const [value, setValue] = useState(5);
  const clamp = (n: number) => Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, n));

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Font size"
      accessibilityValue={{ min: SLIDER_MIN, max: SLIDER_MAX, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'increment') setValue((v) => clamp(v + 1));
        if (event.nativeEvent.actionName === 'decrement') setValue((v) => clamp(v - 1));
      }}
      style={drillStyles.sliderTrack}
    >
      <View style={[drillStyles.sliderFill, { width: `${(value / SLIDER_MAX) * 100}%` }]} />
      <ThemedText style={drillStyles.sliderValue}>{value}</ThemedText>
    </View>
  );
}

function UnsyncedCounter() {
  const { pendingCount } = useNotes();
  const announcedCount = useRef(pendingCount);

  useEffect(() => {
    // accessibilityLiveRegion is Android-only (TalkBack polls the subtree on
    // change). VoiceOver never reads it, so iOS needs an explicit announcement
    // on the same change — hence both mechanisms driven off one effect.
    if (pendingCount !== announcedCount.current) {
      AccessibilityInfo.announceForAccessibility(
        `${pendingCount} unsynced note${pendingCount === 1 ? '' : 's'}`,
      );
      announcedCount.current = pendingCount;
    }
  }, [pendingCount]);

  return (
    <ThemedText accessibilityLiveRegion="polite">Unsynced notes: {pendingCount}</ThemedText>
  );
}

export default function Drill13() {
  return (
    <View>
      <ThemedText style={drillStyles.drillTitle}>Drill 13 — Eyes closed</ThemedText>

      <ThemedText type="subtitle">Checkbox — accessibilityRole=&quot;checkbox&quot;</ThemedText>
      <ThemedText>
        A single accessible Pressable wrapper around the box + label, not two nested elements —
        nesting is the &quot;traps&quot; section&apos;s first warning, VoiceOver/TalkBack don&apos;t
        agree on how to handle it. accessibilityState=
        {'{'}checked{'}'} is what actually gets spoken as &quot;checked&quot; / &quot;not
        checked&quot;; the checkmark glyph is decorative and invisible to the wrapper&apos;s single
        label.
      </ThemedText>
      <CheckboxRow />

      <ThemedText type="subtitle" style={drillStyles.section}>
        Slider — accessibilityValue + increment/decrement actions
      </ThemedText>
      <ThemedText>
        Used accessibilityRole=&quot;adjustable&quot; here, not the ARIA alias role=&quot;adjustable&quot;
        — the rest of this codebase (AppButton, the checkbox above) is on accessibilityRole, and the
        lesson&apos;s own warning is that role silently wins if both are set with no error. One
        convention per codebase, so adjustable stays consistent with everything else rather than
        being the one ARIA outlier.
      </ThemedText>
      <AdjustableSlider />

      <ThemedText type="subtitle" style={drillStyles.section}>
        Live region — unsynced notes counter
      </ThemedText>
      <ThemedText>
        Backed by useNotes().pendingCount (hooks/use-notes.ts) — same count SyncIndicator already
        shows. Compose a note above and watch/hear this update.
      </ThemedText>
      <UnsyncedCounter />

      <ThemedText type="subtitle" style={drillStyles.section}>
        Modal focus trap — see app/compose.tsx
      </ThemedText>
      <ThemedText>
        accessibilityViewIsModal on the compose screen&apos;s root View traps VoiceOver there on
        iOS. Android has no per-view trap prop; instead app/(tabs)/_layout.tsx sets
        importantForAccessibility=&quot;no-hide-descendants&quot; on the tab tree whenever the route
        underneath it isn&apos;t focused, which TalkBack respects as if that subtree didn&apos;t
        exist.
      </ThemedText>

      <ThemedText type="subtitle" style={drillStyles.section}>
        Reduce motion — see components/organism/Drill11.tsx
      </ThemedText>
      <ThemedText>
        Drill 11&apos;s pulsing dot was purely decorative (proof the native driver keeps animating
        during a JS-thread block) — no information rides on it, so
        AccessibilityInfo.isReduceMotionEnabled() now stops it outright instead of just shortening
        it. Toggle Reduce Motion in device settings and reopen that drill to confirm.
      </ThemedText>
    </View>
  );
}

const drillStyles = StyleSheet.create({
  drillTitle: styles.drillTitle,
  section: {
    marginTop: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxMark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sliderTrack: {
    marginTop: 8,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#2563EB33',
  },
  sliderValue: {
    paddingHorizontal: 12,
  },
});
