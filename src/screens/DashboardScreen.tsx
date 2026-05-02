import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { theme, fonts } from '../theme';
import { Eyebrow, SerifText, Card, MonoText } from '../components/UI';
import AnimatedHourglass from '../components/AnimatedHourglass';
import { useCountdown } from '../hooks/useCountdown';
import { loadUser, ageFromBirthdate, daysUntilBirthday } from '../storage';
import { UserData } from '../types';
import { useT } from '../i18n';

function DashHourglass() {
  const [fillPct, setFillPct] = useState(() => {
    const now = new Date();
    const secs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    return Math.max(0.02, 1 - secs / 86400);
  });
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      const secs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      setFillPct(Math.max(0.02, 1 - secs / 86400));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <AnimatedHourglass size={110} fillPct={fillPct} animate grainMs={1400} />;
}

function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={rowStyles.row}>
      <View style={{ flex: 1 }}>
        <Eyebrow style={{ fontSize: 9, marginBottom: 2 }}>{label}</Eyebrow>
        {sub && <MonoText style={{ fontSize: 9, color: theme.muted }}>{sub}</MonoText>}
      </View>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 14,
  },
  value: { fontFamily: fonts.serif, fontSize: 24, color: theme.fg },
});

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { s, lang } = useT();

  const [user, setUser] = useState<UserData | null>(null);
  const countdown = useCountdown();
  const navigation = useNavigation<any>();

  const reload = useCallback(() => {
    loadUser().then(setUser);
  }, []);

  useFocusEffect(reload);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let sub: any;
    try {
      const Notifications = require('expo-notifications');
      sub = Notifications.addNotificationResponseReceivedListener(() => {
        navigation.navigate('Today');
      });
    } catch {}
    return () => sub?.remove();
  }, []);

  if (!user) return null;

  const now = new Date();
  const doy = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000);
  const secsSinceMidnight = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const todayUsed = Math.round((secsSinceMidnight / 86400) * 100);

  const totalDays = user.targetAge * 365;
  const lifePct = Math.min(100, (user.age * 365 / totalDays) * 100);
  const yearPct = Math.round((doy / 365) * 100);

  const displayAge = user.birthdate ? ageFromBirthdate(user.birthdate) : user.age;
  const nextBday = user.birthdate ? daysUntilBirthday(user.birthdate) : null;

  const today = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });

  const greeting = user.name
    ? s.goodToSeeNamed(user.name).replace('\n', ' ')
    : s.goodToSee;

  const bars = [
    { label: lang === 'zh' ? '今日' : 'Today', pct: todayUsed },
    { label: lang === 'zh' ? '今年' : 'Year', pct: yearPct },
    { label: lang === 'zh' ? '人生' : 'Life', pct: lifePct },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={false} onRefresh={reload} />}
    >
      {/* top bar */}
      <View style={styles.topBar}>
        <Eyebrow>L/C · {today}</Eyebrow>
        <View style={styles.livePip}>
          <View style={styles.dot} />
          <Eyebrow>{s.live}</Eyebrow>
        </View>
      </View>

      {/* greeting */}
      <SerifText size={22} style={{ marginBottom: 16, lineHeight: 28 }}>
        {greeting}
      </SerifText>

      {/* hourglass + countdown */}
      <View style={styles.heroSection}>
        <DashHourglass />

        <View style={styles.countdownCard}>
          <Eyebrow style={{ fontSize: 8, marginBottom: 4 }}>{s.todayEndsIn}</Eyebrow>
          <Text style={styles.countdown}>{countdown}</Text>
        </View>
      </View>

      {/* age card */}
      <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <View>
          <Eyebrow style={{ fontSize: 9, marginBottom: 6 }}>{s.youAre}</Eyebrow>
          <Text style={styles.ageNumber}>
            {displayAge}
            <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: theme.muted }}> {s.yrs}</Text>
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {nextBday !== null ? (
            <>
              <Eyebrow style={{ fontSize: 9, marginBottom: 6 }}>{s.nextBirthday}</Eyebrow>
              <Text style={[styles.sideNumber, { color: theme.accent }]}>
                {nextBday}
                <Text style={{ fontFamily: fonts.mono, fontSize: 10, color: theme.muted }}> {s.days}</Text>
              </Text>
            </>
          ) : (
            <>
              <Eyebrow style={{ fontSize: 9, marginBottom: 6 }}>{s.target}</Eyebrow>
              <Text style={styles.sideNumber}>
                {user.targetAge}
                <Text style={{ fontFamily: fonts.mono, fontSize: 10, color: theme.muted }}> {s.yrs}</Text>
              </Text>
            </>
          )}
        </View>
      </Card>

      {/* stats */}
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
          sub={`${yearPct}%`}
        />
        <View style={styles.divider} />
        <StatRow
          label={lang === 'zh' ? '人生进度' : 'Life progress'}
          value={`${lifePct.toFixed(1)}%`}
          sub={lang === 'zh' ? `还剩 ${user.daysLeft.toLocaleString()} 天` : `${user.daysLeft.toLocaleString()} days left`}
        />
      </View>

      {/* progress bars */}
      <View style={styles.barsCard}>
        {bars.map((b, i) => (
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

      {/* links */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Hourglass')}
        style={styles.link}
      >
        <Eyebrow style={{ color: theme.accent }}>{s.viewHourglass}</Eyebrow>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Today')}
        style={[styles.link, { marginTop: 8 }]}
      >
        <Eyebrow style={{ color: theme.accent }}>
          {s.todaysNote} →
        </Eyebrow>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('WidgetPreview')}
        style={[styles.link, { marginTop: 8 }]}
      >
        <Eyebrow style={{ color: theme.accent }}>Widget Preview →</Eyebrow>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  livePip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.accent },

  heroSection: { alignItems: 'center', paddingVertical: 16, gap: 12, marginBottom: 10 },

  countdownCard: {
    paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 12, backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border,
    alignItems: 'center',
  },
  countdown: { fontFamily: fonts.mono, fontSize: 26, letterSpacing: 2, color: theme.accent },

  ageNumber: { fontFamily: fonts.serif, fontSize: 40, lineHeight: 42, color: theme.fg },
  sideNumber: { fontFamily: fonts.serif, fontSize: 22, color: theme.fg },

  statsCard: {
    backgroundColor: theme.surface, borderRadius: 16,
    borderWidth: 1, borderColor: theme.border,
    paddingHorizontal: 16, marginBottom: 10,
  },
  divider: { height: 1, backgroundColor: theme.border },

  barsCard: {
    backgroundColor: theme.surface, borderRadius: 16,
    borderWidth: 1, borderColor: theme.border,
    padding: 16, marginBottom: 10,
  },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  track: { height: 3, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: theme.accent, borderRadius: 2 },

  link: {
    alignItems: 'center', paddingVertical: 14,
    borderRadius: 12, backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border, marginTop: 4,
  },
});
