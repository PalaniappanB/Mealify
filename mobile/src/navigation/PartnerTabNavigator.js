import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import PartnerListingsScreen from '../screens/partner/PartnerListingsScreen';
import PartnerOrdersScreen from '../screens/partner/PartnerOrdersScreen';
import PartnerReportsScreen from '../screens/partner/PartnerReportsScreen';
import PartnerProfileScreen from '../screens/partner/PartnerProfileScreen';
import { useTheme } from '../theme/ThemeProvider';

const Tab = createBottomTabNavigator();
const ICONS = { PartnerListings: '📦', PartnerOrders: '🧾', PartnerReports: '📊', PartnerProfileTab: '👤' };

export default function PartnerTabNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{ICONS[route.name]}</Text>
      })}
    >
      <Tab.Screen name="PartnerListings" component={PartnerListingsScreen} options={{ tabBarLabel: t('nav.listings') }} />
      <Tab.Screen name="PartnerOrders" component={PartnerOrdersScreen} options={{ tabBarLabel: t('nav.incomingOrders') }} />
      <Tab.Screen name="PartnerReports" component={PartnerReportsScreen} options={{ tabBarLabel: t('nav.reports') }} />
      <Tab.Screen name="PartnerProfileTab" component={PartnerProfileScreen} options={{ tabBarLabel: t('nav.profile') }} />
    </Tab.Navigator>
  );
}
