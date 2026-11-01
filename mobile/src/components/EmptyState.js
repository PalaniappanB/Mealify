import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export default function EmptyState({ title, subtitle, icon = '🍽️' }) {
  const { colors, spacing, typography } = useTheme();
  const styles = StyleSheet.create({
    wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
    icon: { fontSize: 40, marginBottom: spacing.sm },
    title: { ...typography.h3, color: colors.text, textAlign: 'center' },
    subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxs }
  });
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}
