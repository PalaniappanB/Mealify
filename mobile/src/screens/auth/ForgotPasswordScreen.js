import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { forgotPassword } from '../../api/auth';

export default function ForgotPasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const { resetPasswordLogin } = useAuth();

  const [step, setStep] = useState('phone'); // phone | reset
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [devHint, setDevHint] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.xs },
    hint: { ...typography.caption, color: colors.textFaint, marginBottom: spacing.lg },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
    resend: { ...typography.bodyStrong, color: colors.primary, textAlign: 'center', marginTop: spacing.md },
    devBanner: {
      backgroundColor: colors.secondaryTint,
      borderRadius: radii.md,
      padding: spacing.sm,
      marginBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs
    },
    devBannerText: { ...typography.bodyStrong, color: colors.secondaryDark, flex: 1 }
  });

  const sendCode = async () => {
    setError('');
    if (!phone.trim()) return setError(t('auth.errorPhoneRequired'));
    setLoading(true);
    try {
      const { devHint: hint } = await forgotPassword(phone.trim());
      setDevHint(hint || '');
      setCode(hint || '');
      setStep('reset');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async () => {
    setError('');
    if (!code.trim()) return setError(t('auth.errorCodeRequired'));
    if (!newPassword || newPassword.length < 6) return setError(t('auth.errorPasswordTooShort'));
    setLoading(true);
    try {
      await resetPasswordLogin({ phone: phone.trim(), code: code.trim(), newPassword });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('auth.forgotPasswordTitle')}</Text>
      <Text style={styles.hint}>{t('auth.forgotPasswordSubtitle')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {step === 'phone' ? (
        <>
          <Input
            label={t('auth.phone')}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="9820011122"
          />
          <Button title={t('auth.sendCode')} onPress={sendCode} loading={loading} style={{ marginTop: spacing.sm }} />
        </>
      ) : (
        <>
          <Text style={[typography.body, { color: colors.textMuted, marginBottom: spacing.sm }]}>
            {t('auth.codeSentTo', { phone })}
          </Text>
          {devHint ? (
            <View style={styles.devBanner}>
              <Icon name="flask-outline" size={18} color={colors.secondaryDark} />
              <Text style={styles.devBannerText}>{t('auth.devCodeBanner', { code: devHint })}</Text>
            </View>
          ) : null}
          <Input
            label={t('auth.enterCode')}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="1234"
          />
          <Input
            label={t('auth.newPassword')}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="••••••••"
          />
          <Button title={t('auth.resetPassword')} onPress={submitReset} loading={loading} style={{ marginTop: spacing.sm }} />
          <Text style={styles.resend} onPress={sendCode}>{t('auth.resend')}</Text>
        </>
      )}
    </ScreenContainer>
  );
}
