import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type Props = {
  latitude: number;
  longitude: number;
  markers?: Array<{ id: string; latitude: number; longitude: number }>;
};

export default function AppMapView({ latitude, longitude, markers = [] }: Props) {
  // HARD-CODED DOWNWARD MOVE (dp/px). Increase = move further down.
  const MAP_Y_OFFSET = 90;

  return (
    <View style={styles.wrapper}>
      <MapView
        style={[
          StyleSheet.absoluteFillObject,
          {
            top: MAP_Y_OFFSET,        // <-- moves the map DOWN
            bottom: -MAP_Y_OFFSET,    // <-- keeps it filling the screen
          },
        ]}
        mapType="mutedStandard"
        userInterfaceStyle="dark"
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
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
