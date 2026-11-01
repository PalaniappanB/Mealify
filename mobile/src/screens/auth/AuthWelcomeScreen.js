import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import { LogoMark } from '../../components/Logo';
import { useTheme } from '../../theme/ThemeProvider';

export default function AuthWelcomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();

  const styles = StyleSheet.create({
    hero: { alignItems: 'center', marginTop: spacing.xxl, marginBottom: spacing.xl },
    title: { ...typography.display, color: colors.text, textAlign: 'center', marginTop: spacing.sm },
    subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.md },
    actions: { marginTop: 'auto', gap: spacing.sm },
    linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md, gap: 6 },
    link: { ...typography.bodyStrong, color: colors.primary },
    linkText: { ...typography.body, color: colors.textMuted },
    partnerLink: { alignItems: 'center', marginTop: spacing.lg }
  });

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <View style={styles.hero}>
        <LogoMark size={72} />
        <Text style={styles.title}>{t('auth.welcomeTitle')}</Text>
        <Text style={styles.subtitle}>{t('auth.welcomeSubtitle')}</Text>
      </View>

      <View style={styles.actions}>
        <Button title={t('auth.loginWithPassword')} onPress={() => navigation.navigate('Login')} />
        <Button title={t('auth.loginWithOtp')} variant="outline" onPress={() => navigation.navigate('OtpLogin')} />
        <View style={styles.linkRow}>
          <Text style={styles.linkText}>{t('auth.noAccount')}</Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>{t('auth.signup')}</Text>
        </View>
        <View style={styles.partnerLink}>
          <Text style={styles.link} onPress={() => navigation.navigate('PartnerLogin')}>{t('auth.partnerLogin')} →</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
