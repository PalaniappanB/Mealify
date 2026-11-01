import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListingCard from '../../components/ListingCard';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import CartFloatingBar from '../../components/CartFloatingBar';
import { useTheme } from '../../theme/ThemeProvider';
import { fetchPartner } from '../../api/catalog';
import { useLocation } from '../../context/LocationContext';

export default function PartnerDetailScreen({ route, navigation }) {
  const { partnerId } = route.params;
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const location = useLocation();

  const [partner, setPartner] = useState(null);
  const [listings, setListings] = useState([]);
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
    if (!location.loading) load();
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
    heroLogoEmoji: { fontSize: 24 },
    heroTitle: { ...typography.h1, color: colors.text },
    heroMeta: { ...typography.body, color: colors.textMuted, marginTop: 2 },
    heroAddress: { ...typography.caption, color: colors.textFaint, marginTop: 2 },
    sectionTitle: { ...typography.h2, color: colors.text, margin: spacing.md, marginBottom: spacing.sm },
    listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }
  });

  if (loading) return <LoadingView label={t('common.loading')} />;
  if (error || !partner) return <EmptyState icon="⚠️" title={t('common.error')} subtitle={error} />;

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
                  <Text style={styles.heroLogoEmoji}>🍴</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>{partner.name}</Text>
                <Text style={styles.heroMeta}>{partner.cuisine_type} · {partner.city}</Text>
                <Text style={styles.heroAddress}>{partner.address}</Text>
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
      />
      <CartFloatingBar />
    </SafeAreaView>
  );
}
