import React, { forwardRef, useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import Icon from './Icon';

const Input = forwardRef(function Input({ label, error, style, secureTextEntry, ...props }, ref) {
  const { colors, spacing, radii, typography } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  const styles = StyleSheet.create({
    wrap: { marginBottom: spacing.sm },
    label: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xxs },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
      borderRadius: radii.md,
      backgroundColor: colors.surface
    },
    input: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      color: colors.text,
      fontSize: typography.body.fontSize
    },
    eyeBtn: { paddingHorizontal: spacing.sm },
    error: { ...typography.tiny, color: colors.danger, marginTop: spacing.xxs }
  });

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={colors.textFaint}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secureTextEntry ? hidden : false}
          {...props}
        />
        {secureTextEntry ? (
          <Pressable style={styles.eyeBtn} onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Icon name={hidden ? 'eye-outline' : 'eye-off-outline'} size={19} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

export default Input;
