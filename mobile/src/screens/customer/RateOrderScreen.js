import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { submitReview } from '../../api/reviews';

export default function RateOrderScreen({ route, navigation }) {
  const { order } = route.params;
  const { t } = useTranslation();
  const { colors, spacing, radii, typography } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const styles = StyleSheet.create({
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
    subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
    starsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg },
    input: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      minHeight: 100,
      textAlignVertical: 'top',
      ...typography.body,
      color: colors.text,
      marginBottom: spacing.lg
    }
  });

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert(t('reviews.pickRatingTitle'), t('reviews.pickRatingMessage'));
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({ order_id: order.id, rating, comment: comment.trim() || undefined });
      navigation.goBack();
    } catch (err) {
      Alert.alert(t('common.error'), err.message || t('reviews.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <Text style={styles.title}>{t('reviews.rateTitle')}</Text>
      <Text style={styles.subtitle}>{t('reviews.rateSubtitle', { partner: order.partner_name })}</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setRating(n)} hitSlop={6}>
            <Icon
              name={n <= rating ? 'star' : 'star-outline'}
              size={36}
              color={n <= rating ? colors.secondaryDark : colors.textFaint}
            />
          </Pressable>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder={t('reviews.commentPlaceholder')}
        placeholderTextColor={colors.textFaint}
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <Button title={t('reviews.submit')} onPress={handleSubmit} loading={submitting} />
    </ScreenContainer>
  );
}
