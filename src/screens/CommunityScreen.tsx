import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Eyebrow, SerifText, Card, MonoText } from '../components/UI';
import { theme, fonts } from '../theme';
import { loadUser } from '../storage';
import { useT } from '../i18n';
import { db } from '../firebase';

type Quote = {
  id: string;
  text: { en: string; zh: string };
  author: string;
  source: string | null;
};

type Figure = {
  id: string;
  name: string;
  name_zh?: string;
  died_age: number;
  note: { en: string; zh: string };
  field: string;
};

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { s, lang } = useT();
  const [age, setAge] = useState(28);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [figures, setFigures] = useState<Figure[]>([]);
  const [tab, setTab] = useState<'quotes' | 'figures'>('quotes');

  useEffect(() => {
    getDocs(query(collection(db, 'quotes'), where('active', '==', true)))
      .then(snap => setQuotes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Quote))))
      .catch(console.error);
    getDocs(query(collection(db, 'figures'), where('active', '==', true)))
      .then(snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Figure));
        data.sort((a, b) => a.died_age - b.died_age);
        setFigures(data);
      })
      .catch(console.error);
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
      <SerifText size={28} style={{ marginBottom: 16 }}>{s.communitySubtitle}</SerifText>

      {/* Tab switcher */}
      <View style={styles.toggle}>
        {(['quotes', 'figures'] as const).map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.toggleBtn, tab === t && styles.toggleActive]}
          >
            <Text style={[styles.toggleText, tab === t && styles.toggleTextActive]}>
              {t === 'quotes' ? s.tabQuotes.toUpperCase() : s.tabFigures.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'quotes' ? (
        <>
          <Eyebrow style={{ marginBottom: 10, marginTop: 16 }}>{s.cohortLabel(age)}</Eyebrow>
          <View style={{ gap: 8, marginBottom: 20 }}>
            {s.cohort.map((c, i) => (
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

          <Eyebrow style={{ marginBottom: 10 }}>{s.thisWeek((1024).toLocaleString())}</Eyebrow>
          <Card style={{ marginBottom: 20, gap: 14 }}>
            {s.streaks.map((streak, i) => (
              <View key={i}>
                <View style={styles.streakRow}>
                  <Text style={styles.streakLabel}>{streak.label}</Text>
                  <MonoText style={{ fontSize: 9, color: theme.accent }}>{streak.pct}%</MonoText>
                </View>
                <View style={styles.bar}>
                  <View style={[styles.barFill, { width: `${streak.pct}%` as any }]} />
                </View>
              </View>
            ))}
          </Card>

          {quotes.length > 0 && (
            <>
              <Eyebrow style={{ marginBottom: 10 }}>{s.wordsToCarry}</Eyebrow>
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
        </>
      ) : (
        <>
          <Eyebrow style={{ marginBottom: 8, marginTop: 16 }}>{s.figuresSubtitle}</Eyebrow>
          <View style={{ gap: 8 }}>
            {figures.map(f => {
              const outlived = age > f.died_age;
              const ratio = Math.min(1, age / f.died_age);
              return (
                <View key={f.id} style={[styles.figCard, outlived && styles.figCardAccent]}>
                  <View style={[styles.ratioBar, {
                    width: `${ratio * 100}%` as any,
                    backgroundColor: outlived ? theme.accent : theme.muted,
                    opacity: outlived ? 0.9 : 0.4,
                  }]} />
                  <View style={styles.figRow}>
                    <Text style={styles.figName}>{lang === 'zh' && f.name_zh ? f.name_zh : f.name}</Text>
                    <Text style={[styles.figBadge, { color: outlived ? theme.accent : theme.muted }]}>
                      {outlived
                        ? `+${age - f.died_age} ${s.yrs} ${s.outlived}`
                        : `${f.died_age - age} ${s.yrs} ${s.toLive}`}
                    </Text>
                  </View>
                  <Text style={styles.figNote}>
                    {s.passedAt(f.died_age)} — {lang === 'zh' ? f.note.zh : f.note.en}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row', borderRadius: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: theme.border, alignSelf: 'flex-start',
  },
  toggleBtn: { paddingHorizontal: 20, paddingVertical: 9, backgroundColor: 'transparent' },
  toggleActive: { backgroundColor: theme.accent },
  toggleText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.8, color: theme.muted },
  toggleTextActive: { color: theme.accentFg },

  cohortValue: { fontFamily: fonts.serif, fontSize: 28, color: theme.fg, lineHeight: 30 },
  streakRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  streakLabel: { fontFamily: fonts.body, fontSize: 12, color: theme.fg },
  bar: { height: 2, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: theme.accent, borderRadius: 2 },
  quoteCard: {
    padding: 14, borderRadius: 12,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
  },
  quoteText: { fontFamily: fonts.serifItalic, fontSize: 14, color: theme.fg, lineHeight: 20, marginBottom: 8 },
  quoteAuthor: { fontSize: 9, color: theme.muted },

  figCard: {
    padding: 14, paddingBottom: 18, borderRadius: 12,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    overflow: 'hidden', position: 'relative',
  },
  figCardAccent: { borderColor: theme.accent },
  ratioBar: { position: 'absolute', left: 0, bottom: 0, height: 3 },
  figRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  figName: { fontFamily: fonts.serif, fontSize: 20, color: theme.fg, flex: 1 },
  figBadge: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, paddingTop: 4 },
  figNote: { fontSize: 12, color: theme.muted, lineHeight: 18, fontFamily: fonts.body },
});
