import { StyleSheet, View } from 'react-native';

import { SwipeableNoteListGestureHandler } from '@/components/molecule/SwipeableNoteListGestureHandler';
import { SwipeableNoteListPanResponder } from '@/components/molecule/SwipeableNoteListPanResponder';
import { styles } from '@/constants/styles';
import { ThemedText } from '@/components/themed-text';

export default function Drill12() {
  return (
    <View>
      <ThemedText style={drillStyles.drillTitle}>Drill 12 — Swipe to archive</ThemedText>

      <ThemedText type="subtitle">PanResponder — components/molecule/SwipeableNoteRowPanResponder.tsx</ThemedText>
      <ThemedText>
        onMoveShouldSetPanResponder claims the gesture only once Math.abs(dx) &gt; Math.abs(dy),
        so the vertical FlatList below keeps scrolling untouched. Release classifies the resting
        translateX into closed / revealed / commit; a fast release (|vx| &gt; 0.8 px/ms) runs
        Animated.decay on gestureState.vx first, then re-classifies once it settles.
      </ThemedText>
      <SwipeableNoteListPanResponder />

      <ThemedText type="subtitle" style={drillStyles.section}>
        react-native-gesture-handler port — components/molecule/SwipeableNoteRowGestureHandler.tsx
      </ThemedText>
      <ThemedText>
        Same note list, same thresholds, rebuilt on Gesture.Pan() + Reanimated shared values.
      </ThemedText>
      <SwipeableNoteListGestureHandler />

      <ThemedText type="subtitle" style={drillStyles.section}>
        The diff
      </ThemedText>
      <ThemedText style={drillStyles.explanation}>
        Claiming the gesture: PanResponder&apos;s onMoveShouldSetPanResponder receives raw
        gestureState and you write the Math.abs(dx) &gt; Math.abs(dy) comparison yourself.
        gesture-handler replaces that with declarative activeOffsetX([-2, 2]) /
        failOffsetY([-10, 10]) — same negotiation, but the axis-lock is a config value the
        library enforces before your code ever runs, not a comparison you could get wrong.
      </ThemedText>
      <ThemedText style={drillStyles.explanation}>
        Which thread decides: PanResponder&apos;s should-set callbacks run on the JS thread —
        the responder negotiation itself waits on JS. gesture-handler runs recognition on the
        UI thread via Reanimated worklets; onUpdate mutates translateX.value directly, no
        Animated.event bridge, no useNativeDriver flag to get right or wrong. That is the
        practical reason it composes better with scroll containers: the axis decision that
        keeps this list scrollable is not competing with whatever else is on the JS thread.
      </ThemedText>
      <ThemedText style={drillStyles.explanation}>
        Interruption: onResponderTerminate is something the current responder cannot refuse —
        an ancestor&apos;s capture handler forces it, which is why the PanResponder list above
        wraps the FlatList in a View that only captures when armed. gesture-handler has no
        identical event; its analog is onFinalize&apos;s second argument, success — false means
        the gesture was cancelled rather than ended via onEnd. There is no capture-handler
        equivalent to force that from a parent, so this drill demonstrates it the way
        gesture-handler actually expects: toggling the gesture&apos;s own .enabled(false)
        while it is active. Both still needed a second touch to arm the interruption while
        the first is mid-drag; gesture-handler is not exempt, it just shifts the mechanism.
      </ThemedText>
      <ThemedText style={drillStyles.explanation}>
        Fling: Animated.decay(translateX, {`{ velocity: gestureState.vx }`}) becomes
        withDecay(&#123; velocity: e.velocityX &#125;) — same physics, but the velocity unit is
        not the same number. PanResponder&apos;s gestureState.vx is roughly px/ms (this drill&apos;s
        threshold is 0.8); gesture-handler&apos;s velocityX is px/s (threshold 800). Porting the
        literal constant instead of the unit would have silently broken the fling detection.
      </ThemedText>
      <ThemedText style={drillStyles.explanation}>
        What stayed identical: the thresholds that define the UX (REVEAL_THRESHOLD,
        COMMIT_THRESHOLD), the commit/reveal/close decision tree, and the presentational
        SwipeRowActions component behind the row — none of that is gesture-system-specific, so
        none of it was rewritten.
      </ThemedText>
    </View>
  );
}

const drillStyles = StyleSheet.create({
  drillTitle: styles.drillTitle,
  section: {
    marginTop: 20,
  },
  explanation: {
    marginTop: 12,
    lineHeight: 20,
  },
});
