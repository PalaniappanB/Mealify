import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { useCart } from '../context/CartContext';
import { formatRupees } from '../utils/format';
import Icon from './Icon';

// Persistent "view cart" bar shown once something's in the cart — the
// Zomato/Swiggy-style floating summary bar requested for quick checkout access.
export default function CartFloatingBar({ bottom = 12 }) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { colors, spacing, radii, typography, shadows } = useTheme();
  const { partner, totalItems, subtotal } = useCart();

  const styles = StyleSheet.create({
    wrap: { position: 'absolute', left: spacing.md, right: spacing.md, bottom },
    bar: {
      backgroundColor: colors.primary,
      borderRadius: radii.pill,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...shadows.raised
    },
    left: { flex: 1 },
    count: { ...typography.caption, color: colors.onPrimary, opacity: 0.9 },
    amount: { ...typography.h3, color: colors.onPrimary },
    ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cta: { ...typography.bodyStrong, color: colors.onPrimary }
  });

  if (totalItems === 0) return null;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable style={styles.bar} onPress={() => navigation.navigate('CustomerTabs', { screen: 'CartTab' })}>
        <View style={styles.left}>
          <Text style={styles.count}>{t('cart.itemsFrom', { partner: partner?.name })}</Text>
          <Text style={styles.amount}>{formatRupees(subtotal)}</Text>
        </View>
        <View style={styles.ctaRow}>
          <Text style={styles.cta}>{t('listing.goToCart')}</Text>
          <Icon name="arrow-forward" size={16} color={colors.onPrimary} />
        </View>
      </Pressable>
    </View>
  );
}
