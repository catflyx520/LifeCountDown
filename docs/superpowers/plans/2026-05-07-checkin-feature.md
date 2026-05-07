# Check-in Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a daily check-in tab where users record mood, satisfaction rating, and intention — with a monthly calendar history view — and move Figures into Community as a tab.

**Architecture:** `CheckIn` records stored in `UserData.checkins[]` via existing AsyncStorage `saveUser/loadUser`. New `CheckInScreen` replaces the Figures tab. Community screen gains an internal Quotes/Figures toggle. Dashboard gets a shortcut button.

**Tech Stack:** React Native / Expo SDK 54, AsyncStorage (`src/storage.ts`), terracotta theme (`src/theme.ts`), `@react-navigation/bottom-tabs`, no external calendar library.

---

### Task 1: Types + Storage

**Files:**
- Modify: `src/types.ts`
- Modify: `src/storage.ts`

- [ ] **Step 1: Add CheckIn type and update UserData in `src/types.ts`**

Replace the entire file content with:

```typescript
export type CountMode = 'manual' | 'ai';

export interface Capsule {
  id: string;
  text: string;
  createdAt: string;
  unlockAt: string;
  unlockDays: number;
}

export interface CheckIn {
  date: string;       // 'YYYY-MM-DD'
  mood: string;       // 'calm' | 'good' | 'stressed' | 'tired' | 'motivated' | 'low'
  rating: number;     // 1–5
  intention: string;
}

export interface UserData {
  age: number;
  birthdate: string | null;
  mode: CountMode | null;
  targetAge: number;
  daysLeft: number;
  confidence: number;
  name: string;
  capsules: Capsule[];
  checkins: CheckIn[];
  createdAt: string;
  notificationsEnabled: boolean;
  notifyHour: number;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Age: undefined;
  Mode: undefined;
  Manual: undefined;
  Quiz: undefined;
  Main: undefined;
  Hourglass: undefined;
  WidgetPreview: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  CheckIn: undefined;
  Capsule: undefined;
  Community: undefined;
  Settings: undefined;
};
```

- [ ] **Step 2: Add `checkins: []` to defaultUser in `src/storage.ts`**

Find the `defaultUser` object and add `checkins: []` after `capsules: []`:

```typescript
export const defaultUser: UserData = {
  age: 28,
  birthdate: null,
  mode: null,
  targetAge: 80,
  daysLeft: 18993,
  confidence: 90,
  name: '',
  capsules: [],
  checkins: [],
  createdAt: new Date().toISOString(),
  notificationsEnabled: false,
  notifyHour: 9,
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/storage.ts
git commit -m "feat: add CheckIn type and checkins field to UserData"
```

---

### Task 2: i18n Strings

**Files:**
- Modify: `src/i18n/index.tsx`

- [ ] **Step 1: Add check-in strings to the `en` object**

Add after the `notifTest` line (around line 225, before the closing `tabDashboard` section):

```typescript
  // Check-in
  tabCheckIn: 'Check In',
  checkInTitle: 'Check In',
  checkInSubtitle: "Still here.\nMake it count.",
  todayCheckedIn: "You checked in today.",
  checkInBtn: "I'm here today →",
  moodLabel: 'How are you feeling?',
  moods: [
    { key: 'calm',      label: 'Calm',      emoji: '😌' },
    { key: 'good',      label: 'Good',      emoji: '😊' },
    { key: 'motivated', label: 'Motivated', emoji: '🔥' },
    { key: 'tired',     label: 'Tired',     emoji: '😴' },
    { key: 'stressed',  label: 'Stressed',  emoji: '😤' },
    { key: 'low',       label: 'Low',       emoji: '😔' },
  ],
  ratingLabel: 'Rate your day',
  intentionLabel: "One thing I want to do today",
  intentionPlaceholder: 'Type here...',
  saveCheckIn: 'Save →',
  checkInSaved: 'Saved.',
  noIntention: '—',
  viewingDate: (date: string) => `Viewing ${date}`,
  // Community tabs
  tabQuotes: 'Quotes',
  tabFigures: 'Figures',
  // Dashboard check-in link
  checkInLink: 'Check In →',
```

- [ ] **Step 2: Add the same strings to the `zh` object**

Add after `notifTest` in the zh section:

