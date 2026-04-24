import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'en' | 'zh';
const LANG_KEY = '@lifecountdown/lang';

const en = {
  // Onboarding
  tagline: 'Every grain counts.\nSo spend it.',
  sub: 'Not a warning. A tool.\nCount the sand you have left.',
  cta: 'Start your count down →',
  privacy: 'your data stays on device',

  // Age screen
  beforeWeStart: 'Before we start —\nwhat should we call you?',
  namePlaceholder: 'Your name (optional)',
  anonymousPlaceholder: 'Anonymous',
  step01: 'Step 01 / 02',
  howOld: 'How old\nare you?',
  modeAge: 'AGE',
  modeBirthday: 'BIRTHDAY',
  yearsAliveDrag: 'years alive · drag to change',
  drag: 'drag',
  selectDOB: 'Select your date of birth',
  drumYear: 'Year', drumMonth: 'Month', drumDay: 'Day',
  continueBtn: 'Continue →',

  // Mode screen
  step02: 'Step 02 / 02',
  howEstimate: 'How should we estimate\nyour time?',
  modeATitle: 'Set it yourself',
  modeADesc: 'Choose your own target age. Simple and direct.',
  modeBTitle: 'AI Estimate',
  modeBDesc: 'Answer a few lifestyle questions. AI estimates your lifespan.',
  chooseModeA: 'Choose A →',
  chooseModeB: 'Choose B →',
  modeHint: 'you can change this later',

  // Manual screen
  step03: 'Step 03 · Mode A',
  pickYourNumber: 'Pick your number.',
  targetAge: 'target age',
  lockItIn: 'Lock it in →',
  yourNumberSet: 'Your number is set —',
  seeMyCount: 'See my count →',
  manualCountSet: 'Manual · Count set',
  yourCountStartsNow: 'your count starts now.',
  setManually: 'set manually',

  // Quiz screen
  questionOf: (n: number, total: number) => `Question ${n} / ${total}`,
  aiEstimating: 'AI · Estimating',
  almostDone: 'Almost done',
  optional: 'Optional',
  anyConditions: 'Any existing conditions?',
  conditionsHint: 'e.g. kidney disease, herniated disc, hypertension — the AI will factor these in.',
  conditionsPlaceholder: 'Type here, or leave blank to skip',
  skip: 'Skip',
  beforeWeReveal: 'Before we reveal\nyour number —',
  whatCallYou: 'what should we call you?',
  showMyNumber: 'Show my number →',
  calculating: 'Calculating your\nremaining time...',
  aiThinking: 'AI is thinking',
  aiComplete: 'AI · Estimate complete',
  hereIsWhat: "here's what we found.",
  estimatedLifespan: 'Estimated lifespan',
  estimatedYears: 'estimated years',
  aiFeedback: 'AI feedback',
  yourAnswers: 'Your answers',
  startCounting: 'Start counting →',
  disclaimer: 'This is an AI estimate for reflection only — not medical advice.\nIf you have health concerns, please consult a doctor.',
  basedOnActuarial: 'Based on actuarial life tables',

  // Quiz questions & options
  quiz: [
    { q: 'How many hours do you sleep?',   opts: ['< 5', '5–6', '7–8', '9+'] },
    { q: 'Do you smoke?',                  opts: ['Never', 'Socially', 'Daily', 'Heavy'] },
    { q: 'How much do you drink?',         opts: ['Rarely', '1–2/week', '3–6/week', 'Daily'] },
    { q: 'Exercise per week?',             opts: ['Never', '1–2×', '3–4×', '5+'] },
    { q: 'Diet quality?',                  opts: ['Mostly junk', 'Mixed', 'Mostly whole', 'Strict'] },
    { q: 'Stress level?',                  opts: ['Low', 'Moderate', 'High', 'Crushing'] },
  ],

  // Dashboard
  goodToSee: 'Good to see you.',
  goodToSeeNamed: (name: string) => `Good to see you,\n${name}.`,
  live: 'live',
  daysRemaining: 'Days Remaining',
  monthsRemaining: 'Months Remaining',
  todayEndsIn: 'today ends in',
  lifeProgress: 'Life Progress',
  youAre: 'you are',
  nextBirthday: 'next birthday',
  target: 'target',
  todaysNote: "Today's note",
  forNamed: (name: string) => `for ${name}`,
  dayOfYear: 'day of year',
  yearsLeft: 'years left',
  confidence: 'confidence',
  aiEstimate: 'ai estimate',
  userSet: 'user set',
  viewHourglass: 'View Full Hourglass →',
  yrs: 'yrs',
  mo: 'mo',
  days: 'days',
  approx: 'approx',

  // Stats
  daysLeft: 'Days left',
  monthsLeft: 'Months left',

  // Hourglass
  hourglassLive: 'Hourglass · live',
  pctRemains: (pct: string) => `${pct}% of you remains`,
  grainsLeft: (n: string) => `${n} grains left.`,
  grainLegend: 'one grain ≈ one day · running in real time',
  back: '← back',

  // Figures
  figuresTitle: 'Historical Figures',
  figuresSubtitle: 'How do you compare?',
  outlived: 'outlived',
  toLive: 'to live',
  passedAt: (age: number) => `passed away at ${age}`,

  // Capsule
  capsuleTitle: 'Time Capsule',
  capsuleSubtitle: 'Write a letter to your future self.',
  newLetter: 'New letter',
  dearFutureMe: 'Dear future me,',
  opensIn: (days: number) => `Opens in ${days} days`,
  tapToRead: 'tap to read',
  sealAway: 'Seal it away →',
  yourLetters: 'Your letters',
  noCapsules: "You haven't written any letters yet.",
  locked: 'Locked',
  unlockIn: 'Unlocks in',
  unlockedOn: 'Unlocked',
  writtenOn: 'Written',

  // Community
  communityTitle: 'Community · anonymous',
  communitySubtitle: "You're not\ncounting alone.",
  cohortLabel: (age: number) => `Your cohort · age ${age}±5`,
  thisWeek: (n: string) => `This week · ${n} users`,
  recentCapsules: 'Recent capsules · anonymized',
  mockPreview: 'all data anonymized · mock preview',

  // Settings
  settingsTitle: 'Settings',
  yourProfile: 'Your profile',
  displayName: 'Display name',
  onDevice: 'shown only on your device',
  currentStats: 'Current stats',
  age: 'Age',
  birthday: 'Birthday',
  mode: 'Mode',
  switchToManual: 'Switch to manual target →',
  reRunAI: 'Re-run AI estimate →',
  updateAge: 'Update age / birthday →',
  timeCapsules: 'Time capsules',
  lettersToSelf: 'letters to your future self',
  language: 'Language',
  dangerZone: 'Danger zone',
  resetAll: 'Reset all data',
  versionNote: 'v1.0.0 · data stored on device only',
  resetTitle: 'Reset everything?',
  resetMsg: 'This will clear all your data and return to the start.',
  cancel: 'Cancel',
  reset: 'Reset',
  aiMode: (confidence: number) => `AI · ${confidence}% confidence`,
  manualMode: 'Manual',

  // Nav tabs
  tabDashboard: 'Home',
  tabFigures: 'Figures',
  tabCapsule: 'Capsule',
  tabCommunity: 'Community',
  tabSettings: 'Settings',
};

