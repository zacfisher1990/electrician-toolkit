/**
 * refreshGoogleCalendarToken.js
 *
 * Callable Cloud Function that refreshes a user's Google Calendar access token.
 * The client secret stays server-side — never exposed to the app.
 *
 * Reads the user's refresh token from:
 *   users/{uid}/integrations/googleCalendar
 *
 * Returns: { accessToken: string }
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { getFirestore } = require('firebase-admin/firestore');

const GOOGLE_CLIENT_SECRET = defineSecret('GOOGLE_CLIENT_SECRET');

const GOOGLE_CLIENT_ID = '878846360709-o1o5l8t1fsmg0chi3bj3lo55h0ktbck2.apps.googleusercontent.com';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

exports.refreshGoogleCalendarToken = onCall(
  { secrets: [GOOGLE_CLIENT_SECRET] },
  async (request) => {
    // Must be authenticated
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const db = getFirestore();

    // Load the stored refresh token
    const integrationRef = db.doc(`users/${uid}/integrations/googleCalendar`);
    const snap = await integrationRef.get();

    if (!snap.exists || !snap.data()?.refreshToken) {
      throw new HttpsError('failed-precondition', 'Google Calendar not connected.');
    }

    const refreshToken = snap.data().refreshToken;

    // Exchange refresh token for a new access token
    const params = new URLSearchParams({
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET.value(),
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
    });

    const response = await fetch(TOKEN_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    params.toString(),
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      console.error('[GCal] Token refresh failed:', data);

      // If the refresh token has been revoked, mark the integration as disconnected
      if (data.error === 'invalid_grant') {
        await integrationRef.update({
          connected:    false,
          accessToken:  null,
          refreshToken: null,
        });
        throw new HttpsError('unauthenticated', 'Google Calendar disconnected — please reconnect.');
      }

      throw new HttpsError('internal', 'Failed to refresh Google Calendar token.');
    }

    // Persist the new access token
    await integrationRef.update({ accessToken: data.access_token });

    return { accessToken: data.access_token };
  }
);