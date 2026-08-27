import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Text } from '@react-navigation/elements';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/motor.jpg')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome! Wasjo</ThemedText>
      </ThemedView>

      <View style={styles.row}>
      <View style={styles.avatar}>
        <Image
          source={require('@/assets/images/motor.jpg')}
          style={styles.avatarImage}
        />
        <View style={styles.unreadDot} />
      </View>

      <View style={styles.messageBody}>
        <Text style={styles.message}>
          This is a very looooooooooooooooooooooooooooooooooooooooooooooooooooooong message that should wrap without overflowing .
        </Text>
      </View>

      <Text style={styles.timestamp}>10:42 AM</Text>
    </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 300,
    width: 400,
    bottom:50
  },
   row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatar: {
    width: 40,
    height: 40,
    position: 'relative',
    marginRight: 5
  },

  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 50,
    backgroundColor: 'red',
  },

  messageBody: {
    flex: 1,
    minWidth: 0,
  },

  timestamp: {
    flexShrink: 0,
  },

  message: {
    flexWrap: 'wrap',
  },
});
