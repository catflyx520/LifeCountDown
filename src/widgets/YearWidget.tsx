import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { fonts } from '../theme';

const C = {
  bg:       '#f5ecd6',
  fg:       '#3a2e1e',
  accent:   '#b5533c',
  muted80:  '#3a2e1e80',
  muted59:  '#3a2e1e59',
  barEmpty: '#ddd5c4',
  padding:  14,
  radius:   18,
  labelSize: 7,
  valueSize: 32,
  subSize:   8,
  barHeight: 4,
  barRadius: 2,
} as const;

interface Props { dayOfYear: number; lang: string; }

// ── Widget version ────────────────────────────────────────────────────────────
export function YearWidget({ dayOfYear, lang }: Props) {
  const pct   = Math.max(1, Math.round((dayOfYear / 365) * 100));
  const empty = Math.max(1, 100 - pct);
  const isZh  = lang === 'zh';

  return (
    <FlexWidget style={{ width: 'match_parent', height: 'match_parent', flexDirection: 'column', backgroundColor: C.bg, borderRadius: C.radius, padding: C.padding, justifyContent: 'space-between' }}>
      <TextWidget text={isZh ? '今年' : 'YEAR'} style={{ fontFamily: 'monospace', fontSize: C.labelSize, color: C.muted80, letterSpacing: 1 }} />
      <FlexWidget style={{ flexDirection: 'column' }}>
        <TextWidget text={String(dayOfYear)} style={{ fontFamily: 'serif', fontSize: C.valueSize, color: C.fg }} />
        <TextWidget text="/ 365" style={{ fontFamily: 'monospace', fontSize: C.subSize, color: C.muted59 }} />
      </FlexWidget>
      <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', height: C.barHeight, borderRadius: C.barRadius }}>
        <FlexWidget style={{ flex: pct,   height: 'match_parent', backgroundColor: C.accent }} />
        <FlexWidget style={{ flex: empty, height: 'match_parent', backgroundColor: C.barEmpty }} />
      </FlexWidget>
    </FlexWidget>
  );
}

// ── Preview version ───────────────────────────────────────────────────────────
export function YearPreview({ dayOfYear, lang }: Props) {
  const pct  = (dayOfYear / 365) * 100;
  const isZh = lang === 'zh';

  return (
    <View style={[s.card, { padding: C.padding, borderRadius: C.radius, backgroundColor: C.bg }]}>
      <Text style={{ fontFamily: fonts.mono, fontSize: C.labelSize, color: C.muted80, letterSpacing: 1 }}>{isZh ? '今年' : 'YEAR'}</Text>
      <View>
        <Text style={{ fontFamily: fonts.serif, fontSize: C.valueSize, color: C.fg, lineHeight: C.valueSize + 2 }}>{dayOfYear}</Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: C.subSize, color: C.muted59 }}>/ 365</Text>
      </View>
      <View style={{ height: C.barHeight, borderRadius: C.barRadius, backgroundColor: C.barEmpty, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%` as any, height: '100%', backgroundColor: C.accent, borderRadius: C.barRadius }} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flex: 1, justifyContent: 'space-between', aspectRatio: 1 },
});