```typescript
  tabCheckIn: '打卡',
  checkInTitle: '打卡',
  checkInSubtitle: '还活着。\n好好过。',
  todayCheckedIn: '今天已打卡。',
  checkInBtn: '我今天在 →',
  moodLabel: '现在感觉如何？',
  moods: [
    { key: 'calm',      label: '平静', emoji: '😌' },
    { key: 'good',      label: '开心', emoji: '😊' },
    { key: 'motivated', label: '充实', emoji: '🔥' },
    { key: 'tired',     label: '疲惫', emoji: '😴' },
    { key: 'stressed',  label: '焦虑', emoji: '😤' },
    { key: 'low',       label: '低落', emoji: '😔' },
  ],
  ratingLabel: '今日评分',
  intentionLabel: '今天最想做一件事',
  intentionPlaceholder: '写在这里...',
  saveCheckIn: '保存 →',
  checkInSaved: '已保存。',
  noIntention: '—',
  viewingDate: (date: string) => `查看 ${date}`,
  tabQuotes: '名言',
  tabFigures: '人物',
  checkInLink: '打卡 →',
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/index.tsx
git commit -m "feat: add check-in and community tab i18n strings"
```

---

### Task 3: CheckInScreen

**Files:**
- Create: `src/screens/CheckInScreen.tsx`

- [ ] **Step 1: Create `src/screens/CheckInScreen.tsx`**

