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

  // Dashboard quotes
  dashQuotes: [
    { text: 'The unexamined life is not worth living.', author: 'Socrates' },
    { text: 'Memento mori. Memento vivere.', author: 'Anon' },
    { text: 'You could leave life right now. Let that determine what you do.', author: 'Marcus Aurelius' },
    { text: 'Every sunrise costs you one.', author: 'D/C' },
  ],

  // Capsule unlock options
  unlockOptions: [
    { label: '30 days', days: 30 },
    { label: '6 months', days: 180 },
    { label: '1 year',  days: 365 },
    { label: '2 years', days: 730 },
  ],
  daysShort: (n: number) => `${n}d`,

  // Community
  wordsToCarry: 'words to carry',
  cohort: [
    { label: 'avg life expectancy', value: 79, unit: 'yrs', note: 'global average 2024' },
    { label: 'sleep / night',       value: 6.8, unit: 'hrs', note: 'adults in your age group' },
    { label: 'screen time / day',   value: 7.3, unit: 'hrs', note: 'us adults average' },
    { label: 'exercise / week',     value: 1.4, unit: 'days', note: 'meet minimum guidelines' },
  ],
  streaks: [
    { pct: 94, label: 'checked in this week' },
    { pct: 61, label: 'opened app daily' },
    { pct: 38, label: 'wrote a capsule' },
    { pct: 12, label: 'changed their target age' },
  ],

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
  opensIn: (days: number) => days === 0 ? 'Opens today' : `Opens in ${days} days`,
  customDays: 'Custom days',
  tapToRead: 'tap to read',
  sealAway: 'Seal it away →',
  yourLetters: 'Your letters',
  noCapsules: "You haven't written any letters yet.",
  locked: 'Locked',
  unlockIn: 'Unlocks in',
  unlockedOn: 'Unlocked on',
  capsuleRead: 'Read',
  capsuleUnread: 'Unread',
  capsuleWrittenHere: 'You wrote a letter on this day',
  capsuleUnlockHere: 'A letter unlocks on this day',
  writtenOn: 'Written',
  customDaysUnit: { year: 'yr', month: 'mo', day: 'd' },

  // Capsule detail modal
  capsuleChipUnlocked: 'unlocked',
  capsuleSealedLabel: (date: string) => `sealed ${date}`,
  capsuleHeroTitle: 'A letter from',
  capsuleHeroPastYou: 'past you.',
  capsuleHeroSub: (dow: string) => `You sealed this on a ${dow}.\nIt's been waiting.`,
  capsuleOpenSeal: 'OPEN SEAL →',
  capsuleSkip: 'skip',
  capsuleLetterLabel: 'Letter · 01',
  capsuleMetaSealed: 'sealed',
  capsuleMetaWaited: 'waited',
  capsuleMetaYouWere: 'you were',
  capsuleMetaDaysThen: 'days then',
  capsuleMetaYrsOld: (age: number) => `${age} yrs old`,
  capsuleMetaDaysAgo: (n: number) => n === 1 ? '1 day ago' : `${n.toLocaleString()} days ago`,
  capsuleKeepOnShelf: 'Keep on shelf',
  capsuleBurnLetter: 'Burn the letter',
  capsuleBurnTitle: 'Burn this letter?',
  capsuleBurnBody: 'It will be gone forever.\nNo going back.',
  capsuleBurnCancel: 'Cancel',
  capsuleBurnConfirm: 'Burn it',

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
  privacyPolicy: 'Privacy Policy',
  versionNote: 'L/C · v1.0.0 · data stored on device only',
  resetTitle: 'Reset everything?',
  resetMsg: 'This will clear all your data and return to the start.',
  cancel: 'Cancel',
  reset: 'Reset',
  aiMode: (confidence: number) => `AI · ${confidence}% confidence`,
  manualMode: 'Manual',

  // Onboarding quotes (ManualScreen result)
  onboardingQuotes: [
    { t: 'It is not that we have a short time to live, but that we waste a lot of it.', a: 'Seneca' },
    { t: 'We are always complaining that our days are few, and acting as though there would be no end of them.', a: 'Seneca' },
    { t: 'Let us prepare our minds as if we had come to the very end of life.', a: 'Seneca' },
    { t: 'Remember that you are mortal; so make the most of your time.', a: 'Marcus Aurelius' },
    { t: 'The whole future lies in uncertainty: live immediately.', a: 'Seneca' },
    { t: 'How we spend our days is, of course, how we spend our lives.', a: 'Annie Dillard' },
    { t: 'Time is the most valuable thing a man can spend.', a: 'Theophrastus' },
  ],

  // Notifications
  notifReminder: 'Daily Reminder',
  notifReminderNote: 'A daily nudge with your life stats & a quote',
  notifTime: 'Reminder time',
  notifEnabled: 'On',
  notifDisabled: 'Off',
  notifPermissionDenied: 'Please enable notifications in your device settings.',
  notifTest: 'Send test notification →',

  // Nav tabs
  tabDashboard: 'Home',
  tabCheckIn: 'Check In',
  tabCapsule: 'Capsule',
  tabCommunity: 'Community',
  tabSettings: 'Settings',

  // Check-in
  checkInTitle: 'Check-in',
  streakLabel: (n: number) => `${n} day streak`,
  moods: [
    { key: 'calm',    emoji: '😌' },
    { key: 'happy',   emoji: '😊' },
    { key: 'neutral', emoji: '😐' },
    { key: 'anxious', emoji: '😟' },
    { key: 'drained', emoji: '😩' },
  ],
  moodLabel: 'How do you feel?',
  ratingLabel: 'Day rating',
  intentionLabel: 'One thing today',
  intentionPlaceholder: 'What matters most today?',
  saveCheckIn: 'Save check-in',
  updateCheckIn: 'Update entry',
  savedCheckIn: 'Saved ✓',
  loggedBadge: 'Logged',
  todayCheckInTitle: "Today's check-in",
  checkInLink: 'Check In →',

  // Community tabs
  tabQuotes: 'Quotes',
  tabFigures: 'Figures',
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

  dashQuotes: [
    { text: '未经审视的人生不值得过。', author: '苏格拉底' },
    { text: '记住你终将死去。记住你还活着。', author: '佚名' },
    { text: '你随时可能离开这个世界。让这个念头决定你的所作所为。', author: '马可·奥勒留' },
    { text: '每一次日出，都让你少了一个。', author: 'D/C' },
  ],

  unlockOptions: [
    { label: '30 天',  days: 30 },
    { label: '半年',   days: 180 },
    { label: '1 年',   days: 365 },
    { label: '2 年',   days: 730 },
  ],
  daysShort: (n: number) => `${n}天`,

  wordsToCarry: '铭记于心',
  cohort: [
    { label: '平均预期寿命', value: 79,  unit: '岁',  note: '全球平均值 2024' },
    { label: '每晚睡眠',     value: 6.8, unit: '小时', note: '同龄成年人' },
    { label: '每日屏幕时间', value: 7.3, unit: '小时', note: '美国成年人平均值' },
    { label: '每周运动',     value: 1.4, unit: '天',   note: '达到最低建议标准' },
  ],
  streaks: [
    { pct: 94, label: '本周打开了 App' },
    { pct: 61, label: '每天打开 App' },
    { pct: 38, label: '写了一封胶囊信' },
    { pct: 12, label: '更改了目标年龄' },
  ],

  figuresTitle: '历史人物',
  figuresSubtitle: '与他们相比如何？',
  outlived: '已超越',
  toLive: '还差',
  passedAt: (age: number) => `于 ${age} 岁辞世`,

  capsuleTitle: '时间胶囊',
  capsuleSubtitle: '写一封信给未来的自己。',
  newLetter: '新信件',
  dearFutureMe: '亲爱的未来的我，',
  opensIn: (days: number) => days === 0 ? '今天开启' : `${days} 天后开启`,
  customDays: '自定义天数',
  tapToRead: '点击阅读',
  sealAway: '封存 →',
  yourLetters: '你的信件',
  noCapsules: '你还没有写过任何信件。',
  locked: '已封存',
  unlockIn: '解锁于',
  unlockedOn: '解锁于',
  capsuleRead: '已阅读',
  capsuleUnread: '未阅读',
  capsuleWrittenHere: '你在这天写了一封信',
  capsuleUnlockHere: '这天有一封信将解锁',
  writtenOn: '写于',
  customDaysUnit: { year: '年', month: '月', day: '天' },

  // Capsule detail modal
  capsuleChipUnlocked: '已解锁',
  capsuleSealedLabel: (date: string) => `封存于 ${date}`,
  capsuleHeroTitle: '一封来自',
  capsuleHeroPastYou: '过去的你。',
  capsuleHeroSub: (dow: string) => `你在${dow}封存了这封信。\n它一直在等你。`,
  capsuleOpenSeal: '开启封印 →',
  capsuleSkip: '跳过',
  capsuleLetterLabel: '信件 · 01',
  capsuleMetaSealed: '封存日',
  capsuleMetaWaited: '等待了',
  capsuleMetaYouWere: '那时的你',
  capsuleMetaDaysThen: '剩余天数',
  capsuleMetaYrsOld: (age: number) => `${age} 岁`,
  capsuleMetaDaysAgo: (n: number) => `${n.toLocaleString()} 天前`,
  capsuleKeepOnShelf: '留在书架',
  capsuleBurnLetter: '焚毁这封信',
  capsuleBurnTitle: '焚毁这封信？',
  capsuleBurnBody: '它将永远消失。\n无法撤销。',
  capsuleBurnCancel: '取消',
  capsuleBurnConfirm: '焚毁',

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
  privacyPolicy: '隐私政策',
  versionNote: 'L/C · v1.0.0 · 数据仅存储在本设备',
  resetTitle: '确认重置？',
  resetMsg: '这将清除所有数据并返回开始页面。',
  cancel: '取消',
  reset: '重置',
  aiMode: (confidence) => `AI · 置信度 ${confidence}%`,
  manualMode: '手动',

  // Onboarding quotes (ManualScreen result)
  onboardingQuotes: [
    { t: '我们的时间并不短暂，是我们浪费了太多。', a: '塞涅卡' },
    { t: '我们总抱怨时日无多，却又活得好像永无止境。', a: '塞涅卡' },
    { t: '让我们做好准备，仿佛已走到生命的尽头。', a: '塞涅卡' },
    { t: '记住你终有一死，所以要充分利用你的时间。', a: '马可·奥勒留' },
    { t: '整个未来都充满不确定——立刻去活。', a: '塞涅卡' },
    { t: '我们如何度过每一天，就是如何度过这一生。', a: '安妮·迪拉德' },
    { t: '时间是人能花费的最宝贵的东西。', a: '泰奥弗拉斯托斯' },
  ],

  // Notifications
  notifReminder: '每日提醒',
  notifReminderNote: '每天推送人生数据与一句格言',
  notifTime: '提醒时间',
  notifEnabled: '已开启',
  notifDisabled: '已关闭',
  notifPermissionDenied: '请在设备设置中开启通知权限。',
  notifTest: '发送测试通知 →',

  tabDashboard: '主页',
  tabCheckIn: '打卡',
  tabCapsule: '胶囊',
  tabCommunity: '社区',
  tabSettings: '设置',

  checkInTitle: '每日打卡',
  streakLabel: (n: number) => `连续 ${n} 天`,
  moods: [
    { key: 'calm',    emoji: '😌' },
    { key: 'happy',   emoji: '😊' },
    { key: 'neutral', emoji: '😐' },
    { key: 'anxious', emoji: '😟' },
    { key: 'drained', emoji: '😩' },
  ],
  moodLabel: '现在感觉如何？',
  ratingLabel: '今日评分',
  intentionLabel: '今天最重要的一件事',
  intentionPlaceholder: '今天最想做什么？',
  saveCheckIn: '保存打卡',
  updateCheckIn: '更新记录',
  savedCheckIn: '已保存 ✓',
  loggedBadge: '已打卡',
  todayCheckInTitle: '今日打卡',
  checkInLink: '打卡 →',

  tabQuotes: '名言',
  tabFigures: '人物',
};

export type Strings = typeof en;

export const rawDashQuotes = { en: en.dashQuotes, zh: zh.dashQuotes };

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
