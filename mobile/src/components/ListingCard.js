import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import Card from './Card';
import Badge from './Badge';
import Icon from './Icon';
import { useTheme } from '../theme/ThemeProvider';
import { useCart } from '../context/CartContext';
import { formatRupees, percentOff, formatTimeRange } from '../utils/format';

export default function ListingCard({ listing, partnerInfo, onPress, showPartnerName = true }) {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const { addItem, setQuantity, getQuantity } = useCart();
  const soldOut = listing.status !== 'active' || listing.quantity_available <= 0;
  const qtyInCart = getQuantity(listing.id);
  const resolvedPartnerInfo = partnerInfo || { id: listing.partner_id, name: listing.partner_name };

  const styles = StyleSheet.create({
    card: { marginBottom: spacing.sm },
    row: { flexDirection: 'row' },
    thumb: {
      width: 76,
      height: 76,
      borderRadius: radii.md,
      backgroundColor: colors.surfaceAlt,
      marginRight: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    thumbImage: { width: '100%', height: '100%' },
    body: { flex: 1, justifyContent: 'space-between' },
    title: { ...typography.h3, color: colors.text },
    partner: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xxs, flexWrap: 'wrap', gap: 6 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xxs },
    price: { ...typography.h2, color: colors.primary, marginRight: spacing.xs },
    originalPrice: { ...typography.caption, color: colors.textFaint, textDecorationLine: 'line-through' },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
    pickupRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    pickup: { ...typography.tiny, color: colors.textMuted },
    addBtn: {
      backgroundColor: soldOut ? colors.surfaceAlt : colors.primary,
      borderRadius: radii.pill,
      paddingVertical: 6,
      paddingHorizontal: 14
    },
    addBtnText: { ...typography.tiny, color: soldOut ? colors.textFaint : colors.onPrimary },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: radii.pill,
      paddingHorizontal: 4
    },
    stepperBtn: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
    stepperQty: { ...typography.bodyStrong, color: colors.onPrimary, minWidth: 18, textAlign: 'center' }
  });

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.thumb}>
            {listing.image_url ? (
              <Image source={{ uri: listing.image_url }} style={styles.thumbImage} />
            ) : (
              <Icon name="bag-handle-outline" size={28} color={colors.textFaint} />
            )}
          </View>
          <View style={styles.body}>
            <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
            {showPartnerName && listing.partner_name ? (
              <Text style={styles.partner} numberOfLines={1}>{listing.partner_name}</Text>
            ) : null}
            <View style={styles.metaRow}>
              <Badge label={t('listing.off', { percent: percentOff(listing.original_price, listing.discounted_price) })} tone="primary" />
              {listing.distance_km != null ? (
                <Badge label={t('common.kmAway', { distance: listing.distance_km })} tone="neutral" rotated={false} />
              ) : null}
              {soldOut ? <Badge label={t('listing.soldOut')} tone="danger" rotated={false} /> : null}
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatRupees(listing.discounted_price)}</Text>
              <Text style={styles.originalPrice}>{formatRupees(listing.original_price)}</Text>
            </View>
            <View style={styles.footerRow}>
              <View style={styles.pickupRow}>
                <Icon name="time-outline" size={12} color={colors.textMuted} />
                <Text style={styles.pickup}>{formatTimeRange(listing.pickup_window_start, listing.pickup_window_end)}</Text>
              </View>
              {soldOut ? (
                <View style={styles.addBtn}>
                  <Text style={styles.addBtnText}>{t('listing.soldOut')}</Text>
                </View>
              ) : qtyInCart > 0 ? (
                <View style={styles.stepper}>
                  <Pressable style={styles.stepperBtn} onPress={() => setQuantity(listing.id, qtyInCart - 1)}>
                    <Icon name="remove" size={16} color={colors.onPrimary} />
                  </Pressable>
                  <Text style={styles.stepperQty}>{qtyInCart}</Text>
                  <Pressable
                    style={styles.stepperBtn}
                    onPress={() => setQuantity(listing.id, qtyInCart + 1)}
                    disabled={qtyInCart >= listing.quantity_available}
                  >
                    <Icon name="add" size={16} color={colors.onPrimary} />
                  </Pressable>
                </View>
              ) : (
                <Pressable style={styles.addBtn} onPress={() => addItem(listing, resolvedPartnerInfo)}>
                  <Text style={styles.addBtnText}>{t('listing.addToCart')}</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
