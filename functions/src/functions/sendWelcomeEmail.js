/**
 * Cloud Function: Send Welcome Email
 * Sends welcome or verification reminder email to user
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const { Resend } = require('resend');
const { generateWelcomeHTML, generateVerificationReminderHTML } = require('../utils/emailTemplates');

// Define the Resend API key parameter
const resendApiKey = defineString('RESEND_API_KEY');

/**
 * Cloud Function to send welcome email
 */
const sendWelcomeEmail = onCall(
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

    const { email, type = 'welcome' } = request.data;

    if (!email) {
      throw new HttpsError(
        'invalid-argument',
        'Email is required.'
      );
    }

    let subject, html;

    if (type === 'verification-reminder') {
      // Reminder email when user requests resend
      subject = '⚡ Verify Your Email - ProXTrades';
      html = generateVerificationReminderHTML(email);
    } else {
      // Welcome email
      subject = '🎉 Welcome to ProXTrades!';
      html = generateWelcomeHTML(email);
    }

    try {
      console.log('Sending welcome/reminder email to:', email);

      const emailData = await resend.emails.send({
        from: 'ProXTrades <welcome@proxtrades.com>',
        to: email,
        subject: subject,
        html: html
      });

      console.log('Email sent successfully:', emailData.id);

      return {
        success: true,
        messageId: emailData.id
      };

    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new HttpsError(
        'internal',
        `Failed to send email: ${error.message}`
      );
    }
  }
);

module.exports = { sendWelcomeEmail };