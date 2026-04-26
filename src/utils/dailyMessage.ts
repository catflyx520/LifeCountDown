const weekdaysZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function daysLeftInMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
}

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

  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  const day   = now.getDate();
  const weekday   = lang === 'zh' ? weekdaysZh[now.getDay()] : weekdaysEn[now.getDay()];
  const monthName = monthsEn[now.getMonth()];
  const daysInMonth = daysLeftInMonth();
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
      title: `${daysStr} 天还在。`,
      body: `今天是${weekday}，${month}月还剩${daysInMonth}天。\n${pct}%的人生已经过去，还有${years}年${months}个月。别让今天只是一个数字。`,
    },
    {
      title: `早安，${weekday}。`,
      body: `这个月快结束了——还剩${daysInMonth}天。你的${daysStr}天里，今天只有一次。好好用。`,
    },
    {
      title: `人生进度：${pct}%。`,
      body: `${year}年${month}月${day}日，还剩${years}年。${years}年后的你，会感谢今天的选择吗？`,
    },
    {
      title: `今年第 ${doy} 天。`,
      body: `${month}月还有${daysInMonth}天。那些还没做的事，今天是个好日子。时间在走，你也可以。`,
    },
    {
      title: `你还有 ${daysStr} 天。`,
      body: `不多，但够了——如果你认真用的话。${weekday}，今天留下点什么吧。`,
    },
    {
      title: `${years} 年 ${months} 个月。`,
      body: `人生${pct}%。不是来吓你的，是提醒你——你还在，还来得及。`,
    },
    {
      title: `${month}月还剩 ${daysInMonth} 天。`,
      body: `但你还有${years}年，${daysStr}天。时间比你想的多，也比你想的少。好好过。`,
    },
    {
      title: `${pctRemaining}% 还没发生。`,
      body: `${year}年${month}月，${weekday}。进度走到了${pct}%。剩下的${pctRemaining}%，你打算怎么过？`,
    },
  ];

  const en: { title: string; body: string }[] = [
    {
      title: `${daysStr} days left.`,
      body: `It's ${weekday}. ${daysInMonth} days left in ${monthName}.\n${pct}% of your life is behind you. ${years} yrs ${months} mo ahead.\nDon't let today just be a number.`,
    },
    {
      title: `Good morning, ${weekday}.`,
      body: `This month ends in ${daysInMonth} days.\nOf your ${daysStr} days left, today only happens once.\nMake it count.`,
    },
    {
      title: `Life at ${pct}%.`,
      body: `${monthName} ${day}, ${year}. ${years} years left.\nWill the you in ${years} years thank today's choices?`,
    },
    {
      title: `Day ${doy} of the year.`,
      body: `${daysInMonth} days left in ${monthName}.\nThings you haven't done yet — today is a good day.\nTime moves. So can you.`,
    },
    {
      title: `You have ${daysStr} days left.`,
      body: `Not many, but enough — if you use them well.\n${weekday}. Leave something behind today.`,
    },
    {
      title: `${years} years ${months} months.`,
      body: `Life at ${pct}%.\nNot here to scare you. Just reminding you —\nyou're still here. There's still time.`,
    },
    {
      title: `${daysInMonth} days left this month.`,
      body: `But you still have ${years} years. ${daysStr} days.\nMore than you think. Less than you think. Live well.`,
    },
    {
      title: `${pctRemaining}% hasn't happened yet.`,
      body: `${monthName} ${year}, ${weekday}. Progress: ${pct}%.\nThe remaining ${pctRemaining}% — how will you spend it?`,
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
