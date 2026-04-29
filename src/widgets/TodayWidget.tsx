import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface Props {
  lang: string;
}

export function TodayWidget({ lang }: Props) {
  const now    = new Date();
  const secs   = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const used   = Math.max(1, Math.round((secs / 86400) * 100));
  const empty  = Math.max(1, 100 - used);
  const isZh   = lang === 'zh';

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
        text={isZh ? '今日' : 'TODAY'}
        style={{ fontFamily: 'monospace', fontSize: 7, color: '#3a2e1e80', letterSpacing: 1 }}
      />
      <FlexWidget style={{ flexDirection: 'column' }}>
        <TextWidget
          text={`${used}%`}
          style={{ fontFamily: 'serif', fontSize: 32, color: '#b5533c' }}
        />
        <TextWidget
          text={isZh ? '已用' : 'used'}
          style={{ fontFamily: 'monospace', fontSize: 8, color: '#3a2e1e59' }}
        />
      </FlexWidget>
      <FlexWidget style={{ flexDirection: 'row', height: 2, borderRadius: 1 }}>
        <FlexWidget style={{ flex: used,  backgroundColor: '#b5533c', borderRadius: 1 }} />
        <FlexWidget style={{ flex: empty, backgroundColor: '#3a2e1e1f' }} />
      </FlexWidget>
    </FlexWidget>
  );
}
