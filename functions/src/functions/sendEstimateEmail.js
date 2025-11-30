/**
 * Cloud Function: Send Estimate Email
 * Sends estimate via email with PDF attachment using Resend
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const { Resend } = require('resend');
const { generateEstimatePDFBuffer } = require('../utils/pdfGenerator');
const { generateEstimateEmailHTML } = require('../utils/emailTemplates');

// Define the Resend API key parameter
const resendApiKey = defineString('RESEND_API_KEY');

/**
 * Cloud Function to send estimate via email with PDF attachment
 */
const sendEstimateEmail = onCall(
  { cors: true },
  async (request) => {
    // Get API key
    const apiKey = resendApiKey.value();
    
    if (!apiKey) {
      throw new HttpsError(
        'failed-precondition',
        'Resend API key is not configured. Please set RESEND_API_KEY environment variable.'
      );
    }

    // Initialize Resend
    const resend = new Resend(apiKey);
    
    // Verify user is authenticated
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

    try {
      console.log('Generating PDF for estimate:', estimate.name);
      
      // Generate PDF
      const pdfBuffer = await generateEstimatePDFBuffer(estimate, userInfo);

      // Convert buffer to base64
      const pdfBase64 = pdfBuffer.toString('base64');

      console.log('Sending email to:', recipientEmail);

      // Send email via Resend with BCC to sender
      const emailData = await resend.emails.send({
        from: `${userInfo.businessName || 'Electrician Pro X'} <estimates@proxtrades.com>`,
        replyTo: userInfo.email, // Client replies go to the user!
        to: recipientEmail,
        bcc: userInfo.email, // BCC the sender so they get a copy
        subject: `Estimate: ${estimate.name || 'Untitled'} from ${userInfo.businessName || 'Electrician Pro X'}`,
        html: generateEstimateEmailHTML(estimate, message, userInfo),
        attachments: [
          {
            filename: `Estimate-${estimate.name || 'draft'}.pdf`,
            content: pdfBase64,
          }
        ]
      });

      console.log('Email sent successfully:', emailData.id);
      console.log('Full response:', JSON.stringify(emailData));

      return {
        success: true,
        messageId: emailData.id,
        message: 'Estimate sent successfully!'
      };

    } catch (error) {
      console.error('Error sending estimate:', error);
      console.error('Error details:', JSON.stringify(error));
      throw new HttpsError(
        'internal',
        `Failed to send estimate: ${error.message}`
      );
    }
  }
);

module.exports = { sendEstimateEmail };