/**
 * Cloud Function: Generate Invoice Share Token
 * Creates a secure token for sharing an invoice via SMS link
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');

const generateInvoiceShareToken = onCall(
  { cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { invoiceId } = request.data;

    if (!invoiceId) {
      throw new HttpsError('invalid-argument', 'invoiceId is required.');
    }

    const db = getFirestore();
    const invoiceRef = db.collection('invoices').doc(invoiceId);
    const invoiceSnap = await invoiceRef.get();

    if (!invoiceSnap.exists) {
      throw new HttpsError('not-found', 'Invoice not found.');
    }

    const invoiceData = invoiceSnap.data();

    // Verify ownership
    if (invoiceData.userId !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'You do not own this invoice.');
    }

    // Reuse existing token if already generated
    if (invoiceData.shareToken) {
      return { token: invoiceData.shareToken };
    }

    // Generate new token
    const shareToken = crypto.randomBytes(32).toString('hex');

    await invoiceRef.update({
      shareToken,
      shareTokenCreatedAt: FieldValue.serverTimestamp(),
    });

    return { token: shareToken };
  }
);

module.exports = { generateInvoiceShareToken };