import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Shell, Eyebrow, SerifText, MonoText, Card, Btn } from '../components/UI';
import { theme, fonts } from '../theme';
import { RootStackParamList } from '../types';
import { saveUser, loadUser, computeDaysLeft } from '../storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedHourglass from '../components/AnimatedHourglass';
import { useCountdown } from '../hooks/useCountdown';
import { useT, Lang } from '../i18n';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Quiz'> };

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

type Result = {
  targetAge: number;
  confidence: number;
  feedback: string;
  answers: string[];
  name: string;
  daysLeft: number;
  fillPct: number;
};

export default function QuizScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { lang, s } = useT();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [showConditions, setShowConditions] = useState(false);
  const [conditions, setConditions] = useState('');
  const [showName, setShowName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const QUIZ = s.quiz;

  const pick = async (optIdx: number) => {
    const opt = QUIZ[step].opts[optIdx];
    const next = [...answers, `${QUIZ[step].q}: ${opt}`];
    setAnswers(next);

    if (step < QUIZ.length - 1) {
      setStep(step + 1);
      return;
    }

    // All questions done — show conditions input first
    setShowConditions(true);
  };

  const confirmName = (n: string) => {
    setNameInput(n);
    setShowName(false);
    submitWithName(answers, conditions, n);
  };

  const submit = async (answersToSubmit: string[], conds: string) => {
    setShowConditions(false);
    setConditions(conds);
    const user = await loadUser();
    if (user.name) {
      setNameInput(user.name);
      submitWithName(answersToSubmit, conds, user.name);
    } else {
      setShowName(true);
    }
  };

  const submitWithName = async (answersToSubmit: string[], conds: string, name: string) => {
    setLoading(true);
    try {
      const user = await loadUser();
      await saveUser({ name: name || undefined });
      const estimate = await estimateLifespan(user.age, name, answersToSubmit, conds, lang);
      const daysLeft = computeDaysLeft(user.age, estimate.targetAge);
      const fillPct = Math.max(0.04, 1 - (user.age / estimate.targetAge));
      await saveUser({ targetAge: estimate.targetAge, daysLeft, confidence: estimate.confidence, mode: 'ai' });
      setResult({ ...estimate, answers: answersToSubmit, name: nameInput.trim() || user.name || '', daysLeft, fillPct });
    } catch (err: any) {
      console.error('[QuizScreen] Gemini API error:', err?.message ?? err);
      Alert.alert('Error', `${err?.message ?? String(err)}\n\nUsing a basic estimate instead.`);
      const user = await loadUser();
      const targetAge = 82;
      const daysLeft = computeDaysLeft(user.age, targetAge);
      await saveUser({ targetAge, daysLeft, confidence: 70, mode: 'ai' });
      const fbDays = computeDaysLeft(user.age, targetAge);
      setResult({
        targetAge, confidence: 70, daysLeft: fbDays,
        fillPct: Math.max(0.04, 1 - user.age / targetAge),
        feedback: "Based on average actuarial data, we've estimated a baseline life expectancy for you.",
        answers: answersToSubmit,
        name: nameInput.trim(),
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Result summary screen ──
  if (result) {
    return <ResultPage result={result} onStart={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })} />;
  }

  // ── Conditions input ──
  if (showConditions) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.bg }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Shell>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Eyebrow>{s.almostDone}</Eyebrow>
              <Eyebrow style={{ color: theme.accent }}>{s.optional}</Eyebrow>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
          </View>

          <View style={styles.body}>
            <SerifText size={28} style={{ marginBottom: 8 }}>{s.anyConditions}</SerifText>
            <Text style={styles.conditionsHint}>{s.conditionsHint}</Text>

            <TextInput
              value={conditions}
              onChangeText={setConditions}
              placeholder={s.conditionsPlaceholder}
              placeholderTextColor={theme.muted}
              multiline
              style={styles.conditionsInput}
              autoFocus
            />
          </View>

          <View style={styles.conditionsButtons}>
            <TouchableOpacity onPress={() => submit(answers, '')} style={styles.skipBtn}>
              <Text style={styles.skipBtnText}>{s.skip}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => submit(answers, conditions)} style={styles.continueBtn}>
              <Text style={styles.continueBtnText}>{s.continueBtn}</Text>
            </TouchableOpacity>
          </View>
        </Shell>
      </KeyboardAvoidingView>
    );
  }

  // ── Name input ──
  if (showName) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.bg }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Shell>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <SerifText size={30} style={{ marginBottom: 8 }}>{s.beforeWeReveal}</SerifText>
            <Text style={styles.conditionsHint}>{s.whatCallYou}</Text>

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

          <View style={styles.conditionsButtons}>
            <TouchableOpacity onPress={() => confirmName('')} style={styles.skipBtn}>
              <Text style={styles.skipBtnText}>{s.skip}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmName(nameInput)} style={styles.continueBtn}>
              <Text style={styles.continueBtnText}>{s.showMyNumber}</Text>
            </TouchableOpacity>
          </View>
        </Shell>
      </KeyboardAvoidingView>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <Shell>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <SerifText size={22} style={{ marginTop: 20, textAlign: 'center' }}>{s.calculating}</SerifText>
          <MonoText style={{ marginTop: 8, textAlign: 'center' }}>{s.aiThinking}</MonoText>
        </View>
      </Shell>
    );
  }

  // ── Quiz ──
  const question = QUIZ[step];
  const pct = ((step + 1) / QUIZ.length) * 100;

  return (
    <Shell>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Eyebrow>{s.questionOf(step + 1, QUIZ.length)}</Eyebrow>
          <Eyebrow style={{ color: theme.accent }}>{s.aiEstimating}</Eyebrow>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
      </View>

      <View style={styles.body}>
        <SerifText size={30} style={{ marginBottom: 24 }}>{question.q}</SerifText>
        <View style={styles.options}>
          {question.opts.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => pick(idx)}
              activeOpacity={0.8}
              style={styles.option}
            >
              <Text style={styles.optionText}>{opt}</Text>
              <Text style={styles.optionLetter}>{String.fromCharCode(65 + idx)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <MonoText style={styles.footer}>{s.basedOnActuarial}</MonoText>
    </Shell>
  );
}

