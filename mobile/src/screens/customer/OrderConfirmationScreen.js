import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CommonActions } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingView from '../../components/LoadingView';
import { useTheme } from '../../theme/ThemeProvider';
import { fetchOrder } from '../../api/orders';
import { formatTimeRange } from '../../utils/format';

export default function OrderConfirmationScreen({ route, navigation }) {
  const { orderId } = route.params;
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrder(orderId).then((data) => setOrder(data.order));
  }, [orderId]);

  const styles = StyleSheet.create({
    center: { alignItems: 'center', marginTop: spacing.lg },
    check: { fontSize: 56 },
    title: { ...typography.h1, color: colors.text, marginTop: spacing.sm },
    subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xxs },
    codeCard: { alignItems: 'center', marginTop: spacing.xl, paddingVertical: spacing.xl },
    codeLabel: { ...typography.eyebrow, color: colors.textMuted },
    code: { fontSize: 40, fontWeight: '800', color: colors.primary, letterSpacing: 6, marginTop: spacing.sm },
    pickupAt: { ...typography.body, color: colors.text, marginTop: spacing.md },
    pickupTime: { ...typography.bodyStrong, color: colors.primaryDark, marginTop: spacing.xxs },
    actions: { marginTop: 'auto', gap: spacing.sm }
  });

  if (!order) return <LoadingView label={t('common.loading')} />;

  const goHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'CustomerTabs' }]
      })
    );
  };

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <View style={styles.center}>
        <Text style={styles.check}>🎉</Text>
        <Text style={styles.title}>{t('confirmation.title')}</Text>
        <Text style={styles.subtitle}>{t('confirmation.subtitle')}</Text>
      </View>

      <Card style={styles.codeCard}>
        <Text style={styles.codeLabel}>{t('confirmation.pickupCode')}</Text>
        <Text style={styles.code}>{order.pickup_code}</Text>
        <Text style={styles.pickupAt}>{t('confirmation.pickupAt', { partner: order.partner_name })}</Text>
        <Text style={styles.pickupTime}>{formatTimeRange(order.pickup_window_start, order.pickup_window_end)}</Text>
      </Card>

      <View style={styles.actions}>
        <Button
          title={t('confirmation.viewOrders')}
          onPress={() => navigation.navigate('CustomerTabs', { screen: 'OrdersTab' })}
        />
        <Button title={t('confirmation.backHome')} variant="outline" onPress={goHome} />
      </View>
    </ScreenContainer>
  );
}
