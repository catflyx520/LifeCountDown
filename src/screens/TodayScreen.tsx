import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { theme, fonts } from '../theme';
import { Eyebrow, MonoText, SerifText } from '../components/UI';
import { loadUser, getDailyQuoteIndex } from '../storage';
import { buildDailyMessage } from '../utils/dailyMessage';
import { rawDashQuotes } from '../i18n';
import { useT } from '../i18n';
import { UserData } from '../types';

// ── Live countdown to midnight ────────────────────────────────────────────────
function useCountdown() {
  const calc = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const secs = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };
  const [cd, setCd] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setCd(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return cd;
}

// ── Stat row ──────────────────────────────────────────────────────────────────
function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={styles.statRow}>
      <View style={{ flex: 1 }}>
        <Eyebrow style={{ fontSize: 9, marginBottom: 2 }}>{label}</Eyebrow>
        {sub && <MonoText style={{ fontSize: 9, color: theme.muted }}>{sub}</MonoText>}
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { lang, s } = useT();
  const countdown = useCountdown();
  const [user, setUser] = useState<UserData | null>(null);
  const [message, setMessage] = useState<{ title: string; body: string } | null>(null);

  useFocusEffect(useCallback(() => {
    loadUser().then(async u => {
      setUser(u);
      const quotes = rawDashQuotes[lang as 'en' | 'zh'];
      const index = await getDailyQuoteIndex(quotes.length);
      const quote = quotes[index];
      setMessage(buildDailyMessage(u, lang, quote));
    });
  }, [lang]));

  if (!user) return null;

  const now = new Date();
  const weekday = now.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const doy = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000);
  const secsSinceMidnight = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const todayUsed = Math.round((secsSinceMidnight / 86400) * 100);

  const total = user.targetAge * 365;
  const lifePct = Math.min(100, (user.age * 365 / total) * 100);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
        <Eyebrow style={{ color: theme.accent }}>← {s.back.replace('← ', '')}</Eyebrow>
      </TouchableOpacity>

      {/* Date */}
      <MonoText style={styles.weekday}>{weekday}</MonoText>
      <SerifText size={32} style={{ marginBottom: 4, lineHeight: 36 }}>{dateStr}</SerifText>
      <MonoText style={styles.dayOfYear}>
        {lang === 'zh' ? `今年第 ${doy} / 365 天` : `Day ${doy} of 365`}
      </MonoText>

      {/* Countdown */}
      <View style={styles.countdownCard}>
        <Eyebrow style={{ marginBottom: 8, fontSize: 9 }}>
          {lang === 'zh' ? '今天还剩' : 'today ends in'}
        </Eyebrow>
        <Text style={styles.countdown}>{countdown}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <StatRow
          label={lang === 'zh' ? '今日已用' : 'Today used'}
          value={`${todayUsed}%`}
          sub={lang === 'zh' ? `${secsSinceMidnight.toLocaleString()} 秒已过` : `${secsSinceMidnight.toLocaleString()}s elapsed`}
        />
        <View style={styles.divider} />
        <StatRow
          label={lang === 'zh' ? '今年进度' : 'Year progress'}
          value={`${doy} / 365`}
          sub={`${Math.round((doy / 365) * 100)}%`}
        />
        <View style={styles.divider} />
        <StatRow
          label={lang === 'zh' ? '人生进度' : 'Life progress'}
          value={`${lifePct.toFixed(1)}%`}
          sub={lang === 'zh' ? `还剩 ${user.daysLeft.toLocaleString()} 天` : `${user.daysLeft.toLocaleString()} days left`}
        />
      </View>

      {/* Progress bars */}
      <View style={styles.barsCard}>
        {[
          { label: lang === 'zh' ? '今日' : 'Today', pct: todayUsed },
          { label: lang === 'zh' ? '今年' : 'Year', pct: Math.round((doy / 365) * 100) },
          { label: lang === 'zh' ? '人生' : 'Life', pct: lifePct },
        ].map((b, i) => (
          <View key={i} style={{ marginBottom: i < 2 ? 14 : 0 }}>
            <View style={styles.barLabelRow}>
              <Eyebrow style={{ fontSize: 9 }}>{b.label}</Eyebrow>
              <MonoText style={{ fontSize: 9 }}>{b.pct.toFixed(b.label === 'Life' || b.label === '人生' ? 1 : 0)}%</MonoText>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${b.pct}%` as any }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Daily message */}
      {message && (
        <View style={styles.messageCard}>
          <Eyebrow style={{ marginBottom: 10 }}>
            {lang === 'zh' ? '今日' : "Today's note"}
          </Eyebrow>
          <Text style={styles.messageTitle}>{message.title}</Text>
          <Text style={styles.messageBody}>{message.body}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  weekday: { fontSize: 11, color: theme.muted, letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' },
  dayOfYear: { fontSize: 10, color: theme.muted, marginBottom: 24 },

  countdownCard: {
    backgroundColor: theme.surface, borderRadius: 16,
    borderWidth: 1, borderColor: theme.border,
    padding: 20, alignItems: 'center', marginBottom: 16,
  },
  countdown: {
    fontFamily: fonts.mono, fontSize: 52,
    letterSpacing: 2, color: theme.accent,
  },

  statsCard: {
    backgroundColor: theme.surface, borderRadius: 16,
    borderWidth: 1, borderColor: theme.border,
    paddingHorizontal: 16, marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 14,
  },
  statValue: { fontFamily: fonts.serif, fontSize: 24, color: theme.fg },
  divider: { height: 1, backgroundColor: theme.border },

  barsCard: {
    backgroundColor: theme.surface, borderRadius: 16,
    borderWidth: 1, borderColor: theme.border,
    padding: 16, marginBottom: 16,
  },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  track: { height: 3, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: theme.accent, borderRadius: 2 },

  messageCard: {
    backgroundColor: theme.surface, borderRadius: 16,
    borderWidth: 1, borderColor: theme.border, padding: 16,
  },
  messageTitle: {
    fontFamily: fonts.serif, fontSize: 22, color: theme.fg,
    lineHeight: 28, marginBottom: 10,
  },
  messageBody: {
    fontFamily: fonts.body, fontSize: 14, color: theme.muted,
    lineHeight: 22,
  },
});
