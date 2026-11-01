import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export default function Input({ label, error, style, ...props }) {
  const { colors, spacing, radii, typography } = useTheme();
  const [focused, setFocused] = useState(false);

  const styles = StyleSheet.create({
    wrap: { marginBottom: spacing.sm },
    label: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xxs },
    input: {
      borderWidth: 1.5,
      borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
      borderRadius: radii.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.surface,
      color: colors.text,
      fontSize: typography.body.fontSize
    },
    error: { ...typography.tiny, color: colors.danger, marginTop: spacing.xxs }
  });

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.textFaint}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
