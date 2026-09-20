import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from './src/screens/auth/SplashScreen';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <SplashScreen />
    </>
  );
}
