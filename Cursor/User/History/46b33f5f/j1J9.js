import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, Alert } from 'react-native';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithCredential } from 'firebase/auth';

const LoginScreen = ({ navigation }) => {
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      
      if (Platform.OS === 'web') {
        // Web platform: use Firebase's built-in popup
        const result = await signInWithPopup(auth, provider);
        navigation.replace('Main');
      } else {
        // Mobile platform: use Google Sign-In
        const { GoogleSignin } = require('@react-native-google-signin/google-signin');
        await GoogleSignin.hasPlayServices();
        const { idToken } = await GoogleSignin.signIn();
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        navigation.replace('Main');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vagou</Text>
      <Text style={styles.subtitle}>Find and reserve parking spots easily</Text>
      
      <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default LoginScreen; 