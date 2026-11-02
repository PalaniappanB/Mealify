import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import i18n from '../../i18n';
import { formatDate, formatRupees } from '../../utils/format';
import { fetchImpactSummary } from '../../api/orders';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const { user, updateLanguage, updateProfile, logout } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    fetchImpactSummary().then(setImpact).catch(() => {});
  }, []);

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
    avatarCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: radii.pill,
      backgroundColor: colors.primaryTint,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
      overflow: 'hidden'
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarText: { ...typography.h2, color: colors.primary },
    name: { ...typography.h2, color: colors.text },
    meta: { ...typography.caption, color: colors.textMuted },
    editHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    editLink: { ...typography.bodyStrong, color: colors.primary },
    sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
    langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    langChip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.md, borderWidth: 1.5 },
    langText: { ...typography.bodyStrong },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
    impactRow: { flexDirection: 'row', gap: spacing.sm },
    impactCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
    impactValue: { ...typography.h1, color: colors.primary },
    impactLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2, textAlign: 'center' }
  });

  const startEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setError('');
    setEditing(true);
  };

  const save = async () => {
    setError('');
    if (!name.trim()) {
      setError(t('auth.errorNameRequired'));
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('profile.title')}</Text>

      {editing ? (
        <Card style={{ marginBottom: spacing.md }}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Input label={t('auth.name')} value={name} onChangeText={setName} />
          <Input label={t('auth.email')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Input label={t('auth.phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
            <Button title={t('common.cancel')} variant="outline" onPress={() => setEditing(false)} style={{ flex: 1 }} />
            <Button title={t('common.save')} onPress={save} loading={saving} style={{ flex: 1 }} />
          </View>
        </Card>
      ) : (
        <Card style={styles.avatarCard}>
          <View style={styles.avatar}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.editHeaderRow}>
              <Text style={styles.name}>{user?.name}</Text>
              <Pressable onPress={startEdit}>
                <Text style={styles.editLink}>{t('profile.edit')}</Text>
              </Pressable>
            </View>
            <Text style={styles.meta}>{user?.email || '—'}</Text>
            <Text style={styles.meta}>{user?.phone || '—'}</Text>
            {user?.created_at ? (
              <Text style={styles.meta}>{t('profile.memberSince', { date: formatDate(user.created_at) })}</Text>
            ) : null}
          </View>
        </Card>
      )}

      {impact ? (
        <>
          <Text style={styles.sectionTitle}>{t('reports.impactTitle')}</Text>
          <View style={styles.impactRow}>
            <Card style={styles.impactCard}>
              <Text style={styles.impactValue}>{impact.bags_rescued}</Text>
              <Text style={styles.impactLabel}>{t('reports.bagsRescued')}</Text>
            </Card>
            <Card style={styles.impactCard}>
              <Text style={styles.impactValue}>{formatRupees(impact.total_saved)}</Text>
              <Text style={styles.impactLabel}>{t('reports.moneySaved')}</Text>
            </Card>
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
      <View style={styles.langRow}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const active = i18n.language === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => updateLanguage(lang.code)}
              style={[
                styles.langChip,
                { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryTint : colors.surface }
              ]}
            >
              <Text style={[styles.langText, { color: active ? colors.primary : colors.text }]}>{lang.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button title={t('profile.logout')} variant="outline" onPress={logout} style={{ marginTop: spacing.xl }} />
    </ScreenContainer>
  );
}
