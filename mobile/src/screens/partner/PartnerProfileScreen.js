import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { uploadPartnerLogo } from '../../api/orders';
import { pickImage } from '../../utils/pickImage';

export default function PartnerProfileScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const { staff, logout } = useAuth();
  const [logoUrl, setLogoUrl] = useState(staff?.logo_url || null);
  const [uploading, setUploading] = useState(false);

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
    card: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: radii.pill,
      backgroundColor: colors.secondaryTint,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
      overflow: 'hidden'
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarText: { ...typography.h2, color: colors.secondaryDark },
    name: { ...typography.h2, color: colors.text },
    meta: { ...typography.caption, color: colors.textMuted },
    photoLink: { ...typography.caption, color: colors.primary, marginTop: spacing.xxs }
  });

  const changeLogo = async () => {
    const asset = await pickImage();
    if (!asset) return;
    setUploading(true);
    try {
      const partner = await uploadPartnerLogo(asset);
      setLogoUrl(partner.logo_url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <Text style={styles.title}>{t('profile.title')}</Text>
      <Card style={styles.card}>
        <Pressable style={styles.avatar} onPress={changeLogo}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{staff?.partner_name?.[0] || 'P'}</Text>
          )}
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{staff?.partner_name}</Text>
          <Text style={styles.meta}>{staff?.name} · {staff?.email}</Text>
          <Text style={styles.meta}>{staff?.cuisine_type} · {staff?.city}</Text>
          <Text style={styles.photoLink} onPress={changeLogo}>
            {uploading ? t('partnerDashboard.uploadingPhoto') : logoUrl ? t('partnerDashboard.changePhoto') : t('partnerDashboard.addPhoto')}
          </Text>
        </View>
      </Card>
      <Button title={t('profile.logout')} variant="outline" onPress={logout} style={{ marginTop: spacing.xl }} />
    </ScreenContainer>
  );
}