function ResultPage({ result, onStart }: { result: Result; onStart: () => void }) {
  const insets = useSafeAreaInsets();
  const countdown = useCountdown();
  const { s } = useT();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <Eyebrow style={{ marginBottom: 8 }}>{s.aiComplete}</Eyebrow>
      <SerifText size={28} style={{ marginBottom: 20 }}>
        {result.name ? `${result.name},\n${s.hereIsWhat}` : s.hereIsWhat}
      </SerifText>

      {/* hourglass + target age */}
      <Card style={{ alignItems: 'center', paddingVertical: 24, marginBottom: 10 }}>
        <AnimatedHourglass size={130} fillPct={result.fillPct} animate grainMs={1000} />
        <Text style={styles.bigAge}>{result.targetAge}</Text>
        <MonoText style={{ fontSize: 10, marginTop: 2 }}>{s.estimatedYears}</MonoText>
        <View style={styles.confTrack}>
          <View style={[styles.confFill, { width: `${result.confidence}%` }]} />
        </View>
        <MonoText style={{ fontSize: 9, marginTop: 4 }}>{result.confidence}% {s.confidence}</MonoText>
      </Card>

      {/* stat row */}
      <View style={styles.statRow}>
        <View style={styles.statCell}>
          <Eyebrow style={{ marginBottom: 4, fontSize: 8 }}>{s.daysLeft}</Eyebrow>
          <Text style={styles.statNum}>{result.daysLeft.toLocaleString()}</Text>
        </View>
        <View style={styles.statCell}>
          <Eyebrow style={{ marginBottom: 4, fontSize: 8 }}>{s.monthsLeft}</Eyebrow>
          <Text style={styles.statNum}>{Math.floor(result.daysLeft / 30.44).toLocaleString()}</Text>
        </View>
        <View style={styles.statCell}>
          <Eyebrow style={{ marginBottom: 4, fontSize: 8 }}>{s.yearsLeft}</Eyebrow>
          <Text style={styles.statNum}>{Math.floor(result.daysLeft / 365)}</Text>
        </View>
      </View>

      {/* countdown */}
      <Card style={{ alignItems: 'center', marginBottom: 10, paddingVertical: 14 }}>
        <Eyebrow style={{ marginBottom: 6, fontSize: 8 }}>{s.todayEndsIn}</Eyebrow>
        <Text style={styles.countdown}>{countdown}</Text>
      </Card>

      {/* AI feedback */}
      <Card style={{ marginBottom: 10 }}>
        <Eyebrow style={{ marginBottom: 10 }}>{s.aiFeedback}</Eyebrow>
        <Text style={styles.feedbackText}>"{result.feedback}"</Text>
      </Card>

      {/* answers */}
      <Card style={{ marginBottom: 24 }}>
        <Eyebrow style={{ marginBottom: 12 }}>{s.yourAnswers}</Eyebrow>
        {result.answers.map((a, i) => {
          const [q, v] = a.split(': ');
          return (
            <View key={i} style={[styles.answerRow, i === result.answers.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.answerQ}>{q}</Text>
              <Text style={styles.answerV}>{v}</Text>
            </View>
          );
        })}
      </Card>

      <Btn onPress={onStart}>{s.startCounting}</Btn>

      <MonoText style={styles.disclaimer}>{s.disclaimer}</MonoText>
    </ScrollView>
  );
}

