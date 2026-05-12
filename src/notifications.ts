import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildDailyMessage } from './utils/dailyMessage';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch {}  // expo-notifications not available in Expo Go (SDK 53+)

export async function requestPermission(): Promise<boolean> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function cancelDaily(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

async function buildAndSchedule(
  user: { daysLeft: number; age: number; targetAge: number; notifyHour: number },
  lang: string,
): Promise<void> {
  const { title, body } = buildDailyMessage(user, lang);
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: { screen: 'CheckIn' } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: user.notifyHour ?? 9,
      minute: 0,
    },
  });
}

export async function sendTestNotification(): Promise<void> {
  try {
    const [userRaw, langRaw] = await Promise.all([
      AsyncStorage.getItem('@lifecountdown/user'),
      AsyncStorage.getItem('@lifecountdown/lang'),
    ]);
    if (!userRaw) return;
    const user = JSON.parse(userRaw);
    const lang = langRaw === 'zh' ? 'zh' : 'en';
    const { title, body } = buildDailyMessage(user, lang);
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { screen: 'CheckIn' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
    });
  } catch {}
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
    await buildAndSchedule(user, lang);
  } catch {}
}
