import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, PanResponder, StyleSheet, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Eyebrow, SerifText, Btn, Card } from '../components/UI';
import { theme, fonts } from '../theme';
import { RootStackParamList } from '../types';
import { saveUser, loadUser } from '../storage';
import { useT } from '../i18n';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Age'> };

const QUOTES = [
  { t: "It is not that we have a short time to live, but that we waste a lot of it.", a: "Seneca" },
  { t: "You could leave life right now. Let that determine what you do.", a: "Marcus Aurelius" },
  { t: "As long as you live, keep learning how to live.", a: "Seneca" },
  { t: "The life of the dead is placed in the memory of the living.", a: "Cicero" },
];

function calcAge(year: number, month: number, day: number): number {
  const bd = new Date(year, month - 1, day);
  const ms = Date.now() - bd.getTime();
  return Math.max(18, Math.min(120, Math.floor(ms / (365.25 * 24 * 3600 * 1000))));
}

export default function AgeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { s } = useT();
  const [mode, setMode] = useState<'age' | 'birthday'>('age');
  const [age, setAge] = useState(28);
  const [outerScroll, setOuterScroll] = useState(true);
  const now = new Date();
  const [bYear, setBYear] = useState(now.getFullYear() - 28);
  const [bMonth, setBMonth] = useState(1);
  const [bDay, setBDay] = useState(1);

  const dragAge = useRef(age);

  useEffect(() => {
    loadUser().then(u => {
      if (u.birthdate) {
        const [y, m, d] = u.birthdate.split('-').map(Number);
        setBYear(y); setBMonth(m); setBDay(d);
        setMode('birthday');
      } else if (u.age) {
        setAge(u.age);
        dragAge.current = u.age;
      }
    });
  }, []);

  const quote = QUOTES[age % QUOTES.length];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { dragAge.current = age; },
      onPanResponderMove: (_, gs) => {
        const newAge = Math.max(18, Math.min(120, Math.round(dragAge.current + gs.dx / 6)));
        setAge(newAge);
      },
    })
  ).current;

  const proceed = () => {
    if (mode === 'birthday') {
      const computedAge = calcAge(bYear, bMonth, bDay);
      const bd = `${bYear}-${String(bMonth).padStart(2, '0')}-${String(bDay).padStart(2, '0')}`;
      saveUser({ age: computedAge, birthdate: bd });
    } else {
      saveUser({ age, birthdate: null });
    }
    navigation.navigate('Mode');
  };

  const previewAge = mode === 'birthday' ? calcAge(bYear, bMonth, bDay) : age;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={outerScroll}
    >
      {/* header */}
      <View style={styles.header}>
        <Eyebrow style={styles.step}>{s.step01}</Eyebrow>
        <SerifText size={32} style={{ marginBottom: 14 }}>{s.howOld}</SerifText>

        <View style={styles.toggle}>
          {(['age', 'birthday'] as const).map(m => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              style={[styles.toggleBtn, mode === m && styles.toggleActive]}
            >
              <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
                {m === 'age' ? s.modeAge : s.modeBirthday}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* input area */}
      {mode === 'age' ? (
        <View style={styles.ageArea}>
          <Text style={styles.bigNumber}>{age}</Text>
          <Eyebrow style={{ textAlign: 'center' }}>{s.yearsAliveDrag}</Eyebrow>
          <View style={styles.scrubber} {...panResponder.panHandlers}>
            <Text style={styles.scrubberHint}>← {s.drag} · {age} {s.yrs} · {s.drag} →</Text>
          </View>
        </View>
      ) : (
        <View style={styles.birthdayArea}>
          <Eyebrow style={{ marginBottom: 12, textAlign: 'center' }}>{s.selectDOB}</Eyebrow>

          {/* disable outer scroll while fingers are on the drums */}
          <View
            style={styles.drumRow}
            onTouchStart={() => setOuterScroll(false)}
            onTouchEnd={() => setOuterScroll(true)}
            onTouchCancel={() => setOuterScroll(true)}
          >
            <View style={styles.drumCol}>
              <Eyebrow style={styles.drumLabel}>{s.drumYear}</Eyebrow>
              <ScrollView style={styles.drum} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                {Array.from({ length: now.getFullYear() - 1924 }, (_, i) => now.getFullYear() - i).map(y => (
                  <TouchableOpacity key={y} onPress={() => setBYear(y)} style={styles.drumItem}>
                    <Text style={[styles.drumItemText, bYear === y && styles.drumItemActive]}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.drumCol}>
              <Eyebrow style={styles.drumLabel}>{s.drumMonth}</Eyebrow>
              <ScrollView style={styles.drum} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <TouchableOpacity key={m} onPress={() => setBMonth(m)} style={styles.drumItem}>
                    <Text style={[styles.drumItemText, bMonth === m && styles.drumItemActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.drumCol}>
              <Eyebrow style={styles.drumLabel}>{s.drumDay}</Eyebrow>
              <ScrollView style={styles.drum} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                {Array.from({ length: new Date(bYear, bMonth, 0).getDate() }, (_, i) => i + 1).map(d => (
                  <TouchableOpacity key={d} onPress={() => setBDay(d)} style={styles.drumItem}>
                    <Text style={[styles.drumItemText, bDay === d && styles.drumItemActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <Text style={styles.birthdayPreview}>
            {bYear}-{String(bMonth).padStart(2, '0')}-{String(bDay).padStart(2, '0')}
            {'  '}
            <Text style={{ color: theme.accent }}>{s.age} {previewAge}</Text>
          </Text>
        </View>
      )}

      <Card style={{ marginVertical: 16 }}>
        <Text style={styles.quoteText}>"{quote.t}"</Text>
        <Text style={styles.quoteAuthor}>— {quote.a.toUpperCase()}</Text>
      </Card>

      <Btn onPress={proceed}>{s.continueBtn}</Btn>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 8, marginBottom: 8 },
  step: { marginBottom: 8 },
  toggle: {
    flexDirection: 'row', borderRadius: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: theme.border, alignSelf: 'flex-start',
  },
  toggleBtn: { paddingHorizontal: 18, paddingVertical: 8, backgroundColor: 'transparent' },
  toggleActive: { backgroundColor: theme.accent },
  toggleText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.8, color: theme.muted },
  toggleTextActive: { color: theme.accentFg },

  ageArea: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  bigNumber: { fontFamily: fonts.serif, fontSize: 120, lineHeight: 120, color: theme.fg, letterSpacing: -4 },
  scrubber: {
    width: '100%', height: 52, borderRadius: 10,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    alignItems: 'center', justifyContent: 'center',
  },
  scrubberHint: { fontFamily: fonts.mono, fontSize: 11, color: theme.muted, letterSpacing: 1.5 },

  birthdayArea: { paddingVertical: 16 },
  drumRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 12 },
  drumCol: { flex: 1, alignItems: 'center' },
  drumLabel: { fontSize: 9, marginBottom: 4 },
  drum: { height: 160, width: '100%', borderRadius: 10, borderWidth: 1, borderColor: theme.border },
  drumItem: { height: 40, alignItems: 'center', justifyContent: 'center' },
  drumItemText: { fontFamily: fonts.serif, fontSize: 18, color: theme.muted },
  drumItemActive: { color: theme.fg },
  birthdayPreview: { fontFamily: fonts.serif, fontSize: 16, color: theme.muted, textAlign: 'center' },

  quoteText: { fontFamily: fonts.serifItalic, fontSize: 14, lineHeight: 20, color: theme.fg, marginBottom: 8 },
  quoteAuthor: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2.2, color: theme.muted },
});
