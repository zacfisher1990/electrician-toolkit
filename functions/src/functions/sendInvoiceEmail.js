/**
 * Cloud Function: Send Invoice Email
 * Sends invoice via email with PDF attachment using Resend
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const { Resend } = require('resend');
const { generateInvoicePDFBuffer } = require('../utils/pdfGenerator');
const { generateInvoiceEmailHTML } = require('../utils/emailTemplates');

// Define the Resend API key parameter
const resendApiKey = defineString('RESEND_API_KEY');

/**
 * Cloud Function to send invoice via email with PDF attachment
 */
const sendInvoiceEmail = onCall(
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
        'User must be authenticated to send invoices.'
      );
    }

    const { invoice, recipientEmail, message, userInfo } = request.data;

    if (!invoice || !recipientEmail) {
      throw new HttpsError(
        'invalid-argument',
        'Invoice data and recipient email are required.'
      );
    }

    try {
      console.log('Generating PDF for invoice:', invoice.invoiceNumber);
      
      // Generate PDF
      const pdfBuffer = await generateInvoicePDFBuffer(invoice, userInfo);

      // Convert buffer to base64
      const pdfBase64 = pdfBuffer.toString('base64');

      console.log('Sending email to:', recipientEmail);

      // Send email via Resend with BCC to sender
      const emailData = await resend.emails.send({
        from: `${userInfo.businessName || 'Electrician Pro X'} <invoices@proxtrades.com>`,
        replyTo: userInfo.email, // Client replies go to the user!
        to: recipientEmail,
        bcc: userInfo.email, // BCC the sender so they get a copy
        subject: `Invoice #${invoice.invoiceNumber || 'N/A'} from ${userInfo.businessName || 'Electrician Pro X'}`,
        html: generateInvoiceEmailHTML(invoice, message, userInfo),
        attachments: [
          {
            filename: `Invoice-${invoice.invoiceNumber || 'draft'}.pdf`,
            content: pdfBase64,
          }
        ]
      });

      console.log('Email sent successfully:', emailData.id);
      console.log('Full response:', JSON.stringify(emailData));

      return {
        success: true,
        messageId: emailData.id,
        message: 'Invoice sent successfully!'
      };

    } catch (error) {
      console.error('Error sending invoice:', error);
      console.error('Error details:', JSON.stringify(error));
      throw new HttpsError(
        'internal',
        `Failed to send invoice: ${error.message}`
      );
    }
  }
);

module.exports = { sendInvoiceEmail };