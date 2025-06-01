import React from 'react';
import { StatusBar } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AppNavigator from './src/navigation/AppNavigator';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'AIzaSyARv3D-oJhwVC4YDymlsvJh0DeWQQ6p2RU', // Get this from Firebase Console
});

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </>
  );
}
