import React, { useRef, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginScreen() {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.xs },
    hint: { ...typography.caption, color: colors.textFaint, marginBottom: spacing.lg },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm }
  });

  const submit = async () => {
    setError('');
    if (!email.trim()) return setError(t('auth.errorEmailRequired'));
    if (!password) return setError(t('auth.errorPasswordRequired'));
    setLoading(true);
    try {
      await loginAdmin({ email: email.trim(), password });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('auth.adminLogin')}</Text>
      <Text style={styles.hint}>admin@mealify.demo / admin123</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Input
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="admin@mealify.demo"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        blurOnSubmit={false}
      />
      <Input
        ref={passwordRef}
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <Button title={t('auth.login')} onPress={submit} loading={loading} style={{ marginTop: spacing.sm }} />
    </ScreenContainer>
  );
}
