import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions, TextInput,
  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedHourglass from '../components/AnimatedHourglass';
import { useCountdown } from '../hooks/useCountdown';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Shell, Eyebrow, SerifText, Btn, Card, MonoText } from '../components/UI';
import { theme, fonts } from '../theme';
import { RootStackParamList } from '../types';
import { saveUser, computeDaysLeft, loadUser } from '../storage';
import { useT } from '../i18n';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Manual'> };

type Stage = 'pick' | 'name' | 'result';

export default function ManualScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { s } = useT();
  const [target, setTarget] = useState(80);
  const [stage, setStage] = useState<Stage>('pick');
  const [nameInput, setNameInput] = useState('');
  const [daysLeft, setDaysLeft] = useState(0);
  const [fillPct, setFillPct] = useState(0.7);
  const [savedName, setSavedName] = useState('');
  const quote = s.onboardingQuotes[target % s.onboardingQuotes.length];

  const lockIn = async () => {
    const user = await loadUser();
    const days = computeDaysLeft(user.age, target);
    await saveUser({ targetAge: target, daysLeft: days, mode: 'manual' });
    setDaysLeft(days);
    setFillPct(Math.max(0.04, 1 - user.age / target));
    if (user.name) {
      setSavedName(user.name);
      setStage('result');
    } else {
      setStage('name');
    }
  };

  const confirmName = async (n: string) => {
    if (n.trim()) await saveUser({ name: n.trim() });
    setSavedName(n.trim());
    setStage('result');
  };

  // ── Name screen ──
  if (stage === 'name') {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.bg }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Shell>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <SerifText size={30} style={{ marginBottom: 8 }}>
              {s.yourNumberSet}
            </SerifText>
            <Text style={styles.nameHint}>{s.whatCallYou}</Text>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder={s.namePlaceholder}
              placeholderTextColor={theme.muted}
              style={styles.nameInput}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={() => confirmName(nameInput)}
            />
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={() => confirmName(nameInput)}
              style={[styles.continueBtn, !nameInput.trim() && { opacity: 0.4 }]}
              disabled={!nameInput.trim()}
            >
              <Text style={styles.continueBtnText}>{s.seeMyCount}</Text>
            </TouchableOpacity>
          </View>
        </Shell>
      </KeyboardAvoidingView>
    );
  }

  // ── Result screen ──
  if (stage === 'result') {
    return <ManualResult
      target={target} daysLeft={daysLeft} fillPct={fillPct}
      name={savedName} quote={quote}
      onStart={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
    />;
  }

  // ── Pick screen ──
  return (
    <Shell>
      <View style={styles.header}>
        <Eyebrow style={{ marginBottom: 8 }}>{s.step03}</Eyebrow>
        <SerifText size={30}>{s.pickYourNumber}</SerifText>
      </View>

      <View style={styles.body}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.bigTarget}>{target}</Text>
          <Eyebrow style={{ marginTop: 4 }}>{s.targetAge}</Eyebrow>
        </View>

        <AgePicker value={target} min={40} max={110} onChange={setTarget} />

        <Card>
          <Text style={styles.quoteText}>"{quote.t}"</Text>
          <Text style={styles.quoteAuthor}>— {quote.a.toUpperCase()}</Text>
        </Card>
      </View>

      <Btn onPress={lockIn} style={{ marginBottom: 16 }}>{s.lockItIn}</Btn>
    </Shell>
  );
}

