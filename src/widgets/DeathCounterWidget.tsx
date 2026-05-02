import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { FlexWidget, TextWidget, ImageWidget } from 'react-native-android-widget';
import { fonts } from '../theme';

// ── Shared colors + structure (same for widget and preview) ──────────────────
const C = {
  bg:       '#f5ecd6',
  fg:       '#3a2e1e',
  accent:   '#b5533c',
  muted80:  '#3a2e1e80',
  muted73:  '#3a2e1e73',
  muted26:  '#3a2e1e26',
  barEmpty: '#ddd5c4',
  padding:  14,
  radius:   20,
  logoRadius: 6,
  dividerMx:  12,
  barHeight:  6,
  barRadius:  3,
  headerMb:   8,
  numbersMb:  10,
  progressMb: 5,
} as const;

// ── Widget sizes (larger — widget on home screen renders smaller than preview) ─
const WS = {
  logoSize:          44,
  appLabelSize:      14,
  numLabelSize:      12,
  numValueSize:      48,
  dividerH:          58,
  progressLabelSize: 13,
} as const;

// ── Preview sizes (matches what looks good in the in-app preview screen) ──────
const PS = {
  logoSize:          34,
  appLabelSize:      12,
  numLabelSize:      10,
  numValueSize:      41,
  dividerH:          50,
  progressLabelSize: 11,
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
    <FlexWidget style={{ width: 'match_parent', height: 'match_parent', flexDirection: 'column', backgroundColor: C.bg, borderRadius: C.radius, padding: C.padding }}>

      {/* Header */}
      <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', alignItems: 'center', marginBottom: C.headerMb }}>
        <ImageWidget image={require('../../assets/adaptive-icon.png')} imageWidth={WS.logoSize} imageHeight={WS.logoSize} radius={C.logoRadius} />
        <TextWidget text={isZh ? '  人生计数器' : '  LIFE COUNTER'} style={{ fontFamily: 'monospace', fontSize: WS.appLabelSize, color: C.muted80, letterSpacing: 1 }} />
      </FlexWidget>

      {/* Numbers */}
      <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', alignItems: 'center', marginBottom: C.numbersMb }}>
        <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
          <TextWidget text={isZh ? '天数' : 'DAYS'} style={{ fontFamily: 'monospace', fontSize: WS.numLabelSize, color: C.muted80, letterSpacing: 1 }} />
          <TextWidget text={daysStr} style={{ fontFamily: 'serif', fontSize: WS.numValueSize, color: C.fg }} />
        </FlexWidget>
        <FlexWidget style={{ width: 1, height: WS.dividerH, backgroundColor: C.muted26, marginHorizontal: C.dividerMx }} />
        <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
          <TextWidget text={isZh ? '月数' : 'MONTHS'} style={{ fontFamily: 'monospace', fontSize: WS.numLabelSize, color: C.muted80, letterSpacing: 1 }} />
          <TextWidget text={monthsStr} style={{ fontFamily: 'serif', fontSize: WS.numValueSize, color: C.fg }} />
        </FlexWidget>
      </FlexWidget>

      {/* Progress label */}
      <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', marginBottom: C.progressMb }}>
        <TextWidget text="LIFE PROGRESS" style={{ fontFamily: 'monospace', fontSize: WS.progressLabelSize, color: C.muted73, letterSpacing: 1 }} />
        <FlexWidget style={{ flex: 1 }} />
        <TextWidget text={`${pctStr}%`} style={{ fontFamily: 'monospace', fontSize: WS.progressLabelSize, color: C.accent }} />
      </FlexWidget>

      {/* Bar — inner children need height: match_parent to fill the 6dp outer height */}
      <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', height: C.barHeight, borderRadius: C.barRadius }}>
        <FlexWidget style={{ flex: filled, height: 'match_parent', backgroundColor: C.accent }} />
        <FlexWidget style={{ flex: empty,  height: 'match_parent', backgroundColor: C.barEmpty }} />
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

      {/* Header */}
      <View style={[s.row, { alignItems: 'center', marginBottom: C.headerMb }]}>
        <Image source={require('../../assets/adaptive-icon.png')} style={{ width: PS.logoSize, height: PS.logoSize, borderRadius: C.logoRadius }} resizeMode="contain" />
        <Text style={{ fontFamily: fonts.mono, fontSize: PS.appLabelSize, color: C.muted80, letterSpacing: 1 }}>
          {isZh ? '  人生计数器' : '  LIFE COUNTER'}
        </Text>
      </View>

      {/* Numbers */}
      <View style={[s.row, { marginBottom: C.numbersMb }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: PS.numLabelSize, color: C.muted80, letterSpacing: 1 }}>{isZh ? '天数' : 'DAYS'}</Text>
          <Text style={{ fontFamily: fonts.serif, fontSize: PS.numValueSize, color: C.fg, lineHeight: PS.numValueSize + 4 }}>{daysStr}</Text>
        </View>
        <View style={{ width: 1, height: PS.dividerH, backgroundColor: C.muted26, marginHorizontal: C.dividerMx }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: PS.numLabelSize, color: C.muted80, letterSpacing: 1 }}>{isZh ? '月数' : 'MONTHS'}</Text>
          <Text style={{ fontFamily: fonts.serif, fontSize: PS.numValueSize, color: C.fg, lineHeight: PS.numValueSize + 4 }}>{monthsStr}</Text>
        </View>
      </View>

      {/* Progress label */}
      <View style={[s.row, { marginBottom: C.progressMb }]}>
        <Text style={{ fontFamily: fonts.mono, fontSize: PS.progressLabelSize, color: C.muted73, letterSpacing: 1 }}>LIFE PROGRESS</Text>
        <View style={{ flex: 1 }} />
        <Text style={{ fontFamily: fonts.mono, fontSize: PS.progressLabelSize, color: C.accent }}>{pctStr}%</Text>
      </View>

      {/* Bar */}
      <View style={{ height: C.barHeight, borderRadius: C.barRadius, backgroundColor: C.barEmpty, overflow: 'hidden' }}>
        <View style={{ width: `${(filled / total) * 100}%` as any, height: '100%', backgroundColor: C.accent }} />
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  card: { aspectRatio: 4 / 2 },
  row:  { flexDirection: 'row' },
});
