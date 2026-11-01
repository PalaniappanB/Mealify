import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export default function Card({ children, style, padded = true }) {
  const { colors, radii, spacing, shadows } = useTheme();
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: padded ? spacing.md : 0,
      ...shadows.card
    }
  });
  return <View style={[styles.card, style]}>{children}</View>;
}
