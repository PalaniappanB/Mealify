import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { mockCharge } from '../../api/orders';
import { formatRupees } from '../../utils/format';

// Sandbox payment screen. The service layer (api/orders.js#mockCharge -> POST
// /api/payments/mock-charge) is isolated so a real gateway like Razorpay could
// be swapped in later without touching this screen's flow.
export default function PaymentScreen({ route, navigation }) {
  const { orderId, amount } = route.params;
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
    card: { marginBottom: spacing.lg, alignItems: 'center' },
    cardIcon: { fontSize: 36, marginBottom: spacing.sm },
    methodLabel: { ...typography.h3, color: colors.text },
    cardNumber: { ...typography.body, color: colors.textMuted, marginTop: spacing.xxs, letterSpacing: 2 },
    notice: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      backgroundColor: colors.surfaceAlt,
      padding: spacing.sm,
      borderRadius: radii.md,
      marginTop: spacing.md
    },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm, textAlign: 'center' }
  });

  const pay = async () => {
    setError('');
    setLoading(true);
    try {
      const { order } = await mockCharge(orderId);
      navigation.replace('OrderConfirmation', { orderId: order.id });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <Text style={styles.title}>{t('payment.title')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Card style={styles.card}>
        <Text style={styles.cardIcon}>💳</Text>
        <Text style={styles.methodLabel}>{t('payment.mockCard')}</Text>
        <Text style={styles.cardNumber}>{t('payment.cardNumber')}</Text>
      </Card>
      <Text style={styles.notice}>{t('payment.sandboxNotice')}</Text>
      <Button
        title={loading ? t('payment.processing') : t('payment.payAmount', { amount: formatRupees(amount) })}
        onPress={pay}
        loading={loading}
        style={{ marginTop: spacing.lg }}
      />
    </ScreenContainer>
  );
}
