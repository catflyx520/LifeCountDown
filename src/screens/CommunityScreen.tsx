import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Eyebrow, SerifText, Card, MonoText } from '../components/UI';
import { theme, fonts } from '../theme';
import { loadUser } from '../storage';
import { useT } from '../i18n';
import { db } from '../firebase';

const COHORT = [
  { label: 'avg life expectancy', value: 79, unit: 'yrs', note: 'global average 2024' },
  { label: 'sleep / night', value: 6.8, unit: 'hrs', note: 'adults in your age group' },
  { label: 'screen time / day', value: 7.3, unit: 'hrs', note: 'us adults average' },
  { label: 'exercise / week', value: 1.4, unit: 'days', note: 'meet minimum guidelines' },
];

const STREAKS = [
  { pct: 94, label: 'checked in this week' },
  { pct: 61, label: 'opened app daily' },
  { pct: 38, label: 'wrote a capsule' },
  { pct: 12, label: 'changed their target age' },
];

type Quote = {
  id: string;
  text: { en: string; zh: string };
  author: string;
  source: string | null;
};

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { s, lang } = useT();
  const [age, setAge] = useState(28);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, 'quotes'), where('active', '==', true)))
      .then(snap => setQuotes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Quote))));
  }, []);

  useFocusEffect(useCallback(() => {
    loadUser().then(u => setAge(u.age));
  }, []));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Eyebrow style={{ marginBottom: 8 }}>{s.communityTitle}</Eyebrow>
      <SerifText size={28} style={{ marginBottom: 20 }}>{s.communitySubtitle}</SerifText>

      {/* cohort compare */}
      <Eyebrow style={{ marginBottom: 10 }}>{s.cohortLabel(age)}</Eyebrow>
      <View style={{ gap: 8, marginBottom: 20 }}>
        {COHORT.map((c, i) => (
          <Card key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Eyebrow style={{ fontSize: 9, marginBottom: 4 }}>{c.label}</Eyebrow>
              <MonoText style={{ fontSize: 9, color: theme.muted }}>{c.note}</MonoText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cohortValue}>{c.value}</Text>
              <MonoText style={{ fontSize: 9 }}>{c.unit}</MonoText>
            </View>
          </Card>
        ))}
      </View>

      {/* activity streaks */}
      <Eyebrow style={{ marginBottom: 10 }}>{s.thisWeek((1024).toLocaleString())}</Eyebrow>
      <Card style={{ marginBottom: 20, gap: 14 }}>
        {STREAKS.map((streak, i) => (
          <View key={i}>
            <View style={styles.streakRow}>
              <Text style={styles.streakLabel}>{streak.label}</Text>
              <MonoText style={{ fontSize: 9, color: theme.accent }}>{streak.pct}%</MonoText>
            </View>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${streak.pct}%` }]} />
            </View>
          </View>
        ))}
      </Card>

      {/* quotes from Firestore */}
      {quotes.length > 0 && (
        <>
          <Eyebrow style={{ marginBottom: 10 }}>words to carry</Eyebrow>
          <View style={{ gap: 8 }}>
            {quotes.map(q => (
              <View key={q.id} style={styles.quoteCard}>
                <Text style={styles.quoteText}>
                  "{lang === 'zh' ? q.text.zh : q.text.en}"
                </Text>
                <MonoText style={styles.quoteAuthor}>
                  — {q.author}{q.source ? `, ${q.source}` : ''}
                </MonoText>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cohortValue: {
    fontFamily: fonts.serif, fontSize: 28, color: theme.fg, lineHeight: 30,
  },
  streakRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  streakLabel: { fontFamily: fonts.body, fontSize: 12, color: theme.fg },
  bar: { height: 2, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: theme.accent, borderRadius: 2 },
  quoteCard: {
    padding: 14, borderRadius: 12,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
  },
  quoteText: {
    fontFamily: fonts.serifItalic, fontSize: 14, color: theme.fg, lineHeight: 20, marginBottom: 8,
  },
  quoteAuthor: { fontSize: 9, color: theme.muted },
});
