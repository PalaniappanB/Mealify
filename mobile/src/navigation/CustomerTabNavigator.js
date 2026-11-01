import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import HomeScreen from '../screens/customer/HomeScreen';
import CartScreen from '../screens/customer/CartScreen';
import OrderHistoryScreen from '../screens/customer/OrderHistoryScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import { useTheme } from '../theme/ThemeProvider';
import { useCart } from '../context/CartContext';

const Tab = createBottomTabNavigator();

const ICONS = { Home: '🏠', CartTab: '🛒', OrdersTab: '🧾', ProfileTab: '👤' };

export default function CustomerTabNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { totalItems } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{ICONS[route.name]}</Text>,
        tabBarBadge: route.name === 'CartTab' && totalItems > 0 ? totalItems : undefined
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('nav.home') }} />
      <Tab.Screen name="CartTab" component={CartScreen} options={{ tabBarLabel: t('nav.cart') }} />
      <Tab.Screen name="OrdersTab" component={OrderHistoryScreen} options={{ tabBarLabel: t('nav.orders') }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: t('nav.profile') }} />
    </Tab.Navigator>
  );
}
