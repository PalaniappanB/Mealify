import React, { useEffect, useRef } from 'react';
import { View, Animated, Text, StyleSheet, Easing } from 'react-native';
import { LogoMark } from './Logo';
import { useTheme } from '../theme/ThemeProvider';

export default function LoadingView({ label }) {
  const { colors, spacing, typography } = useTheme();
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 550, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 550, easing: Easing.in(Easing.quad), useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bounce]);

  const translateY = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const scale = bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  const styles = StyleSheet.create({
    wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
    label: { ...typography.body, color: colors.textMuted, marginTop: spacing.md }
  });

  return (
    <View style={styles.wrap}>
      <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
        <LogoMark size={56} />
      </Animated.View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}
