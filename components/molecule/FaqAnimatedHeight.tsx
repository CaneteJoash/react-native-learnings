/* eslint-disable react-hooks/refs -- Animated.Value is a deliberate escape hatch from
   React's render-purity model; see CollapsingHeader.tsx for the full note. */
import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FAQ_ITEMS } from '@/lib/faq-items';

const MAX_ANSWER_HEIGHT = 90;

function FaqRow({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    Animated.timing(progress, {
      toValue: next ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const maxHeight = progress.interpolate({ inputRange: [0, 1], outputRange: [0, MAX_ANSWER_HEIGHT] });
  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={styles.row}>
      <Pressable onPress={toggle} hitSlop={8}>
        <ThemedText type="defaultSemiBold">{question}</ThemedText>
      </Pressable>
      <Animated.View style={[styles.answerClip, { maxHeight, opacity }]}>
        <ThemedText style={styles.answer}>{answer}</ThemedText>
      </Animated.View>
    </View>
  );
}

export function FaqAnimatedHeight() {
  return (
    <View>
      {FAQ_ITEMS.map((item) => (
        <FaqRow key={item.id} question={item.question} answer={item.answer} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  answerClip: {
    overflow: 'hidden',
  },
  answer: {
    marginTop: 6,
    lineHeight: 20,
    opacity: 0.8,
  },
});
