export const theme = {
  // Colors — Terracotta palette
  bg: '#eadfc3',
  surface: '#f5ecd6',
  fg: '#3a2e1e',
  muted: 'rgba(58,46,30,0.55)',
  border: 'rgba(58,46,30,0.15)',
  accent: '#b5533c',
  accentFg: '#f5ecd6',

  // Lockscreen
  lockBg: '#dcc9a4',
  lockFg: '#3a2e1e',

  // Notification
  notifBg: 'rgba(245,236,214,0.95)',
  notifFg: '#3a2e1e',
  notifBorder: 'rgba(58,46,30,0.12)',
  notifBgStrong: 'rgba(252,244,226,0.98)',
  notifFgStrong: '#3a2e1e',
  notifBorderStrong: 'rgba(181,83,60,0.35)',
} as const;

// Font family names — loaded via expo-font
export const fonts = {
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

export type Theme = typeof theme;
