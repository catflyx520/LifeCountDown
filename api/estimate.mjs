// Life expectancy estimate, run on the server as a Vercel Function (POST /api/estimate).
//
// The Gemini API key lives only here, in the server environment variable GEMINI_API_KEY.
// It is never sent to the browser or compiled into the app. The app sends the quiz
// answers, this function builds the prompt, calls Gemini and returns three numbers/strings.
//
// Server environment variables (set them in the hosting dashboard, not in .env):
//   GEMINI_API_KEY    required. Without it the function answers 503 and the app falls
//                     back to its basic estimate.
//   GEMINI_MODEL      optional, defaults to gemini-2.5-flash.
//   ALLOWED_ORIGINS   optional, comma separated extra web origins allowed to call this
//                     (for example http://localhost:8081 during development). Pages
//                     served from the same host as this function are always allowed.

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_BODY_CHARS = 8 * 1024;
const MAX_ANSWERS = 12;
const MAX_ANSWER_CHARS = 160;
const MAX_NAME_CHARS = 40;
const MAX_CONDITIONS_CHARS = 300;
const MAX_FEEDBACK_CHARS = 300;
const UPSTREAM_TIMEOUT_MS = 20_000;

// Best-effort limit per IP address. It lives in the memory of one warm function
// instance, so it slows down casual abuse but is not a hard guarantee.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

// Returns the origin to echo back, '' when the request has no Origin header
// (the Android app, or a server), or null when the origin is not allowed.
function checkOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return '';
  let originHost = '';
  try {
    originHost = new URL(origin).host;
  } catch {
    return null;
  }
  const ownHosts = [request.headers.get('x-forwarded-host'), request.headers.get('host')];
  try {
    ownHosts.push(new URL(request.url).host);
  } catch {
    // request.url can be a bare path on some runtimes; the headers above cover it
  }
  if (ownHosts.includes(originHost)) return origin;
  const extra = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return extra.includes(origin) ? origin : null;
}

function reply(status, body, origin) {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', vary: 'Origin' };
  if (origin) {
    headers['access-control-allow-origin'] = origin;
    headers['access-control-allow-methods'] = 'POST, OPTIONS';
    headers['access-control-allow-headers'] = 'content-type';
  }
  return new Response(body === null ? null : JSON.stringify(body), { status, headers });
}

// One line of plain text: no control characters or line breaks, trimmed and capped.
function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function readInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const age = body.age;
  if (!Number.isInteger(age) || age < 1 || age > 120) return null;
  if (!Array.isArray(body.answers) || body.answers.length < 1 || body.answers.length > MAX_ANSWERS) return null;
  const answers = [];
  for (const item of body.answers) {
    if (typeof item !== 'string' || item.length > MAX_ANSWER_CHARS) return null;
    const answer = clean(item, MAX_ANSWER_CHARS);
    if (!answer) return null;
    answers.push(answer);
  }
  for (const [key, max] of [['name', MAX_NAME_CHARS], ['conditions', MAX_CONDITIONS_CHARS]]) {
    const value = body[key];
    if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > max)) return null;
  }
  return {
    age,
    answers,
    name: clean(body.name, MAX_NAME_CHARS),
    conditions: clean(body.conditions, MAX_CONDITIONS_CHARS),
    lang: body.lang === 'zh' ? 'zh' : 'en',
  };
}

function buildPrompt({ age, name, answers, conditions, lang }) {
  const conditionsLine = conditions ? `\nExisting medical conditions: ${conditions}` : '';
  const nameLine = name ? `The person's name is ${name}.` : '';
  const langInstruction =
    lang === 'zh' ? 'Write the feedback field in Simplified Chinese.' : 'Write the feedback field in English.';

  return `You are a life expectancy estimator. ${nameLine} Based on the following lifestyle information, estimate a realistic life expectancy for a person who is currently ${age} years old.

Lifestyle information:
${answers.map((a) => `- ${a}`).join('\n')}${conditionsLine}

Return ONLY a JSON object with exactly these three fields:
- targetAge: a whole number between 60 and 105 (the estimated age at death)
- confidence: a whole number between 55 and 95 (your confidence percentage)
- feedback: a single sentence (max 30 words) of honest, direct insight — address them by name if provided — about the biggest factor affecting their longevity

${langInstruction}

Example: {"targetAge": 83, "confidence": 78, "feedback": "Alex, your sleep and exercise habits are strong foundations, but daily drinking is the single biggest drag on your estimate."}

Respond with the JSON object only, no other text.`;
}

async function askGemini(apiKey, prompt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal,
      },
    );
    if (!response.ok) throw new Error(`Gemini answered ${response.status}`);
    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const text = Array.isArray(parts) ? parts.map((part) => (typeof part?.text === 'string' ? part.text : '')).join('') : '';
    const match = text.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error('No JSON in the Gemini response');
    const parsed = JSON.parse(match[0]);
    return {
      targetAge: Math.round(Math.max(60, Math.min(105, Number(parsed.targetAge) || 82))),
      confidence: Math.round(Math.max(55, Math.min(95, Number(parsed.confidence) || 75))),
      feedback: clean(String(parsed.feedback || ''), MAX_FEEDBACK_CHARS) || 'Your lifestyle profile has been analyzed.',
    };
  } finally {
    clearTimeout(timer);
  }
}

export function OPTIONS(request) {
  const origin = checkOrigin(request);
  if (origin === null) return reply(403, { error: 'Origin not allowed' }, '');
  return reply(204, null, origin);
}

export async function POST(request) {
  const origin = checkOrigin(request);
  if (origin === null) return reply(403, { error: 'Origin not allowed' }, '');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return reply(503, { error: 'AI estimate is not configured' }, origin);

  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return reply(429, { error: 'Too many requests, try again later' }, origin);

  if (!(request.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
    return reply(415, { error: 'Send JSON' }, origin);
  }
  let raw = '';
  try {
    raw = await request.text();
  } catch {
    return reply(400, { error: 'Could not read the request' }, origin);
  }
  if (raw.length > MAX_BODY_CHARS) return reply(413, { error: 'Request too large' }, origin);

  let input = null;
  try {
    input = readInput(JSON.parse(raw));
  } catch {
    input = null;
  }
  if (!input) return reply(400, { error: 'Invalid quiz data' }, origin);

  try {
    return reply(200, await askGemini(apiKey, buildPrompt(input)), origin);
  } catch (error) {
    // Log the reason on the server only. The key is never part of the message.
    console.error('[estimate]', error instanceof Error ? error.message : 'unknown error');
    return reply(502, { error: 'Estimate service unavailable' }, origin);
  }
}
