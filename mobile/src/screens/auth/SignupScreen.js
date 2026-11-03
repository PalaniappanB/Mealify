import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();
  const { signupCustomer } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.lg },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
    linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md, gap: 6 },
    link: { ...typography.bodyStrong, color: colors.primary },
    linkText: { ...typography.body, color: colors.textMuted },
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg, gap: spacing.sm },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: { ...typography.caption, color: colors.textFaint }
  });

  const submit = async () => {
    setError('');
    if (!name.trim()) return setError(t('auth.errorNameRequired'));
    if (!email.trim() && !phone.trim()) return setError(t('auth.errorContactRequired'));
    if (!password) return setError(t('auth.errorPasswordRequired'));
    if (password.length < 6) return setError(t('auth.errorPasswordTooShort'));
    setLoading(true);
    try {
      await signupCustomer({ name, email: email.trim() || undefined, phone: phone.trim() || undefined, password });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('auth.signup')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Input
        label={t('auth.name')}
        value={name}
        onChangeText={setName}
        placeholder="Aditi Sharma"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        blurOnSubmit={false}
      />
      <Input
        ref={emailRef}
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
        returnKeyType="next"
        onSubmitEditing={() => phoneRef.current?.focus()}
        blurOnSubmit={false}
      />
      <Input
        ref={phoneRef}
        label={t('auth.phone')}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="9820011122"
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
      <Button title={t('auth.signup')} onPress={submit} loading={loading} style={{ marginTop: spacing.sm }} />

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{t('auth.or')}</Text>
        <View style={styles.dividerLine} />
      </View>
      <Button
        title={t('auth.signupWithPhone')}
        variant="outline"
        onPress={() => navigation.navigate('OtpLogin')}
      />

      <View style={styles.linkRow}>
        <Text style={styles.linkText}>{t('auth.haveAccount')}</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>{t('auth.login')}</Text>
      </View>
    </ScreenContainer>
  );
}
