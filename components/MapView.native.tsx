import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

type Props = {
  latitude: number;
  longitude: number;
  markers?: Array<{ id: string; latitude: number; longitude: number }>;
};

export default function AppMapView({ latitude, longitude, markers = [] }: Props) {
  const { height: screenHeight } = useWindowDimensions();

  /**
   * MOVE MAP CONTENT DOWN (dp/px)
   * Increase to push the visible map "down" (no blank space at top).
   */
  const CONTENT_DOWN_PX = 90;

  /**
   * Convert screen pixels to a latitude shift.
   * If we want the map content to appear DOWN by CONTENT_DOWN_PX,
   * we move the camera center UP (north) by a proportional amount.
   */
  const latitudeDelta = 0.05;
  const longitudeDelta = 0.05;

  const region: Region = useMemo(() => {
    // fraction of screen height (e.g. 90px / 800px = 0.1125)
    const frac = screenHeight > 0 ? CONTENT_DOWN_PX / screenHeight : 0;

    // move center north by that fraction of the visible latitude span
    const latShift = latitudeDelta * frac;

    return {
      latitude: latitude + latShift,
      longitude,
      latitudeDelta,
      longitudeDelta,
    };
  }, [latitude, longitude, screenHeight]);

  return (
    <View style={styles.wrapper}>
      <MapView
        style={StyleSheet.absoluteFillObject} // stays full-screen, no top gap
        mapType="mutedStandard"
        userInterfaceStyle="dark"
        initialRegion={region}
      >
        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});
