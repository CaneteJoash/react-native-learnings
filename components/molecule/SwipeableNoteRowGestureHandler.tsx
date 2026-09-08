import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { SWIPE_ACTIONS_WIDTH, SwipeRowActions } from '@/components/molecule/SwipeRowActions';
import { ThemedText } from '@/components/themed-text';
import type { SwipeNote } from '@/lib/swipe-note-items';

const REVEAL_THRESHOLD = -SWIPE_ACTIONS_WIDTH;
const COMMIT_THRESHOLD = -260;
const FLING_VELOCITY = 800;

type Props = {
  note: SwipeNote;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  disabled: boolean;
  onDragStart: (id: string) => void;
  onInterrupted: (offset: number) => void;
};

export function SwipeableNoteRowGestureHandler({
  note,
  onArchive,
  onDelete,
  disabled,
  onDragStart,
  onInterrupted,
}: Props) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const commit = (action: (id: string) => void) => {
    'worklet';
    translateX.value = withTiming(-400, { duration: 200 }, (finished) => {
      if (finished) runOnJS(action)(note.id);
    });
  };

  const classifyAndSettle = (current: number) => {
    'worklet';
    if (current < COMMIT_THRESHOLD) {
      commit(onDelete);
    } else if (current < REVEAL_THRESHOLD / 2) {
      translateX.value = withSpring(REVEAL_THRESHOLD);
    } else {
      translateX.value = withSpring(0);
    }
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-2, 2])
    .failOffsetY([-10, 10])
    .enabled(!disabled)
    .onStart(() => {
      startX.value = translateX.value;
      isDragging.value = true;
      runOnJS(onDragStart)(note.id);
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(e.velocityX) > FLING_VELOCITY) {
        translateX.value = withDecay({ velocity: e.velocityX, deceleration: 0.985 }, (finished) => {
          if (finished) classifyAndSettle(translateX.value);
        });
      } else {
        classifyAndSettle(translateX.value);
      }
    })
    .onFinalize((_event, success) => {
      isDragging.value = false;
      if (!success) {
        const offset = translateX.value;
        translateX.value = withSpring(0);
        runOnJS(onInterrupted)(offset);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <SwipeRowActions onArchive={() => commit(onArchive)} onDelete={() => commit(onDelete)} />
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.row, animatedStyle]}>
          <ThemedText type="defaultSemiBold">{note.title}</ThemedText>
          <ThemedText numberOfLines={1}>{note.snippet}</ThemedText>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  row: {
    backgroundColor: '#1F2933',
    borderRadius: 8,
    padding: 12,
  },
});
