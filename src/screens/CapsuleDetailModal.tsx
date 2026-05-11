import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Modal, ScrollView, TouchableOpacity,
  Animated, Dimensions, StyleSheet, Alert,
} from 'react-native';
import RAnimated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme, fonts } from '../theme';
import type { Capsule, UserData } from '../types';

const { width: W, height: H } = Dimensions.get('window');
const DARK = '#1a1410';
const PARTICLE_COUNT = 24;

const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, '${d.getFullYear().toString().slice(2)}`;
}
function fmtDateShort(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} '${d.getFullYear().toString().slice(2)}`;
}
function dayOfWeek(iso: string): string {
  return DAYS[new Date(iso).getDay()];
}
function numWithCommas(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function makeParticleData() {
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const edge = Math.floor(Math.random() * 4);
    let sx: number, sy: number;
    if (edge === 0) { sx = Math.random() * W; sy = -10; }
    else if (edge === 1) { sx = W + 10; sy = Math.random() * H; }
    else if (edge === 2) { sx = Math.random() * W; sy = H + 10; }
    else { sx = -10; sy = Math.random() * H; }
    return { sx, sy, delay: Math.floor(Math.random() * 600) };
  });
}

// ─── Particle ────────────────────────────────────────────────────────────────

function Particle({ sx, sy, delay }: { sx: number; sy: number; delay: number }) {
  const pos = useRef(new Animated.ValueXY({ x: sx, y: sy })).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(pos, {
        toValue: { x: W / 2, y: H / 2 },
        duration: 1800,
        delay,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 1400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: theme.accent,
        opacity,
        transform: pos.getTranslateTransform(),
      }}
    />
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'sealed' | 'ritual' | 'letter';

interface Props {
  capsule: Capsule | null;
  user: UserData;
  visible: boolean;
  onClose: () => void;
  onBurn: (id: string) => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CapsuleDetailModal({ capsule, user, visible, onClose, onBurn }: Props) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('sealed');
  const [letterReady, setLetterReady] = useState(false);

  // RN Animated values for ring pulses
  const r1 = useRef(new Animated.Value(1)).current;
  const r2 = useRef(new Animated.Value(1)).current;
  const r3 = useRef(new Animated.Value(1)).current;

  // Skip button opacity + bloom
  const skipOpacity = useRef(new Animated.Value(0)).current;
  const bloomSize = useRef(new Animated.Value(80)).current;
  const bloomOpacity = useRef(new Animated.Value(0)).current;

  // Particle data — stable per capsule
  const particles = useMemo(() => makeParticleData(), [capsule?.id]);

  // Reset on open
  useEffect(() => {
    if (!visible) return;
    setPhase('sealed');
    setLetterReady(false);
    skipOpacity.setValue(0);
    bloomSize.setValue(80);
    bloomOpacity.setValue(0);
  }, [visible]);

  // Sealed phase: pulsing rings
  useEffect(() => {
    if (phase !== 'sealed') {
      r1.stopAnimation(); r2.stopAnimation(); r3.stopAnimation();
      r1.setValue(1); r2.setValue(1); r3.setValue(1);
      return;
    }
    const loop = (val: Animated.Value, startDelay: number) => {
      const t = setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(val, { toValue: 1.06, duration: 700, useNativeDriver: true }),
            Animated.timing(val, { toValue: 1.0, duration: 700, useNativeDriver: true }),
          ])
        ).start();
      }, startDelay);
      return t;
    };
    const t1 = loop(r1, 0);
    const t2 = loop(r2, 350);
    const t3 = loop(r3, 700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [phase]);

  // Ritual phase: skip button, bloom, auto-advance
  useEffect(() => {
    if (phase !== 'ritual') return;

    const tSkip = setTimeout(() => {
      Animated.timing(skipOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 800);

    const tBloom = setTimeout(() => {
      Animated.parallel([
        Animated.timing(bloomSize, { toValue: 280, duration: 700, useNativeDriver: false }),
        Animated.sequence([
          Animated.timing(bloomOpacity, { toValue: 0.5, duration: 300, useNativeDriver: false }),
          Animated.timing(bloomOpacity, { toValue: 0, duration: 400, useNativeDriver: false }),
        ]),
      ]).start();
    }, 1800);

    const tLetter = setTimeout(() => setPhase('letter'), 2600);

    return () => {
      clearTimeout(tSkip);
      clearTimeout(tBloom);
      clearTimeout(tLetter);
    };
  }, [phase]);

  // Letter phase: short delay before words start appearing
  useEffect(() => {
    if (phase !== 'letter') { setLetterReady(false); return; }
    const t = setTimeout(() => setLetterReady(true), 200);
    return () => clearTimeout(t);
  }, [phase]);

  if (!capsule) return null;

  const daysWaited = Math.floor((Date.now() - new Date(capsule.createdAt).getTime()) / 86400000);
  const daysRemainingThen = user.daysLeft + daysWaited;
  const words = capsule.text.split(/\s+/).filter(Boolean);
  const sealMonogram = capsule.text.trim()[0]?.toUpperCase() ?? '✦';

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>

      {/* ── Phase 1: Sealed ──────────────────────────────────────────────────── */}
      {phase === 'sealed' && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: DARK, alignItems: 'center', justifyContent: 'center' }]}>
          {/* Header */}
          <View style={[s.darkHeader, { top: insets.top }]}>
            <TouchableOpacity onPress={onClose} style={s.backBtn}>
              <Text style={s.backText}>← Capsule</Text>
            </TouchableOpacity>
            <View style={s.chip}>
              <Text style={s.chipText}>unlocked</Text>
            </View>
          </View>

          {/* Rings */}
          <View style={s.ringsWrap}>
            <Animated.View style={[s.ring, s.ring3, { transform: [{ scale: r3 }] }]} />
            <Animated.View style={[s.ring, s.ring2, { transform: [{ scale: r2 }] }]} />
            <Animated.View style={[s.ring, s.ring1, { transform: [{ scale: r1 }] }]} />
            {/* Seal */}
            <View style={s.seal}>
              <Text style={s.sealGlyph}>{sealMonogram}</Text>
            </View>
          </View>

          <Text style={s.sealedLabel}>sealed {fmtDateShort(capsule.createdAt)}</Text>
          <Text style={s.heroTitle}>
            A letter from{'\n'}<Text style={s.heroAccent}>past you.</Text>
          </Text>
          <Text style={s.heroSub}>
            You sealed this on a {dayOfWeek(capsule.createdAt)}.{'\n'}It's been waiting.
          </Text>

          <TouchableOpacity style={s.openBtn} onPress={() => setPhase('ritual')}>
            <Text style={s.openBtnText}>OPEN SEAL →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Phase 2: Ritual ──────────────────────────────────────────────────── */}
      {phase === 'ritual' && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: DARK }]}>
          {particles.map((p, i) => (
            <Particle key={i} sx={p.sx} sy={p.sy} delay={p.delay} />
          ))}

          {/* Bloom — fixed container centered at screen, inner view expands */}
          <View style={{ position: 'absolute', left: W / 2 - 140, top: H / 2 - 140, width: 280, height: 280, alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
            <Animated.View style={{ width: bloomSize, height: bloomSize, borderRadius: 999, backgroundColor: theme.accent, opacity: bloomOpacity }} />
          </View>

          {/* Skip button */}
          <Animated.View style={[s.skipWrap, { top: insets.top + 16, opacity: skipOpacity }]}>
            <TouchableOpacity onPress={() => setPhase('letter')} style={s.skipBtn}>
              <Text style={s.skipText}>skip</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Center glyph */}
          <View style={s.ritualCenter} pointerEvents="none">
            <Text style={s.ritualGlyph}>{sealMonogram}</Text>
          </View>
        </View>
      )}

      {/* ── Phase 3: Letter ──────────────────────────────────────────────────── */}
      {phase === 'letter' && (
        <RAnimated.View entering={FadeIn.duration(500)} style={[StyleSheet.absoluteFill, { backgroundColor: DARK }]}>
          <ScrollView
            contentContainerStyle={[s.letterScroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={s.letterHeader}>
              <Text style={s.letterHeaderLabel}>Letter · 01</Text>
              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                <Text style={s.closeBtnText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Metadata grid */}
            <View style={s.metaGrid}>
              <View style={s.metaRow}>
                <MetaCell label="sealed" value={fmtDate(capsule.createdAt)} />
                <View style={s.metaDividerV} />
                <MetaCell label="waited" value={`${numWithCommas(daysWaited)} days`} accent />
              </View>
              <View style={s.metaDividerH} />
              <View style={s.metaRow}>
                <MetaCell label="you were" value={`${user.age} yrs old`} />
                <View style={s.metaDividerV} />
                <MetaCell label="days then" value={numWithCommas(daysRemainingThen)} />
              </View>
            </View>

            {/* Letter body */}
            <View style={s.letterBody}>
              <Text style={s.letterGreeting}>Dear future me,</Text>

              {/* Word-by-word reveal */}
              {letterReady && (
                <View style={s.wordWrap}>
                  {words.map((word, i) => (
                    <RAnimated.View key={i} entering={FadeInDown.delay(i * 28).duration(500)}>
                      <Text style={s.letterWord}>{word} </Text>
                    </RAnimated.View>
                  ))}
                </View>
              )}

              <Text style={s.letterSignoff}>
                {'\n'}— me, {daysWaited === 1 ? '1 day' : `${numWithCommas(daysWaited)} days`} ago
              </Text>
            </View>

            {/* Actions */}
            <View style={s.actions}>
              <TouchableOpacity style={s.actionGhost} onPress={onClose}>
                <Text style={s.actionGhostText}>Keep on shelf</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.actionBurn}
                onPress={() => {
                  Alert.alert(
                    'Burn this letter?',
                    'It will be gone forever. No going back.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Burn it', style: 'destructive', onPress: () => onBurn(capsule!.id) },
                    ]
                  );
                }}
              >
                <Text style={s.actionBurnText}>Burn the letter</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </RAnimated.View>
      )}
    </Modal>
  );
}

