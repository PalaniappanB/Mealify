import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListingCard from '../../components/ListingCard';
import LoadingView from '../../components/LoadingView';
import { LogoMark } from '../../components/Logo';
import Icon from '../../components/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { searchWithAi } from '../../api/chat';
import { useLocation } from '../../context/LocationContext';

const SUGGESTIONS = [
  { icon: 'pricetag-outline', labelKey: 'aiSearch.chipBudget', query: 'something good under 100 rupees' },
  { icon: 'flame-outline', labelKey: 'aiSearch.chipSpicy', query: 'something spicy' },
  { icon: 'sunny-outline', labelKey: 'aiSearch.chipBreakfast', query: 'good for breakfast' },
  { icon: 'ice-cream-outline', labelKey: 'aiSearch.chipSweet', query: 'something sweet' },
  { icon: 'nutrition-outline', labelKey: 'aiSearch.chipHealthy', query: 'something healthy' }
];

export default function AiSearchScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, spacing, radii, typography, shadows } = useTheme();
  const location = useLocation();
  const listRef = useRef(null);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 'intro', role: 'assistant', text: t('aiSearch.intro'), listings: [] }
  ]);
  const [loading, setLoading] = useState(false);

  const runSearch = async (text) => {
    if (!text || loading) return;
    setInput('');
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const { reply, listings } = await searchWithAi(text, location);
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'assistant', text: reply, listings }]);
    } catch (err) {
      setMessages((m) => [...m, { id: `e-${Date.now()}`, role: 'assistant', text: t('aiSearch.error'), listings: [] }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const send = () => runSearch(input.trim());
  const sendSuggestion = (query) => runSearch(query);

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    list: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.lg },
    bubbleRow: { marginBottom: spacing.md },
    assistantRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
    avatar: {
      width: 30,
      height: 30,
      borderRadius: radii.pill,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.raised
    },
    userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primary,
      borderRadius: radii.lg,
      borderBottomRightRadius: radii.stamp,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      maxWidth: '85%',
      ...shadows.raised
    },
    userText: { ...typography.body, color: colors.onPrimary },
    assistantBubble: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      borderBottomLeftRadius: radii.stamp,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      maxWidth: '85%',
      ...shadows.raised
    },
    assistantText: { ...typography.body, color: colors.text },
    resultsWrap: { marginTop: spacing.sm, gap: spacing.xs, paddingLeft: 38 },
    suggestionsRow: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
    suggestionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radii.pill,
      paddingVertical: 7,
      paddingHorizontal: 12,
      marginRight: spacing.xs
    },
    suggestionText: { ...typography.caption, color: colors.text },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.xs
    },
    input: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: radii.pill,
      borderWidth: 1.5,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      ...typography.body,
      color: colors.text
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: radii.pill,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.raised
    }
  });

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={styles.bubbleRow}>
              {item.role === 'user' ? (
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{item.text}</Text>
                </View>
              ) : (
                <View style={styles.assistantRow}>
                  <View style={styles.avatar}>
                    <LogoMark size={20} />
                  </View>
                  <View style={styles.assistantBubble}>
                    <Text style={styles.assistantText}>{item.text}</Text>
                  </View>
                </View>
              )}
              {item.listings?.length > 0 && (
                <View style={styles.resultsWrap}>
                  {item.listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onPress={() => navigation.navigate('PartnerDetail', { partnerId: listing.partner_id })}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
          ListFooterComponent={loading ? <LoadingView label={t('aiSearch.thinking')} /> : null}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsRow}>
          {SUGGESTIONS.map((s) => (
            <Pressable key={s.labelKey} style={styles.suggestionChip} onPress={() => sendSuggestion(s.query)} disabled={loading}>
              <Icon name={s.icon} size={14} color={colors.primary} />
              <Text style={styles.suggestionText}>{t(s.labelKey)}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t('aiSearch.placeholder')}
            placeholderTextColor={colors.textFaint}
            onSubmitEditing={send}
            returnKeyType="send"
            numberOfLines={1}
            multiline={false}
          />
          <Pressable style={styles.sendBtn} onPress={send} disabled={loading}>
            <Icon name="send" size={18} color={colors.onPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
