import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { requestOtp } from '../../api/auth';

export default function OtpLoginScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const { verifyOtpLogin } = useAuth();
  const [step, setStep] = useState('phone'); // phone | code
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
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
      const { devHint: hint } = await requestOtp(phone.trim());
      setDevHint(hint || '');
      setCode(hint || '');
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError('');
    if (!code.trim()) return setError(t('auth.errorCodeRequired'));
    setLoading(true);
    try {
      await verifyOtpLogin({ phone: phone.trim(), code: code.trim(), name: name.trim() || undefined });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('auth.loginWithOtp')}</Text>
      <Text style={styles.hint}>{t('auth.otpHint')}</Text>
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
          <Input label={t('auth.name')} value={name} onChangeText={setName} placeholder="Aditi Sharma" />
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
          <Button title={t('auth.verify')} onPress={verify} loading={loading} style={{ marginTop: spacing.sm }} />
          <Text style={styles.resend} onPress={sendCode}>{t('auth.resend')}</Text>
        </>
      )}
    </ScreenContainer>
  );
}
