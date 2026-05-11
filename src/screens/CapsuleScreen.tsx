import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Eyebrow, SerifText, Card, MonoText } from '../components/UI';
import { theme, fonts } from '../theme';
import { loadUser, saveUser } from '../storage';
import { Capsule, UserData } from '../types';
import { useT } from '../i18n';
import CapsuleDetailModal from './CapsuleDetailModal';


export default function CapsuleScreen() {
  const insets = useSafeAreaInsets();
  const { s, lang } = useT();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
  const [draft, setDraft] = useState('');
  const [unlockDays, setUnlockDays] = useState(365);
  const [customYears, setCustomYears] = useState('');
  const [customMonths, setCustomMonths] = useState('');
  const [customDaysInput, setCustomDaysInput] = useState('');

  const isCustomMode = customYears !== '' || customMonths !== '' || customDaysInput !== '';

  const applyCustom = (y: string, mo: string, d: string) => {
    const total = (parseInt(y || '0', 10) * 365) + (parseInt(mo || '0', 10) * 30) + (parseInt(d || '0', 10));
    setUnlockDays(total);
  };

  const unlockDate = new Date(Date.now() + unlockDays * 86400000);
  const unlockDateStr = unlockDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const reload = useCallback(() => {
    loadUser().then(u => { setCapsules(u.capsules ?? []); setUser(u); });
  }, []);

  useFocusEffect(reload);

  const seal = async () => {
    if (!draft.trim()) return;
    const now = new Date();
    const unlockAt = new Date(now.getTime() + unlockDays * 86400000).toISOString();
    const newCapsule: Capsule = {
      id: Date.now().toString(),
      text: draft.trim(),
      createdAt: now.toISOString(),
      unlockAt,
      unlockDays,
    };
    const updated = [...capsules, newCapsule];
    await saveUser({ capsules: updated });
    setCapsules(updated);
    setDraft('');
  };

  const isUnlocked = (c: Capsule) => Date.now() >= new Date(c.unlockAt).getTime();

  const burnCapsule = async (id: string) => {
    const updated = capsules.filter(c => c.id !== id);
    await saveUser({ capsules: updated });
    setCapsules(updated);
    setSelectedCapsule(null);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Eyebrow style={{ marginBottom: 8 }}>{s.capsuleTitle}</Eyebrow>
      <SerifText size={28} style={{ marginBottom: 20 }}>{s.capsuleSubtitle}</SerifText>

      {/* compose */}
      <Card style={{ marginBottom: 20 }}>
        <Eyebrow style={{ marginBottom: 10 }}>{s.newLetter}</Eyebrow>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={s.dearFutureMe}
          placeholderTextColor={theme.muted}
          multiline
          style={styles.textarea}
        />

        {/* unlock options */}
        <View style={styles.unlockRow}>
          {s.unlockOptions.map(o => (
            <TouchableOpacity
              key={o.days}
              onPress={() => { setUnlockDays(o.days); setCustomYears(''); setCustomMonths(''); setCustomDaysInput(''); }}
              style={[styles.unlockBtn, unlockDays === o.days && !isCustomMode && styles.unlockBtnActive]}
            >
              <Text style={[styles.unlockBtnText, unlockDays === o.days && !isCustomMode && { color: theme.accentFg }]}>
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* 自定义 */}
        <View style={styles.customSection}>
          <MonoText style={styles.customLabel}>{s.customDays}</MonoText>
          <View style={styles.customRow}>
            <View style={styles.customUnit}>
              <TextInput
                value={customYears}
                onChangeText={v => { const n = v.replace(/[^0-9]/g, ''); setCustomYears(n); applyCustom(n, customMonths, customDaysInput); }}
                placeholder="0"
                placeholderTextColor={theme.muted}
                keyboardType="number-pad"
                style={[styles.customInput, customYears !== '' && styles.customInputActive]}
              />
              <MonoText style={styles.customUnitLabel}>{lang === 'zh' ? '年' : 'yr'}</MonoText>
            </View>
            <View style={styles.customUnit}>
              <TextInput
                value={customMonths}
                onChangeText={v => { const n = v.replace(/[^0-9]/g, ''); setCustomMonths(n); applyCustom(customYears, n, customDaysInput); }}
                placeholder="0"
                placeholderTextColor={theme.muted}
                keyboardType="number-pad"
                style={[styles.customInput, customMonths !== '' && styles.customInputActive]}
              />
              <MonoText style={styles.customUnitLabel}>{lang === 'zh' ? '月' : 'mo'}</MonoText>
            </View>
            <View style={styles.customUnit}>
              <TextInput
                value={customDaysInput}
                onChangeText={v => { const n = v.replace(/[^0-9]/g, ''); setCustomDaysInput(n); applyCustom(customYears, customMonths, n); }}
                placeholder="0"
                placeholderTextColor={theme.muted}
                keyboardType="number-pad"
                style={[styles.customInput, customDaysInput !== '' && styles.customInputActive]}
              />
              <MonoText style={styles.customUnitLabel}>{lang === 'zh' ? '天' : 'd'}</MonoText>
            </View>
          </View>
        </View>

        <View style={styles.sealRow}>
          <View>
            <MonoText style={{ fontSize: 9 }}>{s.opensIn(unlockDays)}</MonoText>
            <MonoText style={{ fontSize: 9, color: theme.muted, marginTop: 2 }}>{unlockDateStr}</MonoText>
          </View>
          <TouchableOpacity
            onPress={seal}
            style={[styles.sealBtn, !draft.trim() && { opacity: 0.4 }]}
            disabled={!draft.trim()}
          >
            <Text style={styles.sealBtnText}>{s.sealAway.replace(' →', '').toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* letters list */}
      <Eyebrow style={{ marginBottom: 10 }}>
        {s.yourLetters} · {capsules.length} {s.locked.toLowerCase()} · {capsules.filter(isUnlocked).length} {s.unlockedOn.toLowerCase()}
      </Eyebrow>

      {capsules.length === 0 && (
        <MonoText style={{ textAlign: 'center', marginTop: 20 }}>{s.noCapsules}</MonoText>
      )}

      {[...capsules].reverse().map(c => {
        const unlocked = isUnlocked(c);
        const daysLeft = Math.max(0, Math.ceil((new Date(c.unlockAt).getTime() - Date.now()) / 86400000));
        return (
          <Pressable
            key={c.id}
            onPress={unlocked ? () => setSelectedCapsule(c) : undefined}
            style={[styles.letter, unlocked && styles.letterUnlocked]}
          >
            <View style={styles.letterHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.dot, unlocked && styles.dotUnlocked]}>
                  <Text style={{ fontSize: 10, color: unlocked ? theme.accentFg : theme.muted }}>
                    {unlocked ? '✓' : '✕'}
                  </Text>
                </View>
                <Eyebrow style={{ color: unlocked ? theme.accent : theme.muted }}>
                  {unlocked ? s.unlockedOn : `${s.unlockIn} ${s.daysShort(daysLeft)}`}
                </Eyebrow>
              </View>
              <MonoText style={{ fontSize: 9 }}>{unlocked ? s.tapToRead : s.locked}</MonoText>
            </View>
            <Text style={[styles.letterPreview, !unlocked && { color: 'transparent', textShadowColor: theme.muted, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 }]}>
              "{unlocked ? c.text : '•'.repeat(40)}"
            </Text>
          </Pressable>
        );
      })}

      {user && (
        <CapsuleDetailModal
          capsule={selectedCapsule}
          user={user}
          visible={selectedCapsule !== null}
          onClose={() => setSelectedCapsule(null)}
          onBurn={burnCapsule}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  textarea: {
    fontFamily: fonts.serifItalic,
    fontSize: 16, lineHeight: 24,
    color: theme.fg, minHeight: 80,
    marginBottom: 12,
  },
  unlockRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  customSection: { marginBottom: 12 },
  customLabel: { fontSize: 9, color: theme.muted, marginBottom: 6 },
  customRow: { flexDirection: 'row', gap: 8 },
  customUnit: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  customInput: {
    fontFamily: fonts.mono, fontSize: 13, color: theme.fg,
    borderWidth: 1, borderColor: theme.border, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 5, width: 52, textAlign: 'center',
  },
  customInputActive: { borderColor: theme.accent },
  customUnitLabel: { fontSize: 9, color: theme.muted },
  unlockBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: theme.border,
  },
  unlockBtnActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  unlockBtnText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: theme.muted },
  sealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  sealBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
    backgroundColor: theme.accent,
  },
  sealBtnText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: theme.accentFg },

  letter: {
    padding: 14, borderRadius: 12, marginBottom: 8,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    opacity: 0.85,
  },
  letterUnlocked: { opacity: 1, borderColor: theme.accent },
  letterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dot: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1, borderColor: theme.border,
    alignItems: 'center', justifyContent: 'center',
  },
  dotUnlocked: { backgroundColor: theme.accent, borderColor: theme.accent },
  letterPreview: { fontFamily: fonts.serifItalic, fontSize: 14, color: theme.fg, lineHeight: 20 },
});
