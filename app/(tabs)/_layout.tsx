import { Tabs, usePathname } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Screens presented as native modals (see app/_layout.tsx Stack.Screen
// options) cover this tab tree without unmounting it. iOS traps VoiceOver
// inside the modal itself via accessibilityViewIsModal (see app/compose.tsx);
// Android has no such per-view trap, so TalkBack can still reach the tabs
// underneath unless this subtree is explicitly hidden while a modal is open.
const MODAL_ROUTES = ['/compose', '/modal'];

export default function TabLayout() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const pathname = usePathname();
  const modalOpen = MODAL_ROUTES.includes(pathname);

  return (
    <View style={{ flex: 1 }} importantForAccessibility={modalOpen ? 'no-hide-descendants' : 'auto'}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen
          name="notes"
          options={{
            title: 'Notes',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="note.text" color={color} />,
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
