import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import Button from './Button';
import Icon from './Icon';

export default function ConfirmModal({ visible, title, message, confirmLabel, cancelLabel, destructive, onConfirm, onCancel }) {
  const { colors, spacing, radii, typography, shadows } = useTheme();

  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg
    },
    card: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      padding: spacing.lg,
      ...shadows.card
    },
    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: radii.pill,
      backgroundColor: destructive ? colors.dangerTint : colors.secondaryTint,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm
    },
    title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
    message: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
    actions: { flexDirection: 'row', gap: spacing.sm }
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconWrap}>
            <Icon name={destructive ? 'warning' : 'help-circle'} size={26} color={destructive ? colors.danger : colors.secondaryDark} />
          </View>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <Button title={cancelLabel} variant="outline" onPress={onCancel} style={{ flex: 1 }} />
            <Button title={confirmLabel} variant={destructive ? 'danger' : 'primary'} onPress={onConfirm} style={{ flex: 1 }} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
