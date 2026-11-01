import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../../components/Card';
import LoadingView from '../../components/LoadingView';
import { useTheme } from '../../theme/ThemeProvider';
import { fetchPartnerReports } from '../../api/orders';
import { formatRupees } from '../../utils/format';
import { SafeAreaView } from 'react-native-safe-area-context';

function StatCard({ label, value, accent, style }) {
  const { colors, spacing, radii, typography } = useTheme();
  const styles = StyleSheet.create({
    card: { flex: 1, borderLeftWidth: 4, borderLeftColor: accent || colors.primary },
    value: { ...typography.h1, color: colors.text },
    label: { ...typography.caption, color: colors.textMuted, marginTop: 2 }
  });
  return (
    <Card style={[styles.card, style]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
}

export default function PartnerReportsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchPartnerReports();
      setReport(data);
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
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
    row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
    sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
    chartCard: { paddingVertical: spacing.md },
    barRow: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: spacing.xs },
    barCol: { flex: 1, alignItems: 'center' },
    bar: { width: '70%', borderRadius: radii.sm, backgroundColor: colors.primary, minHeight: 4 },
    barLabel: { ...typography.tiny, color: colors.textFaint, marginTop: 4 },
    listingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
    listingTitle: { ...typography.body, color: colors.text, flex: 1 },
    listingMeta: { ...typography.caption, color: colors.textMuted }
  });

  if (loading || !report) return <LoadingView label={t('common.loading')} />;

  const maxRevenue = Math.max(1, ...report.dailyBreakdown.map((d) => Number(d.revenue)));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('reports.title')}</Text>

        <View style={styles.row}>
          <StatCard label={t('reports.totalRevenue')} value={formatRupees(report.total_revenue)} accent={colors.primary} />
          <StatCard label={t('reports.totalOrders')} value={report.total_orders} accent={colors.secondary} />
        </View>
        <View style={styles.row}>
          <StatCard label={t('reports.bagsSold')} value={report.total_items_sold} accent={colors.success} />
          <StatCard label={t('reports.activeOrders')} value={report.active_orders} accent={colors.textFaint} />
        </View>

        <Text style={styles.sectionTitle}>{t('reports.last7Days')}</Text>
        <Card style={styles.chartCard}>
          {report.dailyBreakdown.length === 0 ? (
            <Text style={styles.listingMeta}>{t('reports.noData')}</Text>
          ) : (
            <View style={styles.barRow}>
              {report.dailyBreakdown.map((d) => (
                <View key={d.day} style={styles.barCol}>
                  <View style={[styles.bar, { height: (Number(d.revenue) / maxRevenue) * 90 }]} />
                  <Text style={styles.barLabel}>{new Date(d.day).toLocaleDateString([], { weekday: 'short' })}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>{t('reports.topBags')}</Text>
        <Card>
          {report.topListings.length === 0 ? (
            <Text style={styles.listingMeta}>{t('reports.noData')}</Text>
          ) : (
            report.topListings.map((l) => (
              <View key={l.id} style={styles.listingRow}>
                <Text style={styles.listingTitle} numberOfLines={1}>{l.title}</Text>
                <Text style={styles.listingMeta}>{l.quantity_sold} × · {formatRupees(l.revenue)}</Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
