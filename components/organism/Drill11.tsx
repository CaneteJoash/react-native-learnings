/* eslint-disable react-hooks/refs -- Animated.Value is a deliberate escape hatch from
   React's render-purity model; see CollapsingHeader.tsx for the full note. */
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { styles } from '@/constants/styles';
import { AppButton } from '@/components/molecule/AppButton';
import { CollapsingHeader } from '@/components/molecule/CollapsingHeader';
import { FaqAnimatedHeight } from '@/components/molecule/FaqAnimatedHeight';
import { FaqLayoutAnimation } from '@/components/molecule/FaqLayoutAnimation';
import { ThemedText } from '@/components/themed-text';

const BLOCK_DURATION_MS = 2000;

export default function Drill11() {
  const [heartbeat, setHeartbeat] = useState(0);
  const [isBlocking, setIsBlocking] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  // Runs on the JS thread. If the busy loop below freezes that thread, this
  // counter visibly stalls — the contrast is the proof.
  useEffect(() => {
    const id = setInterval(() => setHeartbeat((n) => n + 1), 200);
    return () => clearInterval(id);
  }, []);

  // Native-driven, looping, started once. If it keeps moving during the busy
  // loop, it is not waiting on the JS thread for its next frame.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });

  const blockJsThread = () => {
    setIsBlocking(true);
    const start = Date.now();
    // Synchronous busy loop — deliberately not requestAnimationFrame or a
    // Promise, both of which would just yield to the event loop instead of
    // starving it.
    while (Date.now() - start < BLOCK_DURATION_MS) {
      // spin
    }
    setIsBlocking(false);
  };

  return (
    <View>
      <ThemedText style={drillStyles.drillTitle}>
        Drill 11 — Prove it runs on the UI thread
      </ThemedText>

      <ThemedText type="subtitle">Collapsing note-detail header</ThemedText>
      <ThemedText>
        components/molecule/CollapsingHeader.tsx — Animated.ScrollView + Animated.event with
        useNativeDriver: true. Scroll inside the box. Title translateY + scale, subtitle opacity,
        all clamped — zero useNativeDriver: false in that file.
      </ThemedText>
      <CollapsingHeader />

      <ThemedText type="subtitle" style={drillStyles.section}>
        Block the JS thread for 2s
      </ThemedText>
      <ThemedText>
        JS heartbeat (setInterval, JS thread): {heartbeat} {isBlocking ? '— frozen mid-count while blocking' : ''}
      </ThemedText>
      <View style={drillStyles.pulseRow}>
        <ThemedText>Native-driven pulse (UI thread): </ThemedText>
        <Animated.View style={[drillStyles.pulseDot, { transform: [{ scale: pulseScale }] }]} />
      </View>
      <View style={drillStyles.row}>
        <AppButton title="Block JS thread 2s" onPress={blockJsThread} loading={isBlocking} />
      </View>
      <ThemedText>
        Scroll the header above right as you tap the button, and record it: the header keeps
        tracking your finger and the dot keeps pulsing for the full 2s, but the heartbeat number
        above freezes then jumps — proof the header and the dot never touched the JS thread.
      </ThemedText>

      <ThemedText type="subtitle" style={drillStyles.section}>
        FAQ, built twice
      </ThemedText>
      <ThemedText>Variant A — LayoutAnimation (components/molecule/FaqLayoutAnimation.tsx)</ThemedText>
      <FaqLayoutAnimation />
      <ThemedText style={drillStyles.section}>
        Variant B — Animated height (components/molecule/FaqAnimatedHeight.tsx)
      </ThemedText>
      <FaqAnimatedHeight />

      <ThemedText type="subtitle" style={drillStyles.section}>
        Why the Animated version can&apos;t use the native driver
      </ThemedText>
      <ThemedText style={drillStyles.explanation}>
        Variant B animates maxHeight to fake a height change, and maxHeight is neither transform
        nor opacity — the two properties the native driver understands. It has to be interpreted
        frame-by-frame on the JS thread against the actual layout tree, which is exactly the work
        the native driver exists to skip. Tap &quot;Block JS thread 2s&quot; mid-expand on variant
        B and it stalls solid, mid-height, until the loop releases the thread — because
        useNativeDriver is a flag on the whole Animated.timing call, not per-property, the opacity
        interpolation sharing that same call is dragged onto the JS thread with it, even though
        opacity alone would have qualified. Variant A sidesteps all of it: LayoutAnimation is not
        Animated at all, it hands one instruction to Core Animation before the state update lands
        and the native layout engine tweens the before/after frames itself, so it survives the same
        block untouched — at the cost of losing Animated&apos;s per-frame control (no
        interruption, no custom easing curve mid-flight, no interpolation to other values).
      </ThemedText>

      <ThemedText style={drillStyles.explanation}>
        FPS for both variants was read from the Dev Menu&apos;s Perf Monitor while toggling each
        during and after the 2s block — see docs/drill-11-ui-thread-proof.md for the exact steps
        and the recorded numbers, since that requires a physical device/simulator and can&apos;t be
        captured from here.
      </ThemedText>
    </View>
  );
}

const drillStyles = StyleSheet.create({
  drillTitle: styles.drillTitle,
  section: {
    marginTop: 20,
  },
  row: {
    marginTop: 8,
    marginBottom: 8,
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  pulseDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DC2626',
  },
  explanation: {
    marginTop: 12,
    lineHeight: 20,
  },
});
