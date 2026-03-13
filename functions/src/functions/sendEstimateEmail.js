/**
 * Cloud Function: Send Estimate Email
 * Sends estimate via email with PDF attachment using Resend.
 * Generates a responseToken for secure client action buttons (Accept/Reject/etc).
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const { Resend } = require('resend');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');
const { generateEstimatePDFBuffer } = require('../utils/pdfGenerator');
const { generateEstimateEmailHTML } = require('../utils/emailTemplates');

const resendApiKey = defineString('RESEND_API_KEY');
const functionsBaseUrl = defineString('FUNCTIONS_BASE_URL');

/**
 * Cloud Function to send estimate via email with PDF attachment
 */
const sendEstimateEmail = onCall(
  { cors: true },
  async (request) => {
    const apiKey = resendApiKey.value();

    if (!apiKey) {
      throw new HttpsError(
        'failed-precondition',
        'Resend API key is not configured. Please set RESEND_API_KEY environment variable.'
      );
    }

    const resend = new Resend(apiKey);

    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'User must be authenticated to send estimates.'
      );
    }

    const { estimate, recipientEmail, message, userInfo } = request.data;

    if (!estimate || !recipientEmail) {
      throw new HttpsError(
        'invalid-argument',
        'Estimate data and recipient email are required.'
      );
    }

    if (!estimate.id) {
      throw new HttpsError(
        'invalid-argument',
        'Estimate must have an id field to generate response links.'
      );
    }

    try {
      // --- Generate a secure response token ---
      const responseToken = crypto.randomBytes(32).toString('hex');

      // --- Build action URLs for email buttons ---
      const baseUrl = functionsBaseUrl.value();
      const makeUrl = (action) =>
        `${baseUrl}/handleEstimateResponse?estimateId=${estimate.id}&action=${action}&token=${responseToken}&userId=${request.auth.uid}`;

      const actionUrls = {
        accept: makeUrl('accept'),
        reject: makeUrl('reject'),
        requestChanges: makeUrl('requestChanges'),
      };

      // --- Save token + update status to "Sent" in Firestore ---
      const db = getFirestore();
      await db.collection('estimates').doc(estimate.id).update({
        responseToken,
        status: 'Sent',
        lastSentAt: FieldValue.serverTimestamp(),
        lastSentTo: recipientEmail,
        lastSentMethod: 'email',
        sentCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log('Generating PDF for estimate:', estimate.name);

      // --- Generate PDF ---
      const pdfBuffer = await generateEstimatePDFBuffer(estimate, userInfo);
      const pdfBase64 = pdfBuffer.toString('base64');

      console.log('Sending email to:', recipientEmail);

      // --- Send email ---
      const emailData = await resend.emails.send({
        from: `${userInfo.businessName || userInfo.name || userInfo.displayName || 'Electrician Pro X'} <estimates@proxtrades.com>`,
        replyTo: userInfo.email,
        to: recipientEmail,
        bcc: userInfo.email,
        subject: `Estimate: ${estimate.name || 'Untitled'} from ${userInfo.businessName || userInfo.name || userInfo.displayName || 'Electrician Pro X'}`,
        html: generateEstimateEmailHTML(estimate, message, userInfo, actionUrls),
        attachments: [
          {
            filename: `Estimate-${estimate.name || 'draft'}.pdf`,
            content: pdfBase64,
          },
        ],
      });

      console.log('Email sent successfully:', emailData.id);

      return {
        success: true,
        messageId: emailData.id,
        message: 'Estimate sent successfully!',
      };
    } catch (error) {
      console.error('Error sending estimate:', error);
      throw new HttpsError('internal', `Failed to send estimate: ${error.message}`);
    }
  }
);

module.exports = { sendEstimateEmail };