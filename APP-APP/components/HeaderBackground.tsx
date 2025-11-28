import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Circle, Rect, Path } from 'react-native-svg';

export type HeaderBackgroundProps = {
  height?: number;
  // Primary brand color stops for pink/magenta theme
  colors?: [string, string];
  patternOpacity?: number; // 0..1
};

// Non-interactive, decorative header background per PRD
export const HeaderBackground = memo(function HeaderBackground({
  height = 160,
  colors = ['#B91C5C', '#EC4899'], // deep magenta -> pink
  patternOpacity = 0.08,
}: HeaderBackgroundProps) {
  return (
    <View pointerEvents="none" style={[styles.root, { height }]}> 
      {/* Gradient base layer */}
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />

      {/* Subtle repeating pattern (non-distracting) */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="patternDots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <Circle cx="6" cy="6" r="1.5" fill="#FFFFFF" opacity={patternOpacity} />
            <Circle cx="18" cy="12" r="1" fill="#FFFFFF" opacity={patternOpacity} />
            <Circle cx="12" cy="18" r="1.25" fill="#FFFFFF" opacity={patternOpacity} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#patternDots)" />
      </Svg>

      {/* Arch-like bottom edge with subtle white outline */}
      <View style={styles.archContainer}>
        <Svg width="100%" height="34" viewBox="0 0 100 34" preserveAspectRatio="none">
          {/* white outline */}
          <Path d="M0 0 Q50 34 100 0 L100 34 L0 34 Z" fill="#FFFFFF" opacity={0.35} />
          {/* overlay the gradient color to soften the outline */}
          <Path d="M0 0 Q50 30 100 0 L100 34 L0 34 Z" fill="rgba(255,255,255,0.15)" />
        </Svg>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  archContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
  },
});
