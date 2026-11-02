import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();
  const { loginCustomer } = useAuth();
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
      await loginCustomer({ email: email.trim(), password });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('auth.login')}</Text>
      <Text style={styles.hint}>{t('auth.demoCreds')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Input
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <Input
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />
      <Button title={t('auth.login')} onPress={submit} loading={loading} style={{ marginTop: spacing.sm }} />
      <Text
        style={[styles.link, { textAlign: 'center', marginTop: spacing.md }]}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        {t('auth.forgotPassword')}
      </Text>
      <View style={styles.linkRow}>
        <Text style={styles.linkText}>{t('auth.noAccount')}</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>{t('auth.signup')}</Text>
      </View>
    </ScreenContainer>
  );
}
