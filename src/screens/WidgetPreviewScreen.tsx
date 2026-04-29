import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { theme, fonts } from '../theme';
import { Eyebrow, MonoText } from '../components/UI';
import { loadUser } from '../storage';
import { UserData } from '../types';

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString('en-US'); }

function dayOfYear() {
  const now = new Date();
  return Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000);
}

function todayUsedPct() {
  const now = new Date();
  const secs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  return Math.round((secs / 86400) * 100);
}

// ── Large Widget ─────────────────────────────────────────────────────────────

function LargeWidget({ user }: { user: UserData }) {
  const days     = user.daysLeft;
  const months   = Math.floor(days / 30.44);
  const total    = user.targetAge * 365;
  const pct      = Math.min(100, (user.age * 365 / total) * 100);
  const pctStr   = pct.toFixed(1);

  return (
    <View style={lw.card}>

      {/* TOP: logo + numbers — same grouping as widget */}
      <View>
        <View style={lw.header}>
          <Image
            source={require('../../assets/adaptive-icon.png')}
            style={lw.logo}
            resizeMode="contain"
          />
          <MonoText style={lw.appLabel}>  LIFE COUNTER</MonoText>
        </View>

        <View style={lw.numbersRow}>
          <View style={lw.numCol}>
            <MonoText style={lw.numLabel}>DAYS</MonoText>
            <Text style={lw.numValue}>{fmt(days)}</Text>
          </View>
          <View style={lw.divider} />
          <View style={lw.numCol}>
            <MonoText style={lw.numLabel}>MONTHS</MonoText>
            <Text style={lw.numValue}>{fmt(months)}</Text>
          </View>
        </View>
      </View>

      {/* BOTTOM: progress */}
      <View style={lw.progressSection}>
        <View style={lw.progressLabelRow}>
          <MonoText style={lw.progressLabel}>LIFE PROGRESS</MonoText>
          <MonoText style={lw.progressPct}>{pctStr}%</MonoText>
        </View>
        <View style={lw.track}>
          <View style={[lw.fill, { width: `${pct}%` as any }]} />
        </View>
      </View>

    </View>
  );
}

const lw = StyleSheet.create({
  card: {
    backgroundColor: '#f5ecd6',
    borderRadius: 20,
    padding: 14,
    justifyContent: 'space-between',
    aspectRatio: 4 / 2,
  },
  // header row: logo + label, marginBottom matches widget's marginBottom: 10
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  logo: { width: 42, height: 42 },
  appLabel: { fontSize: 10, color: '#3a2e1e80', letterSpacing: 1 },
  numbersRow: { flexDirection: 'row', alignItems: 'center' },
  numCol: { flex: 1, flexDirection: 'column' },
  numLabel: { fontSize: 9, color: '#3a2e1e80', letterSpacing: 1, marginBottom: 2 },
  numValue: { fontFamily: fonts.serif, fontSize: 46, color: '#3a2e1e', lineHeight: 50 },
  divider: { width: 1, height: 56, backgroundColor: '#3a2e1e26', marginHorizontal: 12 },
  progressSection: { flexDirection: 'column' },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 8, color: '#3a2e1e73', letterSpacing: 1 },
  progressPct: { fontSize: 8, color: '#b5533c' },
  track: { height: 6, backgroundColor: '#ddd5c4', borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#b5533c', borderRadius: 3 },
});

// ── Small Widgets ─────────────────────────────────────────────────────────────

function SmallWidget({
  label, value, sub, pct, valueColor,
}: { label: string; value: string; sub: string; pct: number; valueColor: string }) {
  return (
    <View style={sw.card}>
      <MonoText style={sw.label}>{label}</MonoText>
      <Text style={[sw.value, { color: valueColor }]}>{value}</Text>
      <MonoText style={sw.sub}>{sub}</MonoText>
      <View style={sw.track}>
        <View style={[sw.fill, { width: `${Math.min(100, pct)}%` as any }]} />
      </View>
    </View>
  );
}

const sw = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#f5ecd6',
    borderRadius: 18,
    padding: 14,
    aspectRatio: 1,
    justifyContent: 'space-between',
  },
  label: { fontSize: 7, color: '#3a2e1e80', letterSpacing: 1, textTransform: 'uppercase' },
  value: { fontFamily: fonts.serif, fontSize: 32, lineHeight: 34 },
  sub: { fontSize: 8, color: '#3a2e1e59' },
  track: { height: 4, backgroundColor: '#ddd5c4', borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#b5533c', borderRadius: 2 },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function WidgetPreviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [user, setUser] = useState<UserData | null>(null);

  useFocusEffect(useCallback(() => {
    loadUser().then(setUser);
  }, []));

  if (!user) return null;

  const doy = dayOfYear();
  const todayPct = todayUsedPct();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
        <Eyebrow style={{ color: theme.accent }}>← back</Eyebrow>
      </TouchableOpacity>

      <Eyebrow style={{ marginBottom: 6 }}>Widget Preview</Eyebrow>
      <Text style={styles.title}>Home Screen</Text>
      <MonoText style={styles.hint}>This is how widgets will look on your home screen.</MonoText>

      {/* Large Widget */}
      <Eyebrow style={styles.sectionLabel}>4×2 · Life Counter</Eyebrow>
      <LargeWidget user={user} />

      {/* Small Widgets */}
      <Eyebrow style={styles.sectionLabel}>2×2 · Small Widgets</Eyebrow>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <SmallWidget
          label="Year"
          value={String(doy)}
          sub="/ 365"
          pct={(doy / 365) * 100}
          valueColor="#3a2e1e"
        />
        <SmallWidget
          label="Today"
          value={`${todayPct}%`}
          sub="used"
          pct={todayPct}
          valueColor="#b5533c"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontSize: 28, color: theme.fg, marginBottom: 4 },
  hint: { fontSize: 9, color: theme.muted, marginBottom: 20 },
  sectionLabel: { marginTop: 20, marginBottom: 10 },
});
