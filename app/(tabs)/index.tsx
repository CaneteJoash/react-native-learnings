import { Image } from 'expo-image';

import Drill2 from '@/components/organism/Drill2';
import Drill3 from '@/components/organism/Drill3';
import Drill4 from '@/components/organism/Drill4';
import Drill5 from '@/components/organism/Drill5';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { styles } from '@/constants/styles';


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

      <ThemedText >=====================================</ThemedText>
      <Drill2 />
      <ThemedText >=====================================</ThemedText>
      <Drill3 />
      <ThemedText >=====================================</ThemedText>
      <Drill4 />
      <ThemedText >=====================================</ThemedText>
      <Drill5 />
      <ThemedText >=====================================</ThemedText>
    </ParallaxScrollView>

  );
}
