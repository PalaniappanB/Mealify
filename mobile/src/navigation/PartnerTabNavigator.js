import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import PartnerListingsScreen from '../screens/partner/PartnerListingsScreen';
import PartnerOrdersScreen from '../screens/partner/PartnerOrdersScreen';
import PartnerReportsScreen from '../screens/partner/PartnerReportsScreen';
import PartnerProfileScreen from '../screens/partner/PartnerProfileScreen';
import Icon from '../components/Icon';
import { useTheme } from '../theme/ThemeProvider';

const Tab = createBottomTabNavigator();
const ICONS = {
  PartnerListings: 'bag-handle',
  PartnerOrders: 'receipt',
  PartnerReports: 'stats-chart',
  PartnerProfileTab: 'person'
};

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
        tabBarIcon: ({ focused, color, size }) => (
          <Icon name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`} size={size} color={color} />
        )
      })}
    >
      <Tab.Screen name="PartnerListings" component={PartnerListingsScreen} options={{ tabBarLabel: t('nav.listings') }} />
      <Tab.Screen name="PartnerOrders" component={PartnerOrdersScreen} options={{ tabBarLabel: t('nav.incomingOrders') }} />
      <Tab.Screen name="PartnerReports" component={PartnerReportsScreen} options={{ tabBarLabel: t('nav.reports') }} />
      <Tab.Screen name="PartnerProfileTab" component={PartnerProfileScreen} options={{ tabBarLabel: t('nav.profile') }} />
    </Tab.Navigator>
  );
}
