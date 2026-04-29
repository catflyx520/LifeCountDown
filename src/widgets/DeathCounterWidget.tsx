import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { FlexWidget, TextWidget, ImageWidget } from 'react-native-android-widget';
import { fonts } from '../theme';

// ── Shared constants ──────────────────────────────────────────────────────────
const C = {
  bg:           '#f5ecd6',
  fg:           '#3a2e1e',
  accent:       '#b5533c',
  muted80:      '#3a2e1e80',
  muted73:      '#3a2e1e73',
  muted26:      '#3a2e1e26',
  barEmpty:     '#ddd5c4',
  padding:      14,
  radius:       20,
  logoSize:     42,
  logoRadius:   8,
  appLabelSize: 10,
  numLabelSize: 9,
  numValueSize: 46,
  dividerH:     56,
  dividerMx:    12,
  barHeight:    6,
  barRadius:    3,
  progressLabelSize: 8,
  headerMb:     10,
  progressMb:   6,
} as const;

// ── Shared data computation ───────────────────────────────────────────────────
function compute(days: number, months: number, pct: number) {
  return {
    daysStr:   days.toLocaleString(),
    monthsStr: months.toLocaleString(),
    pctStr:    pct.toFixed(1),
    filled:    Math.max(1, Math.round(pct)),
    empty:     Math.max(1, 100 - Math.round(pct)),
  };
}

interface Props {
  days: number;
  months: number;
  pct: number;
  lang: string;
}

// ── Widget version (Android widget renderer) ──────────────────────────────────
export function DeathCounterWidget({ days, months, pct, lang }: Props) {
  const { daysStr, monthsStr, pctStr, filled, empty } = compute(days, months, pct);
  const isZh = lang === 'zh';

  return (
    <FlexWidget style={{ width: 'match_parent', height: 'match_parent', flexDirection: 'column', backgroundColor: C.bg, borderRadius: C.radius, padding: C.padding, justifyContent: 'space-between' }}>

      <FlexWidget style={{ flexDirection: 'column' }}>
        {/* Header */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginBottom: C.headerMb }}>
          <ImageWidget image={require('../../assets/adaptive-icon.png')} imageWidth={C.logoSize} imageHeight={C.logoSize} radius={C.logoRadius} />
          <TextWidget text={isZh ? '  人生计数器' : '  LIFE COUNTER'} style={{ fontFamily: 'monospace', fontSize: C.appLabelSize, color: C.muted80, letterSpacing: 1 }} />
        </FlexWidget>

        {/* Numbers */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
            <TextWidget text={isZh ? '天数' : 'DAYS'} style={{ fontFamily: 'monospace', fontSize: C.numLabelSize, color: C.muted80, letterSpacing: 1 }} />
            <TextWidget text={daysStr} style={{ fontFamily: 'serif', fontSize: C.numValueSize, color: C.fg }} />
          </FlexWidget>
          <FlexWidget style={{ width: 1, height: C.dividerH, backgroundColor: C.muted26, marginHorizontal: C.dividerMx }} />
          <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
            <TextWidget text={isZh ? '月数' : 'MONTHS'} style={{ fontFamily: 'monospace', fontSize: C.numLabelSize, color: C.muted80, letterSpacing: 1 }} />
            <TextWidget text={monthsStr} style={{ fontFamily: 'serif', fontSize: C.numValueSize, color: C.fg }} />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>

      {/* Progress */}
      <FlexWidget style={{ flexDirection: 'column' }}>
        <FlexWidget style={{ flexDirection: 'row', marginBottom: C.progressMb }}>
          <TextWidget text="LIFE PROGRESS" style={{ fontFamily: 'monospace', fontSize: C.progressLabelSize, color: C.muted73, letterSpacing: 1 }} />
          <FlexWidget style={{ flex: 1 }} />
          <TextWidget text={`${pctStr}%`} style={{ fontFamily: 'monospace', fontSize: C.progressLabelSize, color: C.accent }} />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'row', height: C.barHeight, borderRadius: C.barRadius }}>
          <FlexWidget style={{ flex: filled, backgroundColor: C.accent, borderRadius: C.barRadius }} />
          <FlexWidget style={{ flex: empty,  backgroundColor: C.barEmpty }} />
        </FlexWidget>
      </FlexWidget>

    </FlexWidget>
  );
}

// ── Preview version (in-app preview, RN primitives) ───────────────────────────
export function DeathCounterPreview({ days, months, pct, lang }: Props) {
  const { daysStr, monthsStr, pctStr, filled, empty } = compute(days, months, pct);
  const isZh = lang === 'zh';
  const total = filled + empty;

  return (
    <View style={[s.card, { padding: C.padding, borderRadius: C.radius, backgroundColor: C.bg }]}>

      <View>
        {/* Header */}
        <View style={[s.row, { alignItems: 'center', marginBottom: C.headerMb }]}>
          <Image source={require('../../assets/adaptive-icon.png')} style={{ width: C.logoSize, height: C.logoSize, borderRadius: C.logoRadius }} resizeMode="contain" />
          <Text style={{ fontFamily: fonts.mono, fontSize: C.appLabelSize, color: C.muted80, letterSpacing: 1 }}>
            {isZh ? '  人生计数器' : '  LIFE COUNTER'}
          </Text>
        </View>

        {/* Numbers */}
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: C.numLabelSize, color: C.muted80, letterSpacing: 1 }}>{isZh ? '天数' : 'DAYS'}</Text>
            <Text style={{ fontFamily: fonts.serif, fontSize: C.numValueSize, color: C.fg, lineHeight: C.numValueSize + 4 }}>{daysStr}</Text>
          </View>
          <View style={{ width: 1, height: C.dividerH, backgroundColor: C.muted26, marginHorizontal: C.dividerMx }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: C.numLabelSize, color: C.muted80, letterSpacing: 1 }}>{isZh ? '月数' : 'MONTHS'}</Text>
            <Text style={{ fontFamily: fonts.serif, fontSize: C.numValueSize, color: C.fg, lineHeight: C.numValueSize + 4 }}>{monthsStr}</Text>
          </View>
        </View>
      </View>

      {/* Progress */}
      <View>
        <View style={[s.row, { justifyContent: 'space-between', marginBottom: C.progressMb }]}>
          <Text style={{ fontFamily: fonts.mono, fontSize: C.progressLabelSize, color: C.muted73, letterSpacing: 1 }}>LIFE PROGRESS</Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: C.progressLabelSize, color: C.accent }}>{pctStr}%</Text>
        </View>
        <View style={{ height: C.barHeight, borderRadius: C.barRadius, backgroundColor: C.barEmpty, overflow: 'hidden' }}>
          <View style={{ width: `${(filled / total) * 100}%` as any, height: '100%', backgroundColor: C.accent, borderRadius: C.barRadius }} />
        </View>
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  card: { justifyContent: 'space-between', aspectRatio: 4 / 2 },
  row:  { flexDirection: 'row' },
});
