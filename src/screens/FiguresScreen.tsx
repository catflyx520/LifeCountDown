import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Eyebrow, SerifText, MonoText } from '../components/UI';
import { theme, fonts } from '../theme';
import { loadUser } from '../storage';
import { useT } from '../i18n';
import { db } from '../firebase';

type Figure = {
  id: string;
  name: string;
  name_zh?: string;
  died_age: number;
  note: { en: string; zh: string };
  field: string;
};

export default function FiguresScreen() {
  const insets = useSafeAreaInsets();
  const { s, lang } = useT();
  const [age, setAge] = useState(28);
  const [figures, setFigures] = useState<Figure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, 'figures'), where('active', '==', true)))
      .then(snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Figure));
        data.sort((a, b) => a.died_age - b.died_age);
        setFigures(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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
      <Eyebrow style={{ marginBottom: 8 }}>{s.figuresTitle}</Eyebrow>
      <SerifText size={28} style={{ marginBottom: 20 }}>{s.figuresSubtitle}</SerifText>

      {loading ? (
        <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
      ) : (
        <View style={{ gap: 8 }}>
          {figures.map(f => {
            const outlived = age > f.died_age;
            const ratio = Math.min(1, age / f.died_age);
            return (
              <View key={f.id} style={[styles.card, outlived && styles.cardAccent]}>
                <View style={[styles.ratioBar, {
                  width: `${ratio * 100}%`,
                  backgroundColor: outlived ? theme.accent : theme.muted,
                  opacity: outlived ? 0.9 : 0.4,
                }]} />
                <View style={styles.row}>
                  <Text style={styles.name}>{lang === 'zh' && f.name_zh ? f.name_zh : f.name}</Text>
                  <Text style={[styles.badge, { color: outlived ? theme.accent : theme.muted }]}>
                    {outlived
                      ? `+${age - f.died_age} ${s.yrs} ${s.outlived}`
                      : `${f.died_age - age} ${s.yrs} ${s.toLive}`}
                  </Text>
                </View>
                <Text style={styles.note}>
                  {s.passedAt(f.died_age)} — {lang === 'zh' ? f.note.zh : f.note.en}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14, paddingBottom: 18, borderRadius: 12,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    overflow: 'hidden', position: 'relative',
  },
  cardAccent: { borderColor: theme.accent },
  ratioBar: { position: 'absolute', left: 0, bottom: 0, height: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  name: { fontFamily: fonts.serif, fontSize: 20, color: theme.fg, flex: 1 },
  badge: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, paddingTop: 4 },
  note: { fontSize: 12, color: theme.muted, lineHeight: 18, fontFamily: fonts.body },
});
