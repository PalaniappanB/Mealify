import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import { useTheme } from '../../theme/ThemeProvider';
import { useConfirm } from '../../context/ConfirmContext';
import { fetchPartnerItems, deletePartnerItem } from '../../api/items';
import { formatRupees } from '../../utils/format';

export default function PartnerMenuScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchPartnerItems();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: t('partnerDashboard.deleteItemTitle'),
      message: t('partnerDashboard.deleteItemMessage', { name: item.name }),
      confirmLabel: t('common.cancel'),
      destructive: true
    });
    if (!ok) return;
    await deletePartnerItem(item.id);
    load();
  };

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
    subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.md },
    card: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    thumb: {
      width: 56,
      height: 56,
      borderRadius: radii.md,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
      overflow: 'hidden'
    },
    thumbImage: { width: '100%', height: '100%' },
    name: { ...typography.bodyStrong, color: colors.text },
    meta: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
    actions: { flexDirection: 'row', gap: spacing.xs },
    actionBtn: { padding: 6 }
  });

  if (loading) return <LoadingView label={t('common.loading')} />;

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <Text style={styles.title}>{t('partnerDashboard.myMenu')}</Text>
      <Text style={styles.subtitle}>{t('partnerDashboard.myMenuSubtitle')}</Text>
      <Button title={t('partnerDashboard.addItem')} onPress={() => navigation.navigate('EditMenuItem')} style={{ marginBottom: spacing.md }} />
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.thumb}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.thumbImage} />
              ) : (
                <Icon name="fast-food-outline" size={22} color={colors.textFaint} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.meta} numberOfLines={1}>
                {item.category ? `${item.category} · ` : ''}
                {item.discounted_price ? formatRupees(item.discounted_price) : t('partnerDashboard.noDefaultPrice')}
              </Text>
            </View>
            <View style={styles.actions}>
              <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('EditMenuItem', { item })}>
                <Icon name="create-outline" size={20} color={colors.textMuted} />
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={() => handleDelete(item)}>
                <Icon name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState title={t('partnerDashboard.noItems')} subtitle={t('partnerDashboard.noItemsSubtitle')} icon="restaurant-outline" />}
      />
    </ScreenContainer>
  );
}
