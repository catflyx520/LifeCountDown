import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Eyebrow, Card, MonoText } from '../components/UI';
import { theme, fonts } from '../theme';
import { loadUser, saveUser } from '../storage';
import { CheckIn, Capsule } from '../types';
import { useT } from '../i18n';

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isoToDate(iso: string): string {
  // handles both '2026-05-07' and full ISO timestamps
  return iso.slice(0, 10);
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
  const navigation = useNavigation<any>();

  const now = new Date();
  const todayStr = toDateStr(now);

  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [draft, setDraft] = useState<CheckIn>({ date: todayStr, mood: '', rating: 0, intention: '' });
  const [justSaved, setJustSaved] = useState(false);

  const entryFor = (iso: string) => checkins.find(c => c.date === iso);

  useFocusEffect(useCallback(() => {
    loadUser().then(u => {
      const all = u.checkins ?? [];
      setCheckins(all);
      setCapsules(u.capsules ?? []);
      const existing = all.find(c => c.date === todayStr);
      setDraft(existing ?? { date: todayStr, mood: '', rating: 0, intention: '' });
      setSelectedDate(todayStr);
      setView({ y: now.getFullYear(), m: now.getMonth() });
    });
    setJustSaved(false);
  }, []));

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

  // 可编辑范围：今天 + 前 6 天
  const minEditDate = new Date(now);
  minEditDate.setDate(minEditDate.getDate() - 6);
  const minEditISO = toDateStr(minEditDate);
  const isEditable = (iso: string) => iso >= minEditISO && iso <= todayStr;

  // 胶囊日期集合（创建日 & 解锁日）
  const capsuleCreatedDates = new Set(capsules.map(c => isoToDate(c.createdAt)));
  const capsuleUnlockDates = new Set(capsules.map(c => isoToDate(c.unlockAt)));

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

  const selectedIsFuture = selectedDate > todayStr;
  const selectedIsPast = selectedDate < minEditISO;
  const selectedIsLocked = !isEditable(selectedDate);

  const zh = lang === 'zh';

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
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => stepMonth(-1)} style={styles.monthArrow}>
            <MonoText style={{ fontSize: 18, color: theme.fg }}>‹</MonoText>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{monthName} {view.y}</Text>
          <TouchableOpacity onPress={() => stepMonth(1)} style={styles.monthArrow}>
            <MonoText style={{ fontSize: 18, color: theme.fg }}>›</MonoText>
          </TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <View key={i} style={styles.weekCell}>
              <MonoText style={{ fontSize: 8, color: theme.muted, letterSpacing: 1 }}>{d}</MonoText>
            </View>
          ))}
        </View>

        {Array.from({ length: cells.length / 7 }).map((_, week) => (
          <View key={week} style={styles.weekRow}>
            {cells.slice(week * 7, week * 7 + 7).map((day, dow) => {
              if (day === null) return <View key={dow} style={styles.dayCell} />;
              const iso = `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const entry = entryFor(iso);
              const mood = entry ? s.moods.find(m => m.key === entry.mood) : null;
              const isSel = iso === selectedDate;
              const isTod = iso === todayStr;
              const hasCreated = capsuleCreatedDates.has(iso);
              const hasUnlock = capsuleUnlockDates.has(iso);
              return (
                <TouchableOpacity
                  key={dow}
                  style={styles.dayCell}
                  onPress={() => selectDate(iso)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.dayCellInner, isSel && styles.dayCellSelected]}>
                    <Text style={[
                      styles.dayNum,
                      isTod && { color: theme.accent, fontWeight: '600' },
                    ]}>
                      {day}
                    </Text>
                    <Text style={styles.dayEmoji}>{mood ? mood.emoji : ''}</Text>
                    {/* 胶囊指示点 */}
                    {(hasCreated || hasUnlock) && (
                      <View style={styles.capsuleDotRow}>
                        {hasCreated && <View style={styles.capsuleDotCreated} />}
                        {hasUnlock && <View style={styles.capsuleDotUnlock} />}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* 图例 */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.capsuleDotCreated} />
            <MonoText style={styles.legendText}>{zh ? '写信日' : 'written'}</MonoText>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.capsuleDotUnlock} />
            <MonoText style={styles.legendText}>{zh ? '解锁日' : 'unlock'}</MonoText>
          </View>
        </View>
      </Card>

      {/* Form */}
      <Card style={{ marginBottom: 12 }}>
        <View style={styles.formHeader}>
          <Eyebrow>
            {selectedDate === todayStr ? s.todayCheckInTitle : selectedDate}
          </Eyebrow>
          {existing && !selectedIsLocked && (
            <MonoText style={{ fontSize: 9, color: theme.accent, letterSpacing: 1.5 }}>
              {s.loggedBadge}
            </MonoText>
          )}
        </View>

        {/* 胶囊信息：写信日 or 解锁日 */}
        {(() => {
          const created = capsules.filter(c => isoToDate(c.createdAt) === selectedDate);
          const unlocking = capsules.filter(c => isoToDate(c.unlockAt) === selectedDate);
          if (!created.length && !unlocking.length) return null;
          return (
            <View style={{ gap: 8, marginBottom: 14 }}>
              {created.map(c => {
                const daysLeft = Math.max(0, Math.ceil((new Date(c.unlockAt).getTime() - Date.now()) / 86400000));
                const unlocked = Date.now() >= new Date(c.unlockAt).getTime();
                return (
                  <View key={c.id} style={styles.capsuleInfoCard}>
                    <Text style={styles.capsuleInfoIcon}>◉</Text>
                    <View style={{ flex: 1 }}>
                      <MonoText style={styles.capsuleInfoMeta}>{zh ? '写信日' : 'WRITTEN HERE'}</MonoText>
                      <Text style={styles.capsuleInfoBody}>
                        {unlocked
                          ? (zh ? '这封信已解锁' : 'This letter is now open')
                          : (zh ? `解锁日 ${isoToDate(c.unlockAt)} · 还有 ${daysLeft} 天` : `Unlocks ${isoToDate(c.unlockAt)} · ${daysLeft} days left`)}
                      </Text>
                      <Text style={styles.capsuleInfoPreview} numberOfLines={2}>
                        {unlocked ? `"${c.text}"` : '••••••••••••••••'}
                      </Text>
                    </View>
                  </View>
                );
              })}
              {unlocking.map(c => {
                const unlocked = Date.now() >= new Date(c.unlockAt).getTime();
                const createdDate = isoToDate(c.createdAt);
                return (
                  <View key={c.id} style={[styles.capsuleInfoCard, unlocked && styles.capsuleInfoCardUnlocked]}>
                    <Text style={styles.capsuleInfoIcon}>◎</Text>
                    <View style={{ flex: 1 }}>
                      <MonoText style={{ ...styles.capsuleInfoMeta, ...(unlocked ? { color: theme.accent } : {}) }}>
                        {zh ? (unlocked ? '已解锁' : '解锁日') : (unlocked ? 'UNLOCKED' : 'UNLOCK DAY')}
                      </MonoText>
                      <Text style={styles.capsuleInfoBody}>
                        {zh ? `写于 ${createdDate}` : `Written ${createdDate}`}
                      </Text>
                      <Text style={styles.capsuleInfoPreview} numberOfLines={unlocked ? 4 : 2}>
                        {unlocked ? `"${c.text}"` : '••••••••••••••••'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })()}

        {selectedIsLocked ? (
          <View>
            {/* 锁定说明 */}
            <View style={styles.lockedBanner}>
              <Text style={styles.lockedIcon}>{selectedIsFuture ? '◌' : '◎'}</Text>
              <View style={{ flex: 1 }}>
                <MonoText style={styles.lockedTitle}>
                  {selectedIsFuture
                    ? (zh ? '未来尚未发生' : 'The future hasn\'t happened yet')
                    : (zh ? '遥远的过去' : 'The distant past')}
                </MonoText>
                <Text style={styles.lockedBody}>
                  {selectedIsFuture
                    ? (zh
                        ? '你无法预先打卡未来的日子，它还没有属于你的故事。'
                        : "You can't check in for a day that hasn't arrived yet.")
                    : (zh
                        ? '你无法修改 7 天前的记录。那一天已成为历史，永远属于那时的你。'
                        : 'Records older than 7 days are sealed. That day belongs to who you were then.')}
                </Text>
              </View>
            </View>

            {/* 只读展示已有打卡 */}
            {existing && (
              <View style={styles.readonlyEntry}>
                <Text style={styles.readonlyMood}>
                  {s.moods.find(m => m.key === existing.mood)?.emoji ?? ''}
                </Text>
                {existing.rating > 0 && (
                  <Text style={styles.readonlyStars}>
                    {'★'.repeat(existing.rating)}{'☆'.repeat(5 - existing.rating)}
                  </Text>
                )}
                {existing.intention ? (
                  <Text style={styles.readonlyIntention}>{existing.intention}</Text>
                ) : null}
              </View>
            )}

            {/* 胶囊引导 */}
            <TouchableOpacity
              style={styles.capsulePrompt}
              onPress={() => navigation.navigate('Capsule')}
              activeOpacity={0.8}
            >
              <Text style={styles.capsulePromptIcon}>◉</Text>
              <View style={{ flex: 1 }}>
                <MonoText style={styles.capsulePromptMeta}>
                  {zh ? '时光胶囊' : 'TIME CAPSULE'}
                </MonoText>
                <Text style={styles.capsulePromptTitle}>
                  {selectedIsFuture
                    ? (zh ? '给那天的自己提前留言' : 'Leave a message for that day')
                    : (zh ? '给那时的自己写一封信' : 'Write a letter to who you were')}
                </Text>
                <Text style={styles.capsulePromptBody}>
                  {selectedIsFuture
                    ? (zh
                        ? '今天写下想说的话，让未来的你来发现。封存记忆，等待开启。'
                        : 'Write something today for your future self to discover.')
                    : (zh
                        ? '把回忆封存进时光胶囊，等未来的你再来翻开。'
                        : 'Seal a memory in a capsule for your future self to open.')}
                </Text>
              </View>
              <MonoText style={{ fontFamily: fonts.mono, fontSize: 14, color: theme.accent }}>→</MonoText>
            </TouchableOpacity>
          </View>
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
  dayNum: { fontFamily: fonts.mono, fontSize: 10, color: theme.fg },
  dayEmoji: { fontSize: 11, lineHeight: 13 },

  capsuleDotRow: { flexDirection: 'row', gap: 2, marginTop: 1 },
  capsuleDotCreated: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.accent },
  capsuleDotUnlock: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.accent },

  legend: { flexDirection: 'row', gap: 12, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.border },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontSize: 8, color: theme.muted, letterSpacing: 0.5 },

  formHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },

  capsuleInfoCard: {
    flexDirection: 'row', gap: 10, padding: 12, borderRadius: 10,
    backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border,
  },
  capsuleInfoCardUnlocked: { borderColor: theme.accent },
  capsuleInfoIcon: { fontSize: 18, color: theme.accent, marginTop: 1 },
  capsuleInfoMeta: { fontSize: 9, letterSpacing: 1.5, color: theme.muted, marginBottom: 3 },
  capsuleInfoBody: { fontFamily: fonts.body, fontSize: 12, color: theme.muted, marginBottom: 4 },
  capsuleInfoPreview: { fontFamily: fonts.serifItalic, fontSize: 13, color: theme.fg, lineHeight: 18 },

  lockedBanner: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    padding: 12, borderRadius: 10,
    backgroundColor: theme.bg, marginBottom: 14,
  },
  lockedIcon: { fontSize: 22, color: theme.muted, marginTop: 1 },
  lockedTitle: { fontSize: 10, letterSpacing: 1.5, color: theme.muted, marginBottom: 4 },
  lockedBody: { fontFamily: fonts.body, fontSize: 13, color: theme.muted, lineHeight: 19 },

  readonlyEntry: {
    padding: 12, borderRadius: 10,
    backgroundColor: theme.bg, marginBottom: 14, gap: 6,
  },
  readonlyMood: { fontSize: 26 },
  readonlyStars: { fontFamily: fonts.mono, fontSize: 16, color: theme.accent, letterSpacing: 2 },
  readonlyIntention: { fontFamily: fonts.body, fontSize: 13, color: theme.fg, lineHeight: 19 },

  capsulePrompt: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: theme.border,
    backgroundColor: theme.bg,
  },
  capsulePromptIcon: { fontSize: 22, color: theme.accent },
  capsulePromptMeta: { fontSize: 9, letterSpacing: 1.8, color: theme.muted, marginBottom: 3 },
  capsulePromptTitle: { fontFamily: fonts.serif, fontSize: 17, color: theme.fg, lineHeight: 22, marginBottom: 3 },
  capsulePromptBody: { fontFamily: fonts.body, fontSize: 12, color: theme.muted, lineHeight: 17 },

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
