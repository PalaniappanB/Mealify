import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { useTheme } from '../theme/ThemeProvider';

export default function EmptyState({ title, subtitle, icon = 'fast-food-outline' }) {
  const { colors, spacing, radii, typography } = useTheme();
  const styles = StyleSheet.create({
    wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: radii.pill,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm
    },
    title: { ...typography.h3, color: colors.text, textAlign: 'center' },
    subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxs }
  });
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={28} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}
