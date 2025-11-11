/**
 * Firebase Admin SDK Configuration
 * Used by Cloud Functions for server-side operations
 */

const admin = require('firebase-admin');
const { setGlobalOptions } = require('firebase-functions/v2');

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Set global options for all functions
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1'
});

module.exports = { admin };