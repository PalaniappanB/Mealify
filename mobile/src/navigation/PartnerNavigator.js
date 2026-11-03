import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import PartnerTabNavigator from './PartnerTabNavigator';
import AddListingScreen from '../screens/partner/AddListingScreen';
import PartnerMenuScreen from '../screens/partner/PartnerMenuScreen';
import EditMenuItemScreen from '../screens/partner/EditMenuItemScreen';
import { useTheme } from '../theme/ThemeProvider';

const Stack = createNativeStackNavigator();

export default function PartnerNavigator() {
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
      <Stack.Screen name="PartnerTabs" component={PartnerTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="AddListing" component={AddListingScreen} options={{ title: t('partnerDashboard.addListing') }} />
      <Stack.Screen name="PartnerMenu" component={PartnerMenuScreen} options={{ title: t('partnerDashboard.myMenu') }} />
      <Stack.Screen name="EditMenuItem" component={EditMenuItemScreen} options={{ title: t('partnerDashboard.addItem') }} />
    </Stack.Navigator>
  );
}
