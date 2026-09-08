import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, UIManager, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FAQ_ITEMS } from '@/lib/faq-items';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function FaqLayoutAnimation() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <View>
      {FAQ_ITEMS.map((item) => (
        <View key={item.id} style={styles.row}>
          <Pressable onPress={() => toggle(item.id)} hitSlop={8}>
            <ThemedText type="defaultSemiBold">{item.question}</ThemedText>
          </Pressable>
          {openId === item.id && <ThemedText style={styles.answer}>{item.answer}</ThemedText>}
        </View>
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
  answer: {
    marginTop: 6,
    lineHeight: 20,
    opacity: 0.8,
  },
});
