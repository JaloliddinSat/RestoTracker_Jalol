import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

type Props = {
  latitude: number;
  longitude: number;
  markers?: Array<{ id: string; latitude: number; longitude: number }>;
};

// MapView ALWAYS fills the screen.
// If you want the visible map content to appear lower,
// we shift the CAMERA UP slightly (no blank space created).

export default function AppMapView({ latitude, longitude, markers = [] }: Props) {
  const { height: screenHeight } = useWindowDimensions();

  // Set this to 0 to remove any top gap (map fills full view).
  // Increase if you want the visible map content pushed DOWN (still no top gap).
  const CONTENT_DOWN_PX = 0;

  const latitudeDelta = 0.05;
  const longitudeDelta = 0.05;

  const region: Region = useMemo(() => {
    const frac = screenHeight > 0 ? CONTENT_DOWN_PX / screenHeight : 0;
    const latShift = latitudeDelta * frac; // move camera UP to push map content DOWN

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
        style={StyleSheet.absoluteFillObject}
        mapType="mutedStandard"
        userInterfaceStyle="dark"
        initialRegion={region}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
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
