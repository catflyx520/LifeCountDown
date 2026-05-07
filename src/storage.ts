import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData } from './types';

const KEY = '@lifecountdown/user';

export const defaultUser: UserData = {
  age: 28,
  birthdate: null,
  mode: null,
  targetAge: 80,
  daysLeft: 18993,
  confidence: 90,
  name: '',
  capsules: [],
  checkins: [],
  createdAt: new Date().toISOString(),
  notificationsEnabled: false,
  notifyHour: 9,
};

export async function loadUser(): Promise<UserData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...defaultUser };
    return { ...defaultUser, ...JSON.parse(raw) };
  } catch {
    return { ...defaultUser };
  }
}

export async function saveUser(data: Partial<UserData>): Promise<void> {
  try {
    const current = await loadUser();
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, ...data }));
  } catch {}
}

export async function clearUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}

// Compute days remaining from age + targetAge
export function computeDaysLeft(currentAge: number, targetAge: number): number {
  return Math.max(0, (targetAge - currentAge) * 365);
}

// Compute exact age from birthdate string
export function ageFromBirthdate(birthdate: string): number {
  const bd = new Date(birthdate);
  const now = new Date();
  let age = now.getFullYear() - bd.getFullYear();
  const hasBirthday =
    now.getMonth() > bd.getMonth() ||
    (now.getMonth() === bd.getMonth() && now.getDate() >= bd.getDate());
  if (!hasBirthday) age--;
  return Math.max(0, age);
}

const QUOTE_KEY = '@lifecountdown/daily-quote';

export async function getDailyQuoteIndex(total: number): Promise<number> {
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  try {
    const raw = await AsyncStorage.getItem(QUOTE_KEY);
    if (raw) {
      const { date, index } = JSON.parse(raw);
      if (date === today && index < total) return index;
    }
  } catch {}
  const index = Math.floor(Math.random() * total);
  await AsyncStorage.setItem(QUOTE_KEY, JSON.stringify({ date: today, index }));
  return index;
}

// Days until next birthday
export function daysUntilBirthday(birthdate: string): number {
  const bd = new Date(birthdate);
  const now = new Date();
  let next = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
  if (next <= now) next.setFullYear(now.getFullYear() + 1);
  return Math.ceil((next.getTime() - now.getTime()) / 86400000);
}
