/**
 * Cloud Function: Generate Estimate Share Token
 * Creates a secure token for sharing an estimate via SMS link
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');

const generateEstimateShareToken = onCall(
  { cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { estimateId } = request.data;

    if (!estimateId) {
      throw new HttpsError('invalid-argument', 'estimateId is required.');
    }

    const db = getFirestore();
    const estimateRef = db.collection('estimates').doc(estimateId);
    const estimateSnap = await estimateRef.get();

    if (!estimateSnap.exists) {
      throw new HttpsError('not-found', 'Estimate not found.');
    }

    const estimateData = estimateSnap.data();

    // Verify ownership
    if (estimateData.userId !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'You do not own this estimate.');
    }

    // Reuse existing token if already generated
    if (estimateData.shareToken) {
      return { token: estimateData.shareToken };
    }

    // Generate new token
    const shareToken = crypto.randomBytes(32).toString('hex');

    await estimateRef.update({
      shareToken,
      shareTokenCreatedAt: FieldValue.serverTimestamp(),
    });

    return { token: shareToken };
  }
);

module.exports = { generateEstimateShareToken };