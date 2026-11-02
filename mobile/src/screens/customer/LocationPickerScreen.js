import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Icon from '../../components/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useLocation } from '../../context/LocationContext';

export default function LocationPickerScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const { addresses, useDeviceLocation, useAddress, saveNewAddress, latitude, longitude } = useLocation();

  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
    sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
    addressCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    addressIconWrap: {
      width: 36,
      height: 36,
      borderRadius: radii.pill,
      backgroundColor: colors.primaryTint,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm
    },
    addressLabel: { ...typography.bodyStrong, color: colors.text },
    addressText: { ...typography.caption, color: colors.textMuted },
    addNewLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
    addNewLinkText: { ...typography.bodyStrong, color: colors.primary }
  });

  const handleUseGps = async () => {
    setError('');
    setLocating(true);
    const result = await useDeviceLocation();
    setLocating(false);
    if (!result.granted) {
      setError(t('location.permissionDenied'));
      return;
    }
    navigation.goBack();
  };

  const handleSaveAddress = async () => {
    if (!newLabel.trim()) return;
    setSaving(true);
    try {
      await saveNewAddress(newLabel.trim(), newNote.trim() || newLabel.trim(), { latitude, longitude });
      setShowAddForm(false);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('location.title')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title={locating ? t('location.locating') : t('location.useCurrentGps')}
        onPress={handleUseGps}
        loading={locating}
      />

      {addresses.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{t('location.savedAddresses')}</Text>
          <FlatList
            data={addresses}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  useAddress(item);
                  navigation.goBack();
                }}
              >
                <Card style={styles.addressCard}>
                  <View style={styles.addressIconWrap}>
                    <Icon name="location" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addressLabel}>{item.label}</Text>
                    <Text style={styles.addressText} numberOfLines={1}>{item.address_text}</Text>
                  </View>
                </Card>
              </Pressable>
            )}
          />
        </>
      ) : null}

      {showAddForm ? (
        <Card style={{ marginTop: spacing.md }}>
          <Input label={t('location.labelField')} value={newLabel} onChangeText={setNewLabel} placeholder="Home" />
          <Input label={t('location.addressField')} value={newNote} onChangeText={setNewNote} placeholder="Near main gate" />
          <Button title={t('location.save')} onPress={handleSaveAddress} loading={saving} style={{ marginTop: spacing.xs }} />
        </Card>
      ) : (
        <Pressable style={styles.addNewLink} onPress={() => setShowAddForm(true)}>
          <Icon name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.addNewLinkText}>{t('location.addNew')}</Text>
        </Pressable>
      )}
    </ScreenContainer>
  );
}
