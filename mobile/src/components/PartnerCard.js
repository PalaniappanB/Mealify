import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import Card from './Card';
import Badge from './Badge';
import Icon from './Icon';
import { useTheme } from '../theme/ThemeProvider';
import { formatRupees } from '../utils/format';
import { useFavorites } from '../context/FavoritesContext';

export default function PartnerCard({ partner, onPress }) {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography, shadows } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(partner.id);

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
    favoriteButton: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.raised
    },
    name: { ...typography.h3, color: colors.text },
    cuisine: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 1 },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
    distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 2 }
  });

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.logo}>
          {partner.logo_url ? (
            <Image source={{ uri: partner.logo_url }} style={styles.logoImage} />
          ) : (
            <Icon name="restaurant-outline" size={24} color={colors.secondaryDark} />
          )}
          <Pressable
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation?.();
              toggleFavorite(partner);
            }}
            hitSlop={8}
          >
            <Icon
              name={favorited ? 'heart' : 'heart-outline'}
              size={14}
              color={favorited ? colors.danger : colors.textMuted}
            />
          </Pressable>
        </View>
        <Text style={styles.name} numberOfLines={1}>{partner.name}</Text>
        <Text style={styles.cuisine} numberOfLines={1}>{partner.cuisine_type} · {partner.city}</Text>
        {partner.average_rating ? (
          <View style={styles.ratingRow}>
            <Icon name="star" size={11} color={colors.secondaryDark} />
            <Text style={typography.tiny}>{partner.average_rating} ({partner.review_count})</Text>
          </View>
        ) : null}
        <View style={styles.footerRow}>
          {partner.min_price ? (
            <Badge label={`${t('common.rupee', { amount: partner.min_price })}+`} tone="secondary" rotated={false} />
          ) : (
            <View />
          )}
          {partner.distance_km != null ? (
            <View style={styles.distanceRow}>
              <Icon name="location-outline" size={11} color={colors.textFaint} />
              <Text style={typography.tiny}>{t('common.kmAway', { distance: partner.distance_km })}</Text>
            </View>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}
