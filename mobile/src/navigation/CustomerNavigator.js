import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import CustomerTabNavigator from './CustomerTabNavigator';
import PartnerDetailScreen from '../screens/customer/PartnerDetailScreen';
import AiSearchScreen from '../screens/customer/AiSearchScreen';
import LocationPickerScreen from '../screens/customer/LocationPickerScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import PaymentScreen from '../screens/customer/PaymentScreen';
import OrderConfirmationScreen from '../screens/customer/OrderConfirmationScreen';
import RateOrderScreen from '../screens/customer/RateOrderScreen';
import FavoritesScreen from '../screens/customer/FavoritesScreen';
import { useTheme } from '../theme/ThemeProvider';

const Stack = createNativeStackNavigator();

export default function CustomerNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' }
      }}
    >
      <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="PartnerDetail" component={PartnerDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="AiSearch" component={AiSearchScreen} options={{ title: t('aiSearch.title') }} />
      <Stack.Screen name="LocationPicker" component={LocationPickerScreen} options={{ title: t('location.title') }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: t('checkout.title') }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: t('payment.title'), headerBackVisible: false }} />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="RateOrder" component={RateOrderScreen} options={{ title: t('reviews.rateTitle') }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: t('favorites.title') }} />
    </Stack.Navigator>
  );
}
