import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from './src/screens/auth/SplashScreen';
import { WelcomeScreen } from './src/screens/auth/WelcomeScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { HouseSelectionScreen } from './src/screens/house/HouseSelectionScreen';
import { CreateHouseScreen } from './src/screens/house/CreateHouseScreen';
import { SetupRulesScreen } from './src/screens/house/SetupRulesScreen';
import { InviteQrScreen } from './src/screens/house/InviteQrScreen';
import { JoinHouseScreen } from './src/screens/house/JoinHouseScreen';
import { PendingRequestScreen } from './src/screens/house/PendingRequestScreen';
import { ManageMembersScreen } from './src/screens/house/ManageMembersScreen';

type Screen =
  | 'splash'
  | 'welcome'
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'house_selection'
  | 'create_house'
  | 'setup_rules'
  | 'invite_qr'
  | 'join_house'
  | 'pending_request'
  | 'manage_members';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('create_house');

  return (
    <>
      <StatusBar style={currentScreen === 'splash' ? 'light' : 'dark'} />

      {currentScreen === 'splash' && (
        <SplashScreen onFinish={() => setCurrentScreen('welcome')} />
      )}

      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onLoginPress={() => setCurrentScreen('login')}
          onRegisterPress={() => setCurrentScreen('register')}
        />
      )}

      {currentScreen === 'login' && (
        <LoginScreen
          onBackPress={() => setCurrentScreen('welcome')}
          onLoginSubmit={(email, password) => setCurrentScreen('house_selection')}
          onForgotPasswordPress={() => setCurrentScreen('forgot_password')}
          onRegisterPress={() => setCurrentScreen('register')}
          onGooglePress={() => setCurrentScreen('house_selection')}
        />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen
          onBackPress={() => setCurrentScreen('welcome')}
          onRegisterSubmit={(name, email, password) => setCurrentScreen('house_selection')}
          onLoginPress={() => setCurrentScreen('login')}
          onTermsPress={() => {}}
          onPrivacyPress={() => {}}
        />
      )}

      {currentScreen === 'forgot_password' && (
        <ForgotPasswordScreen
          onBackPress={() => setCurrentScreen('login')}
          onSubmit={(email) => {}}
          onLoginPress={() => setCurrentScreen('login')}
        />
      )}

      {currentScreen === 'house_selection' && (
        <HouseSelectionScreen
          userName="Norman Osborn"
          userInitials="NO"
          onCreateHousePress={() => setCurrentScreen('create_house')}
          onJoinHousePress={() => setCurrentScreen('join_house')}
          onLogoutPress={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'create_house' && (
        <CreateHouseScreen
          onBackPress={() => setCurrentScreen('house_selection')}
          onSubmit={(data) => setCurrentScreen('setup_rules')}
        />
      )}

      {currentScreen === 'setup_rules' && (
        <SetupRulesScreen
          houseName="República do Sexteto Sinistro"
          onBackPress={() => setCurrentScreen('create_house')}
          onSubmit={(rules) => setCurrentScreen('invite_qr')}
        />
      )}

      {currentScreen === 'invite_qr' && (
        <InviteQrScreen
          houseName="República do Sexteto Sinistro"
          houseCode="SPLIT-8924"
          onBackPress={() => setCurrentScreen('setup_rules')}
          onContinuePress={() => setCurrentScreen('manage_members')}
        />
      )}

      {currentScreen === 'join_house' && (
        <JoinHouseScreen
          onBackPress={() => setCurrentScreen('house_selection')}
          onSubmitCode={(code) => setCurrentScreen('pending_request')}
        />
      )}

      {currentScreen === 'pending_request' && (
        <PendingRequestScreen
          houseName="República do Sexteto Sinistro"
          onBackPress={() => setCurrentScreen('join_house')}
          onCancelPress={() => setCurrentScreen('house_selection')}
        />
      )}

      {currentScreen === 'manage_members' && (
        <ManageMembersScreen
          houseName="República do Sexteto Sinistro"
          onBackPress={() => setCurrentScreen('invite_qr')}
          onViewQrPress={() => setCurrentScreen('invite_qr')}
        />
      )}
    </>
  );
}
