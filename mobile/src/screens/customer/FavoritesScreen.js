import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useFavorites } from '../../context/FavoritesContext';

export default function FavoritesScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const { favorites, toggleFavorite, loaded } = useFavorites();

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
    card: { marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    logo: {
      width: 52,
      height: 52,
      borderRadius: radii.md,
      backgroundColor: colors.secondaryTint,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    logoImage: { width: '100%', height: '100%' },
    name: { ...typography.h3, color: colors.text },
    cuisine: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
    heartButton: { padding: spacing.xs }
  });

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <Text style={styles.title}>{t('favorites.title')}</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('PartnerDetail', { partnerId: item.id })}>
            <Card style={styles.card}>
              <View style={styles.logo}>
                {item.logo_url ? (
                  <Image source={{ uri: item.logo_url }} style={styles.logoImage} />
                ) : (
                  <Icon name="restaurant-outline" size={20} color={colors.secondaryDark} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cuisine} numberOfLines={1}>{item.cuisine_type} · {item.city}</Text>
              </View>
              <Pressable style={styles.heartButton} onPress={() => toggleFavorite(item)} hitSlop={8}>
                <Icon name="heart" size={20} color={colors.danger} />
              </Pressable>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          loaded ? (
            <EmptyState
              icon="heart-outline"
              title={t('favorites.empty')}
              subtitle={t('favorites.emptySubtitle')}
            />
          ) : null
        }
      />
    </ScreenContainer>
  );
}
