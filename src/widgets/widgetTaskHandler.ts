import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadUser, getDailyQuoteIndex } from '../storage';
import { rawDashQuotes } from '../i18n';
import { DeathCounterWidget } from './DeathCounterWidget';
import { YearWidget } from './YearWidget';
import { TodayWidget } from './TodayWidget';

const nameToWidget = {
  DeathCounterWidget,
  YearWidget,
  TodayWidget,
};

async function getWidgetData() {
  const user = await loadUser();
  const langRaw = await AsyncStorage.getItem('@lifecountdown/lang');
  const lang = langRaw === 'zh' ? 'zh' : 'en';
  const quotes = rawDashQuotes[lang];
  const index = await getDailyQuoteIndex(quotes.length);
  const quote = quotes[index];

  const days   = user.daysLeft;
  const months = Math.floor(days / 30.44);
  const total  = user.targetAge * 365;
  const pct    = Math.min(100, (user.age * 365 / total) * 100);
  const now    = new Date();
  const doy    = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000);

  return { user, lang, days, months, pct, doy, quote };
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetAction, widgetInfo, renderWidget } = props;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const data = await getWidgetData();

      switch (widgetInfo.widgetName) {
        case 'DeathCounterWidget':
          renderWidget(
            React.createElement(DeathCounterWidget, {
              days: data.days,
              months: data.months,
              pct: data.pct,
              quote: data.quote.text,
              lang: data.lang,
            })
          );
          break;

        case 'YearWidget':
          renderWidget(
            React.createElement(YearWidget, {
              dayOfYear: data.doy,
              lang: data.lang,
            })
          );
          break;

        case 'TodayWidget':
          renderWidget(
            React.createElement(TodayWidget, {
              lang: data.lang,
            })
          );
          break;
      }
      break;
    }

    case 'WIDGET_DELETED':
      break;

    default:
      break;
  }
}
