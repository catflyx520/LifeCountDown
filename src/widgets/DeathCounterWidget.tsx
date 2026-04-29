import React from 'react';
import { FlexWidget, TextWidget, ImageWidget } from 'react-native-android-widget';

interface Props {
  days: number;
  months: number;
  pct: number;
  lang: string;
}

export function DeathCounterWidget({ days, months, pct, lang }: Props) {
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
        padding: 16,
        justifyContent: 'space-between',
      }}
    >
      {/* Header: logo + label + live */}
      <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ImageWidget
            image={require('../../assets/adaptive-icon.png')}
            imageWidth={28}
            imageHeight={28}
            radius={4}
          />
          <TextWidget
            text={isZh ? ' 人生计数器' : ' LIFE COUNTER'}
            style={{ fontFamily: 'monospace', fontSize: 8, color: '#3a2e1e99', letterSpacing: 1 }}
          />
        </FlexWidget>
        <TextWidget
          text="live"
          style={{ fontFamily: 'monospace', fontSize: 7, color: '#3a2e1e59', letterSpacing: 1 }}
        />
      </FlexWidget>

      {/* Numbers: DAYS | MONTHS — big */}
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
        <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
          <TextWidget
            text={isZh ? '天数' : 'DAYS'}
            style={{ fontFamily: 'monospace', fontSize: 8, color: '#3a2e1e80', letterSpacing: 1 }}
          />
          <TextWidget
            text={daysStr}
            style={{ fontFamily: 'serif', fontSize: 40, color: '#3a2e1e' }}
          />
        </FlexWidget>
        <FlexWidget style={{ width: 1, height: 52, backgroundColor: '#3a2e1e26', marginHorizontal: 14 }} />
        <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
          <TextWidget
            text={isZh ? '月数' : 'MONTHS'}
            style={{ fontFamily: 'monospace', fontSize: 8, color: '#3a2e1e80', letterSpacing: 1 }}
          />
          <TextWidget
            text={monthsStr}
            style={{ fontFamily: 'serif', fontSize: 40, color: '#3a2e1e' }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Life Progress — bigger bar */}
      <FlexWidget style={{ flexDirection: 'column' }}>
        <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <TextWidget
            text={isZh ? 'LIFE PROGRESS' : 'LIFE PROGRESS'}
            style={{ fontFamily: 'monospace', fontSize: 7, color: '#3a2e1e73', letterSpacing: 1 }}
          />
          <TextWidget
            text={`${pctStr}%`}
            style={{ fontFamily: 'monospace', fontSize: 7, color: '#3a2e1e73' }}
          />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'row', height: 5, borderRadius: 3 }}>
          <FlexWidget style={{ flex: filled, backgroundColor: '#b5533c', borderRadius: 3 }} />
          <FlexWidget style={{ flex: empty,  backgroundColor: '#3a2e1e1f' }} />
        </FlexWidget>
      </FlexWidget>

    </FlexWidget>
  );
}
