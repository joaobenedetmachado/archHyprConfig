import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, Platform, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [parkingLots, setParkingLots] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [MobileMapView, setMobileMapView] = useState(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      import('../components/MobileMapView').then(module => {
        setMobileMapView(() => module.default);
      });
    }
  }, []);

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

  // Web version
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.webMessage}>
          Map view is not available on web platform.
          Please use the mobile app to view the map.
        </Text>
        <View style={styles.parkingList}>
          <Text style={styles.listTitle}>Available Parking Lots:</Text>
          {parkingLots.map((lot) => (
            <TouchableOpacity
              key={lot.id}
              style={styles.parkingItem}
              onPress={() => handleParkingPress(lot)}
            >
              <Text style={styles.parkingName}>{lot.name}</Text>
              <Text style={styles.parkingAddress}>{lot.address}</Text>
              <Text style={styles.parkingSpots}>
                Available spots: {lot.available_spots}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // Mobile version
  if (!MobileMapView) return null;
  return <MobileMapView location={location} parkingLots={parkingLots} onParkingPress={handleParkingPress} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    margin: 20,
  },
  parkingList: {
    padding: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  parkingItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  parkingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  parkingAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  parkingSpots: {
    fontSize: 14,
    color: '#007AFF',
  },
});

export default MapScreen; 