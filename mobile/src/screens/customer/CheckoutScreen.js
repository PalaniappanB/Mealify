import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../api/orders';
import { formatRupees, formatTimeRange } from '../../utils/format';

export default function CheckoutScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();
  const { partner, items, subtotal, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickupWindow = useMemo(() => {
    if (items.length === 0) return null;
    const starts = items.map((i) => new Date(i.pickupWindowStart).getTime());
    const ends = items.map((i) => new Date(i.pickupWindowEnd).getTime());
    return { start: new Date(Math.min(...starts)).toISOString(), end: new Date(Math.max(...ends)).toISOString() };
  }, [items]);

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
    sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xxs },
    itemLabel: { ...typography.body, color: colors.text, flex: 1 },
    itemValue: { ...typography.body, color: colors.textMuted },
    card: { marginBottom: spacing.md },
    pickupText: { ...typography.body, color: colors.primaryDark },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
    totalLabel: { ...typography.h2, color: colors.text },
    totalValue: { ...typography.h2, color: colors.primary },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm }
  });

  const confirm = async () => {
    setError('');
    setLoading(true);
    try {
      const order = await createOrder({
        partnerId: partner.id,
        items: items.map((i) => ({ listingId: i.listingId, quantity: i.quantity })),
        pickupWindowStart: pickupWindow.start,
        pickupWindowEnd: pickupWindow.end
      });
      clear();
      navigation.replace('Payment', { orderId: order.id, amount: order.total_amount });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('checkout.title')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>{t('checkout.orderSummary')}</Text>
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.listingId)}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.itemLabel} numberOfLines={1}>{item.quantity} × {item.title}</Text>
              <Text style={styles.itemValue}>{formatRupees(item.discountedPrice * item.quantity)}</Text>
            </View>
          )}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>{t('checkout.pickupWindow')}</Text>
        {pickupWindow ? (
          <Text style={styles.pickupText}>{formatTimeRange(pickupWindow.start, pickupWindow.end)}</Text>
        ) : null}
      </Card>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{t('checkout.total')}</Text>
        <Text style={styles.totalValue}>{formatRupees(subtotal)}</Text>
      </View>

      <Button
        title={loading ? t('checkout.placingOrder') : t('checkout.payNow')}
        onPress={confirm}
        loading={loading}
        style={{ marginTop: spacing.lg }}
      />
    </ScreenContainer>
  );
}
