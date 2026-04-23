const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ─── QUOTES ───────────────────────────────────────────────────────────────────

const QUOTES = [
  {
    text: {
      en: 'It is not that we have a short time to live, but that we waste a lot of it.',
      zh: '并非我们的时间太短，而是我们浪费了太多。',
    },
    author: 'Seneca',
    source: 'On the Shortness of Life',
    type: 'stoic',
    tags: ['time', 'waste', 'life'],
    active: true,
    weight: 10,
  },
  {
    text: {
      en: 'You could leave life right now. Let that determine what you do and say and think.',
      zh: '你随时可能离开这个世界。让这个念头决定你的言行与思想。',
    },
    author: 'Marcus Aurelius',
    source: 'Meditations',
    type: 'stoic',
    tags: ['death', 'purpose', 'action'],
    active: true,
    weight: 10,
  },
  {
    text: {
      en: 'The whole future lies in uncertainty: live immediately.',
      zh: '整个未来都充满不确定性：活在当下。',
    },
    author: 'Seneca',
    source: 'On the Shortness of Life',
    type: 'stoic',
    tags: ['uncertainty', 'present', 'urgency'],
    active: true,
    weight: 9,
  },
  {
    text: {
      en: 'Let us prepare our minds as if we had come to the very end of life.',
      zh: '让我们做好准备，仿佛已走到生命的尽头。',
    },
    author: 'Seneca',
    source: 'Letters from a Stoic',
    type: 'stoic',
    tags: ['preparation', 'death', 'mindset'],
    active: true,
    weight: 8,
  },
  {
    text: {
      en: 'How we spend our days is, of course, how we spend our lives.',
      zh: '我们如何度过每一天，就是如何度过我们的一生。',
    },
    author: 'Annie Dillard',
    source: 'The Writing Life',
    type: 'literary',
    tags: ['daily', 'habits', 'life'],
    active: true,
    weight: 10,
  },
  {
    text: {
      en: 'Time is the most valuable thing a man can spend.',
      zh: '时间是人可以花费的最珍贵之物。',
    },
    author: 'Theophrastus',
    source: null,
    type: 'general',
    tags: ['time', 'value'],
    active: true,
    weight: 8,
  },
  {
    text: {
      en: 'The unexamined life is not worth living.',
      zh: '未经审视的人生不值得过。',
    },
    author: 'Socrates',
    source: 'Apology',
    type: 'general',
    tags: ['reflection', 'purpose', 'examined'],
    active: true,
    weight: 9,
  },
  {
    text: {
      en: 'Memento mori. Memento vivere.',
      zh: '记住你终将死去。记住你还活着。',
    },
    author: 'Anon',
    source: null,
    type: 'memento',
    tags: ['death', 'life', 'balance'],
    active: true,
    weight: 10,
  },
  {
    text: {
      en: 'As long as you live, keep learning how to live.',
      zh: '只要你还活着，就要不断学习如何生活。',
    },
    author: 'Seneca',
    source: 'Letters from a Stoic',
    type: 'stoic',
    tags: ['learning', 'growth', 'life'],
    active: true,
    weight: 8,
  },
  {
    text: {
      en: 'The life of the dead is placed in the memory of the living.',
      zh: '逝者的生命，活在生者的记忆之中。',
    },
    author: 'Cicero',
    source: null,
    type: 'general',
    tags: ['memory', 'death', 'legacy'],
    active: true,
    weight: 7,
  },
  {
    text: {
      en: 'We are always complaining that our days are few, and acting as though there would be no end of them.',
      zh: '我们总在抱怨时日无多，却又活得像永无尽头。',
    },
    author: 'Seneca',
    source: 'On the Shortness of Life',
    type: 'stoic',
    tags: ['contradiction', 'time', 'awareness'],
    active: true,
    weight: 9,
  },
  {
    text: {
      en: 'Every sunrise costs you one.',
      zh: '每一次日出，都让你少了一个。',
    },
    author: 'D/C',
    source: null,
    type: 'memento',
    tags: ['daily', 'countdown', 'awareness'],
    active: true,
    weight: 10,
  },
  {
    text: {
      en: 'Remember that you are mortal; so make the most of your time.',
      zh: '记住你终有一死；所以要充分利用你的时间。',
    },
    author: 'Marcus Aurelius',
    source: 'Meditations',
    type: 'stoic',
    tags: ['mortality', 'time', 'action'],
    active: true,
    weight: 9,
  },
];

// ─── FIGURES ──────────────────────────────────────────────────────────────────

