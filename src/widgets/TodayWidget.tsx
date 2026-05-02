import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { FlexWidget, TextWidget, ImageWidget } from 'react-native-android-widget';
import { fonts } from '../theme';

// ── Shared colors + structure ─────────────────────────────────────────────────
const C = {
  bg:       '#f5ecd6',
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
  valueSize: 44,
  subSize:   13,
  barHeight: 8,
} as const;

// ── Preview sizes ─────────────────────────────────────────────────────────────
const PS = {
  logoSize:  24,
  valueSize: 36,
  subSize:   11,
  barHeight: 6,
} as const;

function usedPct() {
  const now  = new Date();
  const secs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  return Math.max(1, Math.round((secs / 86400) * 100));
}

interface Props { lang: string; }

// ── Widget version ────────────────────────────────────────────────────────────
export function TodayWidget({ lang }: Props) {
  const used  = usedPct();
  const empty = Math.max(1, 100 - used);
  const isZh  = lang === 'zh';

  return (
    <FlexWidget style={{ width: 'match_parent', height: 'match_parent', flexDirection: 'column', backgroundColor: C.bg, borderRadius: C.radius, padding: C.padding }}>

      {/* Logo */}
      <ImageWidget image={require('../../assets/adaptive-icon.png')} imageWidth={WS.logoSize} imageHeight={WS.logoSize} radius={4} />

      {/* Value */}
      <TextWidget text={`${used}%`} style={{ fontFamily: 'serif', fontSize: WS.valueSize, color: C.accent }} />
      <TextWidget text={isZh ? '已用' : 'used'} style={{ fontFamily: 'monospace', fontSize: WS.subSize, color: C.muted59 }} />

      {/* Bar */}
      <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', height: WS.barHeight, borderRadius: C.barRadius }}>
        <FlexWidget style={{ flex: used,  height: 'match_parent', backgroundColor: C.accent }} />
        <FlexWidget style={{ flex: empty, height: 'match_parent', backgroundColor: C.barEmpty }} />
      </FlexWidget>

    </FlexWidget>
  );
}

// ── Preview version ───────────────────────────────────────────────────────────
export function TodayPreview({ lang }: Props) {
  const used = usedPct();
  const isZh = lang === 'zh';

  return (
    <View style={[s.card, { padding: C.padding, borderRadius: C.radius, backgroundColor: C.bg }]}>
      <Image source={require('../../assets/adaptive-icon.png')} style={{ width: PS.logoSize, height: PS.logoSize, borderRadius: 4 }} resizeMode="contain" />
      <View>
        <Text style={{ fontFamily: fonts.serif, fontSize: PS.valueSize, color: C.accent, lineHeight: PS.valueSize + 4 }}>{used}%</Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: PS.subSize, color: C.muted59 }}>{isZh ? '已用' : 'used'}</Text>
      </View>
      <View style={{ height: PS.barHeight, borderRadius: C.barRadius, backgroundColor: C.barEmpty, overflow: 'hidden' }}>
        <View style={{ width: `${used}%` as any, height: '100%', backgroundColor: C.accent }} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flex: 1, justifyContent: 'space-between', aspectRatio: 1 },
});
