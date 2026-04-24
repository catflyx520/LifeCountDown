import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { theme, fonts } from '../theme';
import { Eyebrow, SerifText, Card, MonoText } from '../components/UI';
import AnimatedHourglass from '../components/AnimatedHourglass';
import { useCountdown } from '../hooks/useCountdown';
import { loadUser, ageFromBirthdate, daysUntilBirthday } from '../storage';
import { UserData } from '../types';
import { useT } from '../i18n';


function fmt(n: number) {
  return n.toLocaleString('en-US');
}

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

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { s } = useT();

  const [user, setUser] = useState<UserData | null>(null);
  const countdown = useCountdown();
  const navigation = useNavigation<any>();

  const reload = useCallback(() => {
    loadUser().then(setUser);
  }, []);

  useFocusEffect(reload);

  if (!user) return null;

  const days = user.daysLeft;
  const totalDays = user.targetAge * 365;
  const elapsed = user.age * 365;
  const pct = Math.min(100, (elapsed / totalDays) * 100);
  const dayOfYear = Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000);
  const quote = s.dashQuotes[days % s.dashQuotes.length];

  const displayAge = user.birthdate ? ageFromBirthdate(user.birthdate) : user.age;
  const nextBday = user.birthdate ? daysUntilBirthday(user.birthdate) : null;

  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={false} onRefresh={reload} />}
    >
      {/* top bar */}
      <View style={styles.topBar}>
        <Eyebrow>D/C · {today}</Eyebrow>
        <View style={styles.livePip}>
          <View style={styles.dot} />
          <Eyebrow>{s.live}</Eyebrow>
        </View>
      </View>

      {/* greeting */}
      <SerifText size={22} style={{ marginBottom: 16, lineHeight: 28 }}>
        {user.name ? s.goodToSeeNamed(user.name) : s.goodToSee}
      </SerifText>

      {/* hourglass + hero numbers */}
      <View style={styles.heroSection}>
        <DashHourglass />

        <View style={styles.heroNumbers}>
          <View style={styles.heroCol}>
            <Eyebrow style={{ fontSize: 8, marginBottom: 4 }}>{s.daysRemaining}</Eyebrow>
            <Text style={styles.bigNumber}>{fmt(days)}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.heroCol}>
            <Eyebrow style={{ fontSize: 8, marginBottom: 4 }}>{s.monthsRemaining}</Eyebrow>
            <Text style={styles.bigNumber}>{fmt(Math.floor(days / 30.44))}</Text>
          </View>
        </View>

        <Eyebrow style={{ textAlign: 'center', marginTop: -4 }}>
          ≈ {Math.floor(days / 365)} {s.yrs} · {Math.floor((days % 365) / 30)} {s.mo} · {days % 30} d
        </Eyebrow>

        {/* countdown pill */}
        <View style={styles.countdownCard}>
          <Eyebrow style={{ fontSize: 8, marginBottom: 4 }}>{s.todayEndsIn}</Eyebrow>
          <Text style={styles.countdown}>{countdown}</Text>
        </View>
      </View>

      {/* life progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Eyebrow style={{ fontSize: 9 }}>{s.lifeProgress}</Eyebrow>
          <Eyebrow style={{ fontSize: 9 }}>{pct.toFixed(1)}%</Eyebrow>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
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

      {/* quote */}
      <Card style={{ marginBottom: 10 }}>
        <Eyebrow style={{ marginBottom: 8 }}>
          {user.name ? s.forNamed(user.name) : s.todaysNote}
        </Eyebrow>
        <Text style={styles.quoteText}>"{quote.text}"</Text>
        <Text style={styles.quoteAuthor}>— {quote.author.toUpperCase()}</Text>
      </Card>

      {/* stat grid */}
      <View style={styles.grid}>
        <StatCard label={s.dayOfYear}  value={dayOfYear}             unit="/ 365" />
        <StatCard label={s.yearsLeft}  value={Math.floor(days / 365)} unit={s.approx} />
        <StatCard label={s.target}     value={user.targetAge}         unit={s.yrs} />
        <StatCard
          label={s.confidence}
          value={user.mode === 'ai' ? `${user.confidence}%` : '—'}
          unit={user.mode === 'ai' ? s.aiEstimate : s.userSet}
        />
      </View>

      {/* hourglass link */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Hourglass')}
        style={styles.hourglassLink}
      >
        <Eyebrow style={{ color: theme.accent }}>{s.viewHourglass}</Eyebrow>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string | number; unit: string }) {
  return (
    <View style={statStyles.card}>
      <Eyebrow style={{ fontSize: 9, marginBottom: 8 }}>{label}</Eyebrow>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.unit}>{unit}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    width: '48%', padding: 14, borderRadius: 12,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    marginBottom: 10,
  },
  value: { fontFamily: fonts.serif, fontSize: 26, color: theme.fg, lineHeight: 28 },
  unit: { fontFamily: fonts.mono, fontSize: 9, color: theme.muted, letterSpacing: 1.2, marginTop: 4 },
});

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  livePip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.accent },

  heroSection: { alignItems: 'center', paddingVertical: 16, gap: 12 },
  heroNumbers: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  heroCol: { flex: 1, alignItems: 'center' },
  separator: { width: 1, height: 60, backgroundColor: theme.border },
  bigNumber: { fontFamily: fonts.serif, fontSize: 48, lineHeight: 52, color: theme.fg, letterSpacing: -2 },

  countdownCard: {
    paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 12, backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border,
    alignItems: 'center',
  },
  countdown: { fontFamily: fonts.mono, fontSize: 26, letterSpacing: 2, color: theme.accent },

  progressSection: { marginBottom: 16 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressTrack: { height: 2, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: theme.accent },

  ageNumber: { fontFamily: fonts.serif, fontSize: 40, lineHeight: 42, color: theme.fg },
  sideNumber: { fontFamily: fonts.serif, fontSize: 22, color: theme.fg },

  quoteText: { fontFamily: fonts.serifItalic, fontSize: 16, lineHeight: 22, color: theme.fg, marginBottom: 8 },
  quoteAuthor: { fontFamily: fonts.mono, fontSize: 10, color: theme.muted, letterSpacing: 1.5 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  hourglassLink: {
    alignItems: 'center', paddingVertical: 14,
    borderRadius: 12, backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border, marginTop: 4,
  },
});
