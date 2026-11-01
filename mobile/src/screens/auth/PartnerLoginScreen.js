import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../context/AuthContext';

export default function PartnerLoginScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();
  const { loginPartner } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.xs },
    hint: { ...typography.caption, color: colors.textFaint, marginBottom: spacing.lg },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
    linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md, gap: 6 },
    link: { ...typography.bodyStrong, color: colors.primary },
    linkText: { ...typography.body, color: colors.textMuted }
  });

  const submit = async () => {
    setError('');
    if (!email.trim()) return setError(t('auth.errorEmailRequired'));
    if (!password) return setError(t('auth.errorPasswordRequired'));
    setLoading(true);
    try {
      await loginPartner({ email: email.trim(), password });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('auth.partnerLogin')}</Text>
      <Text style={styles.hint}>manager@bombay.bites.bakery.mealify.demo / partner123</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Input
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="manager@partner.mealify.demo"
      />
      <Input
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />
      <Button title={t('auth.login')} onPress={submit} loading={loading} style={{ marginTop: spacing.sm }} />
      <View style={styles.linkRow}>
        <Text style={styles.linkText}>{t('partnerSignup.noStore')}</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('PartnerSignup')}>{t('partnerSignup.setupStore')}</Text>
      </View>
    </ScreenContainer>
  );
}
