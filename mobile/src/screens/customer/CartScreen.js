import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { useTheme } from '../../theme/ThemeProvider';
import { useCart } from '../../context/CartContext';
import { formatRupees } from '../../utils/format';

export default function CartScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const { partner, items, setQuantity, removeItem, subtotal } = useCart();

  const styles = StyleSheet.create({
    header: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
    partnerLine: { ...typography.body, color: colors.textMuted, marginBottom: spacing.md },
    itemCard: { marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center' },
    itemInfo: { flex: 1 },
    itemTitle: { ...typography.bodyStrong, color: colors.text },
    itemPrice: { ...typography.body, color: colors.primary, marginTop: 2 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    qtyBtn: {
      width: 30,
      height: 30,
      borderRadius: radii.pill,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center'
    },
    qtyText: { ...typography.bodyStrong, color: colors.text },
    removeLink: { ...typography.tiny, color: colors.danger, marginTop: spacing.xs },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.md,
      marginTop: spacing.sm
    },
    subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
    subtotalLabel: { ...typography.h3, color: colors.text },
    subtotalValue: { ...typography.h3, color: colors.primary }
  });

  if (items.length === 0) {
    return (
      <ScreenContainer style={{ flex: 1 }}>
        <Text style={styles.header}>{t('cart.title')}</Text>
        <EmptyState title={t('cart.empty')} subtitle={t('cart.emptySubtitle')} icon="🛒" />
        <Button title={t('cart.browse')} variant="outline" onPress={() => navigation.navigate('Home')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <Text style={styles.header}>{t('cart.title')}</Text>
      <Text style={styles.partnerLine}>{t('cart.itemsFrom', { partner: partner?.name })}</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.listingId)}
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.itemPrice}>{formatRupees(item.discountedPrice)}</Text>
              <Pressable onPress={() => removeItem(item.listingId)}>
                <Text style={styles.removeLink}>{t('cart.remove')}</Text>
              </Pressable>
            </View>
            <View style={styles.qtyRow}>
              <Pressable style={styles.qtyBtn} onPress={() => setQuantity(item.listingId, item.quantity - 1)}>
                <Text style={styles.qtyText}>–</Text>
              </Pressable>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <Pressable
                style={styles.qtyBtn}
                onPress={() => setQuantity(item.listingId, item.quantity + 1)}
                disabled={item.quantity >= item.maxQuantity}
              >
                <Text style={styles.qtyText}>+</Text>
              </Pressable>
            </View>
          </Card>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>{t('cart.subtotal')}</Text>
          <Text style={styles.subtotalValue}>{formatRupees(subtotal)}</Text>
        </View>
        <Button title={t('cart.checkout')} onPress={() => navigation.navigate('Checkout')} />
      </View>
    </ScreenContainer>
  );
}