const FIGURES = [
  {
    name: 'Van Gogh',
    field: 'art',
    born_year: 1853,
    died_year: 1890,
    died_date: '1890-07-29',
    died_age: 37,
    note: {
      en: 'Painted The Starry Night at 36. Sold one painting in his lifetime.',
      zh: '36岁创作《星夜》，一生只卖出一幅画。',
    },
    photo_url: null,
    active: true,
  },
  {
    name: 'Mozart',
    field: 'music',
    born_year: 1756,
    died_year: 1791,
    died_date: '1791-12-05',
    died_age: 35,
    note: {
      en: 'Composed over 600 works before his body gave out.',
      zh: '在身体垮掉之前创作了600余部作品。',
    },
    photo_url: null,
    active: true,
  },
  {
    name: 'Frida Kahlo',
    field: 'art',
    born_year: 1907,
    died_year: 1954,
    died_date: '1954-07-13',
    died_age: 47,
    note: {
      en: 'Painted through chronic pain for 30 years.',
      zh: '带着慢性疼痛坚持作画30年。',
    },
    photo_url: null,
    active: true,
  },
  {
    name: 'Bruce Lee',
    field: 'martial arts',
    born_year: 1940,
    died_year: 1973,
    died_date: '1973-07-20',
    died_age: 32,
    note: {
      en: 'Redefined cinema, martial arts, and philosophy of the body.',
      zh: '重新定义了电影、武术与身体哲学。',
    },
    photo_url: null,
    active: true,
  },
  {
    name: 'Marcus Aurelius',
    field: 'philosophy',
    born_year: 121,
    died_year: 180,
    died_date: '0180-03-17',
    died_age: 58,
    note: {
      en: 'Wrote Meditations — probably to himself, never meant for publication.',
      zh: '写下《沉思录》——可能只是写给自己，从未打算出版。',
    },
    photo_url: null,
    active: true,
  },
  {
    name: 'Marie Curie',
    field: 'science',
    born_year: 1867,
    died_year: 1934,
    died_date: '1934-07-04',
    died_age: 66,
    note: {
      en: 'Won two Nobel Prizes — physics and chemistry. Died from radiation exposure.',
      zh: '获得物理和化学两项诺贝尔奖，死于辐射暴露。',
    },
    photo_url: null,
    active: true,
  },
  {
    name: 'Steve Jobs',
    field: 'technology',
    born_year: 1955,
    died_year: 2011,
    died_date: '2011-10-05',
    died_age: 56,
    note: {
      en: 'Changed how we carry our lives around.',
      zh: '改变了我们携带生活的方式。',
    },
    photo_url: null,
    active: true,
  },
  {
    name: 'Einstein',
    field: 'science',
    born_year: 1879,
    died_year: 1955,
    died_date: '1955-04-18',
    died_age: 76,
    note: {
      en: 'Spent his last 30 years chasing a unified theory of everything.',
      zh: '生命最后30年都在追寻万物统一理论。',
    },
    photo_url: null,
    active: true,
  },
  {
    name: 'Nikola Tesla',
    field: 'science',
    born_year: 1856,
    died_year: 1943,
    died_date: '1943-01-07',
    died_age: 86,
    note: {
      en: 'Died alone in a hotel room. Powered the modern world.',
      zh: '独自死在旅馆房间里，却点亮了现代世界。',
    },
    photo_url: null,
    active: true,
  },
  {
    name: 'Kobe Bryant',
    field: 'sports',
    born_year: 1978,
    died_year: 2020,
    died_date: '2020-01-26',
    died_age: 41,
    note: {
      en: '5 NBA championships. Still working on his next chapter when he died.',
      zh: '5次NBA总冠军。去世时仍在书写下一个篇章。',
    },
    photo_url: null,
    active: true,
  },
  {
    name: 'Seneca',
    field: 'philosophy',
    born_year: -4,
    died_year: 65,
    died_date: '0065-04-12',
    died_age: 69,
    note: {
      en: 'Wrote about dying well his whole life, then was ordered to die.',
      zh: '一生都在写如何好好死去，最终被皇帝命令赴死。',
    },
    photo_url: null,
    active: true,
  },
  {
    name: 'David Bowie',
    field: 'music',
    born_year: 1947,
    died_year: 2016,
    died_date: '2016-01-10',
    died_age: 69,
    note: {
      en: 'Released his final album two days before he died.',
      zh: '在去世前两天发布了他最后一张专辑。',
    },
    photo_url: null,
    active: true,
  },
];

// ─── SEED ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding Firestore...\n');

  // Quotes
  console.log(`📝 Inserting ${QUOTES.length} quotes...`);
  const quoteBatch = db.batch();
  for (const quote of QUOTES) {
    const ref = db.collection('quotes').doc();
    quoteBatch.set(ref, {
      ...quote,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  await quoteBatch.commit();
  console.log(`   ✅ ${QUOTES.length} quotes inserted`);

  // Figures
  console.log(`\n🏛️  Inserting ${FIGURES.length} figures...`);
  const figureBatch = db.batch();
  for (const figure of FIGURES) {
    const ref = db.collection('figures').doc();
    figureBatch.set(ref, {
      ...figure,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  await figureBatch.commit();
  console.log(`   ✅ ${FIGURES.length} figures inserted`);

  // App config
  console.log('\n⚙️  Writing app config...');
  await db.collection('app_config').doc('global').set({
    min_version: '1.0.0',
    maintenance_mode: false,
    ai_enabled: true,
    featured_quote_id: null,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('   ✅ app_config/global written');

  console.log('\n🎉 Seed complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
