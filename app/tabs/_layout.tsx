import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        tabBarInactiveTintColor: 'rgba(213, 215, 219, 0.9)',

        headerStyle: { backgroundColor: '#25292e' },
        headerShadowVisible: false,
        headerTintColor: '#fff',

        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,

        // IMPORTANT: this is what was creating the ugly big yellow block.
        // Keep it subtle or make it transparent.
        tabBarActiveBackgroundColor: 'rgba(255, 211, 61, 0.08)',
        // If you want ZERO yellow pill, use this instead:
        // tabBarActiveBackgroundColor: 'transparent',

        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, styles.glass]}>
            <View style={styles.sheen} />
            <View style={styles.topLine} />
            <View style={styles.bottomShade} />
          </View>
        ),

        // Don’t force weird label/icon offsets—center them cleanly.
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home-sharp' : 'home-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          title: 'Add Location',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'information-circle' : 'information-circle-outline'}
              color={color}
              size={24}
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
    bottom: 28, // raise/lower: 24–34

    height: 62, // compact so labels don’t get pushed out
    borderRadius: 22,

    backgroundColor: 'transparent',
    borderTopWidth: 0,
    overflow: 'hidden',

    // internal padding controls label/icon vertical centering
    paddingTop: 6,
    paddingBottom: 8,

    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },

  tabItem: {
    // makes the active highlight a small pill, not a huge slab
    marginHorizontal: 10,
    borderRadius: 16,
    paddingVertical: 8,
  },

  label: {
    fontSize: 12,
    marginTop: 2,
  },

  // “Apple glass” mimic (no blur)
  glass: {
    borderRadius: 22,
    backgroundColor: 'rgba(20, 20, 20, 0.28)', // lighter, more iOS-like
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },

  sheen: {
    position: 'absolute',
    top: -18,
    left: -40,
    right: -40,
    height: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    transform: [{ rotate: '-8deg' }],
  },

  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },

  bottomShade: {
    position: 'absolute',
    bottom: -10,
    left: -20,
    right: -20,
    height: '60%',
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
  },
});
