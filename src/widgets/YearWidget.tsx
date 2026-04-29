import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface Props {
  dayOfYear: number;
  lang: string;
}

export function YearWidget({ dayOfYear, lang }: Props) {
  const pct   = Math.max(1, Math.round((dayOfYear / 365) * 100));
  const empty = Math.max(1, 100 - pct);
  const isZh  = lang === 'zh';

  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        flexDirection: 'column',
        backgroundColor: '#f5ecd6',
        borderRadius: 18,
        padding: 14,
        justifyContent: 'space-between',
      }}
    >
      <TextWidget
        text={isZh ? '今年' : 'YEAR'}
        style={{ fontFamily: 'monospace', fontSize: 7, color: '#3a2e1e80', letterSpacing: 1 }}
      />
      <FlexWidget style={{ flexDirection: 'column' }}>
        <TextWidget
          text={String(dayOfYear)}
          style={{ fontFamily: 'serif', fontSize: 32, color: '#3a2e1e' }}
        />
        <TextWidget
          text="/ 365"
          style={{ fontFamily: 'monospace', fontSize: 8, color: '#3a2e1e59' }}
        />
      </FlexWidget>
      <FlexWidget style={{ flexDirection: 'row', height: 2, borderRadius: 1 }}>
        <FlexWidget style={{ flex: pct,   backgroundColor: '#b5533c', borderRadius: 1 }} />
        <FlexWidget style={{ flex: empty, backgroundColor: '#3a2e1e1f' }} />
      </FlexWidget>
    </FlexWidget>
  );
}
