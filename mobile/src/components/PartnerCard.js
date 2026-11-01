import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import Card from './Card';
import Badge from './Badge';
import { useTheme } from '../theme/ThemeProvider';
import { formatRupees } from '../utils/format';

export default function PartnerCard({ partner, onPress }) {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();

  const styles = StyleSheet.create({
    card: { width: 190, marginRight: spacing.sm },
    logo: {
      height: 74,
      borderRadius: radii.md,
      backgroundColor: colors.secondaryTint,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
      overflow: 'hidden'
    },
    logoImage: { width: '100%', height: '100%' },
    logoText: { fontSize: 26 },
    name: { ...typography.h3, color: colors.text },
    cuisine: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs }
  });

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.logo}>
          {partner.logo_url ? (
            <Image source={{ uri: partner.logo_url }} style={styles.logoImage} />
          ) : (
            <Text style={styles.logoText}>🍴</Text>
          )}
        </View>
        <Text style={styles.name} numberOfLines={1}>{partner.name}</Text>
        <Text style={styles.cuisine} numberOfLines={1}>{partner.cuisine_type} · {partner.city}</Text>
        <View style={styles.footerRow}>
          {partner.min_price ? (
            <Badge label={`${t('common.rupee', { amount: partner.min_price })}+`} tone="secondary" rotated={false} />
          ) : (
            <View />
          )}
          {partner.distance_km != null ? (
            <Text style={typography.tiny}>{t('common.kmAway', { distance: partner.distance_km })}</Text>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}
