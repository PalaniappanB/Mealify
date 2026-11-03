import React, { useEffect, useState } from 'react';
import { Text, View, Image, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { createPartnerListing, uploadListingImage } from '../../api/orders';
import { fetchPartnerItems } from '../../api/items';
import { pickImage } from '../../utils/pickImage';
import { formatRupees } from '../../utils/format';

export default function AddListingScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const [form, setForm] = useState({
    title: '',
    description: '',
    original_price: '',
    discounted_price: '',
    quantity_available: '',
    pickupStartHours: '2',
    pickupEndHours: '4'
  });
  const [image, setImage] = useState(null);
  const [catalogImageUrl, setCatalogImageUrl] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPartnerItems().then(setMenuItems).catch(() => {});
  }, []);

  const update = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
    menuLabel: { ...typography.h3, color: colors.text, marginTop: spacing.xs, marginBottom: spacing.sm },
    menuRow: { paddingBottom: spacing.md },
    menuCard: {
      width: 110,
      marginRight: spacing.xs,
      padding: spacing.xs,
      borderRadius: radii.md,
      borderWidth: 1.5
    },
    menuThumb: {
      width: '100%',
      height: 56,
      borderRadius: radii.sm,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
      overflow: 'hidden'
    },
    menuThumbImage: { width: '100%', height: '100%' },
    menuName: { ...typography.tiny, color: colors.text },
    menuPrice: { ...typography.tiny, color: colors.primary, marginTop: 1 },
    manageMenuLink: { ...typography.caption, color: colors.primary, marginBottom: spacing.md },
    photoBox: {
      height: 160,
      borderRadius: radii.lg,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
      overflow: 'hidden'
    },
    photo: { width: '100%', height: '100%' },
    photoLabel: { ...typography.bodyStrong, color: colors.textMuted }
  });

  const choosePhoto = async () => {
    const asset = await pickImage();
    if (asset) {
      setImage(asset);
      setCatalogImageUrl(null);
    }
  };

  const pickFromMenu = (item) => {
    setSelectedItemId(item.id);
    setForm((f) => ({
      ...f,
      title: item.name,
      description: item.description || '',
      original_price: item.original_price ? String(item.original_price) : f.original_price,
      discounted_price: item.discounted_price ? String(item.discounted_price) : f.discounted_price
    }));
    setImage(null);
    setCatalogImageUrl(item.image_url || null);
  };

  const submit = async () => {
    setError('');
    const { title, original_price, discounted_price, quantity_available, pickupStartHours, pickupEndHours } = form;

    if (!title.trim()) return setError(t('partnerDashboard.errorTitleRequired'));
    if (!original_price || Number(original_price) <= 0) return setError(t('partnerDashboard.errorOriginalPrice'));
    if (!discounted_price || Number(discounted_price) <= 0) return setError(t('partnerDashboard.errorDiscountedPrice'));
    if (Number(discounted_price) >= Number(original_price)) return setError(t('partnerDashboard.errorPriceOrder'));
    if (!quantity_available || Number(quantity_available) <= 0) return setError(t('partnerDashboard.errorQuantity'));
    if (!pickupStartHours || !pickupEndHours || Number(pickupEndHours) <= Number(pickupStartHours)) {
      return setError(t('partnerDashboard.errorPickupWindow'));
    }

    setLoading(true);
    let createdListing = null;
    try {
      const now = Date.now();
      const start = new Date(now + Number(pickupStartHours) * 60 * 60 * 1000).toISOString();
      const end = new Date(now + Number(pickupEndHours) * 60 * 60 * 1000).toISOString();
      createdListing = await createPartnerListing({
        title: form.title,
        description: form.description,
        original_price: Number(original_price),
        discounted_price: Number(discounted_price),
        quantity_available: Number(quantity_available),
        pickup_window_start: start,
        pickup_window_end: end,
        expires_at: end,
        image_url: !image ? catalogImageUrl : undefined
      });
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return;
    }

    // The bag is already created at this point — a photo upload hiccup shouldn't
    // make it look like the whole thing failed, so it's handled separately.
    if (image) {
      try {
        await uploadListingImage(createdListing.id, image);
      } catch (err) {
        setLoading(false);
        setError(t('partnerDashboard.errorPhotoUpload'));
        return;
      }
    }
    setLoading(false);
    navigation.goBack();
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('partnerDashboard.create')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {menuItems.length > 0 ? (
        <>
          <Text style={styles.menuLabel}>{t('partnerDashboard.pickFromMenu')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menuRow}>
            {menuItems.map((item) => {
              const active = selectedItemId === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.menuCard, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryTint : colors.surface }]}
                  onPress={() => pickFromMenu(item)}
                >
                  <View style={styles.menuThumb}>
                    {item.image_url ? (
                      <Image source={{ uri: item.image_url }} style={styles.menuThumbImage} />
                    ) : (
                      <Icon name="fast-food-outline" size={18} color={colors.textFaint} />
                    )}
                  </View>
                  <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
                  {item.discounted_price ? (
                    <Text style={styles.menuPrice}>{formatRupees(item.discounted_price)}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      ) : null}
      <Text style={styles.manageMenuLink} onPress={() => navigation.navigate('PartnerMenu')}>
        {t('partnerDashboard.manageMenu')}
      </Text>

      <Pressable style={styles.photoBox} onPress={choosePhoto}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.photo} />
        ) : catalogImageUrl ? (
          <Image source={{ uri: catalogImageUrl }} style={styles.photo} />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Icon name="camera-outline" size={30} color={colors.textMuted} />
            <Text style={styles.photoLabel}>{t('partnerDashboard.addPhoto')}</Text>
          </View>
        )}
      </Pressable>

      <Input label={t('partnerDashboard.titleField')} value={form.title} onChangeText={update('title')} />
      <Input
        label={t('partnerDashboard.descriptionField')}
        value={form.description}
        onChangeText={update('description')}
        multiline
      />
      <Input
        label={t('partnerDashboard.originalPriceField')}
        value={form.original_price}
        onChangeText={update('original_price')}
        keyboardType="numeric"
      />
      <Input
        label={t('partnerDashboard.discountedPriceField')}
        value={form.discounted_price}
        onChangeText={update('discounted_price')}
        keyboardType="numeric"
      />
      <Input
        label={t('partnerDashboard.quantityField')}
        value={form.quantity_available}
        onChangeText={update('quantity_available')}
        keyboardType="numeric"
      />
      <Input
        label={t('partnerDashboard.pickupStartField')}
        value={form.pickupStartHours}
        onChangeText={update('pickupStartHours')}
        keyboardType="numeric"
      />
      <Input
        label={t('partnerDashboard.pickupEndField')}
        value={form.pickupEndHours}
        onChangeText={update('pickupEndHours')}
        keyboardType="numeric"
      />
      <Button title={t('partnerDashboard.create')} onPress={submit} loading={loading} style={{ marginTop: spacing.sm }} />
    </ScreenContainer>
  );
}
