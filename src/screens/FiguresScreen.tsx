import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Eyebrow, SerifText, MonoText } from '../components/UI';
import { theme, fonts } from '../theme';
import { loadUser } from '../storage';
import { useT } from '../i18n';

const FIGURES = [
  { name: 'Van Gogh',        died: 37, note: 'painted The Starry Night at 36' },
  { name: 'Mozart',          died: 35, note: 'wrote 600+ works before his body gave out' },
  { name: 'Frida Kahlo',     died: 47, note: 'painted through chronic pain for 30 years' },
  { name: 'Bruce Lee',       died: 32, note: 'redefined cinema, kung fu, and charisma' },
  { name: 'Marcus Aurelius', died: 58, note: 'wrote Meditations — probably to himself' },
  { name: 'Marie Curie',     died: 66, note: 'two Nobels, one in physics, one in chemistry' },
  { name: 'Steve Jobs',      died: 56, note: 'changed how we carry our lives around' },
  { name: 'Einstein',        died: 76, note: 'spent the last 30 years chasing a unified theory' },
];

export default function FiguresScreen() {
  const insets = useSafeAreaInsets();
  const { s } = useT();
  const [age, setAge] = useState(28);

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

      <View style={{ gap: 8 }}>
        {FIGURES.map((f, i) => {
          const outlived = age > f.died;
          const ratio = Math.min(1, age / f.died);
          return (
            <View key={i} style={[styles.card, outlived && styles.cardAccent]}>
              {/* progress bar at bottom */}
              <View style={[styles.ratioBar, {
                width: `${ratio * 100}%`,
                backgroundColor: outlived ? theme.accent : theme.muted,
                opacity: outlived ? 0.9 : 0.4,
              }]} />

              <View style={styles.row}>
                <Text style={styles.name}>{f.name}</Text>
                <Text style={[styles.badge, { color: outlived ? theme.accent : theme.muted }]}>
                  {outlived
                    ? `+${age - f.died} ${s.yrs} ${s.outlived}`
                    : `${f.died - age} ${s.yrs} ${s.toLive}`}
                </Text>
              </View>
              <Text style={styles.note}>died at {f.died} — {f.note}</Text>
            </View>
          );
        })}
      </View>
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