```typescript
import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Eyebrow, SerifText, Card, MonoText } from '../components/UI';
import { theme, fonts } from '../theme';
import { loadUser, saveUser } from '../storage';
import { CheckIn } from '../types';
import { useT } from '../i18n';

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const { s } = useT();

  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [mood, setMood] = useState('');
  const [rating, setRating] = useState(0);
  const [intention, setIntention] = useState('');
  const [saved, setSaved] = useState(false);

  const today = toDateStr(new Date());
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Calendar helpers
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  const checkedDates = new Set(checkins.map(c => c.date));

  const selectedEntry = checkins.find(c => c.date === selectedDate);
  const isToday = selectedDate === today;
  const isEditable = isToday && !selectedEntry;

  useFocusEffect(useCallback(() => {
    loadUser().then(u => {
      setCheckins(u.checkins ?? []);
      // Pre-fill form if today already has a partial entry
      const todayEntry = (u.checkins ?? []).find(c => c.date === today);
      if (todayEntry) {
        setMood(todayEntry.mood);
        setRating(todayEntry.rating);
        setIntention(todayEntry.intention);
      } else {
        setMood('');
        setRating(0);
        setIntention('');
      }
    });
    setSaved(false);
    setSelectedDate(today);
  }, []));

  const handleSave = async () => {
    if (!mood || !rating) return;
    const entry: CheckIn = { date: today, mood, rating, intention };
    const existing = checkins.filter(c => c.date !== today);
    const updated = [...existing, entry];
    await saveUser({ checkins: updated });
    setCheckins(updated);
    setSaved(true);
  };

  const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Eyebrow style={{ marginBottom: 8 }}>{s.checkInTitle}</Eyebrow>
      <SerifText size={28} style={{ marginBottom: 20 }}>{s.checkInSubtitle}</SerifText>

      {/* Calendar */}
      <Card style={{ marginBottom: 16 }}>
        <MonoText style={{ fontSize: 9, marginBottom: 12, textAlign: 'center', letterSpacing: 1.5 }}>
          {monthName.toUpperCase()}
        </MonoText>

        {/* Day-of-week headers */}
        <View style={styles.calRow}>
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <View key={i} style={styles.calCell}>
              <MonoText style={{ fontSize: 8, color: theme.muted }}>{d}</MonoText>
            </View>
          ))}
        </View>

        {/* Day grid */}
        {Array.from({ length: Math.ceil((firstDayOfWeek + daysInMonth) / 7) }).map((_, week) => (
          <View key={week} style={styles.calRow}>
            {Array.from({ length: 7 }).map((_, dow) => {
              const day = week * 7 + dow - firstDayOfWeek + 1;
              if (day < 1 || day > daysInMonth) return <View key={dow} style={styles.calCell} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isChecked = checkedDates.has(dateStr);
              const isSel = dateStr === selectedDate;
              const isTod = dateStr === today;
              return (
                <TouchableOpacity
                  key={dow}
                  style={styles.calCell}
                  onPress={() => setSelectedDate(dateStr)}
                >
                  <View style={[
                    styles.calDot,
                    isChecked && styles.calDotChecked,
                    isSel && styles.calDotSelected,
                    isTod && !isChecked && !isSel && styles.calDotToday,
                  ]}>
                    <Text style={[
                      styles.calDayText,
                      isChecked && { color: theme.accentFg },
                      isSel && { color: theme.accentFg },
                    ]}>
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </Card>

      {/* Selected day detail / form */}
      {selectedEntry && !isEditable ? (
        // View past entry
        <Card style={{ marginBottom: 12 }}>
          <Eyebrow style={{ marginBottom: 10 }}>{s.viewingDate(selectedDate)}</Eyebrow>
          <View style={styles.entryRow}>
            <MonoText style={{ fontSize: 9 }}>{s.moodLabel}</MonoText>
            <Text style={styles.entryValue}>
              {s.moods.find(m => m.key === selectedEntry.mood)?.emoji ?? ''}{' '}
              {s.moods.find(m => m.key === selectedEntry.mood)?.label ?? selectedEntry.mood}
            </Text>
          </View>
          <View style={styles.entryRow}>
            <MonoText style={{ fontSize: 9 }}>{s.ratingLabel}</MonoText>
            <Text style={styles.entryValue}>{'★'.repeat(selectedEntry.rating)}{'☆'.repeat(5 - selectedEntry.rating)}</Text>
          </View>
          <View style={[styles.entryRow, { borderBottomWidth: 0 }]}>
            <MonoText style={{ fontSize: 9 }}>{s.intentionLabel}</MonoText>
            <Text style={[styles.entryValue, { flex: 1, textAlign: 'right' }]}>
              {selectedEntry.intention || s.noIntention}
            </Text>
          </View>
        </Card>
      ) : isToday ? (
        // Today's form
        <Card style={{ marginBottom: 12 }}>
          {saved || !!checkins.find(c => c.date === today) ? (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <MonoText style={{ fontSize: 10, color: theme.accent, letterSpacing: 1.5 }}>
                {s.todayCheckedIn}
              </MonoText>
            </View>
          ) : (
            <>
              {/* Mood */}
              <Eyebrow style={{ marginBottom: 10 }}>{s.moodLabel}</Eyebrow>
              <View style={styles.moodRow}>
                {s.moods.map(m => (
                  <TouchableOpacity
                    key={m.key}
                    onPress={() => setMood(m.key)}
                    style={[styles.moodBtn, mood === m.key && styles.moodBtnActive]}
                  >
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <MonoText style={[styles.moodLabel, mood === m.key && { color: theme.accent }]}>
                      {m.label}
                    </MonoText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Rating */}
              <Eyebrow style={{ marginTop: 16, marginBottom: 10 }}>{s.ratingLabel}</Eyebrow>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(n => (
                  <TouchableOpacity key={n} onPress={() => setRating(n)} style={styles.starBtn}>
                    <Text style={[styles.star, n <= rating && styles.starActive]}>
                      {n <= rating ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Intention */}
              <Eyebrow style={{ marginTop: 16, marginBottom: 10 }}>{s.intentionLabel}</Eyebrow>
              <TextInput
                value={intention}
                onChangeText={setIntention}
                placeholder={s.intentionPlaceholder}
                placeholderTextColor={theme.muted}
                style={styles.intentionInput}
                multiline
              />

              {/* Save */}
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.saveBtn, (!mood || !rating) && { opacity: 0.4 }]}
                disabled={!mood || !rating}
              >
                <MonoText style={{ fontSize: 10, color: theme.accentFg, letterSpacing: 1.5 }}>
                  {s.saveCheckIn}
                </MonoText>
              </TouchableOpacity>
            </>
          )}
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  calRow: { flexDirection: 'row', marginBottom: 4 },
  calCell: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  calDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  calDotChecked: { backgroundColor: theme.accent },
  calDotSelected: { backgroundColor: theme.accent, opacity: 0.7 },
  calDotToday: { borderWidth: 1, borderColor: theme.accent },
  calDayText: { fontFamily: fonts.mono, fontSize: 11, color: theme.fg },

  entryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderColor: theme.border,
  },
  entryValue: { fontFamily: fonts.serif, fontSize: 16, color: theme.fg },

  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: theme.border, alignItems: 'center', gap: 4,
  },
  moodBtnActive: { borderColor: theme.accent, backgroundColor: theme.surface },
  moodEmoji: { fontSize: 20 },
  moodLabel: { fontSize: 9, color: theme.muted, letterSpacing: 1 },

  starsRow: { flexDirection: 'row', gap: 8 },
  starBtn: { padding: 4 },
  star: { fontFamily: fonts.mono, fontSize: 28, color: theme.border },
  starActive: { color: theme.accent },

  intentionInput: {
    fontFamily: fonts.body, fontSize: 15, color: theme.fg,
    borderBottomWidth: 1, borderColor: theme.border,
    paddingVertical: 8, minHeight: 44,
  },

  saveBtn: {
    marginTop: 16, padding: 14, borderRadius: 12,
    backgroundColor: theme.accent, alignItems: 'center',
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/screens/CheckInScreen.tsx
git commit -m "feat: add CheckInScreen with calendar and daily form"
```

---

### Task 4: Community Tab Switcher (Quotes / Figures)

**Files:**
- Modify: `src/screens/CommunityScreen.tsx`

- [ ] **Step 1: Rewrite `src/screens/CommunityScreen.tsx`**

