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
         .text(invoice.clientName || 'Client Name', 50, yPos);

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
      if (invoice.items && invoice.items.length > 0) {
        doc.font('Helvetica').fontSize(9);
        
        invoice.items.forEach((item, index) => {
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
             .text(`$${parseFloat(item.amount || (item.quantity * item.rate) || 0).toFixed(2)}`, 480, yPos + 8);

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

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text('TOTAL:', totalLabelX, yPos, { width: 150, align: 'left' });
      
      doc.fontSize(16)
         .fillColor(primaryColor)
         .text(`$${parseFloat(invoice.total || invoice.amount || 0).toFixed(2)}`, doc.page.width - 120, yPos, { width: 70, align: 'right' });

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

      yPos += 10;
      doc.moveTo(50, yPos).lineTo(doc.page.width - 50, yPos).stroke(borderGray);

      // Total
      yPos += 20;
      const totalLabelX = doc.page.width - 200;
      const totalValueX = doc.page.width - 80;

      doc.moveTo(totalLabelX - 10, yPos).lineTo(doc.page.width - 50, yPos).lineWidth(2).stroke(darkGray);
      yPos += 10;

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text('TOTAL ESTIMATE:', totalLabelX, yPos, { width: 150, align: 'left' });
      
      doc.fontSize(16)
         .fillColor(primaryColor)
         .text(`$${parseFloat(estimate.total || 0).toFixed(2)}`, doc.page.width - 120, yPos, { width: 70, align: 'right' });

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