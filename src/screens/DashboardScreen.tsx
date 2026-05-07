import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { theme, fonts } from '../theme';
import { Eyebrow, SerifText, Card, MonoText } from '../components/UI';
import AnimatedHourglass from '../components/AnimatedHourglass';
import { useCountdown } from '../hooks/useCountdown';
import { loadUser, ageFromBirthdate, daysUntilBirthday, getDailyQuoteIndex } from '../storage';
import { UserData, CheckIn } from '../types';
import { useT, rawDashQuotes } from '../i18n';
import { buildDailyMessage } from '../utils/dailyMessage';

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

function StatRow({ label, value, sub, pct }: { label: string; value: string; sub?: string; pct: number }) {
  return (
    <View style={{ paddingVertical: 14 }}>
      <View style={rowStyles.top}>
        <Eyebrow style={{ fontSize: 9 }}>{label}</Eyebrow>
        <Text style={rowStyles.value}>{value}</Text>
      </View>
      {sub && <MonoText style={{ fontSize: 9, color: theme.muted, marginBottom: 8 }}>{sub}</MonoText>}
      <View style={rowStyles.track}>
        <View style={[rowStyles.fill, { width: `${pct}%` as any }]} />
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  value: { fontFamily: fonts.serif, fontSize: 24, color: theme.fg },
  track: { height: 3, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: theme.accent, borderRadius: 2 },
});

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { s, lang } = useT();

  const [user, setUser] = useState<UserData | null>(null);
  const [message, setMessage] = useState<{ title: string; body: string } | null>(null);
  const countdown = useCountdown();
  const navigation = useNavigation<any>();

  const reload = useCallback(() => {
    loadUser().then(u => {
      setUser(u);
      const quotes = rawDashQuotes[lang as 'en' | 'zh'];
      getDailyQuoteIndex(quotes.length).then(index => {
        setMessage(buildDailyMessage(u, lang, quotes[index]));
      });
    });
  }, [lang]);

  useFocusEffect(reload);

  if (!user) return null;

  const now = new Date();
  const doy = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000);
  const secsSinceMidnight = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const todayUsed = Math.round((secsSinceMidnight / 86400) * 100);

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeftMonth = daysInMonth - now.getDate();
  const monthUsedPct = Math.round(((now.getDate() - 1) / daysInMonth) * 100);

  const totalDays = user.targetAge * 365;
  const lifePct = Math.min(100, (user.age * 365 / totalDays) * 100);
  const yearPct = Math.round((doy / 365) * 100);

  const displayAge = user.birthdate ? ageFromBirthdate(user.birthdate) : user.age;
  const nextBday = user.birthdate ? daysUntilBirthday(user.birthdate) : null;

  const today = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const checkins = user.checkins ?? [];
  const todayEntry = checkins.find((c: CheckIn) => c.date === todayISO);
  const todayMood = todayEntry ? s.moods.find(m => m.key === todayEntry.mood) : null;

  // streak
  let streak = 0;
  const checkedDates = new Set(checkins.map((c: CheckIn) => c.date));
  const sd = new Date(now);
  for (;;) {
    const iso = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, '0')}-${String(sd.getDate()).padStart(2, '0')}`;
    if (checkedDates.has(iso)) { streak++; sd.setDate(sd.getDate() - 1); } else break;
  }

  const greeting = user.name
    ? s.goodToSeeNamed(user.name).replace('\n', ' ')
    : s.goodToSee;

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

      {/* check-in card */}
      <TouchableOpacity
        onPress={() => navigation.navigate('CheckIn' as any)}
        style={[styles.checkInCard, todayEntry && styles.checkInCardDone]}
        activeOpacity={0.85}
      >
        <View style={[styles.checkInIcon, todayEntry && styles.checkInIconDone]}>
          <Text style={styles.checkInIconText}>
            {todayMood ? todayMood.emoji : '✓'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <MonoText style={{ ...styles.checkInMeta, ...(todayEntry ? { color: theme.accentFg, opacity: 0.75 } : {}) }}>
            {lang === 'zh' ? '今天' : 'Today'}{streak > 0 ? ` · ${s.streakLabel(streak)}` : ''}
          </MonoText>
          <Text style={[styles.checkInTitle, todayEntry ? { color: theme.accentFg } : {}]}>
            {todayEntry
              ? (lang === 'zh' ? '已打卡。点击编辑。' : 'Checked in. Tap to edit.')
              : (lang === 'zh' ? '我今天还活着 →' : "I'm alive today →")}
          </Text>
        </View>
        <MonoText style={{ ...styles.checkInArrow, ...(todayEntry ? { color: theme.accentFg } : {}) }}>→</MonoText>
      </TouchableOpacity>

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

      {/* stats + inline bars */}
      <View style={styles.statsCard}>
        <StatRow
          label={lang === 'zh' ? '本月剩余' : 'Days left in month'}
          value={`${daysLeftMonth}`}
          sub={lang === 'zh' ? `${now.getDate()} / ${daysInMonth} 天` : `${now.getDate()} / ${daysInMonth} days`}
          pct={monthUsedPct}
        />
        <View style={styles.divider} />
        <StatRow
          label={lang === 'zh' ? '今年进度' : 'Year progress'}
          value={`${doy} / 365`}
          sub={`${yearPct}%`}
          pct={yearPct}
        />
        <View style={styles.divider} />
        <StatRow
          label={lang === 'zh' ? '人生进度' : 'Life progress'}
          value={`${lifePct.toFixed(1)}%`}
          sub={lang === 'zh' ? `还剩 ${user.daysLeft.toLocaleString()} 天` : `${user.daysLeft.toLocaleString()} days left`}
          pct={lifePct}
        />
      </View>

      {/* daily message */}
      {message && (
        <View style={styles.messageCard}>
          <Eyebrow style={{ marginBottom: 10 }}>
            {lang === 'zh' ? '今日格言' : "Today's note"}
          </Eyebrow>
          <Text style={styles.messageTitle}>{message.title}</Text>
          <Text style={styles.messageBody}>{message.body}</Text>
        </View>
      )}

      {/* capsule count */}
      <Card style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Eyebrow style={{ marginBottom: 4 }}>{s.timeCapsules}</Eyebrow>
          <MonoText style={{ fontSize: 9 }}>{s.lettersToSelf}</MonoText>
        </View>
        <Text style={styles.bigCount}>{user.capsules?.length ?? 0}</Text>
      </Card>

      {/* links */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Hourglass')}
        style={styles.link}
      >
        <Eyebrow style={{ color: theme.accent }}>{s.viewHourglass}</Eyebrow>
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
  bigCount: { fontFamily: fonts.serif, fontSize: 36, color: theme.fg },

  checkInCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 14, marginBottom: 10,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
  },
  checkInCardDone: { backgroundColor: theme.accent, borderColor: theme.accent },
  checkInIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center',
  },
  checkInIconDone: { backgroundColor: 'rgba(245,236,214,0.18)' },
  checkInIconText: { fontSize: 24 },
  checkInMeta: { fontSize: 9, letterSpacing: 1.8, marginBottom: 4 },
  checkInTitle: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 23, color: theme.fg },
  checkInArrow: { fontSize: 14, color: theme.muted },
  sideNumber: { fontFamily: fonts.serif, fontSize: 22, color: theme.fg },

  statsCard: {
    backgroundColor: theme.surface, borderRadius: 16,
    borderWidth: 1, borderColor: theme.border,
    paddingHorizontal: 16, marginBottom: 10,
  },
  divider: { height: 1, backgroundColor: theme.border },

  messageCard: {
    backgroundColor: theme.surface, borderRadius: 16,
    borderWidth: 1, borderColor: theme.border,
    padding: 16, marginBottom: 10,
  },
  messageTitle: {
    fontFamily: fonts.serif, fontSize: 22, color: theme.fg,
    lineHeight: 28, marginBottom: 10,
  },
  messageBody: {
    fontFamily: fonts.body, fontSize: 14, color: theme.muted,
    lineHeight: 22,
  },

  link: {
    alignItems: 'center', paddingVertical: 14,
    borderRadius: 12, backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border, marginTop: 4,
  },
});
