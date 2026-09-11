import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/molecule/AppButton';
import { ThemedText } from '@/components/themed-text';
import { styles } from '@/constants/styles';
import { type CaptureCoords } from '@/lib/capture-store';
import { useCaptures } from '@/hooks/use-captures';
import { useNotes } from '@/hooks/use-notes';

type PermissionState = { granted: boolean; canAskAgain: boolean } | null;

// Same "explain, then ask" shape for every permission this drill needs — the
// three real-world outcomes collapse to two buttons: ask again, or bail out
// to Settings once iOS/Android have taken the in-app prompt off the table.
function PermissionNotice({
  label,
  explanation,
  state,
  onRequest,
}: {
  label: string;
  explanation: string;
  state: PermissionState;
  onRequest: () => void;
}) {
  if (!state || state.granted) return null;

  return (
    <View style={drillStyles.noticeBox}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <ThemedText>{explanation}</ThemedText>
      {state.canAskAgain ? (
        <AppButton title="Allow access" variant="secondary" onPress={onRequest} />
      ) : (
        <AppButton
          title="Open Settings"
          variant="secondary"
          onPress={() => Linking.openSettings()}
        />
      )}
    </View>
  );
}

export default function Drill14() {
  const { notes } = useNotes();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const { captures, attach } = useCaptures(selectedNoteId);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();

  const [started, setStarted] = useState(false);
  const [locationServicesOn, setLocationServicesOn] = useState<boolean | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!started) return;
    Location.hasServicesEnabledAsync().then(setLocationServicesOn);
  }, [started]);

  const handleCapture = async () => {
    if (!cameraRef.current || !selectedNoteId) return;

    setCapturing(true);
    setStatusMessage(null);
    try {
      const photo = await cameraRef.current.takePictureAsync();
      let coords: CaptureCoords | null = null;

      const servicesOn = await Location.hasServicesEnabledAsync();
      setLocationServicesOn(servicesOn);

      if (locationPermission?.granted && servicesOn) {
        try {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
        } catch {
          // No fix available (dead zone, cold GPS, simulator) — the photo is
          // still worth keeping, just without a stamp.
        }
      }

      await attach(photo.uri, coords);
      setStatusMessage(coords ? 'Saved with GPS stamp.' : 'Saved without a GPS stamp.');
    } finally {
      setCapturing(false);
    }
  };

  const canCapture = started && cameraPermission?.granted && !!selectedNoteId;

  return (
    <View>
      <ThemedText style={drillStyles.drillTitle}>Drill 14 — Capture in the field</ThemedText>
      <ThemedText>
        Take a photo, stamp it with GPS, save it to the file system, and attach it to a note.
        Camera and location are asked for here — in context — not on app launch.
      </ThemedText>

      <ThemedText type="subtitle" style={drillStyles.section}>
        1. Pick a note to attach to
      </ThemedText>
      <View style={drillStyles.noteRow}>
        {notes.map((note) => (
          <Pressable
            key={note.id}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedNoteId === note.id }}
            onPress={() => setSelectedNoteId(note.id)}
            style={[
              drillStyles.noteChip,
              selectedNoteId === note.id && drillStyles.noteChipSelected,
            ]}
          >
            <ThemedText>{note.title}</ThemedText>
          </Pressable>
        ))}
      </View>
      {!selectedNoteId && (
        <ThemedText style={drillStyles.hint}>Select a note above before capturing.</ThemedText>
      )}

      <ThemedText type="subtitle" style={drillStyles.section}>
        2. Capture
      </ThemedText>
      {!started ? (
        <View style={drillStyles.noticeBox}>
          <ThemedText>
            FieldKit needs your camera to photograph the site, and your location to stamp where
            the photo was taken. Both prompts appear only once you tap below.
          </ThemedText>
          <AppButton title="Start capturing" onPress={() => setStarted(true)} />
        </View>
      ) : (
        <>
          <PermissionNotice
            label="Camera access"
            explanation="Required to take the photo itself."
            state={cameraPermission}
            onRequest={requestCameraPermission}
          />
          <PermissionNotice
            label="Location access"
            explanation="Optional — used to stamp the photo with where it was taken. Captures still save without it."
            state={locationPermission}
            onRequest={requestLocationPermission}
          />

          {cameraPermission?.granted && (
            <>
              {locationPermission?.granted && locationServicesOn === false && (
                <ThemedText style={drillStyles.hint}>
                  Location services are off at the device level — captures will save without a
                  GPS stamp until they&apos;re back on.
                </ThemedText>
              )}
              <CameraView ref={cameraRef} style={drillStyles.camera} facing="back" />
              <AppButton
                title={capturing ? 'Saving…' : 'Take photo'}
                onPress={handleCapture}
                disabled={!canCapture}
                loading={capturing}
              />
              {statusMessage && <ThemedText>{statusMessage}</ThemedText>}
            </>
          )}
        </>
      )}

      <ThemedText type="subtitle" style={drillStyles.section}>
        3. Attached photos
      </ThemedText>
      {captures.length === 0 ? (
        <ThemedText>No photos attached to this note yet.</ThemedText>
      ) : (
        <View style={drillStyles.captureGrid}>
          {captures.map((capture) => (
            <View key={capture.id} style={drillStyles.captureItem}>
              <Image source={{ uri: capture.uri }} style={drillStyles.captureThumb} />
              <ThemedText style={drillStyles.captureCaption}>
                {capture.coords
                  ? `${capture.coords.latitude.toFixed(4)}, ${capture.coords.longitude.toFixed(4)}`
                  : 'No GPS stamp'}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const drillStyles = StyleSheet.create({
  drillTitle: styles.drillTitle,
  section: {
    marginTop: 20,
  },
  hint: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  noteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  noteChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  noteChipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  noticeBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  camera: {
    marginTop: 12,
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
  },
  captureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  captureItem: {
    width: 100,
  },
  captureThumb: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  captureCaption: {
    fontSize: 12,
    marginTop: 4,
  },
});
