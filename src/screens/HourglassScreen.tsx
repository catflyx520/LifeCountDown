import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Eyebrow, MonoText } from '../components/UI';
import AnimatedHourglass from '../components/AnimatedHourglass';
import { theme, fonts } from '../theme';
import { loadUser } from '../storage';
import { UserData } from '../types';
import { useT } from '../i18n';

function fmt(n: number) { return n.toLocaleString('en-US'); }

export default function HourglassScreen() {
  const insets = useSafeAreaInsets();
  const { s } = useT();
  const navigation = useNavigation();
  const [user, setUser] = useState<UserData | null>(null);

  useFocusEffect(useCallback(() => {
    loadUser().then(setUser);
  }, []));

  if (!user) return null;

  const totalDays = user.targetAge * 365;
  const elapsed = user.age * 365;
  const fillPct = Math.max(0.04, 1 - elapsed / totalDays);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Eyebrow>{s.hourglassLive}</Eyebrow>
        <Text onPress={() => navigation.goBack()} style={styles.back}>{s.back}</Text>
      </View>

      <View style={styles.center}>
        <AnimatedHourglass size={260} fillPct={fillPct} animate grainMs={900} />

        <View style={{ alignItems: 'center', marginTop: 28 }}>
          <Eyebrow style={{ marginBottom: 6 }}>
            {s.pctRemains((fillPct * 100).toFixed(1))}
          </Eyebrow>
          <Text style={styles.subtitle}>{s.grainsLeft(fmt(user.daysLeft))}</Text>
        </View>
      </View>

      <MonoText style={styles.footer}>{s.grainLegend}</MonoText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, paddingHorizontal: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  back: { fontFamily: fonts.mono, fontSize: 10, color: theme.muted, letterSpacing: 1.5, textTransform: 'uppercase' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontFamily: fonts.serifItalic, fontSize: 22, color: theme.fg },
  footer: { textAlign: 'center', paddingBottom: 24, fontSize: 10, letterSpacing: 1.5 },
});
