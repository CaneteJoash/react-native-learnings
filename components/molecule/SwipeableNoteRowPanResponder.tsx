/* eslint-disable react-hooks/refs -- Animated.Value + a value-listener ref is the standard
   escape hatch for reading PanResponder's current offset synchronously; see Drill11's
   CollapsingHeader note for the general pattern. */
import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

import { SWIPE_ACTIONS_WIDTH, SwipeRowActions } from '@/components/molecule/SwipeRowActions';
import { ThemedText } from '@/components/themed-text';
import type { SwipeNote } from '@/lib/swipe-note-items';

const REVEAL_THRESHOLD = -SWIPE_ACTIONS_WIDTH;
const COMMIT_THRESHOLD = -260;
const FLING_VELOCITY = 0.8;
type Props = {
  note: SwipeNote;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onInterrupted: (offset: number) => void;
};

export function SwipeableNoteRowPanResponder({
  note,
  onArchive,
  onDelete,
  onDragStart,
  onDragEnd,
  onInterrupted,
}: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const offsetRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      offsetRef.current = value;
    });
    return () => translateX.removeListener(id);
  }, [translateX]);

  const snapTo = (toValue: number) => {
    Animated.spring(translateX, { toValue, useNativeDriver: false, bounciness: 6 }).start();
  };

  const commit = (action: (id: string) => void) => {
    Animated.timing(translateX, { toValue: -400, duration: 200, useNativeDriver: false }).start(
      ({ finished }) => finished && action(note.id),
    );
  };

  const classifyAndSettle = () => {
    const current = offsetRef.current;
    if (current < COMMIT_THRESHOLD) {
      commit(onDelete);
    } else if (current < REVEAL_THRESHOLD / 2) {
      snapTo(REVEAL_THRESHOLD);
    } else {
      snapTo(0);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, g) => Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 2,
      onPanResponderGrant: () => {
        translateX.stopAnimation();
        translateX.setOffset(offsetRef.current);
        translateX.setValue(0);
        setDragging(true);
        onDragStart();
      },
      onPanResponderMove: Animated.event([null, { dx: translateX }], { useNativeDriver: false }),
      onPanResponderRelease: (_evt, gestureState) => {
        translateX.flattenOffset();
        setDragging(false);
        onDragEnd();

        if (Math.abs(gestureState.vx) > FLING_VELOCITY) {
          Animated.decay(translateX, {
            velocity: gestureState.vx,
            deceleration: 0.985,
            useNativeDriver: false,
          }).start(() => classifyAndSettle());
        } else {
          classifyAndSettle();
        }
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => {
        translateX.flattenOffset();
        onInterrupted(offsetRef.current);
        setDragging(false);
        onDragEnd();
        snapTo(0);
      },
    }),
  ).current;

  return (
    <View style={styles.wrapper}>
      <SwipeRowActions onArchive={() => commit(onArchive)} onDelete={() => commit(onDelete)} />
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.row, dragging && styles.rowDragging, { transform: [{ translateX }] }]}
      >
        <ThemedText type="defaultSemiBold">{note.title}</ThemedText>
        <ThemedText numberOfLines={1}>{note.snippet}</ThemedText>
      </Animated.View>
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
  rowDragging: {
    opacity: 0.9,
  },
});
