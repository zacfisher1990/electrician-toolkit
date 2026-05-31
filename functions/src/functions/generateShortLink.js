// functions/src/functions/generateShortLink.js

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
const generateCode = (len = 6) =>
  Array.from({ length: len }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');

exports.generateShortLink = onCall(async (request) => {
  const { invoiceId, token } = request.data;
  if (!invoiceId || !token) throw new HttpsError('invalid-argument', 'invoiceId and token required');

  const fullUrl = `https://electricianprox.com/invoice/${invoiceId}?token=${token}`;

  const existing = await db.collection('shortLinks')
    .where('invoiceId', '==', invoiceId)
    .where('token', '==', token)
    .limit(1)
    .get();

  if (!existing.empty) {
    const code = existing.docs[0].id;
    return { shortUrl: `https://electricianprox.com/i/${code}` };
  }

  let code;
  let attempts = 0;
  while (attempts < 10) {
    code = generateCode();
    const snap = await db.collection('shortLinks').doc(code).get();
    if (!snap.exists) break;
    attempts++;
  }

  await db.collection('shortLinks').doc(code).set({
    invoiceId,
    token,
    fullUrl,
    createdAt: new Date().toISOString(),
  });

  return { shortUrl: `https://electricianprox.com/i/${code}` };
});
