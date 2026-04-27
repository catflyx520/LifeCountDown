import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Shell, SerifText, Btn, Eyebrow, MonoText } from '../components/UI';
import AnimatedHourglass from '../components/AnimatedHourglass';
import { theme, fonts } from '../theme';
import { RootStackParamList } from '../types';
import { useT, LANGUAGES } from '../i18n';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'> };

export default function OnboardingScreen({ navigation }: Props) {
  const { lang, setLang, s } = useT();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === lang)!;

  return (
    <Shell>
      {/* top bar */}
      <View style={styles.topBar}>
        <Eyebrow>L/C · v.01</Eyebrow>

        <TouchableOpacity onPress={() => setShowLangMenu(true)} style={styles.flagBtn}>
          <Text style={styles.flag}>{currentLang.flag}</Text>
          <Text style={styles.flagChevron}>▾</Text>
        </TouchableOpacity>
      </View>

      {/* centered hero */}
      <View style={styles.hero}>
        <AnimatedHourglass size={88} drain animate cycleMs={9000} />

        <View style={styles.textBlock}>
          <SerifText size={40} style={styles.headline}>
            {s.tagline.split('\n')[0]}{'\n'}
            <Text style={{ color: theme.accent, fontFamily: fonts.serifItalic }}>
              {s.tagline.split('\n')[1]}
            </Text>
          </SerifText>

          <Text style={styles.sub}>{s.sub}</Text>
        </View>
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <Btn onPress={() => navigation.navigate('Age')}>{s.cta}</Btn>
        <MonoText style={styles.privacy}>{s.privacy}</MonoText>
      </View>

      {/* Language dropdown */}
      <Modal transparent animationType="fade" visible={showLangMenu} onRequestClose={() => setShowLangMenu(false)}>
        <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setShowLangMenu(false)}>
          <View style={styles.langMenu}>
            {LANGUAGES.map(l => (
              <TouchableOpacity
                key={l.code}
                onPress={() => { setLang(l.code); setShowLangMenu(false); }}
                style={[styles.langItem, l.code === lang && styles.langItemActive]}
              >
                <Text style={styles.langItemFlag}>{l.flag}</Text>
                <Text style={[styles.langItemLabel, l.code === lang && styles.langItemLabelActive]}>
                  {l.label}
                </Text>
                {l.code === lang && <Text style={styles.langCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </Shell>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 8,
  },
  flagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  flag: { fontSize: 18 },
  flagChevron: { fontFamily: fonts.mono, fontSize: 9, color: theme.muted },

  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  textBlock: { alignItems: 'center', gap: 12 },
  headline: { textAlign: 'center', lineHeight: 46 },
  sub: {
    fontFamily: fonts.body, fontSize: 13, lineHeight: 20,
    color: theme.muted, textAlign: 'center', maxWidth: 260,
  },
  cta: { paddingBottom: 16, gap: 12 },
  privacy: { textAlign: 'center', fontSize: 10, letterSpacing: 1 },

  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 56,
    paddingRight: 24,
  },
  langMenu: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    minWidth: 160,
    overflow: 'hidden',
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
    borderBottomWidth: 1,
    borderColor: theme.border,
  },
  langItemActive: { backgroundColor: theme.bg },
  langItemFlag: { fontSize: 20 },
  langItemLabel: { fontFamily: fonts.body, fontSize: 14, color: theme.fg, flex: 1 },
  langItemLabelActive: { color: theme.accent },
  langCheck: { fontFamily: fonts.mono, fontSize: 10, color: theme.accent },
});
