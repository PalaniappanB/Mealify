import React, { useState } from 'react';
import { Text, View, Image, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { createPartnerItem, updatePartnerItem, uploadItemImage } from '../../api/items';
import { pickImage } from '../../utils/pickImage';

export default function EditMenuItemScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const existing = route.params?.item || null;

  const [form, setForm] = useState({
    name: existing?.name || '',
    description: existing?.description || '',
    category: existing?.category || '',
    original_price: existing?.original_price ? String(existing.original_price) : '',
    discounted_price: existing?.discounted_price ? String(existing.discounted_price) : ''
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
    photoBox: {
      height: 140,
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
    photoLabel: { ...typography.bodyStrong, color: colors.textMuted, marginTop: spacing.xxs }
  });

  const choosePhoto = async () => {
    const asset = await pickImage();
    if (asset) setImage(asset);
  };

  const submit = async () => {
    setError('');
    if (!form.name.trim()) return setError(t('partnerDashboard.errorTitleRequired'));
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        category: form.category.trim() || undefined,
        original_price: form.original_price ? Number(form.original_price) : undefined,
        discounted_price: form.discounted_price ? Number(form.discounted_price) : undefined
      };
      const saved = existing ? await updatePartnerItem(existing.id, payload) : await createPartnerItem(payload);
      if (image) {
        await uploadItemImage(saved.id, image);
      }
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{existing ? t('partnerDashboard.editItem') : t('partnerDashboard.addItem')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.photoBox} onPress={choosePhoto}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.photo} />
        ) : existing?.image_url ? (
          <Image source={{ uri: existing.image_url }} style={styles.photo} />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Icon name="camera-outline" size={28} color={colors.textMuted} />
            <Text style={styles.photoLabel}>{t('partnerDashboard.addPhoto')}</Text>
          </View>
        )}
      </Pressable>

      <Input label={t('partnerDashboard.itemName')} value={form.name} onChangeText={update('name')} placeholder="Masala Dosa" />
      <Input
        label={t('partnerDashboard.descriptionField')}
        value={form.description}
        onChangeText={update('description')}
        multiline
      />
      <Input label={t('partnerDashboard.itemCategory')} value={form.category} onChangeText={update('category')} placeholder="Breakfast" />
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
      <Button
        title={existing ? t('common.save') : t('partnerDashboard.addItem')}
        onPress={submit}
        loading={loading}
        style={{ marginTop: spacing.sm }}
      />
    </ScreenContainer>
  );
}
