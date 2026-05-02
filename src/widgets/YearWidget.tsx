import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { FlexWidget, TextWidget, ImageWidget } from 'react-native-android-widget';
import { fonts } from '../theme';

// ── Shared colors + structure ─────────────────────────────────────────────────
const C = {
  bg:       '#f5ecd6',
  fg:       '#3a2e1e',
  accent:   '#b5533c',
  muted59:  '#3a2e1e59',
  barEmpty: '#ddd5c4',
  padding:  12,
  radius:   18,
  barRadius: 2,
} as const;

// ── Widget sizes ──────────────────────────────────────────────────────────────
const WS = {
  logoSize:  30,
  valueSize: 45,
  subSize:   14,
  barHeight: 8,
} as const;

// ── Preview sizes ─────────────────────────────────────────────────────────────
const PS = {
  logoSize:  24,
  valueSize: 36,
  subSize:   11,
  barHeight: 6,
} as const;

interface Props { dayOfYear: number; lang: string; }

// ── Widget version ────────────────────────────────────────────────────────────
export function YearWidget({ dayOfYear, lang }: Props) {
  const pct   = Math.max(1, Math.round((dayOfYear / 365) * 100));
  const empty = Math.max(1, 100 - pct);

  return (
    <FlexWidget style={{ width: 'match_parent', height: 'match_parent', flexDirection: 'column', backgroundColor: C.bg, borderRadius: C.radius, padding: C.padding }}>

      {/* Logo */}
      <ImageWidget image={require('../../assets/adaptive-icon.png')} imageWidth={WS.logoSize} imageHeight={WS.logoSize} radius={4} />

      {/* Value */}
      <TextWidget text={String(dayOfYear)} style={{ fontFamily: 'serif', fontSize: WS.valueSize, color: C.fg }} />
      <TextWidget text={lang === 'zh' ? '今年已用' : 'year used'} style={{ fontFamily: 'monospace', fontSize: WS.subSize, color: C.muted59 }} />
      <TextWidget text="/ 365" style={{ fontFamily: 'monospace', fontSize: WS.subSize, color: C.muted59 }} />

      {/* Bar */}
      <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', height: WS.barHeight, borderRadius: C.barRadius }}>
        <FlexWidget style={{ flex: pct,   height: 'match_parent', backgroundColor: C.accent }} />
        <FlexWidget style={{ flex: empty, height: 'match_parent', backgroundColor: C.barEmpty }} />
      </FlexWidget>

    </FlexWidget>
  );
}

// ── Preview version ───────────────────────────────────────────────────────────
export function YearPreview({ dayOfYear, lang }: Props) {
  const pct = (dayOfYear / 365) * 100;

  return (
    <View style={[s.card, { padding: C.padding, borderRadius: C.radius, backgroundColor: C.bg }]}>
      <Image source={require('../../assets/adaptive-icon.png')} style={{ width: PS.logoSize, height: PS.logoSize, borderRadius: 4 }} resizeMode="contain" />
      <View>
        <Text style={{ fontFamily: fonts.serif, fontSize: PS.valueSize, color: C.fg, lineHeight: PS.valueSize + 4 }}>{dayOfYear}</Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: PS.subSize, color: C.muted59 }}>{lang === 'zh' ? '今年已用' : 'year used'}</Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: PS.subSize, color: C.muted59 }}>/ 365</Text>
      </View>
      <View style={{ height: PS.barHeight, borderRadius: C.barRadius, backgroundColor: C.barEmpty, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%` as any, height: '100%', backgroundColor: C.accent }} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flex: 1, justifyContent: 'space-between', aspectRatio: 1 },
});
