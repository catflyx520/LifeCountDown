import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rawDashQuotes } from './i18n';
import { getDailyQuoteIndex } from './storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function cancelDaily(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

async function buildAndSchedule(
  user: { daysLeft: number; age: number; targetAge: number; notifyHour: number },
  quote: { text: string; author: string },
  lang: string,
): Promise<void> {
  const days = user.daysLeft;
  const totalDays = user.targetAge * 365;
  const elapsed = user.age * 365;
  const pct = Math.min(100, (elapsed / totalDays) * 100).toFixed(1);
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30.44);

  const isZh = lang === 'zh';
  const title = isZh ? '人生倒计时' : 'Life Countdown';
  const quoteStr = isZh
    ? `「${quote.text}」— ${quote.author}`
    : `"${quote.text}" — ${quote.author}`;
  const statsStr = isZh
    ? `还剩 ${days.toLocaleString()} 天 · 人生进度 ${pct}%\n约 ${years} 年 ${months} 个月`
    : `${days.toLocaleString()} days left · ${pct}% of life\n~${years} yrs ${months} mo`;

  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title, body: `${quoteStr}\n${statsStr}` },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: user.notifyHour ?? 9,
      minute: 0,
    },
  });
}

export async function rescheduleIfEnabled(): Promise<void> {
  try {
    const [userRaw, langRaw] = await Promise.all([
      AsyncStorage.getItem('@lifecountdown/user'),
      AsyncStorage.getItem('@lifecountdown/lang'),
    ]);
    if (!userRaw) return;
    const user = JSON.parse(userRaw);
    if (!user.notificationsEnabled) return;

    const lang = langRaw === 'zh' ? 'zh' : 'en';
    const quotes = rawDashQuotes[lang];
    const index = await getDailyQuoteIndex(quotes.length);
    await buildAndSchedule(user, quotes[index], lang);
  } catch {}
}
