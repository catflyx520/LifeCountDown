import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Circle, ClipPath, Defs, G } from 'react-native-svg';
import { theme, fonts } from '../theme';

function LogoMark({ size = 54 }: { size?: number }) {
  const scale = size / 54;
  const W = 42 * scale;
  const H = 54 * scale;
  return (
    <Svg width={W} height={H} viewBox="0 0 42 54" fill="none">
      <Defs>
        <ClipPath id="lc1">
          <Path d="M5 5 L37 5 L23 27 L19 27 Z" />
        </ClipPath>
        <ClipPath id="lc2">
          <Path d="M19 27 L23 27 L37 49 L5 49 Z" />
        </ClipPath>
      </Defs>
      {/* Top bar */}
      <Rect x="2" y="1" width="38" height="4" rx="1.5" fill={theme.fg} />
      {/* Bottom bar */}
      <Rect x="2" y="49" width="38" height="4" rx="1.5" fill={theme.fg} />
      {/* Top triangle outline */}
      <Path d="M5 5 L37 5 L23 27 L19 27 Z" stroke={theme.fg} strokeWidth="1.5" fill="none" />
      {/* Bottom triangle outline */}
      <Path d="M19 27 L23 27 L37 49 L5 49 Z" stroke={theme.fg} strokeWidth="1.5" fill="none" />
      {/* Sand top */}
      <G clipPath="url(#lc1)">
        <Rect x="0" y="8" width="42" height="22" fill={theme.accent} />
      </G>
      {/* Falling grain */}
      <Circle cx="21" cy="31" r="1.2" fill={theme.accent} />
      <Circle cx="21" cy="36" r="0.9" fill={theme.accent} opacity="0.6" />
      {/* Sand bottom */}
      <G clipPath="url(#lc2)">
        <Rect x="0" y="38" width="42" height="15" fill={theme.accent} />
      </G>
      {/* Neck clear */}
      <Rect x="18" y="25" width="6" height="5" fill={theme.bg} />
    </Svg>
  );
}

export default function AppSplash() {
  return (
    <View style={styles.container}>
      <View style={styles.wordmark}>
        <LogoMark size={64} />
        <View style={styles.wordmarkText}>
          <Text style={styles.name}>Life Counter</Text>
          <Text style={styles.tagline}>COUNT WHAT'S LEFT</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  wordmarkText: {
    gap: 4,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 36,
    color: theme.fg,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  tagline: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: theme.muted,
    letterSpacing: 3,
  },
});