function ManualResult({ target, daysLeft, fillPct, name, quote, onStart }: {
  target: number; daysLeft: number; fillPct: number;
  name: string; quote: { t: string; a: string }; onStart: () => void;
}) {
  const insets = useSafeAreaInsets();
  const countdown = useCountdown();
  const { s } = useT();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <Eyebrow style={{ marginBottom: 8 }}>{s.manualCountSet}</Eyebrow>
      <SerifText size={28} style={{ marginBottom: 20 }}>
        {name ? `${name},\n${s.yourCountStartsNow}` : `${s.yourNumberSet}\n${s.yourCountStartsNow}`}
      </SerifText>

      {/* hourglass + target */}
      <Card style={{ alignItems: 'center', paddingVertical: 24, marginBottom: 10 }}>
        <AnimatedHourglass size={130} fillPct={fillPct} animate grainMs={1000} />
        <Text style={styles.bigAge}>{target}</Text>
        <MonoText style={{ fontSize: 10, marginTop: 2 }}>{s.targetAge} · {s.setManually}</MonoText>
      </Card>

      {/* stat row */}
      <View style={styles.statRow}>
        <View style={styles.statCell}>
          <Eyebrow style={{ marginBottom: 4, fontSize: 8 }}>{s.daysLeft}</Eyebrow>
          <Text style={styles.statNum}>{daysLeft.toLocaleString()}</Text>
        </View>
        <View style={styles.statCell}>
          <Eyebrow style={{ marginBottom: 4, fontSize: 8 }}>{s.monthsLeft}</Eyebrow>
          <Text style={styles.statNum}>{Math.floor(daysLeft / 30.44).toLocaleString()}</Text>
        </View>
        <View style={styles.statCell}>
          <Eyebrow style={{ marginBottom: 4, fontSize: 8 }}>{s.yearsLeft}</Eyebrow>
          <Text style={styles.statNum}>{Math.floor(daysLeft / 365)}</Text>
        </View>
      </View>

      {/* countdown */}
      <Card style={{ alignItems: 'center', marginBottom: 10, paddingVertical: 14 }}>
        <Eyebrow style={{ marginBottom: 6, fontSize: 8 }}>{s.todayEndsIn}</Eyebrow>
        <Text style={styles.countdown}>{countdown}</Text>
      </Card>

      {/* quote */}
      <Card style={{ marginBottom: 24 }}>
        <Text style={styles.quoteText}>"{quote.t}"</Text>
        <Text style={styles.quoteAuthor}>— {quote.a.toUpperCase()}</Text>
      </Card>

      <Btn onPress={onStart}>{s.startCounting}</Btn>
    </ScrollView>
  );
}

const ITEM_W = 64;
const AGES = Array.from({ length: 71 }, (_, i) => i + 40);

function AgePicker({ value, min, max, onChange }: {
  value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  const ref = useRef<FlatList>(null);
  const screenW = Dimensions.get('window').width - 48;
  const sidepad = (screenW - ITEM_W) / 2;

  return (
    <View>
      <View pointerEvents="none" style={pickerStyles.indicator} />
      <FlatList
        ref={ref}
        data={AGES}
        horizontal
        keyExtractor={String}
        snapToInterval={ITEM_W}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: sidepad }}
        initialScrollIndex={value - 40}
        getItemLayout={(_, index) => ({ length: ITEM_W, offset: ITEM_W * index, index })}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / ITEM_W);
          onChange(Math.max(min, Math.min(max, idx + 40)));
        }}
        renderItem={({ item }) => (
          <View style={pickerStyles.item}>
            <Text style={[pickerStyles.itemText, item === value && pickerStyles.itemActive]}>
              {item}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 8, marginBottom: 16 },
  body: { flex: 1, justifyContent: 'center', gap: 28 },
  bigTarget: { fontFamily: fonts.serif, fontSize: 100, lineHeight: 112, color: theme.accent, letterSpacing: -3 },
  bigAge: { fontFamily: fonts.serif, fontSize: 72, lineHeight: 82, color: theme.accent, letterSpacing: -2, marginTop: 8 },
  statRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statCell: {
    flex: 1, backgroundColor: theme.surface, borderRadius: 12,
    borderWidth: 1, borderColor: theme.border, padding: 12, alignItems: 'center',
  },
  statNum: { fontFamily: fonts.serif, fontSize: 22, color: theme.fg, letterSpacing: -0.5 },
  countdown: { fontFamily: fonts.mono, fontSize: 28, color: theme.fg, letterSpacing: 3 },
  quoteText: { fontFamily: fonts.serifItalic, fontSize: 15, lineHeight: 22, color: theme.fg, marginBottom: 10 },
  quoteAuthor: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2.2, color: theme.muted },
  nameHint: { fontFamily: fonts.serifItalic, fontSize: 18, color: theme.muted, lineHeight: 26, marginBottom: 32 },
  nameInput: {
    fontFamily: fonts.serifItalic, fontSize: 28, color: theme.fg,
    borderBottomWidth: 1, borderColor: theme.accent, paddingBottom: 10,
  },
  btnRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  skipBtn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  skipBtnText: { fontFamily: fonts.mono, fontSize: 10, color: theme.muted, letterSpacing: 1.5 },
  continueBtn: { flex: 2, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: theme.accent },
  continueBtnText: { fontFamily: fonts.mono, fontSize: 10, color: theme.accentFg, letterSpacing: 1.5 },
});

const pickerStyles = StyleSheet.create({
  indicator: {
    position: 'absolute', alignSelf: 'center',
    width: ITEM_W, height: 56, borderRadius: 10,
    backgroundColor: theme.accent, opacity: 0.12, zIndex: 1,
  },
  item: { width: ITEM_W, alignItems: 'center', justifyContent: 'center', height: 56 },
  itemText: { fontFamily: fonts.serif, fontSize: 26, color: theme.muted },
  itemActive: { color: theme.accent, fontSize: 36 },
});
