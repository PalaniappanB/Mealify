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
import { useTheme } from '../../theme/ThemeProvider';
import { fetchPartnerOrders, updatePartnerOrderStatus } from '../../api/orders';
import { formatRupees, formatDateTime } from '../../utils/format';

const STATUS_TONE = { placed: 'secondary', ready: 'success', completed: 'neutral', cancelled: 'danger' };
const NEXT_STATUS = { placed: 'ready', ready: 'completed' };

export default function PartnerOrdersScreen() {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchPartnerOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const advance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    await updatePartnerOrderStatus(order.id, next);
    load();
  };

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
    card: { marginBottom: spacing.sm },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    customer: { ...typography.h3, color: colors.text },
    date: { ...typography.tiny, color: colors.textFaint, marginTop: 2 },
    amount: { ...typography.h3, color: colors.primary },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
    code: { ...typography.caption, color: colors.textMuted }
  });

  if (loading) return <LoadingView label={t('common.loading')} />;

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <Text style={styles.title}>{t('partnerDashboard.orders')}</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.customer}>{item.customer_name}</Text>
                <Text style={styles.date}>{formatDateTime(item.created_at)}</Text>
              </View>
              <Text style={styles.amount}>{formatRupees(item.total_amount)}</Text>
            </View>
            <View style={styles.footerRow}>
              <Badge label={t(`orders.status.${item.status}`)} tone={STATUS_TONE[item.status] || 'neutral'} rotated={false} />
              <Text style={styles.code}>{t('orders.pickupCode')}: {item.pickup_code}</Text>
            </View>
            {NEXT_STATUS[item.status] ? (
              <Button
                title={item.status === 'placed' ? t('partnerDashboard.markReady') : t('partnerDashboard.markCompleted')}
                onPress={() => advance(item)}
                style={{ marginTop: spacing.sm }}
              />
            ) : null}
          </Card>
        )}
        ListEmptyComponent={<EmptyState title={t('partnerDashboard.noOrders')} />}
      />
    </ScreenContainer>
  );
}
