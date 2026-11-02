import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../context/AuthContext';

export default function PartnerSignupScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const { signupPartner } = useAuth();

  const [form, setForm] = useState({
    storeName: '',
    cuisineType: '',
    address: '',
    city: '',
    staffName: '',
    email: '',
    password: ''
  });
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.xs },
    hint: { ...typography.caption, color: colors.textFaint, marginBottom: spacing.lg },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
    sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
    locationBox: {
      backgroundColor: coords ? colors.successTint : colors.surfaceAlt,
      borderRadius: radii.md,
      padding: spacing.sm,
      marginBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs
    },
    locationText: { ...typography.caption, color: coords ? colors.success : colors.textMuted, flex: 1 }
  });

  const detectLocation = async () => {
    setError('');
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError(t('partnerSignup.locationDenied'));
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    } catch (err) {
      setError(t('partnerSignup.locationFailed'));
    } finally {
      setLocating(false);
    }
  };

  const submit = async () => {
    setError('');
    const { storeName, cuisineType, address, city, staffName, email, password } = form;
    if (!storeName.trim()) return setError(t('partnerSignup.errorStoreName'));
    if (!cuisineType.trim()) return setError(t('partnerSignup.errorCuisine'));
    if (!address.trim() || !city.trim()) return setError(t('partnerSignup.errorAddress'));
    if (!coords) return setError(t('partnerSignup.errorLocation'));
    if (!staffName.trim()) return setError(t('auth.errorNameRequired'));
    if (!email.trim()) return setError(t('auth.errorEmailRequired'));
    if (!password || password.length < 6) return setError(t('auth.errorPasswordTooShort'));

    setLoading(true);
    try {
      await signupPartner({
        storeName: storeName.trim(),
        cuisineType: cuisineType.trim(),
        address: address.trim(),
        city: city.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        staffName: staffName.trim(),
        email: email.trim(),
        password
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('partnerSignup.title')}</Text>
      <Text style={styles.hint}>{t('partnerSignup.subtitle')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>{t('partnerSignup.storeSection')}</Text>
      <Input label={t('partnerSignup.storeName')} value={form.storeName} onChangeText={update('storeName')} placeholder="Bombay Bites Bakery" />
      <Input label={t('partnerSignup.cuisine')} value={form.cuisineType} onChangeText={update('cuisineType')} placeholder="Bakery" />
      <Input label={t('partnerSignup.address')} value={form.address} onChangeText={update('address')} placeholder="Linking Road, Bandra West" />
      <Input label={t('partnerSignup.city')} value={form.city} onChangeText={update('city')} placeholder="Mumbai" />

      <View style={styles.locationBox}>
        <Icon name="location" size={16} color={coords ? colors.success : colors.textMuted} />
        <Text style={styles.locationText}>
          {coords ? t('partnerSignup.locationCaptured') : t('partnerSignup.locationNeeded')}
        </Text>
      </View>
      <Button
        title={locating ? t('location.locating') : t('partnerSignup.detectLocation')}
        variant="outline"
        onPress={detectLocation}
        loading={locating}
        style={{ marginBottom: spacing.md }}
      />

      <Text style={styles.sectionTitle}>{t('partnerSignup.accountSection')}</Text>
      <Input label={t('auth.name')} value={form.staffName} onChangeText={update('staffName')} placeholder="Store manager name" />
      <Input
        label={t('auth.email')}
        value={form.email}
        onChangeText={update('email')}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input label={t('auth.password')} value={form.password} onChangeText={update('password')} secureTextEntry />

      <Button title={t('partnerSignup.create')} onPress={submit} loading={loading} style={{ marginTop: spacing.sm }} />
    </ScreenContainer>
  );
}
