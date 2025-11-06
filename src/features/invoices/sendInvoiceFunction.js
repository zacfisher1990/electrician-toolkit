// This file should be placed in your Firebase Functions directory
// e.g., functions/src/sendInvoice.js or functions/index.js

const functions = require('firebase-functions');
const { Resend } = require('resend');
const { jsPDF } = require('jspdf');

// Initialize Resend with your API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Cloud Function to send invoice via email with PDF attachment
 */
exports.sendInvoiceEmail = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send invoices.'
    );
  }

  const { invoice, recipientEmail, message, userInfo } = data;

  if (!invoice || !recipientEmail) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invoice data and recipient email are required.'
    );
  }

  try {
    // Generate PDF (same logic as client-side but in Node.js)
    const pdfBuffer = generateInvoicePDFBuffer(invoice, userInfo);

    // Convert buffer to base64 for Resend
    const pdfBase64 = pdfBuffer.toString('base64');

    // Send email via Resend with BCC to sender
    const emailData = await resend.emails.send({
      from: userInfo.email || 'invoices@yourdomain.com', // Use your verified domain
      to: recipientEmail,
      bcc: userInfo.email, // BCC the sender so they get a copy
      subject: `Invoice #${invoice.invoiceNumber || 'N/A'} from ${userInfo.businessName || 'Your Business'}`,
      html: generateEmailHTML(invoice, message, userInfo),
      attachments: [
        {
          filename: `Invoice-${invoice.invoiceNumber || 'draft'}.pdf`,
          content: pdfBase64,
          contentType: 'application/pdf'
        }
      ]
    });

    return {
      success: true,
      messageId: emailData.id,
      message: 'Invoice sent successfully!'
    };

  } catch (error) {
    console.error('Error sending invoice:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to send invoice: ${error.message}`
    );
  }
});

/**
 * Generate PDF buffer for the invoice (server-side)
 */
