import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Eyebrow, SerifText, Card, MonoText } from '../components/UI';
import { theme, fonts } from '../theme';
import { loadUser, saveUser, clearUser, ageFromBirthdate } from '../storage';
import { UserData } from '../types';
import { useT } from '../i18n';
import { requestPermission, cancelDaily, rescheduleIfEnabled, sendTestNotification } from '../notifications';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { lang, setLang, s } = useT();
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<UserData | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const reload = useCallback(() => {
    loadUser().then(u => { setUser(u); setNameInput(u.name ?? ''); });
  }, []);

  useFocusEffect(reload);

  if (!user) return null;

  const displayAge = user.birthdate ? ageFromBirthdate(user.birthdate) : user.age;

  const saveName = async () => {
    await saveUser({ name: nameInput.trim() || undefined });
  };

  const restart = async () => {
    await clearUser();
    navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  };

  const toggleNotifications = async () => {
    if (!user) return;
    if (user.notificationsEnabled) {
      await saveUser({ notificationsEnabled: false });
      await cancelDaily();
      setUser(u => u ? { ...u, notificationsEnabled: false } : u);
    } else {
      const granted = await requestPermission();
      if (!granted) { setPermissionDenied(true); return; }
      setPermissionDenied(false);
      await saveUser({ notificationsEnabled: true });
      await rescheduleIfEnabled();
      setUser(u => u ? { ...u, notificationsEnabled: true } : u);
    }
  };

  const changeHour = async (h: number) => {
    await saveUser({ notifyHour: h });
    await rescheduleIfEnabled();
    setUser(u => u ? { ...u, notifyHour: h } : u);
  };

  const switchMode = () => {
    const dest = user.mode === 'ai' ? 'Manual' : 'Quiz';
    navigation.navigate(dest);
  };

  const modeLabel = user.mode === 'ai'
    ? s.aiMode(user.confidence ?? 0)
    : s.manualMode;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Eyebrow style={{ marginBottom: 8 }}>{s.settingsTitle}</Eyebrow>
      <SerifText size={28} style={{ marginBottom: 20 }}>{s.yourProfile}</SerifText>

      {/* name */}
      <Card style={{ marginBottom: 12 }}>
        <Eyebrow style={{ marginBottom: 8 }}>{s.displayName}</Eyebrow>
        <View style={styles.inputRow}>
          <TextInput
            value={nameInput}
            onChangeText={setNameInput}
            placeholder={s.anonymousPlaceholder}
            placeholderTextColor={theme.muted}
            style={styles.input}
            onBlur={saveName}
            returnKeyType="done"
            onSubmitEditing={saveName}
          />
        </View>
        <MonoText style={{ fontSize: 9, marginTop: 6 }}>{s.onDevice}</MonoText>
      </Card>

      {/* current stats */}
      <Card style={{ marginBottom: 12 }}>
        <Eyebrow style={{ marginBottom: 12 }}>{s.currentStats}</Eyebrow>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>{s.age}</Text>
          <Text style={styles.statValue}>{displayAge} {s.yrs}</Text>
        </View>
        {user.birthdate && (
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{s.birthday}</Text>
            <Text style={styles.statValue}>{user.birthdate}</Text>
          </View>
        )}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>{s.target}</Text>
          <Text style={styles.statValue}>{user.targetAge} {s.yrs}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>{s.daysLeft}</Text>
          <Text style={styles.statValue}>{user.daysLeft.toLocaleString()}</Text>
        </View>
        <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.statLabel}>{s.mode}</Text>
          <Text style={[styles.statValue, { color: theme.accent }]}>{modeLabel}</Text>
        </View>
      </Card>

      {/* change mode */}
      <TouchableOpacity onPress={switchMode} style={styles.actionBtn}>
        <Text style={styles.actionBtnText}>
          {user.mode === 'ai' ? s.switchToManual : s.reRunAI}
        </Text>
      </TouchableOpacity>

      {/* update age */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Age')}
        style={[styles.actionBtn, { marginTop: 8 }]}
      >
        <Text style={styles.actionBtnText}>{s.updateAge}</Text>
      </TouchableOpacity>

      {/* language */}
      <Card style={{ marginBottom: 12 }}>
        <Eyebrow style={{ marginBottom: 12 }}>{s.language}</Eyebrow>
        <View style={styles.langRow}>
          {(['en', 'zh'] as const).map(l => (
            <TouchableOpacity
              key={l}
              onPress={() => setLang(l)}
              style={[styles.langBtn, lang === l && styles.langBtnActive]}
            >
              <Text style={[styles.langBtnText, lang === l && styles.langBtnTextActive]}>
                {l === 'en' ? 'English' : '中文'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* notifications */}
      <Card style={{ marginBottom: 12 }}>
        <View style={styles.notifRow}>
          <View style={{ flex: 1 }}>
            <Eyebrow style={{ marginBottom: 4 }}>{s.notifReminder}</Eyebrow>
            <MonoText style={{ fontSize: 9 }}>{s.notifReminderNote}</MonoText>
          </View>
          <TouchableOpacity
            onPress={toggleNotifications}
            style={[styles.toggleBtn, user.notificationsEnabled && styles.toggleBtnOn]}
          >
            <Text style={[styles.toggleText, user.notificationsEnabled && { color: theme.accentFg }]}>
              {user.notificationsEnabled ? s.notifEnabled : s.notifDisabled}
            </Text>
          </TouchableOpacity>
        </View>

        {permissionDenied && (
          <MonoText style={{ fontSize: 9, color: theme.accent, marginTop: 8 }}>
            {s.notifPermissionDenied}
          </MonoText>
        )}

        {user.notificationsEnabled && (
          <View style={{ marginTop: 12 }}>
            <TouchableOpacity
              onPress={sendTestNotification}
              style={[styles.actionBtn, { marginBottom: 12 }]}
            >
              <Text style={styles.actionBtnText}>{s.notifTest}</Text>
            </TouchableOpacity>
            <Eyebrow style={{ marginBottom: 8 }}>{s.notifTime}</Eyebrow>
            <View style={styles.hourRow}>
              {[7, 8, 9, 10, 12, 20, 21].map(h => (
                <TouchableOpacity
                  key={h}
                  onPress={() => changeHour(h)}
                  style={[styles.hourBtn, (user.notifyHour ?? 9) === h && styles.hourBtnActive]}
                >
                  <Text style={[styles.hourText, (user.notifyHour ?? 9) === h && { color: theme.accentFg }]}>
                    {h}:00
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Card>

      {/* danger zone */}
      <View style={styles.divider} />
      <Eyebrow style={{ marginBottom: 10, color: theme.muted }}>{s.dangerZone}</Eyebrow>
      <TouchableOpacity onPress={() => setShowResetModal(true)} style={styles.resetBtn}>
        <Text style={styles.resetBtnText}>{s.resetAll}</Text>
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={showResetModal} onRequestClose={() => setShowResetModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Eyebrow style={{ marginBottom: 10 }}>{s.dangerZone}</Eyebrow>
            <SerifText size={22} style={{ marginBottom: 10 }}>{s.resetTitle}</SerifText>
            <Text style={styles.dialogMsg}>{s.resetMsg}</Text>
            <View style={styles.dialogBtns}>
              <TouchableOpacity onPress={() => setShowResetModal(false)} style={styles.dialogCancel}>
                <Text style={styles.dialogCancelText}>{s.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={restart} style={styles.dialogReset}>
                <Text style={styles.dialogResetText}>{s.reset}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={() => navigation.navigate('PrivacyPolicy' as any)}
        style={{ alignItems: 'center', marginTop: 16 }}
      >
        <MonoText style={{ fontSize: 9, color: theme.accent, letterSpacing: 1.5 }}>
          {s.privacyPolicy} →
        </MonoText>
      </TouchableOpacity>

      <MonoText style={{ textAlign: 'center', marginTop: 12, fontSize: 9 }}>
        {s.versionNote}
      </MonoText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    borderBottomWidth: 1, borderColor: theme.border, paddingBottom: 4,
  },
  input: {
    fontFamily: fonts.body, fontSize: 16, color: theme.fg,
    paddingVertical: 4,
  },
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderColor: theme.border,
  },
  statLabel: { fontFamily: fonts.body, fontSize: 13, color: theme.muted },
  statValue: { fontFamily: fonts.mono, fontSize: 12, color: theme.fg, letterSpacing: 0.5 },
  actionBtn: {
    padding: 14, borderRadius: 12,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    alignItems: 'center',
  },
  actionBtnText: { fontFamily: fonts.mono, fontSize: 10, color: theme.accent, letterSpacing: 1.5 },
  langRow: { flexDirection: 'row', gap: 10 },
  langBtn: {
    flex: 1, padding: 12, borderRadius: 10, alignItems: 'center',
    borderWidth: 1, borderColor: theme.border,
  },
  langBtnActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  langBtnText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: theme.muted },
  langBtnTextActive: { color: theme.accentFg },
  divider: { height: 1, backgroundColor: theme.border, marginVertical: 20 },
  notifRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: theme.border,
  },
  toggleBtnOn: { backgroundColor: theme.accent, borderColor: theme.accent },
  toggleText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: theme.muted },
  hourRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  hourBtn: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, borderColor: theme.border,
  },
  hourBtnActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  hourText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 0.5, color: theme.muted },
  resetBtn: {
    padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#b5533c44',
    alignItems: 'center',
  },
  resetBtnText: { fontFamily: fonts.mono, fontSize: 10, color: theme.accent, letterSpacing: 1.5 },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32,
  },
  dialog: {
    backgroundColor: theme.surface, borderRadius: 20,
    borderWidth: 1, borderColor: theme.border,
    padding: 24, width: '100%',
  },
  dialogMsg: {
    fontFamily: fonts.body, fontSize: 13, color: theme.muted,
    lineHeight: 20, marginBottom: 24,
  },
  dialogBtns: { flexDirection: 'row', gap: 10 },
  dialogCancel: {
    flex: 1, padding: 14, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: theme.border,
  },
  dialogCancelText: { fontFamily: fonts.mono, fontSize: 10, color: theme.muted, letterSpacing: 1.5 },
  dialogReset: {
    flex: 1, padding: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: theme.accent,
  },
  dialogResetText: { fontFamily: fonts.mono, fontSize: 10, color: theme.accentFg, letterSpacing: 1.5 },
});
