import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const ParkingDetailsScreen = ({ route, navigation }) => {
  const { parkingLot } = route.params;
  const [isReserving, setIsReserving] = useState(false);

  const handleReservation = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to make a reservation');
      return;
    }

    setIsReserving(true);

    try {
      // Check if user already has an active reservation
      const reservationsRef = collection(db, 'reservations');
      const q = query(
        reservationsRef,
        where('user_id', '==', auth.currentUser.uid),
        where('status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        Alert.alert('Error', 'You already have an active reservation');
        return;
      }

      // Create new reservation
      const reservation = {
        parking_lot_id: parkingLot.id,
        user_id: auth.currentUser.uid,
        datetime: new Date(),
        status: 'active'
      };

      await addDoc(collection(db, 'reservations'), reservation);
      
      Alert.alert(
        'Success',
        'Reservation created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating reservation:', error);
      Alert.alert('Error', 'Failed to create reservation');
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{parkingLot.name}</Text>
        <Text style={styles.address}>{parkingLot.address}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Spots</Text>
            <Text style={styles.statValue}>{parkingLot.total_spots}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Available</Text>
            <Text style={styles.statValue}>{parkingLot.available_spots}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.reserveButton, isReserving && styles.reserveButtonDisabled]}
        onPress={handleReservation}
        disabled={isReserving || parkingLot.available_spots === 0}
      >
        <Text style={styles.reserveButtonText}>
          {isReserving ? 'Processing...' : 'Reserve Spot'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  infoContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  reserveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  reserveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ParkingDetailsScreen; 