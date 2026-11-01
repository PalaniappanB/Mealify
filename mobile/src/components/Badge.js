import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

// Mealify's signature "stamped ticket" badge — a slightly rotated, hard-cornered
// tag (instead of the rounded eco-green pill most surplus-food apps use).
export default function Badge({ label, tone = 'primary', rotated = true }) {
  const { colors, radii, spacing, typography } = useTheme();

  const tones = {
    primary: { bg: colors.primary, fg: colors.onPrimary },
    secondary: { bg: colors.secondary, fg: colors.text },
    success: { bg: colors.successTint, fg: colors.success },
    danger: { bg: colors.dangerTint, fg: colors.danger },
    neutral: { bg: colors.surfaceAlt, fg: colors.textMuted }
  };
  const t = tones[tone] || tones.primary;

  const styles = StyleSheet.create({
    wrap: {
      backgroundColor: t.bg,
      borderRadius: radii.stamp,
      paddingVertical: spacing.xxs,
      paddingHorizontal: spacing.xs,
      alignSelf: 'flex-start',
      transform: rotated ? [{ rotate: '-3deg' }] : undefined
    },
    text: { ...typography.tiny, color: t.fg, letterSpacing: 0.5 }
  });

  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
