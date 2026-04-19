import React, { useEffect, useState, useRef } from 'react';
import Svg, { Path, Rect, Ellipse, Circle, ClipPath, Defs, G, Line } from 'react-native-svg';
import { theme } from '../theme';

interface Props {
  size?: number;
  /** 0..1 — how full the TOP chamber is. 1=full, 0=empty. Ignored when drain=true. */
  fillPct?: number;
  /** Show falling grain animation */
  animate?: boolean;
  /** Continuously drain top→bottom in a loop (Onboarding demo) */
  drain?: boolean;
  /** Duration of one full drain cycle in ms */
  cycleMs?: number;
  /** Duration of one grain falling from neck to bottom in ms */
  grainMs?: number;
}

const VB_W = 56;
const VB_H = 72;
let _uid = 0;

export default function AnimatedHourglass({
  size = 96,
  fillPct = 0.6,
  animate = true,
  drain = false,
  cycleMs = 9000,
  grainMs = 2600,
}: Props) {
  // Unique ID per instance so ClipPath IDs never conflict on the same screen
  const uid = useRef(`hg${++_uid}`).current;

  const [drainPhase, setDrainPhase] = useState(0);
  const [grainPhase, setGrainPhase] = useState(0);

  useEffect(() => {
    if (!drain) return;
    const id = setInterval(() => setDrainPhase(p => (p + 16 / cycleMs) % 1), 16);
    return () => clearInterval(id);
  }, [drain, cycleMs]);

  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => setGrainPhase(p => (p + 16 / grainMs) % 1), 16);
    return () => clearInterval(id);
  }, [animate, grainMs]);

  // p = 0 → top full, p = 1 → top empty
  const rawP = drain ? drainPhase : 1 - fillPct;
  const p = drain
    ? (rawP < 0.5 ? 2 * rawP * rawP : 1 - Math.pow(-2 * rawP + 2, 2) / 2)
    : Math.max(0, Math.min(1, rawP));

  const topSurface = 6 + (33 - 6) * p;
  const botSurface = 66 - (66 - 39) * p;

  // Grains: fall from just above the neck (y≈32) through the neck and into the bottom (y≈56)
  // Each grain is staggered evenly across the cycle
  const NUM_GRAINS = 6;
  const hasSand = p < 0.97; // no grains when top is empty
  const grains = animate && hasSand
    ? Array.from({ length: NUM_GRAINS }, (_, i) => {
        const gp = (grainPhase + i / NUM_GRAINS) % 1;
        const y = 32 + gp * 24;          // travel 32 → 56 through the neck at 36
        const xJitter = Math.sin(i * 1.9) * 1.2; // slight horizontal spread
        // fade in quickly, hold, fade out near bottom
        const opacity = gp < 0.08
          ? gp / 0.08
          : gp > 0.85
          ? (1 - gp) / 0.15
          : 1;
        return { i, y, x: 28 + xJitter, opacity: opacity * 0.9 };
      })
    : [];

  const w = size * (VB_W / VB_H);
  const h = size;

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`}>
      <Defs>
        <ClipPath id={`${uid}-top`}>
          <Path d="M8 5 L48 5 L30 36 L26 36 Z" />
        </ClipPath>
        <ClipPath id={`${uid}-bot`}>
          <Path d="M26 36 L30 36 L48 67 L8 67 Z" />
        </ClipPath>
      </Defs>

      {/* Caps */}
      <Rect x="4" y="2" width="48" height="3" rx="1" fill={theme.fg} />
      <Rect x="4" y="67" width="48" height="3" rx="1" fill={theme.fg} />

      {/* Glass outline */}
      <Path d="M8 5 L48 5 L30 36 L26 36 Z"
        stroke={theme.fg} strokeOpacity={0.7} strokeWidth={1.2} fill="none" />
      <Path d="M26 36 L30 36 L48 67 L8 67 Z"
        stroke={theme.fg} strokeOpacity={0.7} strokeWidth={1.2} fill="none" />

      {/* Top sand */}
      <G clipPath={`url(#${uid}-top)`}>
        <Rect x="0" y={topSurface} width={VB_W} height={VB_H} fill={theme.accent} opacity={0.95} />
        <Ellipse cx={28} cy={topSurface + 0.6}
          rx={Math.max(1, 22 * (1 - p * 0.6))} ry={0.8}
          fill={theme.accent} opacity={0.5} />
      </G>

      {/* Falling grains — drawn over everything, no clip */}
      {grains.map(({ i, y, x, opacity }) => (
        <Circle key={i} cx={x} cy={y} r={0.85} fill={theme.accent} opacity={opacity} />
      ))}

      {/* Bottom sand */}
      <G clipPath={`url(#${uid}-bot)`}>
        <Rect x="0" y={botSurface} width={VB_W} height={VB_H} fill={theme.accent} />
        <Ellipse cx={28} cy={botSurface}
          rx={14 + 8 * p} ry={1.5 + 1.5 * p}
          fill={theme.accent} />
      </G>

      {/* Neck gap */}
      <Line x1={26} y1={36} x2={30} y2={36} stroke={theme.bg} strokeWidth={0.8} />
    </Svg>
  );
}
