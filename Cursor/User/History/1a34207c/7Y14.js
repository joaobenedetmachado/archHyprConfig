import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const MobileMapView = ({ location, parkingLots, onParkingPress }) => {
  const [MapComponent, setMapComponent] = useState(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      import('react-native-maps').then((module) => {
        setMapComponent({
          MapView: module.default,
          Marker: module.Marker
        });
      });
    }
  }, []);

  if (!location || !MapComponent) return null;

  const { MapView, Marker } = MapComponent;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Your Location"
          pinColor="blue"
        />

        {parkingLots.map((lot) => (
          <Marker
            key={lot.id}
            coordinate={{
              latitude: lot.latitude,
              longitude: lot.longitude,
            }}
            title={lot.name}
            description={`Available spots: ${lot.available_spots}`}
            onPress={() => onParkingPress(lot)}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default MobileMapView; 