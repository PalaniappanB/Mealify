import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingView from '../../components/LoadingView';
import Icon from '../../components/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminOverview, fetchAdminPartners, fetchAdminTopItems } from '../../api/admin';
import { formatRupees } from '../../utils/format';

function StatCard({ label, value, icon, accent, style }) {
  const { colors, spacing, radii, typography } = useTheme();
  const styles = StyleSheet.create({
    card: { flex: 1, borderLeftWidth: 4, borderLeftColor: accent || colors.primary },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    value: { ...typography.h1, color: colors.text },
    label: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: radii.pill,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
  return (
    <Card style={[styles.card, style]}>
      <View style={styles.row}>
        <Text style={styles.value}>{value}</Text>
        <View style={styles.iconWrap}>
          <Icon name={icon} size={16} color={accent || colors.primary} />
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
}

export default function AdminDashboardScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const { admin, logout } = useAuth();
  const [overview, setOverview] = useState(null);
  const [partners, setPartners] = useState([]);
  const [topItems, setTopItems] = useState({ topItems: [], cuisinePopularity: [] });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [ov, pts, ti] = await Promise.all([fetchAdminOverview(), fetchAdminPartners(), fetchAdminTopItems()]);
      setOverview(ov);
      setPartners(pts);
      setTopItems(ti);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xxl },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    title: { ...typography.h1, color: colors.text },
    subtitle: { ...typography.caption, color: colors.textMuted },
    row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
    sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
    partnerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    partnerName: { ...typography.bodyStrong, color: colors.text },
    partnerMeta: { ...typography.tiny, color: colors.textMuted, marginTop: 1 },
    partnerRevenue: { ...typography.bodyStrong, color: colors.primary },
    rank: { ...typography.caption, color: colors.textFaint, width: 22 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
    itemTitle: { ...typography.body, color: colors.text, flex: 1 },
    itemMeta: { ...typography.caption, color: colors.textMuted }
  });

  if (loading || !overview) return <LoadingView label={t('common.loading')} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t('admin.dashboard')}</Text>
            <Text style={styles.subtitle}>{admin?.name}</Text>
          </View>
          <Button title={t('profile.logout')} variant="ghost" fullWidth={false} onPress={logout} />
        </View>

        <View style={styles.row}>
          <StatCard label={t('admin.totalRevenue')} value={formatRupees(overview.total_revenue)} icon="cash-outline" accent={colors.primary} />
          <StatCard label={t('admin.totalOrders')} value={overview.total_orders} icon="receipt-outline" accent={colors.secondaryDark} />
        </View>
        <View style={styles.row}>
          <StatCard label={t('admin.activePartners')} value={`${overview.active_partners}/${overview.total_partners}`} icon="storefront-outline" accent={colors.success} />
          <StatCard label={t('admin.totalCustomers')} value={overview.total_customers} icon="people-outline" accent={colors.textMuted} />
        </View>
        <View style={styles.row}>
          <StatCard label={t('admin.bagsRescued')} value={overview.bags_rescued} icon="bag-handle-outline" accent={colors.primary} />
          <StatCard label={t('admin.averageRating')} value={overview.average_rating || '—'} icon="star-outline" accent={colors.secondaryDark} />
        </View>

        <Text style={styles.sectionTitle}>{t('admin.leaderboard')}</Text>
        <Card>
          {partners.slice(0, 10).map((p, idx) => (
            <View key={p.id} style={styles.partnerRow}>
              <Text style={styles.rank}>#{idx + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.partnerName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.partnerMeta}>
                  {p.city} · {p.total_orders} {t('admin.orders')} {p.average_rating ? `· ${p.average_rating}★` : ''}
                </Text>
              </View>
              <Text style={styles.partnerRevenue}>{formatRupees(p.total_revenue)}</Text>
              {!p.is_active ? <Badge label={t('partnerDashboard.storeClosed')} tone="danger" rotated={false} /> : null}
            </View>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>{t('admin.topItems')}</Text>
        <Card>
          {topItems.topItems.length === 0 ? (
            <Text style={styles.itemMeta}>{t('reports.noData')}</Text>
          ) : (
            topItems.topItems.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title} · {item.partner_name}</Text>
                <Text style={styles.itemMeta}>{item.quantity_sold}×</Text>
              </View>
            ))
          )}
        </Card>

        <Text style={styles.sectionTitle}>{t('admin.cuisinePopularity')}</Text>
        <Card>
          {topItems.cuisinePopularity.map((c, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemTitle}>{c.cuisine_type}</Text>
              <Text style={styles.itemMeta}>{c.orders} {t('admin.orders')}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
