/**
 * Firebase Cloud Functions v2 for Invoice & Estimate Email Sending
 * 
 * Installation:
 * 1. cd functions
 * 2. npm install resend jspdf
 * 3. Create functions/.env with: RESEND_API_KEY=your_key_here
 * 4. Deploy: firebase deploy --only functions:sendInvoiceEmail,sendEstimateEmail
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const { Resend } = require('resend');
const { jsPDF } = require('jspdf');
const functions = require('firebase-functions');

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
    // Initialize Resend with environment variable
    const resend = new Resend(functions.config().resend.api_key);
    
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
      const pdfBuffer = generateInvoicePDFBuffer(invoice, userInfo);

      // Convert buffer to base64
      const pdfBase64 = pdfBuffer.toString('base64');

      console.log('Sending email to:', recipientEmail);

      // Send email via Resend with BCC to sender
      const emailData = await resend.emails.send({
        from: 'Electrician Toolkit <onboarding@resend.dev>',
        to: recipientEmail,
        bcc: userInfo.email, // BCC the sender so they get a copy
        subject: `Invoice #${invoice.invoiceNumber || 'N/A'} from ${userInfo.businessName || 'Electrician Toolkit'}`,
        html: generateInvoiceEmailHTML(invoice, message, userInfo),
        attachments: [
          {
            filename: `Invoice-${invoice.invoiceNumber || 'draft'}.pdf`,
            content: pdfBase64,
          }
        ]
      });

      console.log('Email sent successfully:', emailData.id);

      return {
        success: true,
        messageId: emailData.id,
        message: 'Invoice sent successfully!'
      };

    } catch (error) {
      console.error('Error sending invoice:', error);
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
    // Initialize Resend with environment variable
    const resend = new Resend(functions.config().resend.api_key);
    
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
      const pdfBuffer = generateEstimatePDFBuffer(estimate, userInfo);

      // Convert buffer to base64
      const pdfBase64 = pdfBuffer.toString('base64');

      console.log('Sending email to:', recipientEmail);

      // Send email via Resend with BCC to sender
      const emailData = await resend.emails.send({
        from: 'Electrician Toolkit <onboarding@resend.dev>',
        to: recipientEmail,
        bcc: userInfo.email, // BCC the sender so they get a copy
        subject: `Estimate: ${estimate.name || 'Untitled'} from ${userInfo.businessName || 'Electrician Toolkit'}`,
        html: generateEstimateEmailHTML(estimate, message, userInfo),
        attachments: [
          {
            filename: `Estimate-${estimate.name || 'draft'}.pdf`,
            content: pdfBase64,
          }
        ]
      });

      console.log('Email sent successfully:', emailData.id);

      return {
        success: true,
        messageId: emailData.id,
        message: 'Estimate sent successfully!'
      };

    } catch (error) {
      console.error('Error sending estimate:', error);
      throw new HttpsError(
        'internal',
        `Failed to send estimate: ${error.message}`
      );
    }
  }
);

/**
 * Generate PDF buffer for the invoice
 */
