import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, Alert } from 'react-native';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithCredential, onAuthStateChanged } from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Ensure WebBrowser is initialized
WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'AIzaSyARv3D-oJhwVC4YDymlsvJh0DeWQQ6p2RU',
    iosClientId: 'AIzaSyARv3D-oJhwVC4YDymlsvJh0DeWQQ6p2RU',
    androidClientId: 'AIzaSyARv3D-oJhwVC4YDymlsvJh0DeWQQ6p2RU',
  });

  useEffect(() => {
    // Check if user is already signed in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace('Main');
      }
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).catch((error) => {
        console.error('Error signing in with credential:', error);
        Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
      });
    }
  }, [response]);

  const signInWithGoogle = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web platform: use Firebase's built-in popup
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
          prompt: 'select_account'
        });
        await signInWithPopup(auth, provider);
      } else {
        // Mobile platform: use Expo's Google Auth
        await promptAsync();
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google Sign-In is not enabled. Please contact support.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Multiple popup requests were made. Please try again.';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vagou</Text>
      <Text style={styles.subtitle}>Find and reserve parking spots easily</Text>
      
      <TouchableOpacity 
        style={styles.googleButton} 
        onPress={signInWithGoogle}
        disabled={!request}
      >
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