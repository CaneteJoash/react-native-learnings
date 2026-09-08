/* eslint-disable react-hooks/refs -- Animated.Value is a deliberate escape hatch from
   React's render-purity model (RN's own docs create it via useRef(...).current and
   read it during render); this rule doesn't yet recognize that pattern. */
import { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

const HEADER_MAX_HEIGHT = 220;
const HEADER_MIN_HEIGHT = 90;
const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export function CollapsingHeader() {
  const scrollY = useRef(new Animated.Value(0)).current;

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [0, -18],
    extrapolate: 'clamp',
  });
  const titleScale = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [1, 0.78],
    extrapolate: 'clamp',
  });
  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.ScrollView
      style={styles.frame}
      contentContainerStyle={styles.content}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
      scrollEventThrottle={16}
    >
      <View style={styles.header} pointerEvents="none">
        <Animated.Text
          style={[
            styles.title,
            { transform: [{ translateY: titleTranslateY }, { scale: titleScale }] },
          ]}
        >
          Trailhead maintenance log
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          Updated 2 hours ago · 14 entries
        </Animated.Text>
      </View>
      {Array.from({ length: 14 }, (_, i) => (
        <ThemedText key={i} style={styles.paragraph}>
          Field log entry {i + 1} — scroll to collapse the header above. Every property driving
          it is transform or opacity, nothing else, so this whole gesture stays off the JS thread.
        </ThemedText>
      ))}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 420,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MAX_HEIGHT,
    backgroundColor: '#2563EB',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 1,
  },
  title: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#dbeafe',
    fontSize: 13,
    marginTop: 4,
  },
  content: {
    paddingTop: HEADER_MAX_HEIGHT,
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 24,
  },
  paragraph: {
    lineHeight: 20,
  },
});
