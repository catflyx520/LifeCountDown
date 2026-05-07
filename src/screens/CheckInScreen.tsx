import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Eyebrow, Card, MonoText } from '../components/UI';
import { theme, fonts } from '../theme';
import { loadUser, saveUser } from '../storage';
import { CheckIn } from '../types';
import { useT } from '../i18n';

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function calcStreak(checkins: CheckIn[]): number {
  if (!checkins.length) return 0;
  const dates = new Set(checkins.map(c => c.date));
  let streak = 0;
  const d = new Date();
  for (;;) {
    const iso = toDateStr(d);
    if (dates.has(iso)) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const { s, lang } = useT();

  const now = new Date();
  const todayStr = toDateStr(now);

  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [draft, setDraft] = useState<CheckIn>({ date: todayStr, mood: '', rating: 0, intention: '' });
  const [justSaved, setJustSaved] = useState(false);

  const entryFor = (iso: string) => checkins.find(c => c.date === iso);

  useFocusEffect(useCallback(() => {
    loadUser().then(u => {
      const all = u.checkins ?? [];
      setCheckins(all);
      const existing = all.find(c => c.date === todayStr);
      setDraft(existing ?? { date: todayStr, mood: '', rating: 0, intention: '' });
      setSelectedDate(todayStr);
      setView({ y: now.getFullYear(), m: now.getMonth() });
    });
    setJustSaved(false);
  }, []));

  // Update draft when selected date changes
  const selectDate = (iso: string) => {
    setSelectedDate(iso);
    const existing = entryFor(iso);
    setDraft(existing ?? { date: iso, mood: '', rating: 0, intention: '' });
    setJustSaved(false);
  };

  const handleSave = async () => {
    if (!draft.mood) return;
    const entry: CheckIn = { ...draft, date: selectedDate };
    const updated = [...checkins.filter(c => c.date !== selectedDate), entry];
    await saveUser({ checkins: updated });
    setCheckins(updated);
    setJustSaved(true);
  };

  const stepMonth = (delta: number) => {
    let { y, m } = view;
    m += delta;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setView({ y, m });
  };

  // Calendar cells
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const firstDayOfWeek = new Date(view.y, view.m, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = new Date(view.y, view.m, 1).toLocaleString('en-US', { month: 'long' });

  const streak = calcStreak(checkins);
  const existing = entryFor(selectedDate);
  const isSaved = justSaved || (existing && JSON.stringify(existing) === JSON.stringify({ ...draft, date: selectedDate }));
  const btnLabel = isSaved ? s.savedCheckIn : existing ? s.updateCheckIn : s.saveCheckIn;

  // 可编辑范围：今天 + 前 6 天
  const minEditDate = new Date(now);
  minEditDate.setDate(minEditDate.getDate() - 6);
  const minEditISO = toDateStr(minEditDate);
  const isEditable = (iso: string) => iso >= minEditISO && iso <= todayStr;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Eyebrow>{s.checkInTitle}</Eyebrow>
        {streak > 0 && (
          <MonoText style={{ fontSize: 9, color: theme.accent, letterSpacing: 1.5 }}>
            {s.streakLabel(streak)}
          </MonoText>
        )}
      </View>

      {/* Calendar */}
      <Card style={{ marginBottom: 14 }}>
        {/* Month navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => stepMonth(-1)} style={styles.monthArrow}>
            <MonoText style={{ fontSize: 18, color: theme.fg }}>‹</MonoText>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{monthName} {view.y}</Text>
          <TouchableOpacity onPress={() => stepMonth(1)} style={styles.monthArrow}>
            <MonoText style={{ fontSize: 18, color: theme.fg }}>›</MonoText>
          </TouchableOpacity>
        </View>

        {/* Day-of-week headers */}
        <View style={styles.weekRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <View key={i} style={styles.weekCell}>
              <MonoText style={{ fontSize: 8, color: theme.muted, letterSpacing: 1 }}>{d}</MonoText>
            </View>
          ))}
        </View>

        {/* Day grid */}
        {Array.from({ length: cells.length / 7 }).map((_, week) => (
          <View key={week} style={styles.weekRow}>
            {cells.slice(week * 7, week * 7 + 7).map((day, dow) => {
              if (day === null) return <View key={dow} style={styles.dayCell} />;
              const iso = `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const entry = entryFor(iso);
              const mood = entry ? s.moods.find(m => m.key === entry.mood) : null;
              const isSel = iso === selectedDate;
              const isTod = iso === todayStr;
              const canEdit = isEditable(iso);
              return (
                <TouchableOpacity
                  key={dow}
                  style={styles.dayCell}
                  onPress={() => canEdit && selectDate(iso)}
                  activeOpacity={canEdit ? 0.7 : 1}
                >
                  <View style={[
                    styles.dayCellInner,
                    isSel && styles.dayCellSelected,
                    !canEdit && styles.dayCellDisabled,
                  ]}>
                    <Text style={[
                      styles.dayNum,
                      isTod && { color: theme.accent, fontWeight: '600' },
                      !canEdit && { color: theme.border },
                    ]}>
                      {day}
                    </Text>
                    <Text style={[styles.dayEmoji, !canEdit && { opacity: 0.3 }]}>{mood ? mood.emoji : ''}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </Card>

      {/* Form */}
      <Card style={{ marginBottom: 12 }}>
        <View style={styles.formHeader}>
          <Eyebrow>
            {selectedDate === todayStr ? s.todayCheckInTitle : selectedDate}
          </Eyebrow>
          {existing && (
            <MonoText style={{ fontSize: 9, color: theme.accent, letterSpacing: 1.5 }}>
              {s.loggedBadge}
            </MonoText>
          )}
        </View>

        {!isEditable(selectedDate) ? (
          <MonoText style={{ fontSize: 11, color: theme.muted, textAlign: 'center', paddingVertical: 20 }}>
            {lang === 'zh' ? '仅可修改最近 7 天的记录' : 'Only the last 7 days can be edited'}
          </MonoText>
        ) : (
          <>
            {/* Mood */}
            <Eyebrow style={{ marginBottom: 8, fontSize: 9 }}>{s.moodLabel}</Eyebrow>
            <View style={styles.moodRow}>
              {s.moods.map(m => (
                <TouchableOpacity
                  key={m.key}
                  onPress={() => { setDraft(d => ({ ...d, mood: m.key })); setJustSaved(false); }}
                  style={[styles.moodBtn, draft.mood === m.key && styles.moodBtnActive]}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating */}
            <Eyebrow style={{ marginTop: 16, marginBottom: 8, fontSize: 9 }}>{s.ratingLabel}</Eyebrow>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity
                  key={n}
                  onPress={() => { setDraft(d => ({ ...d, rating: n })); setJustSaved(false); }}
                  style={styles.starBtn}
                >
                  <Text style={[styles.star, n <= draft.rating && styles.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Intention */}
            <Eyebrow style={{ marginTop: 16, marginBottom: 8, fontSize: 9 }}>{s.intentionLabel}</Eyebrow>
            <TextInput
              value={draft.intention}
              onChangeText={text => { setDraft(d => ({ ...d, intention: text.slice(0, 200) })); setJustSaved(false); }}
              placeholder={s.intentionPlaceholder}
              placeholderTextColor={theme.muted}
              style={styles.intentionInput}
              multiline
            />
            <MonoText style={{ fontSize: 9, color: theme.muted, textAlign: 'right', marginTop: 4 }}>
              {draft.intention.length}/200
            </MonoText>

            {/* Save button */}
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, !draft.mood && { opacity: 0.4 }]}
              disabled={!draft.mood}
            >
              <MonoText style={{ fontSize: 10, color: theme.accentFg, letterSpacing: 1.5 }}>
                {btnLabel}
              </MonoText>
            </TouchableOpacity>
          </>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  monthNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  monthArrow: { paddingHorizontal: 10, paddingVertical: 4 },
  monthTitle: { fontFamily: fonts.serif, fontSize: 20, color: theme.fg, letterSpacing: -0.2 },

  weekRow: { flexDirection: 'row', marginBottom: 2 },
  weekCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },

  dayCell: { flex: 1, aspectRatio: 1, padding: 2 },
  dayCellInner: {
    flex: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'transparent',
  },
  dayCellSelected: {
    borderColor: theme.accent, backgroundColor: 'rgba(181,83,60,0.08)',
  },
  dayCellDisabled: { opacity: 0.35 },
  dayNum: { fontFamily: fonts.mono, fontSize: 10, color: theme.fg },
  dayEmoji: { fontSize: 11, lineHeight: 13 },

  formHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },

  moodRow: { flexDirection: 'row', gap: 6 },
  moodBtn: {
    flex: 1, aspectRatio: 1, borderRadius: 12,
    borderWidth: 1, borderColor: theme.border,
    alignItems: 'center', justifyContent: 'center',
  },
  moodBtnActive: { borderColor: theme.accent, backgroundColor: 'rgba(181,83,60,0.1)' },
  moodEmoji: { fontSize: 24 },

  starsRow: { flexDirection: 'row', gap: 8 },
  starBtn: { padding: 2 },
  star: { fontFamily: fonts.mono, fontSize: 28, color: theme.border },
  starActive: { color: theme.accent },

  intentionInput: {
    fontFamily: fonts.body, fontSize: 14, color: theme.fg,
    borderWidth: 1, borderColor: theme.border, borderRadius: 10,
    padding: 10, minHeight: 64, textAlignVertical: 'top',
  },

  saveBtn: {
    marginTop: 14, padding: 14, borderRadius: 12,
    backgroundColor: theme.accent, alignItems: 'center',
  },
});
