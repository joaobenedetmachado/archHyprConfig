import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [parkingLots, setParkingLots] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      // Fetch parking lots from Firestore
      const fetchParkingLots = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'parking_lots'));
          const lots = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setParkingLots(lots);
        } catch (error) {
          console.error('Error fetching parking lots:', error);
          Alert.alert('Error', 'Failed to load parking lots');
        }
      };

      fetchParkingLots();
    })();
  }, []);

  const handleParkingPress = (parkingLot) => {
    navigation.navigate('ParkingDetails', { parkingLot });
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* User's location marker */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />

          {/* Parking lot markers */}
          {parkingLots.map((lot) => (
            <Marker
              key={lot.id}
              coordinate={{
                latitude: lot.latitude,
                longitude: lot.longitude,
              }}
              title={lot.name}
              description={`Available spots: ${lot.available_spots}`}
              onPress={() => handleParkingPress(lot)}
            />
          ))}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default MapScreen; 