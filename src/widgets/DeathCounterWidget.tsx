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
        padding: 14,
        justifyContent: 'space-between',
      }}
    >
      {/* TOP: logo + numbers stacked close together */}
      <FlexWidget style={{ flexDirection: 'column' }}>

        {/* Logo row */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <ImageWidget
            image={require('../../assets/adaptive-icon.png')}
            imageWidth={42}
            imageHeight={42}
            radius={8}
          />
          <TextWidget
            text={isZh ? '  人生计数器' : '  LIFE COUNTER'}
            style={{ fontFamily: 'monospace', fontSize: 10, color: '#3a2e1e80', letterSpacing: 1 }}
          />
        </FlexWidget>

        {/* Numbers row */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
            <TextWidget
              text={isZh ? '天数' : 'DAYS'}
              style={{ fontFamily: 'monospace', fontSize: 9, color: '#3a2e1e80', letterSpacing: 1 }}
            />
            <TextWidget
              text={daysStr}
              style={{ fontFamily: 'serif', fontSize: 46, color: '#3a2e1e' }}
            />
          </FlexWidget>
          <FlexWidget style={{ width: 1, height: 56, backgroundColor: '#3a2e1e26', marginHorizontal: 12 }} />
          <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
            <TextWidget
              text={isZh ? '月数' : 'MONTHS'}
              style={{ fontFamily: 'monospace', fontSize: 9, color: '#3a2e1e80', letterSpacing: 1 }}
            />
            <TextWidget
              text={monthsStr}
              style={{ fontFamily: 'serif', fontSize: 46, color: '#3a2e1e' }}
            />
          </FlexWidget>
        </FlexWidget>

      </FlexWidget>

      {/* BOTTOM: life progress */}
      <FlexWidget style={{ flexDirection: 'column' }}>
        <FlexWidget style={{ flexDirection: 'row', marginBottom: 6 }}>
          <TextWidget
            text={isZh ? 'LIFE PROGRESS' : 'LIFE PROGRESS'}
            style={{ fontFamily: 'monospace', fontSize: 8, color: '#3a2e1e73', letterSpacing: 1 }}
          />
          <FlexWidget style={{ flex: 1 }} />
          <TextWidget
            text={`${pctStr}%`}
            style={{ fontFamily: 'monospace', fontSize: 8, color: '#b5533c' }}
          />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'row', height: 6, borderRadius: 3 }}>
          <FlexWidget style={{ flex: filled, backgroundColor: '#b5533c', borderRadius: 3 }} />
          <FlexWidget style={{ flex: empty,  backgroundColor: '#ddd5c4' }} />
        </FlexWidget>
      </FlexWidget>

    </FlexWidget>
  );
}
