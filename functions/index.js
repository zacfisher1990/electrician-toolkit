/**
 * Firebase Cloud Functions v2 for Invoice & Estimate Email Sending
 * 
 * Installation:
 * 1. cd functions
 * 2. npm install resend pdfkit
 * 3. Set config: firebase functions:config:set resend.api_key="your_key_here"
 * 4. For local: Add RESEND_API_KEY to functions/.env
 * 5. Deploy: firebase deploy --only functions:sendInvoiceEmail,sendEstimateEmail
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const { defineString } = require('firebase-functions/params');
const { Resend } = require('resend');
const PDFDocument = require('pdfkit');
const admin = require('firebase-admin');

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Define the Resend API key parameter (will use RESEND_API_KEY env var)
const resendApiKey = defineString('RESEND_API_KEY');

// Set global options
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1'
});

/**
 * Cloud Function to send invoice via email with PDF attachment
 */
exports.sendInvoiceEmail = onCall(
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
        from: `${userInfo.businessName || 'ProXTrades'} <invoices@proxtrades.com>`,
        replyTo: userInfo.email, // Client replies go to the user!
        to: recipientEmail,
        bcc: userInfo.email, // BCC the sender so they get a copy
        subject: `Invoice #${invoice.invoiceNumber || 'N/A'} from ${userInfo.businessName || 'ProXTrades'}`,
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

/**
 * Cloud Function to send estimate via email with PDF attachment
 */
exports.sendEstimateEmail = onCall(
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
        from: `${userInfo.businessName || 'ProXTrades'} <estimates@proxtrades.com>`,
        replyTo: userInfo.email, // Client replies go to the user!
        to: recipientEmail,
        bcc: userInfo.email, // BCC the sender so they get a copy
        subject: `Estimate: ${estimate.name || 'Untitled'} from ${userInfo.businessName || 'ProxTrades'}`,
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

/**
 * Generate PDF buffer for the invoice using PDFKit
 */
async function generateInvoicePDFBuffer(invoice, userInfo = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const primaryColor = '#3b82f6';
      const darkGray = '#1f2937';
      const lightGray = '#6b7280';
      const borderGray = '#e5e7eb';

      // Header - Blue background
      doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);

      // Company Logo (if available)
      let logoX = 50;
      if (userInfo.companyLogo) {
        try {
          // Note: If logo is a URL, you'll need to fetch it first
          // For now, we'll skip the logo or you can implement fetching
          logoX = 90; // Adjust for logo space
        } catch (error) {
          console.error('Error adding logo to invoice PDF:', error);
        }
      }

      // Company Name
      doc.fillColor('#ffffff')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text(userInfo.businessName || 'Electrician Toolkit', logoX, 30);

      // Company Contact Info
      doc.fontSize(10)
         .font('Helvetica')
         .text(userInfo.email || '', logoX, 60);

      if (userInfo.phone) {
        doc.text(userInfo.phone, logoX, 75);
      }

      // Reset to black for body
      doc.fillColor(darkGray);

      // Invoice Title
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .text('INVOICE', 50, 130);

      // Invoice details (right side)
      const rightColumn = 400;
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(lightGray)
         .text('Invoice Number:', rightColumn, 130);
      
      doc.font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(invoice.invoiceNumber || 'N/A', rightColumn, 145);

      doc.font('Helvetica')
         .fillColor(lightGray)
         .text('Invoice Date:', rightColumn, 165);
      
      doc.font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(invoice.date || new Date().toLocaleDateString(), rightColumn, 180);

      doc.font('Helvetica')
         .fillColor(lightGray)
         .text('Due Date:', rightColumn, 200);
      
      doc.font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(invoice.dueDate || 'Upon Receipt', rightColumn, 215);

      // Bill To section
      let yPos = 250;
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text('Bill To:', 50, yPos);

      yPos += 20;
      doc.fontSize(10)
         .font('Helvetica')
         .text(invoice.clientName || invoice.client || invoice.customerName || 'Client Name', 50, yPos);

      if (invoice.clientEmail) {
        yPos += 15;
        doc.text(invoice.clientEmail, 50, yPos);
      }

      if (invoice.clientPhone) {
        yPos += 15;
        doc.text(invoice.clientPhone, 50, yPos);
      }

      if (invoice.clientAddress) {
        yPos += 15;
        doc.text(invoice.clientAddress, 50, yPos);
      }

      // Line Items Table
      yPos = 350;
      
      // Table Header
      doc.rect(50, yPos, doc.page.width - 100, 30).fill('#f9fafb');
      
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text('Description', 60, yPos + 10)
         .text('Qty', 320, yPos + 10)
         .text('Rate', 380, yPos + 10)
         .text('Amount', 480, yPos + 10);

      yPos += 30;

      // Table Rows
      const items = invoice.lineItems || invoice.items || [];
      if (items.length > 0) {
        doc.font('Helvetica').fontSize(9);
        
        items.forEach((item, index) => {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          const rowColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
          doc.rect(50, yPos, doc.page.width - 100, 25).fill(rowColor);

          doc.fillColor(darkGray)
             .text(item.description || item.name || 'Item', 60, yPos + 8, { width: 240 })
             .text(item.quantity || 1, 320, yPos + 8)
             .text(`$${parseFloat(item.rate || item.price || 0).toFixed(2)}`, 380, yPos + 8)
             .text(`$${parseFloat(item.amount || ((item.quantity || 1) * (item.rate || item.price || 0))).toFixed(2)}`, 480, yPos + 8);

          yPos += 25;
        });
      }

      yPos += 10;
      doc.moveTo(50, yPos).lineTo(doc.page.width - 50, yPos).stroke(borderGray);

      // Totals
      yPos += 20;
      const totalLabelX = doc.page.width - 200;
      const totalValueX = doc.page.width - 80;

      if (invoice.subtotal) {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor(lightGray)
           .text('Subtotal:', totalLabelX, yPos)
           .fillColor(darkGray)
           .text(`$${parseFloat(invoice.subtotal).toFixed(2)}`, totalValueX, yPos, { align: 'right' });
        yPos += 20;
      }

      if (invoice.tax) {
        doc.fillColor(lightGray)
           .text('Tax:', totalLabelX, yPos)
           .fillColor(darkGray)
           .text(`$${parseFloat(invoice.tax).toFixed(2)}`, totalValueX, yPos, { align: 'right' });
        yPos += 20;
      }

      // Total line
      doc.moveTo(totalLabelX - 10, yPos).lineTo(doc.page.width - 50, yPos).lineWidth(2).stroke(darkGray);
      yPos += 10;

      // Left-aligned label
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text('TOTAL:', 50, yPos);
      
      // Right-aligned amount - calculate position
      const totalAmount = `$${parseFloat(invoice.total || invoice.amount || 0).toFixed(2)}`;
      doc.fontSize(16);
      const amountWidth = doc.widthOfString(totalAmount);
      
      doc.fillColor(primaryColor)
         .text(totalAmount, doc.page.width - 50 - amountWidth, yPos);

      // Notes
      if (invoice.notes) {
        yPos += 40;
        if (yPos > 650) {
          doc.addPage();
          yPos = 50;
        }

        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Notes:', 50, yPos);

        yPos += 15;
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(lightGray)
           .text(invoice.notes, 50, yPos, { width: doc.page.width - 100 });
      }

      // Footer
      const footerY = doc.page.height - 50;
      doc.moveTo(50, footerY - 10).lineTo(doc.page.width - 50, footerY - 10).stroke(borderGray);
      
      doc.fontSize(9)
         .fillColor(lightGray)
         .text('Thank you for your business!', 50, footerY, { align: 'center', width: doc.page.width - 100 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate PDF buffer for the estimate using PDFKit
 */
async function generateEstimatePDFBuffer(estimate, userInfo = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const primaryColor = '#10b981'; // Green for estimates
      const darkGray = '#1f2937';
      const lightGray = '#6b7280';
      const borderGray = '#e5e7eb';

      // Header - Green background
      doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);

      // Company Logo (if available)
      let logoX = 50;
      if (userInfo.companyLogo) {
        try {
          // Note: If logo is a URL, you'll need to fetch it first
          logoX = 90; // Adjust for logo space
        } catch (error) {
          console.error('Error adding logo to estimate PDF:', error);
        }
      }

      // Company Name
      doc.fillColor('#ffffff')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text(userInfo.businessName || 'Electrician Toolkit', logoX, 30);

      // Company Contact Info
      doc.fontSize(10)
         .font('Helvetica')
         .text(userInfo.email || '', logoX, 60);

      if (userInfo.phone) {
        doc.text(userInfo.phone, logoX, 75);
      }

      // Reset to black for body
      doc.fillColor(darkGray);

      // Estimate Title
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .text('ESTIMATE', 50, 130);

      // Estimate details (right side)
      const rightColumn = 400;
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(lightGray)
         .text('Estimate Name:', rightColumn, 130);
      
      doc.font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(estimate.name || 'Untitled', rightColumn, 145, { width: 150 });

      doc.font('Helvetica')
         .fillColor(lightGray)
         .text('Date:', rightColumn, 165);
      
      // Handle Firestore timestamp properly
      const estimateDate = estimate.createdAt?.seconds 
        ? new Date(estimate.createdAt.seconds * 1000)
        : estimate.createdAt 
          ? new Date(estimate.createdAt)
          : new Date();
      
      doc.font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(estimateDate.toLocaleDateString(), rightColumn, 180);

      doc.font('Helvetica')
         .fillColor(lightGray)
         .text('Valid Until:', rightColumn, 200);
      
      const validDate = new Date(estimateDate);
      validDate.setDate(validDate.getDate() + 30);
      
      doc.font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(validDate.toLocaleDateString(), rightColumn, 215);

      // Labor section (if applicable)
      let yPos = 250;
      
      if (estimate.laborHours && estimate.laborRate) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Labor:', 50, yPos);

        yPos += 20;
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor(lightGray)
           .text(`${estimate.laborHours} hours × $${parseFloat(estimate.laborRate).toFixed(2)}/hr`, 60, yPos);
        
        const laborTotal = estimate.laborHours * estimate.laborRate;
        doc.fillColor(darkGray)
           .text(`$${laborTotal.toFixed(2)}`, 480, yPos);

        yPos += 30;
      }

      // Materials Table
      
      if (estimate.materials && estimate.materials.length > 0) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Materials:', 50, yPos);
        
        yPos += 20;
      
        // Table Header
        doc.rect(50, yPos, doc.page.width - 100, 30).fill('#f9fafb');
        
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Material', 60, yPos + 10)
           .text('Qty', 320, yPos + 10)
           .text('Cost', 380, yPos + 10)
           .text('Total', 480, yPos + 10);

        yPos += 30;

        // Materials Rows
        doc.font('Helvetica').fontSize(9);
        
        estimate.materials.forEach((material, index) => {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          const rowColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
          doc.rect(50, yPos, doc.page.width - 100, 25).fill(rowColor);

          const materialTotal = (material.quantity || 1) * (material.cost || 0);

          doc.fillColor(darkGray)
             .text(material.name || 'Material', 60, yPos + 8, { width: 240 })
             .text(material.quantity || 1, 320, yPos + 8)
             .text(`$${parseFloat(material.cost || 0).toFixed(2)}`, 380, yPos + 8)
             .text(`$${materialTotal.toFixed(2)}`, 480, yPos + 8);

          yPos += 25;
        });

        yPos += 10;
      }

      // Additional Items section (if applicable)
      if (estimate.additionalItems && estimate.additionalItems.length > 0) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Additional Items:', 50, yPos);
        
        yPos += 20;

        estimate.additionalItems.forEach((item, index) => {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          const rowColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
          doc.rect(50, yPos, doc.page.width - 100, 25).fill(rowColor);

          doc.fontSize(10)
             .font('Helvetica')
             .fillColor(darkGray)
             .text(item.description || 'Item', 60, yPos + 8, { width: 340 })
             .text(`$${parseFloat(item.amount || 0).toFixed(2)}`, 480, yPos + 8);

          yPos += 25;
        });

        yPos += 10;
      }

      yPos += 10;
      doc.moveTo(50, yPos).lineTo(doc.page.width - 50, yPos).stroke(borderGray);

      // Total
      yPos += 20;
      const totalLabelX = doc.page.width - 200;
      const totalValueX = doc.page.width - 80;

      doc.moveTo(totalLabelX - 10, yPos).lineTo(doc.page.width - 50, yPos).lineWidth(2).stroke(darkGray);
      yPos += 10;

      // Left-aligned label
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text('TOTAL ESTIMATE:', 50, yPos);
      
      // Right-aligned amount - calculate position
      const totalAmount = `$${parseFloat(estimate.total || 0).toFixed(2)}`;
      doc.fontSize(16);
      const amountWidth = doc.widthOfString(totalAmount);
      
      doc.fillColor(primaryColor)
         .text(totalAmount, doc.page.width - 50 - amountWidth, yPos);

      // Notes
      if (estimate.notes) {
        yPos += 40;
        if (yPos > 650) {
          doc.addPage();
          yPos = 50;
        }

        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Notes:', 50, yPos);

        yPos += 15;
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(lightGray)
           .text(estimate.notes, 50, yPos, { width: doc.page.width - 100 });
      }

      // Footer
      const footerY = doc.page.height - 50;
      doc.moveTo(50, footerY - 10).lineTo(doc.page.width - 50, footerY - 10).stroke(borderGray);
      
      doc.fontSize(9)
         .fillColor(lightGray)
         .text('Thank you for considering our services!', 50, footerY, { align: 'center', width: doc.page.width - 100 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate HTML email content for invoice
 */
function generateInvoiceEmailHTML(invoice, customMessage, userInfo) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${invoice.invoiceNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="background-color: #3b82f6; padding: 30px; text-align: center;">
                  ${userInfo.companyLogo ? `
                    <img src="${userInfo.companyLogo}" alt="${userInfo.businessName || 'Company Logo'}" style="max-width: 120px; max-height: 120px; margin-bottom: 15px; background: white; padding: 10px; border-radius: 8px;" />
                  ` : ''}
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${userInfo.businessName || 'Electrician Toolkit'}</h1>
                  <p style="color: #ffffff; margin: 10px 0 0; font-size: 14px;">${userInfo.email || ''}</p>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #111827; margin: 0 0 20px; font-size: 20px;">Invoice #${invoice.invoiceNumber || 'N/A'}</h2>
                  
                  ${customMessage ? `
                    <p style="color: #6b7280; margin: 0 0 20px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${customMessage}</p>
                  ` : ''}
                  
                  <table width="100%" cellpadding="10" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; margin: 20px 0;">
                    <tr style="background-color: #f9fafb;">
                      <td style="color: #6b7280; font-size: 14px;">Invoice Date:</td>
                      <td align="right" style="color: #111827; font-size: 14px; font-weight: 600;">${invoice.date || new Date().toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Due Date:</td>
                      <td align="right" style="color: #111827; font-size: 14px; font-weight: 600; border-top: 1px solid #e5e7eb;">${invoice.dueDate || 'Upon Receipt'}</td>
                    </tr>
                    <tr style="background-color: #f9fafb;">
                      <td style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Amount Due:</td>
                      <td align="right" style="color: #3b82f6; font-size: 18px; font-weight: 700; border-top: 1px solid #e5e7eb;">$${parseFloat(invoice.total || invoice.amount || 0).toFixed(2)}</td>
                    </tr>
                  </table>
                  
                  <p style="color: #6b7280; margin: 20px 0 0; font-size: 13px;">
                    The invoice is attached as a PDF. If you have any questions, please don't hesitate to reach out.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                    Thank you for your business!
                  </p>
                  ${userInfo.phone ? `
                    <p style="color: #9ca3af; margin: 10px 0 0; font-size: 12px;">
                      ${userInfo.phone}
                    </p>
                  ` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Generate HTML email content for estimate
 */
function generateEstimateEmailHTML(estimate, customMessage, userInfo) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Estimate: ${estimate.name}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="background-color: #10b981; padding: 30px; text-align: center;">
                  ${userInfo.companyLogo ? `
                    <img src="${userInfo.companyLogo}" alt="${userInfo.businessName || 'Company Logo'}" style="max-width: 120px; max-height: 120px; margin-bottom: 15px; background: white; padding: 10px; border-radius: 8px;" />
                  ` : ''}
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${userInfo.businessName || 'Electrician Toolkit'}</h1>
                  <p style="color: #ffffff; margin: 10px 0 0; font-size: 14px;">${userInfo.email || ''}</p>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #111827; margin: 0 0 20px; font-size: 20px;">Estimate: ${estimate.name || 'Your Project'}</h2>
                  
                  ${customMessage ? `
                    <p style="color: #6b7280; margin: 0 0 20px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${customMessage}</p>
                  ` : ''}
                  
                  <table width="100%" cellpadding="10" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; margin: 20px 0;">
                    <tr style="background-color: #f9fafb;">
                      <td style="color: #6b7280; font-size: 14px;">Estimate Date:</td>
                      <td align="right" style="color: #111827; font-size: 14px; font-weight: 600;">${estimate.createdAt?.seconds ? new Date(estimate.createdAt.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Valid Until:</td>
                      <td align="right" style="color: #111827; font-size: 14px; font-weight: 600; border-top: 1px solid #e5e7eb;">${(() => {
                        const date = estimate.createdAt?.seconds ? new Date(estimate.createdAt.seconds * 1000) : new Date();
                        date.setDate(date.getDate() + 30);
                        return date.toLocaleDateString();
                      })()}</td>
                    </tr>
                    <tr style="background-color: #f9fafb;">
                      <td style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Total:</td>
                      <td align="right" style="color: #10b981; font-size: 18px; font-weight: 700; border-top: 1px solid #e5e7eb;">$${parseFloat(estimate.total || 0).toFixed(2)}</td>
                    </tr>
                  </table>
                  
                  <p style="color: #6b7280; margin: 20px 0 0; font-size: 13px;">
                    The estimate is attached as a PDF. This estimate is valid for 30 days. If you have any questions, please don't hesitate to reach out.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                    Thank you for considering our services!
                  </p>
                  ${userInfo.phone ? `
                    <p style="color: #9ca3af; margin: 10px 0 0; font-size: 12px;">
                      ${userInfo.phone}
                    </p>
                  ` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
/**
 * Cloud Function to delete user account and all associated data
 */
exports.deleteUserAccount = onCall(async (request) => {
  const userId = request.auth?.uid;

  // Check authentication
  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    console.log(`Starting account deletion for user: ${userId}`);

    const db = admin.firestore();
    const storage = admin.storage();
    const bucket = storage.bucket();

    // Step 1: Delete all jobs and their subcollections
    console.log('Deleting jobs...');
    const jobsRef = db.collection('users').doc(userId).collection('jobs');
    const jobsSnapshot = await jobsRef.get();
    
    const jobDeletionPromises = [];
    for (const jobDoc of jobsSnapshot.docs) {
      // Delete estimates subcollection
      const estimatesRef = jobDoc.ref.collection('estimates');
      const estimatesSnapshot = await estimatesRef.get();
      estimatesSnapshot.docs.forEach(doc => {
        jobDeletionPromises.push(doc.ref.delete());
      });

      // Delete invoices subcollection
      const invoicesRef = jobDoc.ref.collection('invoices');
      const invoicesSnapshot = await invoicesRef.get();
      invoicesSnapshot.docs.forEach(doc => {
        jobDeletionPromises.push(doc.ref.delete());
      });

      // Delete the job document
      jobDeletionPromises.push(jobDoc.ref.delete());
    }
    await Promise.all(jobDeletionPromises);
    console.log(`Deleted ${jobsSnapshot.size} jobs`);

    // Step 2: Delete all estimates (top-level)
    console.log('Deleting top-level estimates...');
    const estimatesRef = db.collection('users').doc(userId).collection('estimates');
    const estimatesSnapshot = await estimatesRef.get();
    const estimateDeletionPromises = estimatesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(estimateDeletionPromises);
    console.log(`Deleted ${estimatesSnapshot.size} estimates`);

    // Step 3: Delete all invoices (top-level)
    console.log('Deleting top-level invoices...');
    const invoicesRef = db.collection('users').doc(userId).collection('invoices');
    const invoicesSnapshot = await invoicesRef.get();
    const invoiceDeletionPromises = invoicesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(invoiceDeletionPromises);
    console.log(`Deleted ${invoicesSnapshot.size} invoices`);

    // Step 4: Delete email verification tokens
    console.log('Deleting email verification tokens...');
    const tokensRef = db.collection('emailVerificationTokens');
    const tokensSnapshot = await tokensRef.where('userId', '==', userId).get();
    const tokenDeletionPromises = tokensSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(tokenDeletionPromises);
    console.log(`Deleted ${tokensSnapshot.size} verification tokens`);

    // Step 5: Delete user document
    console.log('Deleting user document...');
    await db.collection('users').doc(userId).delete();

    // Step 6: Delete all Storage files
    console.log('Deleting Storage files...');
    const deleteStorageFolder = async (prefix) => {
      try {
        const [files] = await bucket.getFiles({ prefix });
        const deletionPromises = files.map(file => file.delete().catch(err => {
          console.warn(`Failed to delete file ${file.name}:`, err.message);
        }));
        await Promise.all(deletionPromises);
        return files.length;
      } catch (error) {
        console.warn(`Error accessing folder ${prefix}:`, error.message);
        return 0;
      }
    };

    const profilePhotoCount = await deleteStorageFolder(`profile-photos/${userId}`);
    const companyLogoCount = await deleteStorageFolder(`company-logos/${userId}`);
    const jobPhotosCount = await deleteStorageFolder(`job-photos/${userId}`);
    
    console.log(`Deleted ${profilePhotoCount} profile photos`);
    console.log(`Deleted ${companyLogoCount} company logos`);
    console.log(`Deleted ${jobPhotosCount} job photos`);

    console.log(`✅ Successfully deleted all data for user: ${userId}`);

    return {
      success: true,
      message: 'Account and all associated data deleted successfully'
    };

  } catch (error) {
    console.error('Error deleting user account:', error);
    throw new HttpsError('internal', `Failed to delete account: ${error.message}`);
  }
});

/**
 * Cloud Function to send verification email
 */
exports.sendVerificationEmail = onCall(
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
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Email</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">⚡</h1>
                          <h2 style="margin: 10px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 600;">Verify Your Email</h2>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <h3 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600;">
                            Welcome to ProXTrades! 🚀
                          </h3>
                          
                          <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                            Thanks for signing up! Please verify your email address to activate your account and start managing your electrical business.
                          </p>
                          
                          <!-- CTA Button -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                            <tr>
                              <td align="center">
                                <a href="${verificationLink}" 
                                   style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                                  Verify Email Address
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="margin: 30px 0 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                            Or copy and paste this link into your browser:<br>
                            <a href="${verificationLink}" style="color: #3b82f6; word-break: break-all;">
                              ${verificationLink}
                            </a>
                          </p>

                          <div style="margin-top: 30px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                              <strong>⏰ This link expires in 24 hours</strong><br>
                              Please verify your email soon to ensure uninterrupted access.
                            </p>
                          </div>
                          
                          <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                              If you didn't create an account with ProXTrades, you can safely ignore this email.
                            </p>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                            © ${new Date().getFullYear()} ProXTrades. All rights reserved.
                          </p>
                          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                            This is an automated email, please do not reply.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `
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

/**
 * Cloud Function to send welcome email
 */
exports.sendWelcomeEmail = onCall(
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
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <tr>
                      <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">⚡ ProXTrades</h1>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">
                          📧 Check Your Email
                        </h2>
                        
                        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                          We've sent a verification email to <strong>${email}</strong>
                        </p>

                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
                          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                            <strong>📥 Check your spam/junk folder</strong><br>
                            Verification emails sometimes end up there. If you find it, mark it as "Not Spam" to ensure future emails arrive in your inbox.
                          </p>
                        </div>
                        
                        <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                          Click the verification link in that email to activate your account and start using ProXTrades!
                        </p>

                        <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                            <strong>Didn't receive the email?</strong><br>
                            • Wait a few minutes and check again<br>
                            • Check your spam/junk folder<br>
                            • Make sure ${email} is correct
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                          © ${new Date().getFullYear()} ProXTrades. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;
    } else {
      // Welcome email
      subject = '🎉 Welcome to ProXTrades!';
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0;">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <tr>
                      <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">⚡</h1>
                        <h2 style="margin: 10px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 600;">Welcome to ProXTrades!</h2>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h3 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600;">
                          You're almost ready to go! 🚀
                        </h3>
                        
                        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                          Thanks for signing up! To get started, please verify your email address.
                        </p>

                        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                          <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                            <strong>📧 Check your inbox</strong><br>
                            We've sent a verification email to <strong>${email}</strong>. Click the link in that email to verify your account.
                          </p>
                        </div>

                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
                          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                            <strong>⚠️ Check your spam folder</strong><br>
                            The verification email might be in your spam/junk folder. If you find it there, mark it as "Not Spam".
                          </p>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                          <h4 style="margin: 0 0 15px 0; color: #111827; font-size: 16px; font-weight: 600;">
                            What's Next?
                          </h4>
                          <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                            <li>Verify your email address</li>
                            <li>Log in to your account</li>
                            <li>Start managing your electrical jobs</li>
                            <li>Create professional estimates and invoices</li>
                            <li>Track your business all in one place</li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                          © ${new Date().getFullYear()} ProXTrades. All rights reserved.
                        </p>
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                          If you didn't create an account, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;
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