async function estimateLifespan(
  currentAge: number,
  name: string,
  answersFormatted: string[],
  conditions: string,
  lang: Lang,
): Promise<{ targetAge: number; confidence: number; feedback: string }> {
  if (!API_KEY) throw new Error('No Gemini API key');

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const conditionsLine = conditions.trim()
    ? `\nExisting medical conditions: ${conditions.trim()}`
    : '';

  const nameLine = name.trim() ? `The person's name is ${name.trim()}.` : '';
  const langInstruction = lang === 'zh'
    ? 'Write the feedback field in Simplified Chinese.'
    : 'Write the feedback field in English.';

  const prompt = `You are a life expectancy estimator. ${nameLine} Based on the following lifestyle information, estimate a realistic life expectancy for a person who is currently ${currentAge} years old.

Lifestyle information:
${answersFormatted.map(a => `- ${a}`).join('\n')}${conditionsLine}

Return ONLY a JSON object with exactly these three fields:
- targetAge: a whole number between 60 and 105 (the estimated age at death)
- confidence: a whole number between 55 and 95 (your confidence percentage)
- feedback: a single sentence (max 30 words) of honest, direct insight — address them by name if provided — about the biggest factor affecting their longevity

${langInstruction}

Example: {"targetAge": 83, "confidence": 78, "feedback": "Alex, your sleep and exercise habits are strong foundations, but daily drinking is the single biggest drag on your estimate."}

Respond with the JSON object only, no other text.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const match = text.match(/\{[\s\S]*?\}/);
  if (!match) throw new Error('No JSON in response');
  const parsed = JSON.parse(match[0]);
  return {
    targetAge: Math.max(60, Math.min(105, Number(parsed.targetAge) || 82)),
    confidence: Math.max(55, Math.min(95, Number(parsed.confidence) || 75)),
    feedback: String(parsed.feedback || 'Your lifestyle profile has been analyzed.'),
  };
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingTop: 8, marginBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressTrack: { height: 2, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: theme.accent },
  body: { flex: 1, justifyContent: 'center' },
  options: { gap: 10 },
  option: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 18, borderRadius: 12,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
  },
  optionText: { fontFamily: fonts.body, fontSize: 15, color: theme.fg },
  optionLetter: { fontFamily: fonts.mono, fontSize: 10, color: theme.muted, letterSpacing: 2 },
  footer: { textAlign: 'center', marginBottom: 24, fontSize: 10 },

  bigAge: { fontFamily: fonts.serif, fontSize: 72, lineHeight: 72, color: theme.accent, letterSpacing: -2, marginTop: 8 },
  confTrack: { width: '60%', height: 2, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden', marginTop: 10 },
  confFill: { height: '100%', backgroundColor: theme.accent },
  statRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statCell: {
    flex: 1, backgroundColor: theme.surface, borderRadius: 12,
    borderWidth: 1, borderColor: theme.border,
    padding: 12, alignItems: 'center',
  },
  statNum: { fontFamily: fonts.serif, fontSize: 22, color: theme.fg, letterSpacing: -0.5 },
  countdown: { fontFamily: fonts.mono, fontSize: 28, color: theme.fg, letterSpacing: 3 },
  feedbackText: { fontFamily: fonts.serifItalic, fontSize: 15, lineHeight: 22, color: theme.fg },
  answerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderColor: theme.border,
  },
  answerQ: { fontFamily: fonts.body, fontSize: 12, color: theme.muted, flex: 1 },
  answerV: { fontFamily: fonts.mono, fontSize: 11, color: theme.fg, letterSpacing: 0.5 },
  disclaimer: {
    textAlign: 'center', marginTop: 16, fontSize: 9, lineHeight: 14,
    color: theme.muted, letterSpacing: 0.8,
  },

  conditionsHint: { fontFamily: fonts.serifItalic, fontSize: 18, color: theme.muted, lineHeight: 26, marginBottom: 32 },
  nameInput: {
    fontFamily: fonts.serifItalic, fontSize: 28, color: theme.fg,
    borderBottomWidth: 1, borderColor: theme.accent, paddingBottom: 10,
    marginBottom: 16,
  },
  conditionsInput: {
    fontFamily: fonts.body, fontSize: 15, color: theme.fg,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    borderRadius: 12, padding: 16, minHeight: 100, textAlignVertical: 'top',
  },
  conditionsButtons: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  skipBtn: {
    flex: 1, padding: 16, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: theme.border,
  },
  skipBtnText: { fontFamily: fonts.mono, fontSize: 10, color: theme.muted, letterSpacing: 1.5 },
  continueBtn: {
    flex: 2, padding: 16, borderRadius: 12, alignItems: 'center',
    backgroundColor: theme.accent,
  },
  continueBtnText: { fontFamily: fonts.mono, fontSize: 10, color: theme.accentFg, letterSpacing: 1.5 },
});