Replace the entire file with:

```typescript
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
          {/* cohort compare */}
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

          {/* activity streaks */}
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
    marginBottom: 4,
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/screens/CommunityScreen.tsx
git commit -m "feat: add Quotes/Figures tab switcher to CommunityScreen"
```

---

### Task 5: Navigation — Replace Figures Tab with CheckIn

**Files:**
- Modify: `src/navigation/index.tsx`

- [ ] **Step 1: Update `src/navigation/index.tsx`**

Replace the entire file with:

```typescript
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Text } from 'react-native';
import { theme, fonts } from '../theme';
import { loadUser } from '../storage';
import { RootStackParamList, MainTabParamList } from '../types';
import { useT } from '../i18n';

import OnboardingScreen from '../screens/OnboardingScreen';
import AgeScreen from '../screens/AgeScreen';
import ModeScreen from '../screens/ModeScreen';
import ManualScreen from '../screens/ManualScreen';
import QuizScreen from '../screens/QuizScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CheckInScreen from '../screens/CheckInScreen';
import CapsuleScreen from '../screens/CapsuleScreen';
import HourglassScreen from '../screens/HourglassScreen';
import WidgetPreviewScreen from '../screens/WidgetPreviewScreen';
import CommunityScreen from '../screens/CommunityScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '⌂',
    CheckIn: '✓',
    Capsule: '◉',
    Community: '◈',
    Settings: '⊙',
  };
  return (
    <Text style={{ fontSize: 20, color: active ? theme.accent : theme.muted }}>
      {icons[name] ?? '●'}
    </Text>
  );
}

function MainTabs() {
  const { s } = useT();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: {
          fontFamily: fonts.mono,
          fontSize: 8,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        },
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} active={focused} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: s.tabDashboard }} />
      <Tab.Screen name="CheckIn" component={CheckInScreen} options={{ tabBarLabel: s.tabCheckIn }} />
      <Tab.Screen name="Capsule" component={CapsuleScreen} options={{ tabBarLabel: s.tabCapsule }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ tabBarLabel: s.tabCommunity }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: s.tabSettings }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    loadUser().then(u => {
      if (u.mode !== null && u.daysLeft > 0) {
        setInitialRoute('Main');
      } else if (u.age !== 28 || u.birthdate) {
        setInitialRoute('Mode');
      } else {
        setInitialRoute('Onboarding');
      }
    });
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Age" component={AgeScreen} />
        <Stack.Screen name="Mode" component={ModeScreen} />
        <Stack.Screen name="Manual" component={ManualScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Hourglass" component={HourglassScreen} />
        <Stack.Screen name="WidgetPreview" component={WidgetPreviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/navigation/index.tsx
git commit -m "feat: replace Figures tab with CheckIn in bottom navigation"
```

---

### Task 6: Dashboard Check-in Button

**Files:**
- Modify: `src/screens/DashboardScreen.tsx`

- [ ] **Step 1: Add navigation import and Check-in button**

In `src/screens/DashboardScreen.tsx`, the `useNavigation` hook is already imported. Find the links section (after the capsule card) and add a Check-in button before the Hourglass link:

Find this block:
```typescript
      {/* links */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Hourglass')}
        style={styles.link}
      >
        <Eyebrow style={{ color: theme.accent }}>{s.viewHourglass}</Eyebrow>
      </TouchableOpacity>
```

Replace with:
```typescript
      {/* links */}
      <TouchableOpacity
        onPress={() => navigation.navigate('CheckIn' as any)}
        style={styles.link}
      >
        <Eyebrow style={{ color: theme.accent }}>{s.checkInLink}</Eyebrow>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Hourglass')}
        style={[styles.link, { marginTop: 8 }]}
      >
        <Eyebrow style={{ color: theme.accent }}>{s.viewHourglass}</Eyebrow>
      </TouchableOpacity>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors (the `as any` cast handles the cross-navigator navigation).

- [ ] **Step 3: Start the app and verify**

```bash
npx expo start --clear --ios
```

Verify:
- Bottom nav shows: Home · Check In · Capsule · Community · Settings
- Check-in tab opens with calendar + form
- Mood, rating, intention all save and show on calendar
- Tapping a past checked-in day shows the entry
- Community has Quotes / Figures toggle
- Dashboard has "Check in →" button that jumps to the tab

- [ ] **Step 4: Commit**

```bash
git add src/screens/DashboardScreen.tsx
git commit -m "feat: add Check-in shortcut button to Dashboard"
```

---

### Task 7: Update context + push

- [ ] **Step 1: Update `docs/context.md`** — mark check-in as done, note Community tab refactor complete.

- [ ] **Step 2: Final push**

```bash
git push
```
