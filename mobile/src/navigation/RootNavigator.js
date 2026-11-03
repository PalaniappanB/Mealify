import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../screens/SplashScreen';
import LanguageSelectScreen, { LANGUAGE_CHOSEN_KEY } from '../screens/onboarding/LanguageSelectScreen';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import PartnerNavigator from './PartnerNavigator';
import AdminNavigator from './AdminNavigator';
import { useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { LocationProvider } from '../context/LocationContext';
import { FavoritesProvider } from '../context/FavoritesContext';

export default function RootNavigator() {
  const { booting, isAuthenticated, role } = useAuth();
  const [languageChosen, setLanguageChosen] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_CHOSEN_KEY).then((value) => setLanguageChosen(value === 'true'));
  }, []);

  if (booting || languageChosen === null) return <SplashScreen />;

  return (
    <NavigationContainer>
      {!languageChosen ? (
        <LanguageSelectScreen onDone={() => setLanguageChosen(true)} />
      ) : !isAuthenticated ? (
        <AuthNavigator />
      ) : role === 'partner_staff' ? (
        <PartnerNavigator />
      ) : role === 'admin' ? (
        <AdminNavigator />
      ) : (
        <LocationProvider>
          <CartProvider>
            <FavoritesProvider>
              <CustomerNavigator />
            </FavoritesProvider>
          </CartProvider>
        </LocationProvider>
      )}
    </NavigationContainer>
  );
}
