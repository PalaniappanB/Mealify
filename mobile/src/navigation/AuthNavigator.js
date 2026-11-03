import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import AuthWelcomeScreen from '../screens/auth/AuthWelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OtpLoginScreen from '../screens/auth/OtpLoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import PartnerLoginScreen from '../screens/auth/PartnerLoginScreen';
import PartnerSignupScreen from '../screens/auth/PartnerSignupScreen';
import AdminLoginScreen from '../screens/auth/AdminLoginScreen';
import { useTheme } from '../theme/ThemeProvider';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
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
      <Stack.Screen name="AuthWelcome" component={AuthWelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('auth.login') }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: t('auth.signup') }} />
      <Stack.Screen name="OtpLogin" component={OtpLoginScreen} options={{ title: t('auth.loginWithOtp') }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: t('auth.forgotPasswordTitle') }} />
      <Stack.Screen name="PartnerLogin" component={PartnerLoginScreen} options={{ title: t('auth.partnerLogin') }} />
      <Stack.Screen name="PartnerSignup" component={PartnerSignupScreen} options={{ title: t('partnerSignup.title') }} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ title: t('auth.adminLogin') }} />
    </Stack.Navigator>
  );
}
