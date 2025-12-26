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
        tabBarActiveBackgroundColor: 'rgba(255,255,255,0.14)',

        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: bottomPad,
            height: 74 + bottomPad,
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
    left: 14,
    right: 14,
    bottom: 0,

    // big pill
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    overflow: 'hidden',

    // feels like the screenshot (icons vertically centered)
    paddingTop: 14,

    // soft float shadow
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },

  // active "oval" behind icon
  tabItem: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
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