function generateInvoicePDFBuffer(invoice, userInfo = {}) {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  const primaryColor = [59, 130, 246];
  const darkGray = [31, 41, 55];
  const lightGray = [107, 114, 128];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Company Logo (if available)
  let logoX = margin;
  if (userInfo.companyLogo) {
    try {
      const logoSize = 28;
      const logoY = 6;
      doc.addImage(userInfo.companyLogo, 'PNG', logoX, logoY, logoSize, logoSize);
      logoX += logoSize + 10;
    } catch (error) {
      console.error('Error adding logo to invoice PDF:', error);
    }
  }
  
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(userInfo.businessName || 'Electrician Toolkit', logoX, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (userInfo.email) doc.text(userInfo.email, logoX, 25);
  if (userInfo.phone) doc.text(userInfo.phone, logoX, 32);

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
  doc.text(invoice.client || invoice.clientName || 'Client Name', margin, yPosition);
  
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
  doc.text(invoice.date || new Date().toLocaleDateString(), pageWidth - margin, rightYPosition, { align: 'right' });

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
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

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

  if (invoice.tax && invoice.tax > 0) {
    doc.setTextColor(...lightGray);
    doc.text(`Tax:`, totalsX, yPosition);
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
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }
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
 * Generate PDF buffer for the estimate
 */
function generateEstimatePDFBuffer(estimate, userInfo = {}) {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  const primaryColor = [16, 185, 129]; // Green for estimates
  const darkGray = [31, 41, 55];
  const lightGray = [107, 114, 128];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Company Logo (if available)
  let logoX = margin;
  if (userInfo.companyLogo) {
    try {
      const logoSize = 28;
      const logoY = 6;
      doc.addImage(userInfo.companyLogo, 'PNG', logoX, logoY, logoSize, logoSize);
      logoX += logoSize + 10;
    } catch (error) {
      console.error('Error adding logo to estimate PDF:', error);
    }
  }
  
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(userInfo.businessName || 'Electrician Toolkit', logoX, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (userInfo.email) doc.text(userInfo.email, logoX, 25);
  if (userInfo.phone) doc.text(userInfo.phone, logoX, 32);

  yPosition = 55;

  // Estimate Title
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTIMATE', margin, yPosition);

  doc.setFontSize(12);
  doc.setTextColor(...darkGray);
  doc.text(estimate.name || 'Untitled', pageWidth - margin, yPosition, { align: 'right' });

  yPosition += 15;

  // Client info (if available)
  if (estimate.clientName) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FOR:', margin, yPosition);
    
    yPosition += 7;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(estimate.clientName, margin, yPosition);
    
    if (estimate.clientEmail) {
      yPosition += 6;
      doc.setFontSize(9);
      doc.setTextColor(...lightGray);
      doc.text(estimate.clientEmail, margin, yPosition);
    }
  }

  // Right column - Estimate Details
  const rightColX = pageWidth - margin - 60;
  let rightYPosition = 70;

  doc.setFontSize(9);
  doc.setTextColor(...lightGray);
  doc.text('Estimate Date:', rightColX, rightYPosition);
  doc.setTextColor(...darkGray);
  const estimateDate = estimate.createdAt ? new Date(estimate.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
  doc.text(estimateDate, pageWidth - margin, rightYPosition, { align: 'right' });

  rightYPosition += 6;
  doc.setTextColor(...lightGray);
  doc.text('Valid Until:', rightColX, rightYPosition);
  const validDate = (() => {
    const date = estimate.createdAt ? new Date(estimate.createdAt) : new Date();
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString();
  })();
  doc.setTextColor(...darkGray);
  doc.text(validDate, pageWidth - margin, rightYPosition, { align: 'right' });

  yPosition = Math.max(yPosition, rightYPosition) + 15;

  // Labor section
  if (estimate.laborHours && estimate.laborRate) {
    yPosition += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('LABOR', margin, yPosition);
    yPosition += 7;

    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPosition - 4, pageWidth - (2 * margin), 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${estimate.laborHours} hours × $${parseFloat(estimate.laborRate).toFixed(2)}/hr`, margin + 2, yPosition);
    
    const laborTotal = estimate.laborHours * estimate.laborRate;
    doc.setFont('helvetica', 'bold');
    doc.text(`$${laborTotal.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });

    yPosition += 10;
  }

  // Materials section
  if (estimate.materials && estimate.materials.length > 0) {
    yPosition += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('MATERIALS', margin, yPosition);
    yPosition += 7;

    // Table header
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPosition, pageWidth - (2 * margin), 8, 'F');
    
    yPosition += 6;
    doc.setFontSize(9);
    doc.text('Description', margin + 2, yPosition);
    doc.text('Qty', pageWidth - margin - 60, yPosition);
    doc.text('Unit Cost', pageWidth - margin - 40, yPosition);
    doc.text('Amount', pageWidth - margin, yPosition, { align: 'right' });

    yPosition += 8;

    // Materials list
    doc.setFont('helvetica', 'normal');
    estimate.materials.forEach((item, index) => {
      const quantity = parseFloat(item.quantity) || 1;
      const unitCost = parseFloat(item.cost) || 0;
      const amount = quantity * unitCost;

      doc.text(item.name || '', margin + 2, yPosition);
      doc.text(String(quantity), pageWidth - margin - 60, yPosition);
      doc.text(`$${unitCost.toFixed(2)}`, pageWidth - margin - 40, yPosition);
      doc.text(`$${amount.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });

      yPosition += 7;
      
      if (index < estimate.materials.length - 1) {
        doc.setDrawColor(229, 231, 235);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      }
    });

    yPosition += 10;
  }

  // Total section
  const totalsX = pageWidth - margin - 60;
  
  doc.setDrawColor(...darkGray);
  doc.setLineWidth(0.5);
  doc.line(totalsX, yPosition, pageWidth - margin, yPosition);
  yPosition += 7;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('TOTAL ESTIMATE:', totalsX, yPosition);
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text(`$${parseFloat(estimate.total || 0).toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });

  // Notes
  if (estimate.notes) {
    yPosition += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('Notes:', margin, yPosition);
    yPosition += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightGray);
    const notesLines = doc.splitTextToSize(estimate.notes, pageWidth - (2 * margin));
    doc.text(notesLines, margin, yPosition);
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(9);
  doc.setTextColor(...lightGray);
  doc.text('Thank you for considering our services!', pageWidth / 2, footerY, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
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
                  <h2 style="color: #111827; margin: 0 0 20px; font-size: 20px;">Estimate: ${estimate.name || 'Untitled'}</h2>
                  
                  ${customMessage ? `
                    <p style="color: #6b7280; margin: 0 0 20px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${customMessage}</p>
                  ` : ''}
                  
                  <table width="100%" cellpadding="10" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; margin: 20px 0;">
                    <tr style="background-color: #f9fafb;">
                      <td style="color: #6b7280; font-size: 14px;">Estimate Date:</td>
                      <td align="right" style="color: #111827; font-size: 14px; font-weight: 600;">${estimate.createdAt ? new Date(estimate.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Valid Until:</td>
                      <td align="right" style="color: #111827; font-size: 14px; font-weight: 600; border-top: 1px solid #e5e7eb;">${(() => {
                        const date = estimate.createdAt ? new Date(estimate.createdAt) : new Date();
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