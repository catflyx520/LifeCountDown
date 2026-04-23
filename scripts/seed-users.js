const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccount.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

async function seedUsers() {
  console.log('👤 Creating users collection...\n');

  // Template document — will be replaced when real users sign up via Firebase Auth
  await db.collection('users').doc('_template').set({
    // Identity
    uid:          '_template',
    name:         null,
    email:        null,
    lang:         'en',

    // Age / birthday
    age:          28,
    birthdate:    null,           // "1995-03-12" if provided

    // Countdown
    mode:         'manual',       // 'manual' | 'ai'
    target_age:   80,
    confidence:   null,           // only when mode = 'ai'
    days_left:    18993,

    // Notifications
    fcm_token:              null,
    notifications_enabled:  false,

    // Subscription (future)
    premium:      false,
    premium_until: null,

    // Timestamps
    created_at:   admin.firestore.FieldValue.serverTimestamp(),
    updated_at:   admin.firestore.FieldValue.serverTimestamp(),
    last_seen_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log('✅ users/_template created');
  console.log('\n📌 Note: Real user docs will use Firebase Auth UID as document ID');
  console.log('   Example: users/abc123xyz → actual user');
  console.log('            users/_template → structure reference only\n');

  process.exit(0);
}

seedUsers().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