function generateInvoicePDFBuffer(invoice, userInfo = {}) {
  const doc = new jsPDF();
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Colors
  const primaryColor = [59, 130, 246];
  const darkGray = [31, 41, 55];
  const lightGray = [107, 114, 128];

  // Header - Company Info WITH LOGO
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // *** FIXED: Add Company Logo (if available) ***
  let logoX = margin;
  if (userInfo.companyLogo) {
    try {
      const logoSize = 28;
      const logoY = 6;
      doc.addImage(userInfo.companyLogo, 'PNG', logoX, logoY, logoSize, logoSize);
      logoX += logoSize + 10; // Shift text to the right
    } catch (error) {
      console.error('Error adding logo to invoice PDF:', error);
      // Continue without logo if there's an error
    }
  }
  
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(userInfo.businessName || 'Your Business Name', logoX, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(userInfo.email || '', logoX, 25);
  doc.text(userInfo.phone || '', logoX, 32);

  yPosition = 55;

  // Invoice Title and Number
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', margin, yPosition);

  doc.setFontSize(12);
  doc.setTextColor(...darkGray);
  doc.text(`#${invoice.invoiceNumber || 'N/A'}`, pageWidth - margin, yPosition, { align: 'right' });

  yPosition += 15;

  // Bill To
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', margin, yPosition);
  
  yPosition += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.clientName || invoice.client || 'Client Name', margin, yPosition);
  
  if (invoice.clientEmail) {
    yPosition += 6;
    doc.setFontSize(9);
    doc.setTextColor(...lightGray);
    doc.text(invoice.clientEmail, margin, yPosition);
  }

  // Right column - Invoice Details
  const rightColX = pageWidth - margin - 60;
  let rightYPosition = 70;

  doc.setFontSize(9);
  doc.setTextColor(...lightGray);
  doc.text('Invoice Date:', rightColX, rightYPosition);
  doc.setTextColor(...darkGray);
  doc.text(invoice.invoiceDate || invoice.date || new Date().toLocaleDateString(), pageWidth - margin, rightYPosition, { align: 'right' });

  rightYPosition += 6;
  doc.setTextColor(...lightGray);
  doc.text('Due Date:', rightColX, rightYPosition);
  doc.setTextColor(...darkGray);
  doc.text(invoice.dueDate || 'Upon Receipt', pageWidth - margin, rightYPosition, { align: 'right' });

  rightYPosition += 6;
  doc.setTextColor(...lightGray);
  doc.text('Status:', rightColX, rightYPosition);
  
  const statusColor = invoice.status === 'Paid' ? [16, 185, 129] :
                      invoice.status === 'Pending' ? [245, 158, 11] :
                      invoice.status === 'Overdue' ? [239, 68, 68] : lightGray;
  
  doc.setFillColor(...statusColor);
  const statusText = invoice.status || 'Pending';
  const statusWidth = doc.getTextWidth(statusText) + 8;
  doc.roundedRect(pageWidth - margin - statusWidth, rightYPosition - 4, statusWidth, 6, 1, 1, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(statusText, pageWidth - margin, rightYPosition, { align: 'right' });

  yPosition = Math.max(yPosition, rightYPosition) + 15;

  // Table header
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, yPosition, pageWidth - (2 * margin), 8, 'F');
  
  yPosition += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('Description', margin + 2, yPosition);
  doc.text('Qty', pageWidth - margin - 60, yPosition);
  doc.text('Rate', pageWidth - margin - 40, yPosition);
  doc.text('Amount', pageWidth - margin, yPosition, { align: 'right' });

  yPosition += 8;

  // Line items
  doc.setFont('helvetica', 'normal');
  const lineItems = invoice.lineItems || [];
  lineItems.forEach((item, index) => {
    doc.text(item.description || '', margin + 2, yPosition);
    doc.text(String(item.quantity || 1), pageWidth - margin - 60, yPosition);
    doc.text(`$${parseFloat(item.rate || 0).toFixed(2)}`, pageWidth - margin - 40, yPosition);
    
    const amount = (item.quantity || 1) * (item.rate || 0);
    doc.text(`$${amount.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });

    yPosition += 7;
    
    if (index < lineItems.length - 1) {
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
    }
  });

  yPosition += 10;

  // Totals
  const totalsX = pageWidth - margin - 60;
  
  doc.setFontSize(10);
  doc.setTextColor(...lightGray);
  doc.text('Subtotal:', totalsX, yPosition);
  doc.setTextColor(...darkGray);
  doc.text(`$${parseFloat(invoice.subtotal || invoice.amount || 0).toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });

  yPosition += 7;

  if (invoice.tax > 0) {
    doc.setTextColor(...lightGray);
    doc.text(`Tax (${invoice.taxRate || 0}%):`, totalsX, yPosition);
    doc.setTextColor(...darkGray);
    doc.text(`$${parseFloat(invoice.tax || 0).toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 7;
  }

  doc.setDrawColor(...darkGray);
  doc.setLineWidth(0.5);
  doc.line(totalsX, yPosition, pageWidth - margin, yPosition);
  yPosition += 7;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', totalsX, yPosition);
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text(`$${parseFloat(invoice.total || invoice.amount || 0).toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });

  // Notes
  if (invoice.notes) {
    yPosition += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('Notes:', margin, yPosition);
    yPosition += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightGray);
    const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - (2 * margin));
    doc.text(notesLines, margin, yPosition);
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(9);
  doc.setTextColor(...lightGray);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}

/**
 * Generate HTML email content
 */
function generateEmailHTML(invoice, customMessage, userInfo) {
  // *** FIXED: Add company logo to email HTML ***
  const logoHTML = userInfo.companyLogo 
    ? `<img src="${userInfo.companyLogo}" alt="${userInfo.businessName || 'Company'} Logo" style="max-width: 120px; max-height: 60px; margin-bottom: 10px;" />`
    : '';

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
              <!-- Header -->
              <tr>
                <td style="background-color: #3b82f6; padding: 30px; text-align: center;">
                  ${logoHTML}
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${userInfo.businessName || 'Your Business'}</h1>
                  <p style="color: #ffffff; margin: 10px 0 0; font-size: 14px;">${userInfo.email || ''}</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #111827; margin: 0 0 20px; font-size: 20px;">Invoice #${invoice.invoiceNumber || 'N/A'}</h2>
                  
                  ${customMessage ? `
                    <p style="color: #6b7280; margin: 0 0 20px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${customMessage}</p>
                  ` : ''}
                  
                  <table width="100%" cellpadding="10" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; margin: 20px 0;">
                    <tr style="background-color: #f9fafb;">
                      <td style="color: #6b7280; font-size: 14px;">Invoice Date:</td>
                      <td align="right" style="color: #111827; font-size: 14px; font-weight: 600;">${invoice.invoiceDate || invoice.date || new Date().toLocaleDateString()}</td>
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
              
              <!-- Footer -->
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