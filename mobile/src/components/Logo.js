import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

// Mealify's mark: a rescued takeout bag with a folded turmeric top and a small
// "spark" accent standing in for the good food inside — deliberately not the
// leaf/eco iconography most surplus-food apps use.
export function LogoMark({ size = 64, onPrimary = false }) {
  const { colors } = useTheme();
  // On a colored (primary) background the bag body switches to cream so it
  // doesn't disappear into a same-color backdrop; the fold/spark stay turmeric.
  const bagColor = onPrimary ? colors.onPrimary : colors.primary;
  const foldColor = colors.secondary;
  const foldShade = onPrimary ? 'rgba(255,255,255,0.55)' : colors.secondaryTint;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M28 34 L72 34 L82 86 Q82.5 92 76 92 L24 92 Q17.5 92 18 86 Z"
        fill={bagColor}
      />
      <Rect x="30" y="21" width="40" height="15" rx="6" fill={foldColor} />
      <Path d="M40 47 Q50 40 60 47 Q50 54 40 47 Z" fill={foldShade} />
      <Circle cx="79" cy="20" r="6" fill={foldColor} />
      <Path d="M79 12 L79 16 M79 24 L79 28 M71 20 L75 20 M83 20 L87 20" stroke={foldColor} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}

export default function Logo({ size = 64, showWordmark = true, tone = 'default' }) {
  const { colors, spacing, typography } = useTheme();
  const wordColor = tone === 'inverted' ? colors.onPrimary : colors.text;

  const styles = StyleSheet.create({
    row: { alignItems: 'center' },
    wordmark: { ...typography.h1, color: wordColor, marginTop: spacing.xs, letterSpacing: -0.5 }
  });

  return (
    <View style={styles.row}>
      <LogoMark size={size} onPrimary={tone === 'inverted'} />
      {showWordmark ? <Text style={styles.wordmark}>Mealify</Text> : null}
    </View>
  );
}
