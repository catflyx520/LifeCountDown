/**
 * Weekly Quote Seeder
 * Generates 7 new bilingual quotes with Gemini and creates daily_data entries.
 *
 * Run locally:  node scripts/weekly-seeder.js
 * Run via CI:   GitHub Actions (see .github/workflows/weekly-quotes.yml)
 *
 * Env vars needed:
 *   FIREBASE_SERVICE_ACCOUNT  — JSON string of serviceAccount.json (CI)
 *   GEMINI_API_KEY            — Gemini API key
 */

const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Firebase init ─────────────────────────────────────────────────────────────
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require('../serviceAccount.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// ── Gemini init ───────────────────────────────────────────────────────────────
const geminiKey = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
if (!geminiKey) { console.error('❌ GEMINI_API_KEY not set'); process.exit(1); }
const genAI = new GoogleGenerativeAI(geminiKey);

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getRecentlyUsedTexts() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const snap = await db.collection('daily_data').where('date', '>=', cutoffStr).get();
  const quoteIds = [...new Set(snap.docs.map(d => d.data().quoteId).filter(Boolean))];

  if (quoteIds.length === 0) return [];

  const chunks = [];
  for (let i = 0; i < quoteIds.length; i += 10) chunks.push(quoteIds.slice(i, i + 10));

  const texts = [];
  for (const chunk of chunks) {
    const docs = await Promise.all(chunk.map(id => db.collection('quotes').doc(id).get()));
    docs.filter(d => d.exists).forEach(d => {
      const en = d.data().text?.en;
      if (en) texts.push(en);
    });
  }
  return texts;
}

async function generateQuotes(excludedTexts) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const excludeBlock = excludedTexts.length > 0
    ? `\nDo NOT produce quotes similar to these recently used ones:\n${excludedTexts.slice(-20).map(t => `- "${t}"`).join('\n')}\n`
    : '';

  const prompt = `You are a curator of life philosophy quotes.

Generate 7 unique, powerful quotes about life, time, mortality, and living intentionally.
Mix real historical quotes (Stoics, philosophers, writers) with original ones.
${excludeBlock}
Return ONLY a valid JSON array — no markdown, no explanation:
[
  {
    "text": {
      "en": "The English quote.",
      "zh": "自然流畅的中文版本，不要逐字直译。"
    },
    "author": "Marcus Aurelius",
    "source": null
  }
]

Rules:
- Exactly 7 quotes, each with a different theme/tone
- zh must read naturally in Chinese
- author: real name, or "Anon" for originals
- source: book/work title string, or null
- Pure JSON array only`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Gemini did not return a JSON array.\n' + raw);

  const quotes = JSON.parse(match[0]);
  if (!Array.isArray(quotes) || quotes.length === 0) throw new Error('Empty quotes array');
  return quotes;
}

async function saveQuotes(quotes) {
  const ids = [];
  for (const q of quotes) {
    const ref = await db.collection('quotes').add({
      text: { en: q.text.en, zh: q.text.zh },
      author: q.author || 'Anon',
      source: q.source || null,
      active: true,
      generated: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    ids.push(ref.id);
    console.log(`  ✓ quote saved [${ref.id}]: "${q.text.en.slice(0, 60)}..."`);
  }
  return ids;
}

async function createDailyData(quoteIds) {
  const today = new Date();
  let qi = 0;

  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);

    const existing = await db.collection('daily_data').doc(dateStr).get();
    if (existing.exists) {
      console.log(`  ⏭  daily_data/${dateStr} already exists, skipping`);
      continue;
    }

    if (qi >= quoteIds.length) {
      console.log(`  ⚠️  No more quotes for ${dateStr}`);
      continue;
    }

    await db.collection('daily_data').doc(dateStr).set({
      date: dateStr,
      quoteId: quoteIds[qi],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`  ✓ daily_data/${dateStr} → ${quoteIds[qi]}`);
    qi++;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔄 Weekly quote seeder starting…\n');

  console.log('📖 Fetching recently used quotes (last 90 days)…');
  const recentTexts = await getRecentlyUsedTexts();
  console.log(`   ${recentTexts.length} quotes to exclude\n`);

  console.log('🤖 Generating 7 quotes with Gemini…');
  const quotes = await generateQuotes(recentTexts);
  console.log(`   ${quotes.length} quotes generated\n`);

  console.log('💾 Saving quotes to Firestore…');
  const quoteIds = await saveQuotes(quotes);
  console.log('');

  console.log('📅 Creating daily_data entries…');
  await createDailyData(quoteIds);

  console.log('\n✅ Done!');
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Seeder failed:', err.message || err);
  process.exit(1);
});
