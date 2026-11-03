import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import Icon from '../../components/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useConfirm } from '../../context/ConfirmContext';
import { fetchOrders, cancelOrder } from '../../api/orders';
import { formatRupees, formatDateTime } from '../../utils/format';

const STATUS_TONE = { placed: 'secondary', ready: 'success', completed: 'neutral', cancelled: 'danger' };

export default function OrderHistoryScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();
  const confirm = useConfirm();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      // keep last known list on transient errors
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleCancel = async (order) => {
    const ok = await confirm({
      title: t('orders.cancelTitle'),
      message: t('orders.cancelMessage', { partner: order.partner_name }),
      confirmLabel: t('orders.cancel'),
      destructive: true
    });
    if (!ok) return;
    await cancelOrder(order.id);
    load();
  };

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
    card: { marginBottom: spacing.sm },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    partnerName: { ...typography.h3, color: colors.text },
    date: { ...typography.tiny, color: colors.textFaint, marginTop: 2 },
    amount: { ...typography.h3, color: colors.primary },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
    code: { ...typography.caption, color: colors.textMuted },
    ratedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs, alignSelf: 'flex-end' },
    ratedText: { ...typography.tiny, color: colors.textMuted }
  });

  if (loading) return <LoadingView label={t('common.loading')} />;

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <Text style={styles.title}>{t('orders.title')}</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.partnerName}>{item.partner_name}</Text>
                <Text style={styles.date}>{formatDateTime(item.created_at)}</Text>
              </View>
              <Text style={styles.amount}>{formatRupees(item.total_amount)}</Text>
            </View>
            <View style={styles.footerRow}>
              <Badge label={t(`orders.status.${item.status}`)} tone={STATUS_TONE[item.status] || 'neutral'} rotated={false} />
              <Text style={styles.code}>{t('orders.pickupCode')}: {item.pickup_code}</Text>
            </View>
            {item.status === 'placed' ? (
              <Button
                title={t('orders.cancel')}
                variant="ghost"
                onPress={() => handleCancel(item)}
                style={{ marginTop: spacing.xs, alignSelf: 'flex-end' }}
                fullWidth={false}
              />
            ) : null}
            {item.status === 'completed' && !item.has_review ? (
              <Button
                title={t('reviews.rateThisOrder')}
                variant="outline"
                onPress={() => navigation.navigate('RateOrder', { order: item })}
                style={{ marginTop: spacing.xs, alignSelf: 'flex-end' }}
                fullWidth={false}
              />
            ) : null}
            {item.status === 'completed' && item.has_review ? (
              <View style={styles.ratedRow}>
                <Icon name="star" size={12} color={colors.secondaryDark} />
                <Text style={styles.ratedText}>{t('reviews.alreadyRated')}</Text>
              </View>
            ) : null}
          </Card>
        )}
        ListEmptyComponent={<EmptyState title={t('orders.empty')} icon="receipt-outline" />}
      />
    </ScreenContainer>
  );
}
