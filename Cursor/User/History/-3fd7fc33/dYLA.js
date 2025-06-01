import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import * as Location from 'expo-location';

const OwnerDashboardScreen = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [newParkingLot, setNewParkingLot] = useState({
    name: '',
    address: '',
    total_spots: '',
    available_spots: '',
  });
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchParkingLots();
  }, []);

  const fetchParkingLots = async () => {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, 'parking_lots'),
        where('owner_id', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
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

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      // Get address from coordinates
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setNewParkingLot(prev => ({
        ...prev,
        address: `${address.street}, ${address.city}`,
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handleAddParkingLot = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to add a parking lot');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Please get your current location first');
      return;
    }

    try {
      const parkingLot = {
        ...newParkingLot,
        owner_id: auth.currentUser.uid,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        total_spots: parseInt(newParkingLot.total_spots),
        available_spots: parseInt(newParkingLot.available_spots),
      };

      await addDoc(collection(db, 'parking_lots'), parkingLot);
      
      Alert.alert('Success', 'Parking lot added successfully');
      setNewParkingLot({
        name: '',
        address: '',
        total_spots: '',
        available_spots: '',
      });
      fetchParkingLots();
    } catch (error) {
      console.error('Error adding parking lot:', error);
      Alert.alert('Error', 'Failed to add parking lot');
    }
  };

  const handleUpdateSpots = async (lotId, newAvailableSpots) => {
    try {
      const lotRef = doc(db, 'parking_lots', lotId);
      await updateDoc(lotRef, {
        available_spots: newAvailableSpots,
      });
      fetchParkingLots();
    } catch (error) {
      console.error('Error updating spots:', error);
      Alert.alert('Error', 'Failed to update available spots');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add New Parking Lot</Text>
        <TextInput
          style={styles.input}
          placeholder="Parking Lot Name"
          value={newParkingLot.name}
          onChangeText={(text) => setNewParkingLot(prev => ({ ...prev, name: text }))}
        />
        <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
          <Text style={styles.locationButtonText}>Get Current Location</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={newParkingLot.address}
          onChangeText={(text) => setNewParkingLot(prev => ({ ...prev, address: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Total Spots"
          value={newParkingLot.total_spots}
          onChangeText={(text) => setNewParkingLot(prev => ({ ...prev, total_spots: text }))}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Available Spots"
          value={newParkingLot.available_spots}
          onChangeText={(text) => setNewParkingLot(prev => ({ ...prev, available_spots: text }))}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddParkingLot}>
          <Text style={styles.addButtonText}>Add Parking Lot</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Parking Lots</Text>
        {parkingLots.map((lot) => (
          <View key={lot.id} style={styles.parkingLotCard}>
            <Text style={styles.parkingLotName}>{lot.name}</Text>
            <Text style={styles.parkingLotAddress}>{lot.address}</Text>
            <View style={styles.spotsContainer}>
              <Text style={styles.spotsText}>
                Available Spots: {lot.available_spots} / {lot.total_spots}
              </Text>
              <View style={styles.spotButtons}>
                <TouchableOpacity
                  style={styles.spotButton}
                  onPress={() => handleUpdateSpots(lot.id, lot.available_spots - 1)}
                  disabled={lot.available_spots <= 0}
                >
                  <Text style={styles.spotButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.spotButton}
                  onPress={() => handleUpdateSpots(lot.id, lot.available_spots + 1)}
                  disabled={lot.available_spots >= lot.total_spots}
                >
                  <Text style={styles.spotButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  locationButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  locationButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  parkingLotCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  parkingLotName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  parkingLotAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  spotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotsText: {
    fontSize: 14,
    color: '#666',
  },
  spotButtons: {
    flexDirection: 'row',
  },
  spotButton: {
    backgroundColor: '#007AFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  spotButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OwnerDashboardScreen; 