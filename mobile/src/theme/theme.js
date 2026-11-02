// Single source of truth for Mealify's design system.
// Every screen/component should read colors, spacing, radii, type and shadows from here
// via the `useTheme()` hook — never inline hex codes or magic numbers in a screen.
//
// Style direction: soft & minimal — a deep wine/burgundy primary with a muted
// gold accent against generous cream/white space, restrained type weights, and
// diffuse low-opacity shadows instead of hard borders or bold color blocks.
// (Moved off the earlier terracotta/turmeric — too orange — per design feedback.)

const palette = {
  wine: '#7A2E3F',
  wineDark: '#5A1F2E',
  wineTint: '#F2DEE3',
  gold: '#C9A646',
  goldDark: '#A3832E',
  goldTint: '#F7EFD8',
  ink: '#352B2E',
  inkSoft: '#73666A',
  inkFaint: '#A99DA0',
  cream: '#FBF8F6',
  card: '#FFFFFF',
  sand: '#F2EAE8',
  border: '#EBE1DF',
  success: '#4F8F6E',
  successTint: '#E1F0E7',
  danger: '#B8544A',
  dangerTint: '#F6E1DE',
  overlay: 'rgba(53, 43, 46, 0.5)'
};

export const colors = {
  primary: palette.wine,
  primaryDark: palette.wineDark,
  primaryTint: palette.wineTint,
  secondary: palette.gold,
  secondaryDark: palette.goldDark,
  secondaryTint: palette.goldTint,
  background: palette.cream,
  surface: palette.card,
  surfaceAlt: palette.sand,
  border: palette.border,
  text: palette.ink,
  textMuted: palette.inkSoft,
  textFaint: palette.inkFaint,
  onPrimary: '#FFFFFF',
  success: palette.success,
  successTint: palette.successTint,
  danger: palette.danger,
  dangerTint: palette.dangerTint,
  overlay: palette.overlay
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999,
  stamp: 8
};

export const typography = {
  display: { fontSize: 30, fontWeight: '700', letterSpacing: -0.4 },
  h1: { fontSize: 24, fontWeight: '700', letterSpacing: -0.2 },
  h2: { fontSize: 19, fontWeight: '600' },
  h3: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  bodyStrong: { fontSize: 15, fontWeight: '600' },
  caption: { fontSize: 13, fontWeight: '500' },
  eyebrow: { fontSize: 12, fontWeight: '600', letterSpacing: 1.1, textTransform: 'uppercase' },
  tiny: { fontSize: 11, fontWeight: '600' }
};

export const shadows = {
  card: {
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2
  },
  raised: {
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2
  }
};

export const theme = { colors, spacing, radii, typography, shadows };

export default theme;
