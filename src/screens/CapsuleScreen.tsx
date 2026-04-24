import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Eyebrow, SerifText, Card, MonoText } from '../components/UI';
import { theme, fonts } from '../theme';
import { loadUser, saveUser } from '../storage';
import { Capsule } from '../types';
import { useT } from '../i18n';


export default function CapsuleScreen() {
  const insets = useSafeAreaInsets();
  const { s } = useT();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [draft, setDraft] = useState('');
  const [unlockDays, setUnlockDays] = useState(365);

  const reload = useCallback(() => {
    loadUser().then(u => setCapsules(u.capsules ?? []));
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
              onPress={() => setUnlockDays(o.days)}
              style={[styles.unlockBtn, unlockDays === o.days && styles.unlockBtnActive]}
            >
              <Text style={[styles.unlockBtnText, unlockDays === o.days && { color: theme.accentFg }]}>
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sealRow}>
          <MonoText style={{ fontSize: 9 }}>{s.opensIn(unlockDays)}</MonoText>
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
          <View key={c.id} style={[styles.letter, unlocked && styles.letterUnlocked]}>
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
          </View>
        );
      })}
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
  unlockRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  unlockBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: theme.border,
  },
  unlockBtnActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  unlockBtnText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: theme.muted },
  sealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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
