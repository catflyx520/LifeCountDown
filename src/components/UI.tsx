/**
 * Shared primitive UI components used across all screens.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme, fonts } from '../theme';

// ─── Shell ───────────────────────────────────────────────────────────────────
interface ShellProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}
export function Shell({ children, scroll = false, style }: ShellProps) {
  const insets = useSafeAreaInsets();
  const inner: ViewStyle = {
    flex: 1,
    backgroundColor: theme.bg,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
  };
  if (scroll) {
    return (
      <ScrollView
        style={inner}
        contentContainerStyle={[{ paddingHorizontal: 24, paddingBottom: 40 }, style]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }
  return (
    <View style={[inner, { paddingHorizontal: 24 }, style]}>
      {children}
    </View>
  );
}

// ─── Eyebrow ─────────────────────────────────────────────────────────────────
interface EyebrowProps {
  children: React.ReactNode;
  style?: TextStyle;
}
export function Eyebrow({ children, style }: EyebrowProps) {
  return (
    <Text style={[styles.eyebrow, style]}>
      {typeof children === 'string' ? children.toUpperCase() : children}
    </Text>
  );
}

// ─── SerifText ───────────────────────────────────────────────────────────────
interface SerifProps {
  children: React.ReactNode;
  size?: number;
  italic?: boolean;
  style?: TextStyle;
}
export function SerifText({ children, size = 36, italic = false, style }: SerifProps) {
  return (
    <Text style={[
      styles.serif,
      { fontSize: size },
      italic && { fontFamily: fonts.serifItalic },
      style,
    ]}>
      {children}
    </Text>
  );
}

// ─── Btn ─────────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'ghost' | 'solid';
interface BtnProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: BtnVariant;
  style?: ViewStyle;
  disabled?: boolean;
}
export function Btn({ children, onPress, variant = 'primary', style, disabled }: BtnProps) {
  const variantStyle: ViewStyle =
    variant === 'primary'
      ? { backgroundColor: theme.accent }
      : variant === 'ghost'
      ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border }
      : { backgroundColor: theme.fg };

  const textColor =
    variant === 'primary'
      ? theme.accentFg
      : variant === 'ghost'
      ? theme.fg
      : theme.bg;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[styles.btn, variantStyle, disabled && { opacity: 0.4 }, style]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.btnText, { color: textColor }]}>
          {children.toUpperCase()}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: boolean;
}
export function Card({ children, style, accent }: CardProps) {
  return (
    <View style={[
      styles.card,
      accent && { borderColor: theme.accent },
      style,
    ]}>
      {children}
    </View>
  );
}

// ─── MonoText ─────────────────────────────────────────────────────────────────
interface MonoProps {
  children: React.ReactNode;
  size?: number;
  style?: TextStyle;
}
export function MonoText({ children, size = 10, style }: MonoProps) {
  return (
    <Text style={[styles.mono, { fontSize: size }, style]}>
      {children}
    </Text>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

// ─── styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2.2,
    color: theme.muted,
  },
  serif: {
    fontFamily: fonts.serif,
    fontWeight: '400',
    letterSpacing: -0.5,
    lineHeight: 42,
    color: theme.fg,
  },
  btn: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
  },
  mono: {
    fontFamily: fonts.mono,
    color: theme.muted,
    letterSpacing: 1.2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 8,
  },
});
