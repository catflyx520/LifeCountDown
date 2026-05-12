const weekdaysZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function dateHash(date: string): number {
  return date.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export function buildDailyMessage(
  user: { daysLeft: number; age: number; targetAge: number },
  lang: string,
  _quote?: { text: string; author: string },
): { title: string; body: string } {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekday = lang === 'zh' ? weekdaysZh[now.getDay()] : weekdaysEn[now.getDay()];
  const daysStr = user.daysLeft.toLocaleString();

  const zh: { title: string; body: string }[] = [
    {
      title: '今天打卡了吗？',
      body: `${weekday}，记录今天的心情。\n花一分钟，留给未来的自己。`,
    },
    {
      title: `还剩 ${daysStr} 天。`,
      body: '今天值得被记录下来。\n打开 app，写下此刻的状态。',
    },
    {
      title: '此刻的你，值得被记录。',
      body: `${weekday}。今天感觉如何？\n未来的你会感谢现在的你。`,
    },
    {
      title: '每日打卡',
      body: '一句话也好，一个心情也好。\n记录今天，就是给未来的礼物。',
    },
  ];

  const en: { title: string; body: string }[] = [
    {
      title: 'Checked in today?',
      body: `${weekday} — log your mood, take a moment.\nYour future self will thank you.`,
    },
    {
      title: `${daysStr} days left.`,
      body: "Today is worth remembering.\nOpen the app and record this moment.",
    },
    {
      title: 'This moment is worth logging.',
      body: `${weekday}. How are you feeling?\nOne minute to reflect — that's all it takes.`,
    },
    {
      title: 'Daily check-in',
      body: "A word, a mood, an intention.\nLog today — it's a gift for your future self.",
    },
  ];

  const templates = lang === 'zh' ? zh : en;
  return templates[dateHash(today) % templates.length];
}
