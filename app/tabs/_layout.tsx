import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // ICONS ONLY
        tabBarShowLabel: false,

        // no accent colors
        tabBarActiveTintColor: 'rgba(255,255,255,0.95)',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.70)',

        // the selected "bubble"
        tabBarActiveBackgroundColor: 'rgba(255,255,255,0.12)',

        tabBarStyle: [
          styles.tabBar,
          {
            // keep the pill small but still respect home indicator
            bottom: Math.max(insets.bottom - 6, 10),
          },
        ],

        tabBarItemStyle: styles.tabItem,

        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 85 : 60}
              tint={Platform.OS === 'ios' ? 'systemChromeMaterialDark' : 'dark'}
              style={[StyleSheet.absoluteFill, styles.blurClip]}
            />
            {/* subtle outer border like your reference */}
            <View pointerEvents="none" style={styles.outerBorder} />
            <View pointerEvents="none" style={styles.topLine} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={28}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 10, // gives the “floating pill” spacing

    // SMALL pill
    height: 64, // <- key
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    overflow: 'hidden',

    // center icons vertically without making the bar huge
    paddingVertical: 10,

    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },

  // This controls the selected “bubble”
  tabItem: {
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 999,

    // force it to be an OVAL, not a square fill
    height: 44,
    alignSelf: 'center',

    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // IMPORTANT so active bg clips into an oval
  },

  blurClip: {
    borderRadius: 999,
  },

  outerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },

  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
});
