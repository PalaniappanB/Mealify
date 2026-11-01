import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListingCard from '../../components/ListingCard';
import LoadingView from '../../components/LoadingView';
import { LogoMark } from '../../components/Logo';
import { useTheme } from '../../theme/ThemeProvider';
import { searchWithAi } from '../../api/chat';
import { useLocation } from '../../context/LocationContext';

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

  const send = async () => {
    const text = input.trim();
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
    },
    sendIcon: { fontSize: 18, color: colors.onPrimary }
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
            <Text style={styles.sendIcon}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
