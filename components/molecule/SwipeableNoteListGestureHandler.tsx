import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppButton } from '@/components/molecule/AppButton';
import { SwipeableNoteRowGestureHandler } from '@/components/molecule/SwipeableNoteRowGestureHandler';
import { ThemedText } from '@/components/themed-text';
import { SWIPE_NOTE_ITEMS, type SwipeNote } from '@/lib/swipe-note-items';

export function SwipeableNoteListGestureHandler() {
  const [notes, setNotes] = useState<SwipeNote[]>(SWIPE_NOTE_ITEMS);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [interruptedId, setInterruptedId] = useState<string | null>(null);
  const [lastInterruption, setLastInterruption] = useState<string | null>(null);

  const removeNote = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id));

  return (
    <GestureHandlerRootView>
      <ThemedText>
        Start dragging a row, then — while still holding it — tap &quot;Simulate OS
        interruption&quot; with a second finger. Unlike the PanResponder version, this works by
        toggling the gesture&apos;s own `enabled` prop mid-drag, which gesture-handler treats as a
        real cancellation.
      </ThemedText>
      <View style={styles.row}>
        <AppButton
          title="Simulate OS interruption"
          onPress={() => setInterruptedId(draggingId)}
          variant="secondary"
          disabled={!draggingId}
        />
      </View>
      {lastInterruption && <ThemedText style={styles.log}>{lastInterruption}</ThemedText>}

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <SwipeableNoteRowGestureHandler
            note={item}
            onArchive={removeNote}
            onDelete={removeNote}
            disabled={interruptedId === item.id}
            onDragStart={setDraggingId}
            onInterrupted={(offset) => {
              setLastInterruption(
                `Interrupted mid-drag at translateX=${offset.toFixed(0)} — row reset to 0, no stuck state.`,
              );
              setInterruptedId(null);
              setDraggingId(null);
            }}
          />
        )}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 8,
    marginBottom: 8,
  },
  log: {
    color: '#059669',
    marginBottom: 8,
  },
});
