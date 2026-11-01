import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import i18n from '../../i18n';

export const LANGUAGE_CHOSEN_KEY = 'mealify_language_chosen';

export default function LanguageSelectScreen({ onDone }) {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const [selected, setSelected] = useState(i18n.language || 'en');

  const styles = StyleSheet.create({
    header: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
    emoji: { fontSize: 44, marginBottom: spacing.sm },
    title: { ...typography.h1, color: colors.text, textAlign: 'center' },
    subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxs },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      borderRadius: radii.md,
      borderWidth: 1.5,
      marginBottom: spacing.sm
    },
    optionText: { ...typography.h3 },
    check: { ...typography.h3 },
    footer: { marginTop: 'auto', paddingTop: spacing.lg }
  });

  const choose = async () => {
    i18n.changeLanguage(selected);
    await AsyncStorage.setItem(LANGUAGE_CHOSEN_KEY, 'true');
    onDone();
  };

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🌐</Text>
        <Text style={styles.title}>{t('language.select')}</Text>
        <Text style={styles.subtitle}>{t('language.subtitle')}</Text>
      </View>

      {SUPPORTED_LANGUAGES.map((lang) => {
        const active = selected === lang.code;
        return (
          <Pressable
            key={lang.code}
            onPress={() => setSelected(lang.code)}
            style={[
              styles.option,
              {
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primaryTint : colors.surface
              }
            ]}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>{lang.label}</Text>
            {active ? <Text style={[styles.check, { color: colors.primary }]}>✓</Text> : null}
          </Pressable>
        );
      })}

      <View style={styles.footer}>
        <Button title={t('language.continue')} onPress={choose} />
      </View>
    </ScreenContainer>
  );
}
