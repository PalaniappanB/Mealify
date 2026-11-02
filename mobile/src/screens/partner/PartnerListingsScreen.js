import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
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
import { fetchPartnerListings, updatePartnerListing, deletePartnerListing, uploadListingImage } from '../../api/orders';
import { pickImage } from '../../utils/pickImage';
import { formatRupees, formatTimeRange } from '../../utils/format';

const STATUS_TONE = { active: 'success', sold_out: 'neutral', expired: 'danger', cancelled: 'danger' };

export default function PartnerListingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const confirm = useConfirm();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchPartnerListings();
      setListings(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggleStock = async (listing) => {
    const nextStatus = listing.status === 'active' ? 'sold_out' : 'active';
    await updatePartnerListing(listing.id, { status: nextStatus, quantity_available: nextStatus === 'sold_out' ? 0 : listing.quantity_available || 1 });
    load();
  };

  const cancelListing = async (listing) => {
    const ok = await confirm({
      title: t('partnerDashboard.cancelListingTitle'),
      message: t('partnerDashboard.cancelListingMessage', { title: listing.title }),
      confirmLabel: t('common.cancel'),
      destructive: true
    });
    if (!ok) return;
    await deletePartnerListing(listing.id);
    load();
  };

  const changePhoto = async (listing) => {
    const asset = await pickImage();
    if (!asset) return;
    setUploadingId(listing.id);
    try {
      await uploadListingImage(listing.id, asset);
      load();
    } finally {
      setUploadingId(null);
    }
  };

  const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    title: { ...typography.h1, color: colors.text },
    card: { marginBottom: spacing.sm },
    row: { flexDirection: 'row' },
    thumb: {
      width: 64,
      height: 64,
      borderRadius: radii.md,
      backgroundColor: colors.surfaceAlt,
      marginRight: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    thumbImage: { width: '100%', height: '100%' },
    thumbLabel: { ...typography.tiny, color: colors.primary, marginTop: 2 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', flex: 1 },
    listingTitle: { ...typography.h3, color: colors.text },
    price: { ...typography.body, color: colors.primary, marginTop: 2 },
    meta: { ...typography.tiny, color: colors.textMuted, marginTop: spacing.xxs },
    actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }
  });

  if (loading) return <LoadingView label={t('common.loading')} />;

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('partnerDashboard.listings')}</Text>
      </View>
      <Button title={t('partnerDashboard.addListing')} onPress={() => navigation.navigate('AddListing')} style={{ marginBottom: spacing.md }} />
      <FlatList
        data={listings}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <Pressable style={styles.thumb} onPress={() => changePhoto(item)} disabled={uploadingId === item.id}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.thumbImage} />
                ) : (
                  <Icon name="camera-outline" size={22} color={colors.textFaint} />
                )}
              </Pressable>
              <View style={styles.infoRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.price}>{formatRupees(item.discounted_price)}</Text>
                  <Text style={styles.meta}>{formatTimeRange(item.pickup_window_start, item.pickup_window_end)}</Text>
                  <Text style={styles.meta}>{t('partnerDashboard.stock', { count: item.quantity_available })}</Text>
                  <Text style={styles.thumbLabel} onPress={() => changePhoto(item)}>
                    {uploadingId === item.id
                      ? t('partnerDashboard.uploadingPhoto')
                      : item.image_url
                        ? t('partnerDashboard.changePhoto')
                        : t('partnerDashboard.addPhoto')}
                  </Text>
                </View>
                <Badge label={item.status} tone={STATUS_TONE[item.status] || 'neutral'} rotated={false} />
              </View>
            </View>
            {item.status !== 'cancelled' && item.status !== 'expired' ? (
              <View style={styles.actionsRow}>
                <Button
                  title={item.status === 'active' ? t('listing.soldOut') : t('partnerDashboard.markActive')}
                  variant="outline"
                  fullWidth={false}
                  onPress={() => toggleStock(item)}
                />
                <Button title={t('common.cancel')} variant="ghost" fullWidth={false} onPress={() => cancelListing(item)} />
              </View>
            ) : null}
          </Card>
        )}
        ListEmptyComponent={<EmptyState title={t('partnerDashboard.noListings')} />}
      />
    </ScreenContainer>
  );
}