const zh: typeof en = {
  tagline: '每一粒沙都珍贵。\n好好花费它。',
  sub: '不是警告，是工具。\n数一数你剩下的沙粒。',
  cta: '开始倒计时 →',
  privacy: '数据仅存于你的设备',

  beforeWeStart: '在开始之前 —\n我们怎么称呼你？',
  namePlaceholder: '你的名字（可选）',
  anonymousPlaceholder: '匿名',
  step01: '步骤 01 / 02',
  howOld: '你今年\n多大了？',
  modeAge: '年龄',
  modeBirthday: '生日',
  yearsAliveDrag: '岁 · 左右拖动更改',
  drag: '拖动',
  selectDOB: '选择你的出生日期',
  drumYear: '年', drumMonth: '月', drumDay: '日',
  continueBtn: '继续 →',

  step02: '步骤 02 / 02',
  howEstimate: '如何估算\n你的时间？',
  modeATitle: '手动设定',
  modeADesc: '自己选择目标年龄，简单直接。',
  modeBTitle: 'AI 估算',
  modeBDesc: '回答几个生活习惯问题，AI 估算你的寿命。',
  chooseModeA: '选择 A →',
  chooseModeB: '选择 B →',
  modeHint: '之后可以更改',

  step03: '步骤 03 · 模式 A',
  pickYourNumber: '选择你的数字。',
  targetAge: '目标年龄',
  lockItIn: '确认 →',
  yourNumberSet: '你的数字已设定 —',
  seeMyCount: '查看我的倒计时 →',
  manualCountSet: '手动 · 已设定',
  yourCountStartsNow: '你的倒计时现在开始。',
  setManually: '手动设定',

  questionOf: (n, total) => `问题 ${n} / ${total}`,
  aiEstimating: 'AI · 估算中',
  almostDone: '快完成了',
  optional: '可选',
  anyConditions: '有任何现有病症吗？',
  conditionsHint: '例如：肾炎、腰间盘突出、高血压 — AI 会将这些因素纳入考量。',
  conditionsPlaceholder: '在此输入，或留空跳过',
  skip: '跳过',
  beforeWeReveal: '在揭晓你的数字之前 —',
  whatCallYou: '我们怎么称呼你？',
  showMyNumber: '查看我的数字 →',
  calculating: '正在计算\n你的剩余时间...',
  aiThinking: 'AI 正在思考',
  aiComplete: 'AI · 估算完成',
  hereIsWhat: '这是我们得到的结果。',
  estimatedLifespan: '预估寿命',
  estimatedYears: '预估年龄',
  aiFeedback: 'AI 反馈',
  yourAnswers: '你的回答',
  startCounting: '开始倒计时 →',
  disclaimer: '这是 AI 估算，仅供自我反思，并非医疗建议。\n如有健康问题，请咨询医生。',
  basedOnActuarial: '基于精算寿命表',

  quiz: [
    { q: '你每晚睡几小时？',    opts: ['不到5小时', '5–6小时', '7–8小时', '9小时以上'] },
    { q: '你抽烟吗？',          opts: ['从不', '偶尔', '每天', '大量'] },
    { q: '你喝多少酒？',        opts: ['极少', '每周1–2次', '每周3–6次', '每天'] },
    { q: '每周运动几次？',      opts: ['从不', '1–2次', '3–4次', '5次以上'] },
    { q: '饮食质量如何？',      opts: ['以垃圾食品为主', '混合', '以全食物为主', '严格健康'] },
    { q: '压力水平如何？',      opts: ['低', '中等', '高', '极高'] },
  ],

  goodToSee: '很高兴见到你。',
  goodToSeeNamed: (name) => `很高兴见到你，\n${name}。`,
  live: '实时',
  daysRemaining: '剩余天数',
  monthsRemaining: '剩余月数',
  todayEndsIn: '今天还剩',
  lifeProgress: '人生进度',
  youAre: '你现在',
  nextBirthday: '下次生日',
  target: '目标',
  todaysNote: '今日格言',
  forNamed: (name) => `致 ${name}`,
  dayOfYear: '今年第几天',
  yearsLeft: '剩余年数',
  confidence: '置信度',
  aiEstimate: 'AI 估算',
  userSet: '手动设定',
  viewHourglass: '查看完整沙漏 →',
  yrs: '岁',
  mo: '月',
  days: '天',
  approx: '约',

  daysLeft: '剩余天数',
  monthsLeft: '剩余月数',

  hourglassLive: '沙漏 · 实时',
  pctRemains: (pct) => `${pct}% 的你还在`,
  grainsLeft: (n) => `还剩 ${n} 粒沙。`,
  grainLegend: '一粒沙 ≈ 一天 · 实时运行',
  back: '← 返回',

  figuresTitle: '历史人物',
  figuresSubtitle: '与他们相比如何？',
  outlived: '已超越',
  toLive: '还差',
  passedAt: (age: number) => `于 ${age} 岁辞世`,

  capsuleTitle: '时间胶囊',
  capsuleSubtitle: '写一封信给未来的自己。',
  newLetter: '新信件',
  dearFutureMe: '亲爱的未来的我，',
  opensIn: (days) => `${days} 天后开启`,
  tapToRead: '点击阅读',
  sealAway: '封存 →',
  yourLetters: '你的信件',
  noCapsules: '你还没有写过任何信件。',
  locked: '已封存',
  unlockIn: '解锁于',
  unlockedOn: '已解锁',
  writtenOn: '写于',

  communityTitle: '社区 · 匿名',
  communitySubtitle: '你不是\n一个人在倒计时。',
  cohortLabel: (age) => `你的同龄群体 · ${age}岁±5`,
  thisWeek: (n) => `本周 · ${n} 用户`,
  recentCapsules: '近期胶囊 · 已匿名',
  mockPreview: '所有数据已匿名 · 模拟预览',

  settingsTitle: '设置',
  yourProfile: '你的档案',
  displayName: '显示名称',
  onDevice: '仅在你的设备上显示',
  currentStats: '当前数据',
  age: '年龄',
  birthday: '生日',
  mode: '模式',
  switchToManual: '切换为手动设定 →',
  reRunAI: '重新 AI 估算 →',
  updateAge: '更新年龄/生日 →',
  timeCapsules: '时间胶囊',
  lettersToSelf: '写给未来自己的信',
  language: '语言',
  dangerZone: '危险区域',
  resetAll: '重置所有数据',
  versionNote: 'v1.0.0 · 数据仅存储在本设备',
  resetTitle: '确认重置？',
  resetMsg: '这将清除所有数据并返回开始页面。',
  cancel: '取消',
  reset: '重置',
  aiMode: (confidence) => `AI · 置信度 ${confidence}%`,
  manualMode: '手动',

  tabDashboard: '主页',
  tabFigures: '人物',
  tabCapsule: '胶囊',
  tabCommunity: '社区',
  tabSettings: '设置',
};

export type Strings = typeof en;

export const LANGUAGES: { code: Lang; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
];

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  s: Strings;
}>({ lang: 'en', setLang: () => {}, s: en });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then(v => {
      if (v === 'en' || v === 'zh') setLangState(v);
    });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(LANG_KEY, l);
  };

  const s = lang === 'zh' ? zh : en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, s }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT() {
  return useContext(LanguageContext);
}
