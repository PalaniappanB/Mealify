import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export default function Button({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | ghost | danger
  disabled = false,
  loading = false,
  style,
  fullWidth = true
}) {
  const { colors, spacing, radii, typography } = useTheme();

  const variants = {
    primary: { bg: colors.primary, text: colors.onPrimary, border: 'transparent' },
    secondary: { bg: colors.secondary, text: colors.text, border: 'transparent' },
    outline: { bg: 'transparent', text: colors.primary, border: colors.primary },
    ghost: { bg: 'transparent', text: colors.textMuted, border: 'transparent' },
    danger: { bg: colors.danger, text: '#fff', border: 'transparent' }
  };
  const v = variants[variant] || variants.primary;
  const isDisabled = disabled || loading;

  const styles = StyleSheet.create({
    base: {
      backgroundColor: v.bg,
      borderColor: v.border,
      borderWidth: variant === 'outline' ? 1.5 : 0,
      borderRadius: radii.pill,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
      opacity: isDisabled ? 0.6 : 1
    },
    text: { ...typography.bodyStrong, color: v.text }
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [styles.base, style, pressed && !isDisabled ? { opacity: 0.85 } : null]}
      accessibilityRole="button"
    >
      {loading ? <ActivityIndicator color={v.text} /> : <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}
