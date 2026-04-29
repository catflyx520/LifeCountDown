import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { theme, fonts } from '../theme';
import { Eyebrow, MonoText } from '../components/UI';
import { loadUser } from '../storage';
import { UserData } from '../types';
import { useT } from '../i18n';
import { DeathCounterPreview } from '../widgets/DeathCounterWidget';
import { YearPreview } from '../widgets/YearWidget';
import { TodayPreview } from '../widgets/TodayWidget';

function dayOfYear() {
  const now = new Date();
  return Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000);
}

export default function WidgetPreviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { lang } = useT();
  const [user, setUser] = useState<UserData | null>(null);

  useFocusEffect(useCallback(() => {
    loadUser().then(setUser);
  }, []));

  if (!user) return null;

  const days   = user.daysLeft;
  const months = Math.floor(days / 30.44);
  const total  = user.targetAge * 365;
  const pct    = Math.min(100, (user.age * 365 / total) * 100);
  const doy    = dayOfYear();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
        <Eyebrow style={{ color: theme.accent }}>← back</Eyebrow>
      </TouchableOpacity>

      <Eyebrow style={{ marginBottom: 4 }}>Widget Preview</Eyebrow>
      <Text style={styles.title}>Home Screen</Text>
      <MonoText style={styles.hint}>Same component as actual widget — what you see here is what appears on your home screen.</MonoText>

      <Eyebrow style={styles.section}>4×2 · Life Counter</Eyebrow>
      <DeathCounterPreview days={days} months={months} pct={pct} lang={lang} />

      <Eyebrow style={styles.section}>2×2 · Small Widgets</Eyebrow>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <YearPreview dayOfYear={doy} lang={lang} />
        <TodayPreview lang={lang} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title:   { fontFamily: fonts.serif, fontSize: 28, color: theme.fg, marginBottom: 4 },
  hint:    { fontSize: 9, color: theme.muted, marginBottom: 4 },
  section: { marginTop: 24, marginBottom: 10 },
});