// ─── MetaCell ─────────────────────────────────────────────────────────────────

function MetaCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={s.metaCell}>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={[s.metaValue, accent && { color: theme.accent }]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Dark header
  darkHeader: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 8,
  },
  backBtn: { padding: 4 },
  backText: { fontFamily: fonts.mono, fontSize: 11, color: 'rgba(245,236,214,0.7)', letterSpacing: 0.5 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    borderWidth: 1, borderColor: theme.accent,
  },
  chipText: { fontFamily: fonts.mono, fontSize: 9, color: theme.accent, letterSpacing: 1 },

  // Rings
  ringsWrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1 },
  ring1: { width: 90, height: 90, borderColor: 'rgba(181,83,60,0.5)' },
  ring2: { width: 120, height: 120, borderColor: 'rgba(181,83,60,0.3)' },
  ring3: { width: 155, height: 155, borderColor: 'rgba(181,83,60,0.15)' },
  seal: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#2a1f15',
    borderWidth: 1, borderColor: 'rgba(181,83,60,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  sealGlyph: { fontFamily: fonts.serifItalic, fontSize: 32, color: theme.accentFg },

  // Sealed text
  sealedLabel: { fontFamily: fonts.mono, fontSize: 10, color: 'rgba(245,236,214,0.4)', letterSpacing: 1.5, marginBottom: 16 },
  heroTitle: { fontFamily: fonts.serif, fontSize: 28, color: theme.accentFg, textAlign: 'center', lineHeight: 38, marginBottom: 12 },
  heroAccent: { fontFamily: fonts.serifItalic, color: theme.accent },
  heroSub: { fontFamily: fonts.body, fontSize: 13, color: 'rgba(245,236,214,0.5)', textAlign: 'center', lineHeight: 20, marginBottom: 40 },

  // Open button
  openBtn: {
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 28,
    backgroundColor: theme.accent,
  },
  openBtnText: { fontFamily: fonts.mono, fontSize: 11, color: theme.accentFg, letterSpacing: 2 },

  // Ritual
  skipWrap: { position: 'absolute', right: 20 },
  skipBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16,
    backgroundColor: 'rgba(245,236,214,0.1)',
    borderWidth: 1, borderColor: 'rgba(245,236,214,0.2)',
  },
  skipText: { fontFamily: fonts.mono, fontSize: 10, color: 'rgba(245,236,214,0.6)', letterSpacing: 1 },
  ritualCenter: {
    ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center',
  },
  ritualGlyph: { fontFamily: fonts.serifItalic, fontSize: 48, color: 'rgba(245,236,214,0.15)' },

  // Letter
  letterScroll: { paddingHorizontal: 24 },
  letterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  letterHeaderLabel: { fontFamily: fonts.mono, fontSize: 10, color: 'rgba(245,236,214,0.4)', letterSpacing: 1.5 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(245,236,214,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontFamily: fonts.body, fontSize: 18, color: 'rgba(245,236,214,0.7)', lineHeight: 32 },

  // Metadata grid
  metaGrid: { marginBottom: 28, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(181,83,60,0.25)' },
  metaRow: { flexDirection: 'row' },
  metaDividerH: { height: 1, backgroundColor: 'rgba(181,83,60,0.2)' },
  metaDividerV: { width: 1, backgroundColor: 'rgba(181,83,60,0.2)' },
  metaCell: { flex: 1, backgroundColor: '#2a1f15', paddingVertical: 14, paddingHorizontal: 16 },
  metaLabel: { fontFamily: fonts.mono, fontSize: 9, color: 'rgba(245,236,214,0.35)', letterSpacing: 1, marginBottom: 4 },
  metaValue: { fontFamily: fonts.serif, fontSize: 16, color: 'rgba(245,236,214,0.9)' },

  // Letter body
  letterBody: { marginBottom: 32 },
  letterGreeting: { fontFamily: fonts.serifItalic, fontSize: 22, color: theme.accent, marginBottom: 16, lineHeight: 30 },
  wordWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  letterWord: { fontFamily: fonts.serif, fontSize: 17, color: 'rgba(245,236,214,0.88)', lineHeight: 28 },
  letterSignoff: { fontFamily: fonts.serifItalic, fontSize: 15, color: 'rgba(245,236,214,0.4)', marginTop: 8 },

  // Actions
  actions: { flexDirection: 'row', gap: 12 },
  actionGhost: {
    flex: 1, paddingVertical: 12, borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(245,236,214,0.18)',
    alignItems: 'center',
  },
  actionGhostText: { fontFamily: fonts.mono, fontSize: 10, color: 'rgba(245,236,214,0.45)', letterSpacing: 1 },
  actionBurn: {
    flex: 1, paddingVertical: 12, borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(181,83,60,0.45)',
    alignItems: 'center',
  },
  actionBurnText: { fontFamily: fonts.mono, fontSize: 10, color: theme.accent, letterSpacing: 1 },
});
