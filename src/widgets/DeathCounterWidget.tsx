import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface Props {
  days: number;
  months: number;
  pct: number;
  quote: string;
  lang: string;
}

export function DeathCounterWidget({ days, months, pct, quote, lang }: Props) {
  const daysStr   = days.toLocaleString();
  const monthsStr = months.toLocaleString();
  const pctStr    = pct.toFixed(1);
  const filled    = Math.max(1, Math.round(pct));
  const empty     = Math.max(1, 100 - filled);
  const isZh      = lang === 'zh';

  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        flexDirection: 'column',
        backgroundColor: '#f5ecd6',
        borderRadius: 20,
        padding: 14,
        justifyContent: 'space-between',
      }}
    >
      {/* Header: L/C + LIFE COUNTER + LIVE */}
      <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextWidget
            text="L/C"
            style={{ fontFamily: 'serif', fontSize: 16, color: '#b5533c' }}
          />
          <TextWidget
            text={isZh ? '  ·  人生计数器' : '  ·  LIFE COUNTER'}
            style={{ fontFamily: 'monospace', fontSize: 7, color: '#3a2e1e99', letterSpacing: 1 }}
          />
        </FlexWidget>
        <TextWidget
          text="live"
          style={{ fontFamily: 'monospace', fontSize: 7, color: '#3a2e1e59', letterSpacing: 1 }}
        />
      </FlexWidget>

      {/* Numbers: DAYS | MONTHS */}
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
        <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
          <TextWidget
            text={isZh ? '天' : 'DAYS'}
            style={{ fontFamily: 'monospace', fontSize: 7, color: '#3a2e1e80', letterSpacing: 1 }}
          />
          <TextWidget
            text={daysStr}
            style={{ fontFamily: 'serif', fontSize: 32, color: '#3a2e1e' }}
          />
        </FlexWidget>
        <FlexWidget style={{ width: 1, height: 44, backgroundColor: '#3a2e1e26', marginHorizontal: 12 }} />
        <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
          <TextWidget
            text={isZh ? '月' : 'MONTHS'}
            style={{ fontFamily: 'monospace', fontSize: 7, color: '#3a2e1e80', letterSpacing: 1 }}
          />
          <TextWidget
            text={monthsStr}
            style={{ fontFamily: 'serif', fontSize: 32, color: '#3a2e1e' }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Progress bar */}
      <FlexWidget style={{ flexDirection: 'column' }}>
        <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <TextWidget
            text={isZh ? 'LIFE USED' : 'LIFE USED'}
            style={{ fontFamily: 'monospace', fontSize: 6, color: '#3a2e1e73', letterSpacing: 1 }}
          />
          <TextWidget
            text={`${pctStr}%`}
            style={{ fontFamily: 'monospace', fontSize: 6, color: '#3a2e1e73' }}
          />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'row', height: 2, borderRadius: 1 }}>
          <FlexWidget style={{ flex: filled, backgroundColor: '#b5533c', borderRadius: 1 }} />
          <FlexWidget style={{ flex: empty,  backgroundColor: '#3a2e1e1f' }} />
        </FlexWidget>
      </FlexWidget>

      {/* Quote */}
      <TextWidget
        text={`"${quote}"`}
        style={{ fontFamily: 'serif', fontSize: 10, color: '#b5533c', fontStyle: 'italic' }}
        maxLines={2}
      />
    </FlexWidget>
  );
}
