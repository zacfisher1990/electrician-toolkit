/**
 * Cloud Function: Send Verification Email
 * Sends email verification link to user
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const { Resend } = require('resend');
const { generateVerificationEmailHTML } = require('../utils/emailTemplates');

// Define the Resend API key parameter
const resendApiKey = defineString('RESEND_API_KEY');

/**
 * Cloud Function to send verification email
 */
const sendVerificationEmail = onCall(
  { cors: true },
  async (request) => {
    // Get API key
    const apiKey = resendApiKey.value();
    
    if (!apiKey) {
      throw new HttpsError(
        'failed-precondition',
        'Resend API key is not configured.'
      );
    }

    // Initialize Resend
    const resend = new Resend(apiKey);

    const { email, verificationLink } = request.data;

    if (!email || !verificationLink) {
      throw new HttpsError(
        'invalid-argument',
        'Email and verification link are required.'
      );
    }

    try {
      console.log('Sending verification email to:', email);

      const emailData = await resend.emails.send({
        from: 'ProXTrades <verify@proxtrades.com>',
        to: email,
        subject: '⚡ Verify Your Email - ProXTrades',
        html: generateVerificationEmailHTML(email, verificationLink)
      });

      console.log('Verification email sent successfully:', emailData.id);

      return {
        success: true,
        messageId: emailData.id
      };

    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new HttpsError(
        'internal',
        `Failed to send verification email: ${error.message}`
      );
    }
  }
);

module.exports = { sendVerificationEmail };