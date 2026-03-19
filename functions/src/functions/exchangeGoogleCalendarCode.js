const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { getFirestore } = require('firebase-admin/firestore');

const GOOGLE_CLIENT_SECRET = defineSecret('GOOGLE_CLIENT_SECRET');
const GOOGLE_CLIENT_ID = '878846360709-o1o5l8t1fsmg0chi3bj3lo55h0ktbck2.apps.googleusercontent.com';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REDIRECT_URI = 'https://electrician.proxtrades.com'; // your web app URL


exports.exchangeGoogleCalendarCode = onCall(
  { secrets: [GOOGLE_CLIENT_SECRET] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');

    const { code, codeVerifier, redirectUri } = request.data;
    if (!code) throw new HttpsError('invalid-argument', 'Missing code.');

    const params = new URLSearchParams({
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET.value(),
      code,
      code_verifier: codeVerifier || '',
      grant_type:    'authorization_code',
      redirect_uri:  redirectUri,
    });

    const response = await fetch(TOKEN_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    params.toString(),
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      console.error('[GCal] Code exchange failed:', data);
      throw new HttpsError('internal', 'Failed to exchange code.');
    }

    // Persist tokens to Firestore
    const db = getFirestore();
    await db.doc(`users/${request.auth.uid}/integrations/googleCalendar`).set({
      accessToken:  data.access_token,
      refreshToken: data.refresh_token ?? '',
      connected:    true,
      eventMap:     {},
      connectedAt:  new Date().toISOString(),
    }, { merge: true });

    return { accessToken: data.access_token };
  }
);