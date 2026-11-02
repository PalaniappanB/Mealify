import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable, RefreshControl, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListingCard from '../../components/ListingCard';
import PartnerCard from '../../components/PartnerCard';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import CartFloatingBar from '../../components/CartFloatingBar';
import { LogoMark } from '../../components/Logo';
import Icon from '../../components/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { fetchListings, fetchPartners, fetchCuisines } from '../../api/catalog';

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const [listings, setListings] = useState([]);
  const [partners, setPartners] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [activeCuisine, setActiveCuisine] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const params = { lat: location.latitude, lng: location.longitude };
        if (activeCuisine) params.cuisine = activeCuisine;
        const [listingsData, partnersData, cuisinesData] = await Promise.all([
          fetchListings(params),
          fetchPartners({ lat: location.latitude, lng: location.longitude }),
          cuisines.length ? Promise.resolve(cuisines) : fetchCuisines()
        ]);
        setListings(listingsData);
        setPartners(partnersData);
        if (!cuisines.length) setCuisines(cuisinesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [location.latitude, location.longitude, activeCuisine]
  );

  useEffect(() => {
    if (!location.loading) load();
  }, [location.loading, activeCuisine]);

  const visibleListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.partner_name?.toLowerCase().includes(q) ||
        l.cuisine_type?.toLowerCase().includes(q)
    );
  }, [listings, query]);

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm },
    brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs, gap: spacing.xs },
    brandName: { ...typography.eyebrow, color: colors.primary },
    locationPill: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 'auto',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radii.pill,
      paddingVertical: 5,
      paddingHorizontal: spacing.sm,
      maxWidth: '55%'
    },
    locationText: { ...typography.tiny, color: colors.textMuted, marginHorizontal: 4, flexShrink: 1 },
    greeting: { ...typography.display, color: colors.text },
    subtitle: { ...typography.body, color: colors.textMuted, marginTop: 2 },
    searchWrap: { paddingHorizontal: spacing.md, marginBottom: spacing.xs },
    searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radii.pill,
      borderWidth: 1.5,
      borderColor: colors.border,
      paddingHorizontal: spacing.sm,
      height: 46
    },
    aiButton: {
      width: 46,
      height: 46,
      borderRadius: radii.pill,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center'
    },
    searchInput: { flex: 1, ...typography.body, color: colors.text },
    sectionTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
    chipsRow: { paddingVertical: spacing.xs },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: radii.pill,
      borderWidth: 1.5,
      marginRight: spacing.xs
    },
    chipText: { ...typography.caption },
    listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl * 2 },
    partnersRow: { paddingLeft: spacing.md }
  });

  if (loading && !refreshing) return <LoadingView label={t('common.loading')} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <FlatList
        data={visibleListings}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.brandRow}>
                <LogoMark size={22} />
                <Text style={styles.brandName}>Mealify</Text>
                <Pressable style={styles.locationPill} onPress={() => navigation.navigate('LocationPicker')}>
                  <Icon name="location" size={13} color={colors.primary} />
                  <Text style={styles.locationText} numberOfLines={1}>{location.label}</Text>
                  <Icon name="chevron-down" size={12} color={colors.textFaint} />
                </Pressable>
              </View>
              <Text style={styles.greeting}>{t('home.greeting')}</Text>
              <Text style={styles.subtitle}>{t('home.subtitle')} {user ? `👋 ${user.name.split(' ')[0]}` : ''}</Text>
            </View>

            <View style={styles.searchWrap}>
              <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                  <Icon name="search" size={18} color={colors.textFaint} style={{ marginRight: spacing.xs }} />
                  <TextInput
                    style={styles.searchInput}
                    value={query}
                    onChangeText={setQuery}
                    placeholder={t('home.searchPlaceholder')}
                    placeholderTextColor={colors.textFaint}
                    returnKeyType="search"
                    numberOfLines={1}
                    multiline={false}
                  />
                  {query.length > 0 && (
                    <Pressable onPress={() => setQuery('')}>
                      <Icon name="close-circle" size={18} color={colors.textFaint} />
                    </Pressable>
                  )}
                </View>
                <Pressable style={styles.aiButton} onPress={() => navigation.navigate('AiSearch')}>
                  <Icon name="sparkles" size={20} color={colors.text} />
                </Pressable>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={{ paddingHorizontal: spacing.md }}>
              <Pressable
                onPress={() => setActiveCuisine(null)}
                style={[styles.chip, { borderColor: !activeCuisine ? colors.primary : colors.border, backgroundColor: !activeCuisine ? colors.primaryTint : colors.surface }]}
              >
                <Text style={[styles.chipText, { color: !activeCuisine ? colors.primary : colors.textMuted }]}>{t('home.all')}</Text>
              </Pressable>
              {cuisines.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setActiveCuisine(c)}
                  style={[styles.chip, { borderColor: activeCuisine === c ? colors.primary : colors.border, backgroundColor: activeCuisine === c ? colors.primaryTint : colors.surface }]}
                >
                  <Text style={[styles.chipText, { color: activeCuisine === c ? colors.primary : colors.textMuted }]}>{c}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {!query && partners.length > 0 && (
              <View>
                <Text style={[styles.sectionTitle, { marginHorizontal: spacing.md }]}>{t('home.partnersNearby')}</Text>
                <FlatList
                  data={partners}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => String(item.id)}
                  contentContainerStyle={styles.partnersRow}
                  renderItem={({ item }) => (
                    <PartnerCard partner={item} onPress={() => navigation.navigate('PartnerDetail', { partnerId: item.id })} />
                  )}
                />
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginHorizontal: spacing.md }]}>{t('home.bagsNearYou')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ListingCard listing={item} onPress={() => navigation.navigate('PartnerDetail', { partnerId: item.partner_id })} />
        )}
        ListEmptyComponent={
          error ? (
            <EmptyState icon="alert-circle-outline" title={t('common.error')} subtitle={error} />
          ) : (
            <EmptyState title={query ? t('home.noResults') : t('home.empty')} />
          )
        }
      />
      <CartFloatingBar />
    </SafeAreaView>
  );
}
