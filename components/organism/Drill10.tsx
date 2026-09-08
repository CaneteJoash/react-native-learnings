import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { styles } from '@/constants/styles';
import { supportsFeatureX } from '@/lib/platform';
import { ThemedText } from '../themed-text';
import { AppButton } from '../molecule/AppButton';
import { ConfirmSheet } from '../molecule/ConfirmSheet';
import { ConfirmSheetSplit } from '../molecule/ConfirmSheetSplit';

const SHEET_OPTIONS = [{ label: 'Save draft' }, { label: 'Delete note', destructive: true }];

export default function Drill10() {
  const [selectSheetOpen, setSelectSheetOpen] = useState(false);
  const [splitSheetOpen, setSplitSheetOpen] = useState(false);
  const [lastResult, setLastResult] = useState('—');

  const featureX = supportsFeatureX(Platform);

  return (
    <View>
      <ThemedText style={styles.drillTitle}>Drill 10 — Native-feeling, twice</ThemedText>

      <ThemedText type="subtitle">supportsFeatureX()</ThemedText>
      <ThemedText>
        Platform.OS is {Platform.OS}, Platform.Version is {JSON.stringify(Platform.Version)} (
        {typeof Platform.Version}). supportsFeatureX(Platform) → {String(featureX)}. See
        lib/platform.ts and lib/__tests__/platform.test.ts for the number-vs-string handling and
        both branches under test.
      </ThemedText>

      <ThemedText type="subtitle" style={drillStyles.section}>
        Variant A — Platform.select, one file
      </ThemedText>
      <ThemedText>components/molecule/ConfirmSheet.tsx</ThemedText>
      <View style={drillStyles.row}>
        <AppButton title="Open (select)" onPress={() => setSelectSheetOpen(true)} />
      </View>
      <ConfirmSheet
        visible={selectSheetOpen}
        title="Note actions"
        message="Choose what to do with this note."
        options={SHEET_OPTIONS}
        onSelect={(i: number) => {
          setLastResult(`select: ${SHEET_OPTIONS[i].label}`);
          setSelectSheetOpen(false);
        }}
        onCancel={() => {
          setLastResult('select: cancelled');
          setSelectSheetOpen(false);
        }}
      />

      <ThemedText type="subtitle" style={drillStyles.section}>
        Variant B — .ios.tsx / default file
      </ThemedText>
      <ThemedText>
        components/molecule/ConfirmSheetSplit.ios.tsx overrides ConfirmSheetSplit.tsx (the
        Android/default impl) — same convention as this project&apos;s existing icon-symbol.tsx +
        icon-symbol.ios.tsx. Imported extensionlessly as ./ConfirmSheetSplit; Metro (and tsc) pick
        the iOS file only on iOS. Both export the same signature.
      </ThemedText>
      <View style={drillStyles.row}>
        <AppButton title="Open (split)" onPress={() => setSplitSheetOpen(true)} />
      </View>
      <ConfirmSheetSplit
        visible={splitSheetOpen}
        title="Note actions"
        message="Choose what to do with this note."
        options={SHEET_OPTIONS}
        onSelect={(i) => {
          setLastResult(`split: ${SHEET_OPTIONS[i].label}`);
          setSplitSheetOpen(false);
        }}
        onCancel={() => {
          setLastResult('split: cancelled');
          setSplitSheetOpen(false);
        }}
      />

      <ThemedText style={drillStyles.section}>Last result: {lastResult}</ThemedText>

      <ThemedText type="subtitle" style={drillStyles.section}>
        Which is right, and why
      </ThemedText>
      <ThemedText>
        Both call sites above import a component named ConfirmSheet-something with the identical
        props type (ConfirmSheetProps in confirm-sheet.types.ts) — drop-in interchangeable, as the
        drill asks. But I&apos;d ship variant B (file extensions) for this component, not variant
        A. The divergence isn&apos;t a style tweak, it&apos;s two structurally different UI
        primitives: ActionSheetIOS is an imperative API with no view of its own, the Android side
        is a real component tree (Modal, backdrop, ripple rows). Cramming that into one file with
        Platform.select forces an awkward shape — an effect for the imperative iOS branch sitting
        next to a component-returning branch for Android, both wrapped in one function that returns
        null on iOS and JSX on Android. The .ios/.android split lets each file just be what it
        actually is: the iOS file has no render output at all, the Android file has no
        ActionSheetIOS import to explain away. Per the table above: small and localised (a shadow,
        a padding, one prop) → Platform.select; structural, different components/libraries →
        file extensions. This is the second case.
      </ThemedText>
    </View>
  );
}

const drillStyles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  row: {
    marginTop: 8,
    marginBottom: 8,
  },
});
