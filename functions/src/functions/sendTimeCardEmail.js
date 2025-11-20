/**
 * Cloud Function: sendTimeCardEmail
 * 
 * Sends a professional email with time card PDF attachment using Resend
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const { Resend } = require('resend');

// Define the Resend API key parameter
const resendApiKey = defineString('RESEND_API_KEY');

/**
 * Cloud Function to send time card email with PDF attachment
 */
const sendTimeCardEmail = onCall(
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

    const { recipientEmail, recipientName, weekRange, pdfBase64, fileName, senderName, senderEmail } = request.data;

    // Validation
    if (!recipientEmail || !pdfBase64 || !weekRange) {
      throw new HttpsError('invalid-argument', 'Missing required fields');
    }

    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #374151;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: white;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }
            .header p {
              margin: 10px 0 0 0;
              opacity: 0.9;
              font-size: 16px;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .greeting {
              font-size: 16px;
              margin-bottom: 20px;
            }
            .info-box {
              background: #f9fafb;
              border-left: 4px solid #3b82f6;
              padding: 15px 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-box strong {
              color: #1f2937;
              display: block;
              margin-bottom: 8px;
            }
            .info-box p {
              margin: 5px 0;
              color: #6b7280;
            }
            .attachment-notice {
              background: #eff6ff;
              border: 1px solid #bfdbfe;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              text-align: center;
            }
            .attachment-notice strong {
              color: #1e40af;
              font-size: 14px;
            }
            .footer {
              background: #f9fafb;
              padding: 20px 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
            }
            .footer strong {
              color: #3b82f6;
              display: block;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⏱️ Weekly Time Card</h1>
            <p>${weekRange}</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Hello${recipientName ? ' ' + recipientName : ''},
            </div>
            
            <p>
              Your weekly time card for <strong>${weekRange}</strong> is attached to this email.
            </p>
            
            <div class="info-box">
              <strong>📄 Time Card Details:</strong>
              <p>Week: ${weekRange}</p>
              <p>Format: PDF Document</p>
              <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="attachment-notice">
              <strong>📎 PDF Attachment Included</strong>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #6b7280;">
                Please find your time card attached as <code style="background: white; padding: 2px 6px; border-radius: 3px;">${fileName}</code>
              </p>
            </div>
            
            <p style="margin-top: 20px;">
              This time card includes a detailed breakdown of all your work sessions, jobs, and total hours for the week.
            </p>
            
            ${senderName ? `
              <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                Sent by: ${senderName}${senderEmail ? ` (${senderEmail})` : ''}
              </p>
            ` : ''}
          </div>
          
          <div class="footer">
            <strong>Electrician Pro X</strong>
            <p>Professional time tracking for electrical contractors</p>
            <p style="margin-top: 10px; font-size: 11px;">
              This is an automated message from Electrician Pro X. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    // Plain text version
    const textContent = `
Weekly Time Card - ${weekRange}

Hello${recipientName ? ' ' + recipientName : ''},

Your weekly time card for ${weekRange} is attached to this email.

Time Card Details:
- Week: ${weekRange}
- Format: PDF Document
- Generated: ${new Date().toLocaleString()}

This time card includes a detailed breakdown of all your work sessions, jobs, and total hours for the week.

${senderName ? `Sent by: ${senderName}${senderEmail ? ` (${senderEmail})` : ''}` : ''}

---
Electrician Pro X
Professional time tracking for electrical contractors
    `.trim();

    try {
      console.log('Sending time card email to:', recipientEmail);

      // Send email via Resend
      const emailData = await resend.emails.send({
        from: 'Electrician Pro X <timecards@proxtrades.com>',
        to: recipientEmail,
        subject: `Weekly Time Card - ${weekRange}`,
        html: htmlContent,
        text: textContent,
        attachments: [
          {
            filename: fileName,
            content: pdfBase64,
          }
        ],
        // BCC to sender for confirmation
        ...(senderEmail && { bcc: senderEmail })
      });

      console.log('✅ Time card email sent:', emailData.id);

      return {
        success: true,
        emailId: emailData.id,
        message: 'Time card sent successfully'
      };

    } catch (error) {
      console.error('❌ Error sending time card email:', error);
      throw new HttpsError('internal', `Failed to send time card: ${error.message}`);
    }
  }
);

module.exports = { sendTimeCardEmail };