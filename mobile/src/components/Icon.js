import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

// Single place every icon in the app goes through, so size/color defaults and
// the icon family stay consistent instead of mixing emoji and ad-hoc glyphs.
export default function Icon({ name, size = 20, color, style }) {
  const { colors } = useTheme();
  return <Ionicons name={name} size={size} color={color || colors.text} style={style} />;
}
