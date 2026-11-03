import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListingCard from '../../components/ListingCard';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import CartFloatingBar from '../../components/CartFloatingBar';
import Icon from '../../components/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { fetchPartner } from '../../api/catalog';
import { fetchPartnerReviews } from '../../api/reviews';
import { useLocation } from '../../context/LocationContext';
import { useFavorites } from '../../context/FavoritesContext';
import { formatDateTime } from '../../utils/format';

export default function PartnerDetailScreen({ route, navigation }) {
  const { partnerId } = route.params;
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const location = useLocation();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [partner, setPartner] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ratingInfo, setRatingInfo] = useState({ average_rating: null, review_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchPartner(partnerId, { lat: location.latitude, lng: location.longitude });
        if (!cancelled) {
          setPartner(data.partner);
          setListings(data.listings);
          navigation.setOptions({ title: data.partner.name });
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    async function loadReviews() {
      try {
        const data = await fetchPartnerReviews(partnerId);
        if (!cancelled) {
          setReviews(data.reviews || []);
          setRatingInfo({ average_rating: data.average_rating, review_count: data.review_count });
        }
      } catch (err) {
        // non-critical, leave reviews empty
      }
    }
    if (!location.loading) load();
    loadReviews();
    return () => {
      cancelled = true;
    };
  }, [partnerId, location.loading]);

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    hero: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.sm },
    heroLogo: {
      width: 56,
      height: 56,
      borderRadius: radii.md,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    heroLogoImage: { width: '100%', height: '100%' },
    heroTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    heroTitle: { ...typography.h1, color: colors.text },
    heroMeta: { ...typography.body, color: colors.textMuted, marginTop: 2 },
    heroAddress: { ...typography.caption, color: colors.textFaint, marginTop: 2 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    ratingText: { ...typography.caption, color: colors.text },
    favoriteButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center'
    },
    sectionTitle: { ...typography.h2, color: colors.text, margin: spacing.md, marginBottom: spacing.sm },
    listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
    reviewCard: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm
    },
    reviewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    reviewerName: { ...typography.bodyStrong, color: colors.text },
    reviewDate: { ...typography.tiny, color: colors.textFaint },
    reviewStars: { flexDirection: 'row', gap: 1, marginTop: 2 },
    reviewComment: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs }
  });

  if (loading) return <LoadingView label={t('common.loading')} />;
  if (error || !partner) return <EmptyState icon="alert-circle-outline" title={t('common.error')} subtitle={error} />;

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <FlatList
        data={listings}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <View style={styles.heroLogo}>
                {partner.logo_url ? (
                  <Image source={{ uri: partner.logo_url }} style={styles.heroLogoImage} />
                ) : (
                  <Icon name="restaurant-outline" size={24} color={colors.textFaint} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.heroTitleRow}>
                  <Text style={styles.heroTitle}>{partner.name}</Text>
                  <Pressable style={styles.favoriteButton} onPress={() => toggleFavorite(partner)} hitSlop={8}>
                    <Icon
                      name={isFavorite(partner.id) ? 'heart' : 'heart-outline'}
                      size={18}
                      color={isFavorite(partner.id) ? colors.danger : colors.textMuted}
                    />
                  </Pressable>
                </View>
                <Text style={styles.heroMeta}>{partner.cuisine_type} · {partner.city}</Text>
                <Text style={styles.heroAddress}>{partner.address}</Text>
                {ratingInfo.average_rating ? (
                  <View style={styles.ratingRow}>
                    <Icon name="star" size={13} color={colors.secondaryDark} />
                    <Text style={styles.ratingText}>
                      {ratingInfo.average_rating} · {t('reviews.countLabel', { count: ratingInfo.review_count })}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
            <Text style={styles.sectionTitle}>{t('partner.activeBags')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ListingCard
            listing={{ ...item, partner_name: partner.name }}
            partnerInfo={{ id: partner.id, name: partner.name }}
            showPartnerName={false}
            onPress={() => {}}
          />
        )}
        ListEmptyComponent={<EmptyState title={t('partner.noActiveBags')} />}
        ListFooterComponent={
          reviews.length ? (
            <View>
              <Text style={styles.sectionTitle}>{t('reviews.title')}</Text>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeaderRow}>
                    <Text style={styles.reviewerName}>{review.customer_name}</Text>
                    <Text style={styles.reviewDate}>{formatDateTime(review.created_at)}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Icon
                        key={n}
                        name={n <= review.rating ? 'star' : 'star-outline'}
                        size={13}
                        color={colors.secondaryDark}
                      />
                    ))}
                  </View>
                  {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
                </View>
              ))}
            </View>
          ) : null
        }
      />
      <CartFloatingBar />
    </SafeAreaView>
  );
}
