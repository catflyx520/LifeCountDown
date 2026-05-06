const weekdaysZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function dayOfYear(): number {
  const now = new Date();
  return Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000);
}

function dateHash(date: string): number {
  return date.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export function buildDailyMessage(
  user: { daysLeft: number; age: number; targetAge: number },
  lang: string,
  quote?: { text: string; author: string },
): { title: string; body: string } {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const weekday   = lang === 'zh' ? weekdaysZh[now.getDay()] : weekdaysEn[now.getDay()];
  const monthName = monthsEn[now.getMonth()];
  const doy = dayOfYear();

  const days  = user.daysLeft;
  const total = user.targetAge * 365;
  const pct   = Math.min(100, (user.age * 365 / total) * 100).toFixed(1);
  const pctRemaining = (100 - parseFloat(pct)).toFixed(1);
  const years  = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30.44);
  const daysStr = days.toLocaleString();

  const zh: { title: string; body: string }[] = [
    {
      title: `还剩 ${daysStr} 天。`,
      body: `早安。今年第 ${doy} 天。\n今天最重要的事是什么？`,
    },
    {
      title: `人生进度 ${pct}%。`,
      body: `还有 ${years} 年。\n${years} 年后的你，会感谢今天的选择吗？`,
    },
    {
      title: `今年第 ${doy} 天。`,
      body: `还剩 ${daysStr} 天。时间在走。\n你在建造什么？`,
    },
    {
      title: `${daysStr} 天。今天用一天。`,
      body: `${weekday}。每过一天就少一天。\n让今天值得。`,
    },
    {
      title: `还有 ${years} 年 ${months} 个月。`,
      body: `不是来吓你的，是提醒你——\n你还在，这就是一切。`,
    },
    {
      title: `${pctRemaining}% 还在前方。`,
      body: `${pct}% 已过。剩下的还是你的。\n${weekday}——从这里开始。`,
    },
  ];

  const en: { title: string; body: string }[] = [
    {
      title: `${daysStr} days left.`,
      body: `Good morning. Day ${doy} of the year.\nWhat matters most today?`,
    },
    {
      title: `Life at ${pct}%.`,
      body: `${years} years left.\nWill the you in ${years} years thank today's choices?`,
    },
    {
      title: `Day ${doy} of the year.`,
      body: `${daysStr} days remain. The year is passing.\nWhat are you building?`,
    },
    {
      title: `${daysStr} days. Use one today.`,
      body: `${weekday}. Each day spent is gone for good.\nMake this one count.`,
    },
    {
      title: `${years} years ${months} months left.`,
      body: `Not a warning — a reminder.\nYou're still here. That's everything.`,
    },
    {
      title: `${pctRemaining}% still ahead.`,
      body: `${pct}% is done. The rest is still yours.\n${weekday} — start here.`,
    },
  ];

  const templates = lang === 'zh' ? zh : en;
  const { title, body } = templates[dateHash(today) % templates.length];

  const quoteStr = quote
    ? lang === 'zh'
      ? `\n\n「${quote.text}」\n— ${quote.author.toUpperCase()}`
      : `\n\n"${quote.text}"\n— ${quote.author.toUpperCase()}`
    : '';

  return { title, body: body + quoteStr };
}
