import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function BubbleTabButton({
  accessibilityState,
  children,
  onPress,
}: {
  accessibilityState?: { selected?: boolean };
  children: React.ReactNode;
  onPress?: () => void;
}) {
  const selected = !!accessibilityState?.selected;

  return (
    <Pressable onPress={onPress} style={styles.buttonWrap}>
      <View style={[styles.bubble, selected && styles.bubbleSelected]}>
        {children}
      </View>
    </Pressable>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        tabBarActiveTintColor: 'rgba(255,255,255,0.95)',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.70)',

        tabBarStyle: [
          styles.tabBar,
          {
            bottom: Math.max(insets.bottom - 6, 10),
          },
        ],

        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 85 : 60}
              tint={Platform.OS === 'ios' ? 'systemChromeMaterialDark' : 'dark'}
              style={[StyleSheet.absoluteFill, styles.blurClip]}
            />
            <View pointerEvents="none" style={styles.outerBorder} />
            <View pointerEvents="none" style={styles.topLine} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarButton: (props) => <BubbleTabButton {...props} />,
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
          tabBarButton: (props) => <BubbleTabButton {...props} />,
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
  // Make the whole bar MUCH shorter (half-ish width) and centered
  tabBar: {
    position: 'absolute',
    alignSelf: 'center',
    width: '56%', // <-- smaller pill (try 50%–60%)
    height: 62,
    borderRadius: 999,

    backgroundColor: 'transparent',
    borderTopWidth: 0,
    overflow: 'hidden',

    paddingVertical: 10,
    paddingHorizontal: 10,

    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
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

  // Each tab takes half of the pill, and centers its contents
  buttonWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // This is the actual "oval" selection bubble (never square)
  bubble: {
    width: 64,
    height: 44,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  bubbleSelected: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
});
