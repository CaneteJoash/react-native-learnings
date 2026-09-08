import { useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/molecule/AppButton';
import { SwipeableNoteRowPanResponder } from '@/components/molecule/SwipeableNoteRowPanResponder';
import { ThemedText } from '@/components/themed-text';
import { SWIPE_NOTE_ITEMS, type SwipeNote } from '@/lib/swipe-note-items';

export function SwipeableNoteListPanResponder() {
  const [notes, setNotes] = useState<SwipeNote[]>(SWIPE_NOTE_ITEMS);
  const [interruptArmed, setInterruptArmed] = useState(false);
  const [lastInterruption, setLastInterruption] = useState<string | null>(null);
  const draggingRef = useRef(false);

  const removeNote = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id));

  return (
    <View>
      <ThemedText>
        Start dragging a row with one finger, then — while still holding it — tap &quot;Simulate
        OS interruption&quot; with a second finger (needs a physical device/simulator with
        multitouch; a single mouse pointer can&apos;t hold two touches at once).
      </ThemedText>
      <View style={styles.row}>
        <AppButton
          title={interruptArmed ? 'Armed — drag a row now' : 'Simulate OS interruption'}
          onPress={() => setInterruptArmed(true)}
          variant="secondary"
        />
      </View>
      {lastInterruption && <ThemedText style={styles.log}>{lastInterruption}</ThemedText>}
      <View
        onMoveShouldSetResponderCapture={() => {
          if (!interruptArmed || !draggingRef.current) return false;
          setInterruptArmed(false);
          return true;
        }}
        onResponderGrant={() => { }}
        onResponderMove={() => { }}
        onResponderRelease={() => { }}
      >
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <SwipeableNoteRowPanResponder
              note={item}
              onArchive={removeNote}
              onDelete={removeNote}
              onDragStart={() => {
                draggingRef.current = true;
              }}
              onDragEnd={() => {
                draggingRef.current = false;
              }}
              onInterrupted={(offset) =>
                setLastInterruption(
                  `Interrupted mid-drag at translateX=${offset.toFixed(0)} — row reset to 0, no stuck state.`,
                )
              }
            />
          )}
        />
      </View>
    </View>
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
