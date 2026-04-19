import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Shell, Eyebrow, SerifText, MonoText } from '../components/UI';
import { theme, fonts } from '../theme';
import { RootStackParamList } from '../types';
import { saveUser } from '../storage';
import { useT } from '../i18n';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Mode'> };

export default function ModeScreen({ navigation }: Props) {
  const { s } = useT();

  const pick = (mode: 'manual' | 'ai') => {
    saveUser({ mode });
    navigation.navigate(mode === 'manual' ? 'Manual' : 'Quiz');
  };

  return (
    <Shell>
      <View style={styles.header}>
        <Eyebrow style={{ marginBottom: 8 }}>{s.step02}</Eyebrow>
        <SerifText size={32}>{s.howEstimate}</SerifText>
      </View>

      <View style={styles.options}>
        {/* Manual */}
        <TouchableOpacity onPress={() => pick('manual')} activeOpacity={0.85} style={styles.card}>
          <View style={styles.cardRow}>
            <Eyebrow>Mode A</Eyebrow>
            <Text style={styles.arrow}>→</Text>
          </View>
          <SerifText size={26} style={{ marginTop: 8 }}>{s.modeATitle}</SerifText>
          <Text style={styles.desc}>{s.modeADesc}</Text>
          <View style={styles.btnRow}>
            <Text style={styles.chooseText}>{s.chooseModeA}</Text>
          </View>
        </TouchableOpacity>

        {/* AI */}
        <TouchableOpacity onPress={() => pick('ai')} activeOpacity={0.85} style={[styles.card, styles.cardAccent]}>
          <View style={styles.accentBar} />
          <View style={styles.cardRow}>
            <Eyebrow style={{ color: theme.accent }}>Mode B</Eyebrow>
            <Text style={[styles.arrow, { color: theme.accent }]}>→</Text>
          </View>
          <SerifText size={26} style={{ marginTop: 8 }}>{s.modeBTitle}</SerifText>
          <Text style={styles.desc}>{s.modeBDesc}</Text>
          <View style={styles.btnRow}>
            <Text style={[styles.chooseText, { color: theme.accent }]}>{s.chooseModeB}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <MonoText style={styles.hint}>{s.modeHint}</MonoText>
    </Shell>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 8, marginBottom: 24 },
  options: { flex: 1, justifyContent: 'center', gap: 14 },
  card: {
    padding: 22,
    borderRadius: 16,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    position: 'relative',
    overflow: 'hidden',
  },
  cardAccent: { borderColor: theme.accent },
  accentBar: {
    position: 'absolute', top: 0, right: 0, bottom: 0, width: 3,
    backgroundColor: theme.accent,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  arrow: { fontFamily: fonts.mono, fontSize: 12, color: theme.muted },
  desc: { fontFamily: fonts.body, fontSize: 12, color: theme.muted, lineHeight: 18, marginTop: 6 },
  btnRow: { marginTop: 12 },
  chooseText: { fontFamily: fonts.mono, fontSize: 10, color: theme.muted, letterSpacing: 1.5 },
  hint: { textAlign: 'center', marginBottom: 24, fontSize: 10, letterSpacing: 1 },
});
