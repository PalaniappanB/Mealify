import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LogoMark } from '../components/Logo';
import { useTheme } from '../theme/ThemeProvider';

export default function SplashScreen() {
  const { colors, typography, spacing } = useTheme();
  const styles = StyleSheet.create({
    wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
    markWrap: {
      width: 96,
      height: 96,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md
    },
    title: { ...typography.display, color: colors.onPrimary },
    tagline: { ...typography.body, color: colors.onPrimary, opacity: 0.85, marginTop: spacing.xxs }
  });
  return (
    <View style={styles.wrap}>
      <View style={styles.markWrap}>
        <LogoMark size={64} onPrimary />
      </View>
      <Text style={styles.title}>Mealify</Text>
      <Text style={styles.tagline}>Rescue good food, nearby</Text>
    </View>
  );
}
