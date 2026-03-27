/**
 * PDF Generation Utilities
 * Functions to generate PDF buffers for invoices and estimates using PDFKit
 * Updated to match in-app preview design
 */

const PDFDocument = require('pdfkit');
const https = require('https');
const http = require('http');

/**
 * Fetch image from URL and return as buffer
 */
async function fetchImageBuffer(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve(null);
      return;
    }

    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        fetchImageBuffer(response.headers.location).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        resolve(null);
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', () => resolve(null));
    }).on('error', () => resolve(null));
  });
}

/**
 * Draw a diagonal watermark on the current PDFKit page
 */
function drawWatermark(doc, text, color = '#10b981') {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  doc.save();
  doc.translate(pageWidth / 2, pageHeight / 2);
  doc.rotate(-35);
  doc.fontSize(90)
     .font('Helvetica-Bold')
     .fillColor(color)
     .fillOpacity(0.08)
     .text(text, 0, 0, { lineBreak: false, align: 'center' });
  // Border box around text
  const tw = doc.widthOfString(text, { fontSize: 90 });
  doc.rect(-tw / 2 - 20, -55, tw + 40, 100)
     .lineWidth(8)
     .strokeColor(color)
     .strokeOpacity(0.08)
     .stroke();
  doc.restore();
  doc.fillOpacity(1).strokeOpacity(1);
}

/**
 * Format a date string safely without timezone shift
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const str = String(dateStr).split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Generate PDF buffer for the invoice using PDFKit
 * Design matches the in-app preview with clean white style
 */
async function generateInvoicePDFBuffer(invoice, userInfo = {}, paymentMethods = [], paymentLinkUrl = '') {
  // Fetch logo if available
  let logoBuffer = null;
  if (userInfo.companyLogo) {
    try {
      logoBuffer = await fetchImageBuffer(userInfo.companyLogo);
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  }

  // Fetch Stripe QR code buffer if payment link provided and invoice isn't paid
  let qrBuffer = null;
  const stripeUrl = paymentLinkUrl || invoice.paymentLinkUrl || '';
  if (stripeUrl && invoice.status !== 'Paid') {
    try {
      const encodedUrl = encodeURIComponent(stripeUrl);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedUrl}&margin=6&color=1f2937`;
      qrBuffer = await fetchImageBuffer(qrUrl);
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  }

  // Fetch photo buffers
  const photoData = [];
  if (invoice.photos && invoice.photos.length > 0) {
    for (const photo of invoice.photos) {
      const url = typeof photo === 'string' ? photo : photo?.url || photo?.uri || photo?.downloadURL || null;
      if (url) {
        try {
          const buffer = await fetchImageBuffer(url);
          if (buffer) photoData.push({ buffer, note: typeof photo === 'object' ? photo.note || '' : '' });
        } catch (e) {
          console.error('Error fetching invoice photo:', e);
        }
      }
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors matching in-app preview
      const darkGray = '#1f2937';
      const mediumGray = '#4b5563';
      const lightGray = '#6b7280';
      const borderGray = '#e5e7eb';
      const bgGray = '#f9fafb';

      let yPos = 50;
      const leftMargin = 50;
      const rightMargin = doc.page.width - 50;
      const contentWidth = doc.page.width - 100;

      // Header section - Logo and Company Info
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, leftMargin, yPos, { height: 80, fit: [160, 80] });
        } catch (e) {
          console.error('Error adding logo to PDF:', e);
        }
      }

      // Company info - right aligned
      doc.fontSize(22)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(userInfo.businessName || userInfo.company || 'Your Business Name', leftMargin, yPos, {
           width: contentWidth,
           align: 'right'
         });

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(lightGray)
         .text(userInfo.email || '', leftMargin, yPos + 25, {
           width: contentWidth,
           align: 'right'
         });

      if (userInfo.phone) {
        doc.text(userInfo.phone, leftMargin, yPos + 40, {
          width: contentWidth,
          align: 'right'
        });
      }

      let headerContactY = 55;
      if (userInfo.address || userInfo.businessAddress) {
        doc.text(userInfo.address || userInfo.businessAddress, leftMargin, yPos + headerContactY, {
          width: contentWidth,
          align: 'right'
        });
        headerContactY += 15;
      }
      if (userInfo.licenseNumber) {
        doc.text(`Lic# ${userInfo.licenseNumber}`, leftMargin, yPos + headerContactY, {
          width: contentWidth,
          align: 'right'
        });
        headerContactY += 15;
      }

      yPos += Math.max(100, headerContactY + 20);

      // Watermark (drawn behind content)
      const isPaid = invoice.status === 'Paid';
      if (isPaid) drawWatermark(doc, 'PAID');

      // Divider
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).stroke(borderGray);
      yPos += 20;

      // INVOICE title and number
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text('INVOICE', leftMargin, yPos);

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(`#${invoice.invoiceNumber || 'INV-001'}`, leftMargin, yPos + 5, {
           width: contentWidth,
           align: 'right'
         });

      yPos += 50;

      // Invoice info row
      const colWidth = contentWidth / 2;

      // Left column - Invoice Name and Client
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor(lightGray)
         .text('INVOICE NAME', leftMargin, yPos);
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(invoice.name || invoice.jobTitle || 'Invoice', leftMargin, yPos + 12);

      if (invoice.clientName || invoice.client || invoice.clientCompany) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(lightGray)
           .text('BILL TO', leftMargin, yPos + 35);

        let clientY = yPos + 47;
        if (invoice.clientCompany) {
          doc.fontSize(11).font('Helvetica-Bold').fillColor(darkGray)
             .text(invoice.clientCompany, leftMargin, clientY);
          clientY += 16;
        }
        if (invoice.clientName || invoice.client) {
          doc.fontSize(11).font('Helvetica').fillColor(darkGray)
             .text(invoice.clientName || invoice.client, leftMargin, clientY);
          clientY += 16;
        }
        if (invoice.clientEmail) {
          doc.fontSize(9).font('Helvetica').fillColor(lightGray)
             .text(invoice.clientEmail, leftMargin, clientY);
          clientY += 13;
        }
        if (invoice.clientPhone) {
          doc.fontSize(9).font('Helvetica').fillColor(lightGray)
             .text(invoice.clientPhone, leftMargin, clientY);
          clientY += 13;
        }
        if (invoice.clientAddress) {
          doc.fontSize(9).font('Helvetica').fillColor(lightGray)
             .text(invoice.clientAddress, leftMargin, clientY);
        }
      }

      // Right column - Dates
      const rightColX = leftMargin + colWidth;
      
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor(lightGray)
         .text('INVOICE DATE', rightColX, yPos, { width: colWidth, align: 'right' });
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(invoice.date ? formatDate(invoice.date) : new Date().toLocaleDateString(), rightColX, yPos + 12, { width: colWidth, align: 'right' });

      doc.fontSize(9)
         .font('Helvetica')
         .fillColor(lightGray)
         .text('DUE DATE', rightColX, yPos + 35, { width: colWidth, align: 'right' });
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(invoice.dueDate ? formatDate(invoice.dueDate) : 'Upon Receipt', rightColX, yPos + 47, { width: colWidth, align: 'right' });

      yPos += 80;

      // Divider
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).stroke(borderGray);
      yPos += 20;

      // Labor + Line Items
      const laborHours = parseFloat(invoice.laborHours || 0);
      const laborRate = parseFloat(invoice.laborRate || 0);
      const laborTotal = laborHours > 0 && laborRate > 0 ? laborHours * laborRate : 0;
      const items = invoice.lineItems || invoice.items || [];
      const hasContent = laborTotal > 0 || items.length > 0;

      if (hasContent) {
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Line Items', leftMargin, yPos);
        
        yPos += 20;

        // Table header
        doc.rect(leftMargin, yPos, contentWidth, 25).fill(bgGray);
        
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor(mediumGray)
           .text('Description', leftMargin + 10, yPos + 8)
           .text('Qty', leftMargin + contentWidth * 0.55, yPos + 8)
           .text('Rate', leftMargin + contentWidth * 0.68, yPos + 8)
           .text('Amount', leftMargin + contentWidth * 0.85, yPos + 8);

        yPos += 25;

        // Labor row (if applicable)
        if (laborTotal > 0) {
          doc.fontSize(10)
             .font('Helvetica')
             .fillColor(darkGray)
             .text(`Labor (${laborHours} hrs @ $${laborRate.toFixed(2)}/hr)`, leftMargin + 10, yPos + 5, { width: contentWidth * 0.5 })
             .text('1', leftMargin + contentWidth * 0.55, yPos + 5)
             .text(`$${laborTotal.toFixed(2)}`, leftMargin + contentWidth * 0.68, yPos + 5)
             .text(`$${laborTotal.toFixed(2)}`, leftMargin + contentWidth * 0.85, yPos + 5);

          yPos += 25;
          doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).stroke(borderGray);
        }

        // Table rows
        items.forEach((item, index) => {
          if (yPos > doc.page.height - 150) {
            doc.addPage();
            yPos = 50;
          }

          const amount = item.amount || ((item.quantity || 1) * (item.rate || item.price || 0));

          doc.fontSize(10)
             .font('Helvetica')
             .fillColor(darkGray)
             .text(item.description || item.name || 'Item', leftMargin + 10, yPos + 5, { width: contentWidth * 0.5 })
             .text(item.quantity || 1, leftMargin + contentWidth * 0.55, yPos + 5)
             .text(`$${parseFloat(item.rate || item.price || 0).toFixed(2)}`, leftMargin + contentWidth * 0.68, yPos + 5)
             .text(`$${parseFloat(amount).toFixed(2)}`, leftMargin + contentWidth * 0.85, yPos + 5);

          yPos += 25;
          
          // Row divider
          doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).stroke(borderGray);
        });

        yPos += 10;
      }

      // Total section
      yPos += 20;
      doc.moveTo(leftMargin + contentWidth * 0.6, yPos).lineTo(rightMargin, yPos).lineWidth(2).stroke(darkGray);
      yPos += 15;

      const isPartial = invoice.status === 'Partial' && invoice.amountPaid > 0 && invoice.balance != null;

      if (isPartial) {
        const subtotalAmount = parseFloat(invoice.total || invoice.amount || 0);
        const depositPaid = parseFloat(invoice.amountPaid || 0);
        const balanceDue = parseFloat(invoice.balance || 0);

        // Subtotal row
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor(mediumGray)
           .text('Subtotal:', leftMargin + contentWidth * 0.6, yPos);
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor(darkGray)
           .text(`$${subtotalAmount.toFixed(2)}`, leftMargin, yPos, { width: contentWidth, align: 'right' });

        yPos += 20;

        // Deposit received row
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#10b981')
           .text('Deposit Received:', leftMargin + contentWidth * 0.6, yPos);
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#10b981')
           .text(`-$${depositPaid.toFixed(2)}`, leftMargin, yPos, { width: contentWidth, align: 'right' });

        yPos += 15;
        doc.moveTo(leftMargin + contentWidth * 0.6, yPos).lineTo(rightMargin, yPos).lineWidth(1).stroke(borderGray);
        yPos += 10;

        // Balance due row
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('BALANCE DUE:', leftMargin + contentWidth * 0.6, yPos);
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text(`$${balanceDue.toFixed(2)}`, leftMargin, yPos - 3, { width: contentWidth, align: 'right' });
      } else if (isPaid) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('TOTAL:', leftMargin + contentWidth * 0.6, yPos);

        const paidTotalAmount = `$${parseFloat(invoice.total || invoice.amount || 0).toFixed(2)}`;
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text(paidTotalAmount, leftMargin, yPos - 3, { width: contentWidth, align: 'right' });

        yPos += 30;
        doc.moveTo(leftMargin + contentWidth * 0.6, yPos).lineTo(rightMargin, yPos).lineWidth(2).stroke('#10b981');
        yPos += 15;
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#10b981')
           .text('AMOUNT DUE:', leftMargin + contentWidth * 0.6, yPos);
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor('#10b981')
           .text('$0.00', leftMargin, yPos - 3, { width: contentWidth, align: 'right' });
      } else {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('TOTAL:', leftMargin + contentWidth * 0.6, yPos);

        const totalAmount = `$${parseFloat(invoice.total || invoice.amount || 0).toFixed(2)}`;
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text(totalAmount, leftMargin, yPos - 3, { width: contentWidth, align: 'right' });
      }

      // Notes
      if (invoice.notes) {
        yPos += 50;
        
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Notes:', leftMargin, yPos);

        yPos += 15;
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(lightGray)
           .text(invoice.notes, leftMargin, yPos, { width: contentWidth });
      }

      // Site Photos section
      if (photoData.length > 0) {
        yPos += 40;

        if (yPos > doc.page.height - 150) {
          doc.addPage();
          yPos = 50;
        }

        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Site Photos', leftMargin, yPos);

        yPos += 20;

        const photoSize = (contentWidth - 10) / 2; // 2 columns, 10px gap
        let colIndex = 0;

        for (const photo of photoData) {
          if (yPos > doc.page.height - photoSize - 80) {
            doc.addPage();
            yPos = 50;
            colIndex = 0;
          }

          const xPos = colIndex === 0 ? leftMargin : leftMargin + photoSize + 10;

          try {
            doc.image(photo.buffer, xPos, yPos, {
              width: photoSize,
              height: photoSize,
              fit: [photoSize, photoSize],
              align: 'center',
              valign: 'center'
            });
          } catch (e) {
            console.error('Error rendering invoice photo in PDF:', e);
          }

          if (photo.note) {
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor(lightGray)
               .text(photo.note, xPos, yPos + photoSize + 4, { width: photoSize });
          }

          colIndex++;
          if (colIndex >= 2) {
            colIndex = 0;
            yPos += photoSize + (photo.note ? 28 : 14);
          }
        }

        // Advance if last row had only one photo
        if (colIndex === 1) {
          yPos += photoSize + 14;
        }
      }

      // ── Payment Methods Section ──────────────────────────────────────────
      // Helper: extract a human-readable detail line from a payment method object.
      // Handles both simple {name, url} and richer {type, handle, info, details, username} shapes.
      function pmDetail(method) {
        // Explicit detail fields first
        const detail =
          method.handle ||
          method.username ||
          method.info ||
          method.details ||
          method.accountInfo ||
          method.phone ||
          '';
        if (detail) return detail;

        // Non-http value (e.g. Zelle email/phone stored directly in url field)
        if (method.url && !method.url.startsWith('http')) return method.url;

        // Type-based fallback labels
        const type = (method.type || '').toLowerCase();
        if (type === 'cash')  return 'Cash accepted';
        if (type === 'check') return `Make checks payable to ${userInfo.businessName || userInfo.name || 'contractor'}`;
        if (type === 'zelle') return method.email || method.phone || '';

        // For http payment links (Venmo, PayPal, Cash App, Square, etc.)
        // extract a clean handle from the URL path rather than showing the raw URL.
        // e.g. https://venmo.com/u/zcfshr  → venmo.com/u/zcfshr  (strip https://)
        //      https://paypal.me/zcfshr    → paypal.me/zcfshr
        //      https://cash.app/$zcfshr    → cash.app/$zcfshr
        if (method.url) {
          try {
            const u = new URL(method.url);
            // Show host + path without the protocol, trimming trailing slash
            return (u.hostname + u.pathname).replace(/\/+$/, '');
          } catch (_) {
            return method.url;
          }
        }

        return '';
      }

      // Separate Stripe from other methods — Stripe gets its own QR/link section below
      const hasStripeSection = !isPaid && !!stripeUrl;
      const allMethods   = Array.isArray(paymentMethods) ? paymentMethods : [];
      const otherMethods = allMethods.filter(m => {
        const t = (m.type || m.name || '').toLowerCase();
        return !t.includes('stripe') && !t.includes('card');
      });

      if (otherMethods.length > 0) {
        yPos += 40;

        if (yPos > doc.page.height - 120) {
          doc.addPage();
          yPos = 50;
        }

        doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
        yPos += 18;

        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor(lightGray)
           .text('PAYMENT OPTIONS', leftMargin, yPos);

        yPos += 14;

        const colW = (contentWidth - 10) / 2;
        let pmColIndex = 0;

        otherMethods.forEach((method) => {
          const detail = pmDetail(method);
          const cardH = detail ? 52 : 36;

          if (yPos > doc.page.height - cardH - 20) {
            doc.addPage();
            yPos = 50;
            pmColIndex = 0;
          }

          const pmX = pmColIndex === 0 ? leftMargin : leftMargin + colW + 10;

          // Card background with left accent bar
          doc.rect(pmX, yPos, colW, cardH).fill(bgGray);
          doc.rect(pmX, yPos, 3, cardH).fill('#10b981'); // green accent

          doc.fontSize(10)
             .font('Helvetica-Bold')
             .fillColor(darkGray)
             .text(method.name || method.type || '', pmX + 12, yPos + (detail ? 9 : 13), { width: colW - 22 });

          if (detail) {
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor(mediumGray)
               .text(detail, pmX + 12, yPos + 27, { width: colW - 22, ellipsis: true });
          }

          pmColIndex++;
          if (pmColIndex >= 2) {
            pmColIndex = 0;
            yPos += cardH + 8;
          }
        });

        // Advance if last row had only one card
        if (pmColIndex === 1) yPos += (pmDetail(otherMethods[otherMethods.length - 1]) ? 52 : 36) + 8;
      }

      // ── Stripe / Pay Online Section ──────────────────────────────────────
      if (hasStripeSection) {
        yPos += 30;

        if (yPos > doc.page.height - 150) {
          doc.addPage();
          yPos = 50;
        }

        doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
        yPos += 18;

        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor(lightGray)
           .text('PAY BY CARD', leftMargin, yPos);

        yPos += 14;

        if (qrBuffer) {
          // ── QR + text layout ────────────────────────────────────────────
          const qrSize = 100;
          const sectionH = qrSize + 10;

          // Light background panel
          doc.rect(leftMargin, yPos, contentWidth, sectionH + 10).fill('#f0fdf4');
          doc.rect(leftMargin, yPos, 3, sectionH + 10).fill('#10b981');

          try {
            doc.image(qrBuffer, leftMargin + 14, yPos + 8, { width: qrSize, height: qrSize });
          } catch (e) {
            console.error('Error rendering QR code in PDF:', e);
          }

          const qrTextX = leftMargin + qrSize + 28;
          const qrTextWidth = contentWidth - qrSize - 32;

          doc.fontSize(13)
             .font('Helvetica-Bold')
             .fillColor(darkGray)
             .text('Pay Securely Online', qrTextX, yPos + 14, { width: qrTextWidth });

          doc.fontSize(9)
             .font('Helvetica')
             .fillColor(mediumGray)
             .text('Scan the QR code with your phone\ncamera to pay by credit or debit card.', qrTextX, yPos + 36, { width: qrTextWidth });

          doc.fontSize(9)
             .font('Helvetica-Bold')
             .fillColor('#4f46e5')
             .text('\u27a4  Pay Here', qrTextX, yPos + 76, { width: qrTextWidth });

          yPos += sectionH + 20;
        } else {
          // ── URL-only fallback (QR fetch failed) ─────────────────────────
          const linkBoxH = 46;

          doc.rect(leftMargin, yPos, contentWidth, linkBoxH).fill('#f0fdf4');
          doc.rect(leftMargin, yPos, 3, linkBoxH).fill('#10b981');

          doc.fontSize(10)
             .font('Helvetica-Bold')
             .fillColor(darkGray)
             .text('Pay Securely Online', leftMargin + 14, yPos + 8, { width: contentWidth - 20 });

          doc.fontSize(9)
             .font('Helvetica-Bold')
             .fillColor('#4f46e5')
             .text('Visit the payment link in your invoice email to pay online.', leftMargin + 14, yPos + 26, { width: contentWidth - 20 });

          yPos += linkBoxH + 10;
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate PDF buffer for the estimate using PDFKit
 * Design matches the in-app preview with clean white style
 */
async function generateEstimatePDFBuffer(estimate, userInfo = {}) {
  // Fetch logo if available
  let logoBuffer = null;
  if (userInfo.companyLogo) {
    try {
      logoBuffer = await fetchImageBuffer(userInfo.companyLogo);
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  }

  // Fetch photo buffers
  const photoData = [];
  if (estimate.photos && estimate.photos.length > 0) {
    for (const photo of estimate.photos) {
      const url = typeof photo === 'string' ? photo : photo?.url || photo?.uri || photo?.downloadURL || null;
      if (url) {
        try {
          const buffer = await fetchImageBuffer(url);
          if (buffer) photoData.push({ buffer, note: typeof photo === 'object' ? photo.note || '' : '' });
        } catch (e) {
          console.error('Error fetching photo:', e);
        }
      }
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors matching in-app preview
      const darkGray = '#1f2937';
      const mediumGray = '#4b5563';
      const lightGray = '#6b7280';
      const borderGray = '#e5e7eb';
      const bgGray = '#f9fafb';

      let yPos = 50;
      const leftMargin = 50;
      const rightMargin = doc.page.width - 50;
      const contentWidth = doc.page.width - 100;

      // Header section - Logo and Company Info
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, leftMargin, yPos, { height: 80, fit: [160, 80] });
        } catch (e) {
          console.error('Error adding logo to PDF:', e);
        }
      }

      // Company info - right aligned
      doc.fontSize(22)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(userInfo.businessName || userInfo.company || 'Your Business Name', leftMargin, yPos, {
           width: contentWidth,
           align: 'right'
         });

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(lightGray)
         .text(userInfo.email || '', leftMargin, yPos + 25, {
           width: contentWidth,
           align: 'right'
         });

      if (userInfo.phone) {
        doc.text(userInfo.phone, leftMargin, yPos + 40, {
          width: contentWidth,
          align: 'right'
        });
      }

      let estHeaderContactY = 55;
      if (userInfo.address || userInfo.businessAddress) {
        doc.text(userInfo.address || userInfo.businessAddress, leftMargin, yPos + estHeaderContactY, {
          width: contentWidth,
          align: 'right'
        });
        estHeaderContactY += 15;
      }
      if (userInfo.licenseNumber) {
        doc.text(`Lic# ${userInfo.licenseNumber}`, leftMargin, yPos + estHeaderContactY, {
          width: contentWidth,
          align: 'right'
        });
        estHeaderContactY += 15;
      }

      yPos += Math.max(100, estHeaderContactY + 20);

      // Watermark (drawn behind content)
      const isAccepted = estimate.status === 'Accepted';
      if (isAccepted) drawWatermark(doc, 'ACCEPTED');

      // Divider
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).stroke(borderGray);
      yPos += 20;

      // ESTIMATE title and number
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text('ESTIMATE', leftMargin, yPos);

      if (estimate.estimateNumber) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text(`#${estimate.estimateNumber}`, leftMargin, yPos + 5, {
             width: contentWidth,
             align: 'right'
           });
      }

      yPos += 50;

      // Estimate info row
      const colWidth = contentWidth / 2;

      // Handle Firestore timestamp
      const estimateDate = estimate.createdAt?.seconds 
        ? new Date(estimate.createdAt.seconds * 1000)
        : estimate.createdAt 
          ? new Date(estimate.createdAt)
          : new Date();
      
      const validDate = new Date(estimateDate);
      validDate.setDate(validDate.getDate() + 30);

      // Left column - Estimate Name
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor(lightGray)
         .text('ESTIMATE NAME', leftMargin, yPos);
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(estimate.name || 'Untitled Estimate', leftMargin, yPos + 12);

      // Client info if available
      if (estimate.clientName || estimate.clientCompany) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(lightGray)
           .text('CLIENT', leftMargin, yPos + 35);

        let estClientY = yPos + 47;
        if (estimate.clientCompany) {
          doc.fontSize(11).font('Helvetica-Bold').fillColor(darkGray)
             .text(estimate.clientCompany, leftMargin, estClientY);
          estClientY += 16;
        }
        if (estimate.clientName) {
          doc.fontSize(11).font('Helvetica').fillColor(darkGray)
             .text(estimate.clientName, leftMargin, estClientY);
          estClientY += 16;
        }
        if (estimate.clientEmail) {
          doc.fontSize(9).font('Helvetica').fillColor(lightGray)
             .text(estimate.clientEmail, leftMargin, estClientY);
          estClientY += 13;
        }
        if (estimate.clientPhone) {
          doc.fontSize(9).font('Helvetica').fillColor(lightGray)
             .text(estimate.clientPhone, leftMargin, estClientY);
          estClientY += 13;
        }
        if (estimate.clientAddress) {
          doc.fontSize(9).font('Helvetica').fillColor(lightGray)
             .text(estimate.clientAddress, leftMargin, estClientY);
        }
      }

      // Right column - Dates
      const rightColX = leftMargin + colWidth;
      
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor(lightGray)
         .text('ESTIMATE DATE', rightColX, yPos, { width: colWidth, align: 'right' });
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(formatDate(estimateDate.toISOString().split('T')[0]), rightColX, yPos + 12, { width: colWidth, align: 'right' });

      doc.fontSize(9)
         .font('Helvetica')
         .fillColor(lightGray)
         .text('VALID UNTIL', rightColX, yPos + 35, { width: colWidth, align: 'right' });
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(formatDate(validDate.toISOString().split('T')[0]), rightColX, yPos + 47, { width: colWidth, align: 'right' });

      yPos += 80;

      // Divider
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).stroke(borderGray);
      yPos += 20;

      // Labor section
      if (estimate.laborHours && estimate.laborRate) {
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Labor', leftMargin, yPos);

        yPos += 15;

        // Labor row with background
        doc.rect(leftMargin, yPos, contentWidth, 30).fill(bgGray);
        
        const laborTotal = estimate.laborHours * estimate.laborRate;
        
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor(mediumGray)
           .text(`${estimate.laborHours} hours × $${parseFloat(estimate.laborRate).toFixed(2)}/hr`, leftMargin + 10, yPos + 10);

        doc.font('Helvetica-Bold')
           .fillColor(darkGray)
           .text(`$${laborTotal.toFixed(2)}`, leftMargin, yPos + 10, { width: contentWidth - 10, align: 'right' });

        yPos += 45;
      }

      // Materials section
      if (estimate.materials && estimate.materials.length > 0) {
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Materials', leftMargin, yPos);

        yPos += 15;

        // Table header
        doc.rect(leftMargin, yPos, contentWidth, 25).fill(bgGray);
        
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor(mediumGray)
           .text('Material', leftMargin + 10, yPos + 8)
           .text('Qty', leftMargin + contentWidth * 0.55, yPos + 8)
           .text('Cost', leftMargin + contentWidth * 0.68, yPos + 8)
           .text('Total', leftMargin + contentWidth * 0.85, yPos + 8);

        yPos += 25;

        // Material rows
        estimate.materials.forEach((material, index) => {
          if (yPos > doc.page.height - 150) {
            doc.addPage();
            yPos = 50;
          }

          const materialTotal = (material.quantity || 1) * (material.cost || 0);

          doc.fontSize(10)
             .font('Helvetica')
             .fillColor(darkGray)
             .text(material.name || 'Material', leftMargin + 10, yPos + 5, { width: contentWidth * 0.5 })
             .text(material.quantity || 1, leftMargin + contentWidth * 0.55, yPos + 5)
             .text(`$${parseFloat(material.cost || 0).toFixed(2)}`, leftMargin + contentWidth * 0.68, yPos + 5)
             .text(`$${materialTotal.toFixed(2)}`, leftMargin + contentWidth * 0.85, yPos + 5);

          yPos += 25;
          
          // Row divider
          doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).stroke(borderGray);
        });

        yPos += 15;
      }

      // Additional Items section
      if (estimate.additionalItems && estimate.additionalItems.length > 0) {
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Additional Items', leftMargin, yPos);

        yPos += 15;

        estimate.additionalItems.forEach((item) => {
          if (yPos > doc.page.height - 150) {
            doc.addPage();
            yPos = 50;
          }

          doc.fontSize(10)
             .font('Helvetica')
             .fillColor(mediumGray)
             .text(item.description || 'Item', leftMargin + 10, yPos);

          doc.font('Helvetica-Bold')
             .fillColor(darkGray)
             .text(`$${parseFloat(item.amount || 0).toFixed(2)}`, leftMargin, yPos, { width: contentWidth - 10, align: 'right' });

          yPos += 25;
        });

        yPos += 10;
      }

      // Total section
      yPos += 10;
      doc.moveTo(leftMargin + contentWidth * 0.6, yPos).lineTo(rightMargin, yPos).lineWidth(2).stroke(darkGray);
      yPos += 15;

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text('TOTAL ESTIMATE:', leftMargin + contentWidth * 0.5, yPos);

      const totalAmount = `$${parseFloat(estimate.total || 0).toFixed(2)}`;
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(totalAmount, leftMargin, yPos - 3, { width: contentWidth, align: 'right' });

      // Deposit section
      if (estimate.requireDeposit && estimate.depositAmount) {
        yPos += 35;

        const depositLabel = estimate.depositType === 'percent'
          ? `${estimate.depositValue}% deposit required at acceptance`
          : `$${parseFloat(estimate.depositValue).toFixed(2)} deposit required at acceptance`;

        // Amber highlight box
        doc.rect(leftMargin + contentWidth * 0.4, yPos, contentWidth * 0.6, 30)
           .fill('#fffbeb');

        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#92400e')
           .text('Deposit Required:', leftMargin + contentWidth * 0.42, yPos + 9);

        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#92400e')
           .text(`$${parseFloat(estimate.depositAmount).toFixed(2)}`, leftMargin, yPos + 9, { width: contentWidth - 10, align: 'right' });

        yPos += 35;

        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#b45309')
           .text(depositLabel, leftMargin, yPos, { width: contentWidth, align: 'right' });
      }

      // Notes
      if (estimate.notes) {
        yPos += 50;
        
        if (yPos > doc.page.height - 100) {
          doc.addPage();
          yPos = 50;
        }

        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Notes:', leftMargin, yPos);

        yPos += 15;
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(lightGray)
           .text(estimate.notes, leftMargin, yPos, { width: contentWidth });
      }

      // Terms
      if (estimate.terms || userInfo.estimateTerms) {
        yPos += 40;
        
        if (yPos > doc.page.height - 100) {
          doc.addPage();
          yPos = 50;
        }

        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Terms & Conditions:', leftMargin, yPos);

        yPos += 15;
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor(lightGray)
           .text(estimate.terms || userInfo.estimateTerms, leftMargin, yPos, { width: contentWidth });
      }

      // Contract / Disclaimer + Signature block
      if (estimate.includeContract && estimate.contractText) {
        yPos += 40;

        if (yPos > doc.page.height - 100) {
          doc.addPage();
          yPos = 50;
        }

        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Contract / Disclaimer:', leftMargin, yPos);

        yPos += 15;
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor(lightGray)
           .text(estimate.contractText, leftMargin, yPos, { width: contentWidth });

        yPos += doc.heightOfString(estimate.contractText, { width: contentWidth }) + 10;

        // Signature block — force new page if not enough room (need ~160pt)
        if (yPos > doc.page.height - 180) {
          doc.addPage();
          yPos = 50;
        }

        yPos += 30;

        // Divider
        doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
        yPos += 20;

        // Agreement line
        doc.fontSize(9)
           .font('Helvetica-Oblique')
           .fillColor(mediumGray)
           .text('By signing below, I agree to the terms and conditions outlined above.', leftMargin, yPos, { width: contentWidth });

        yPos += 36;

        // Signature lines — 3 columns: Signature (wide), Printed Name (wide), Date (narrow)
        const sigGap = 24;
        const sigWidth = (contentWidth - sigGap * 2) * 0.38;
        const nameWidth = (contentWidth - sigGap * 2) * 0.38;
        const dateWidth = contentWidth - sigWidth - nameWidth - sigGap * 2;

        const sigX = leftMargin;
        const nameX = sigX + sigWidth + sigGap;
        const dateX = nameX + nameWidth + sigGap;

        // Signature
        doc.moveTo(sigX, yPos).lineTo(sigX + sigWidth, yPos).lineWidth(0.75).stroke(darkGray);
        doc.fontSize(8).font('Helvetica').fillColor(lightGray)
           .text('CLIENT SIGNATURE', sigX, yPos + 6);

        // Printed Name
        doc.moveTo(nameX, yPos).lineTo(nameX + nameWidth, yPos).lineWidth(0.75).stroke(darkGray);
        doc.fontSize(8).font('Helvetica').fillColor(lightGray)
           .text('PRINTED NAME', nameX, yPos + 6);

        // Date
        doc.moveTo(dateX, yPos).lineTo(dateX + dateWidth, yPos).lineWidth(0.75).stroke(darkGray);
        doc.fontSize(8).font('Helvetica').fillColor(lightGray)
           .text('DATE', dateX, yPos + 6);

        yPos += 30;
      }

      // If already e-signed, show the recorded signature instead of blank lines
      if (estimate.signatureName) {
        if (yPos > doc.page.height - 120) {
          doc.addPage();
          yPos = 50;
        }

        yPos += 20;
        doc.rect(leftMargin, yPos, contentWidth, 64).fill('#f0fdf4');
        doc.rect(leftMargin, yPos, contentWidth, 64).lineWidth(0.5).stroke('#bbf7d0');

        doc.fontSize(8).font('Helvetica-Bold').fillColor('#166534')
           .text('ELECTRONICALLY SIGNED', leftMargin + 14, yPos + 12);

        doc.fontSize(12).font('Helvetica-Bold').fillColor(darkGray)
           .text(estimate.signatureName, leftMargin + 14, yPos + 26);

        const sigDateStr = estimate.signatureTimestampISO
          ? new Date(estimate.signatureTimestampISO).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
          : 'Date on record';
        doc.fontSize(9).font('Helvetica').fillColor(lightGray)
           .text(sigDateStr, leftMargin + 14, yPos + 44);

        yPos += 80;
      }

      // Photos section
      if (photoData.length > 0) {
        yPos += 40;

        if (yPos > doc.page.height - 150) {
          doc.addPage();
          yPos = 50;
        }

        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor(darkGray)
           .text('Site Photos', leftMargin, yPos);

        yPos += 20;

        const photoSize = (contentWidth - 10) / 2; // 2 columns, 10px gap
        let colIndex = 0;

        for (const photo of photoData) {
          if (yPos > doc.page.height - photoSize - 80) {
            doc.addPage();
            yPos = 50;
            colIndex = 0;
          }

          const xPos = colIndex === 0 ? leftMargin : leftMargin + photoSize + 10;

          try {
            doc.image(photo.buffer, xPos, yPos, {
              width: photoSize,
              height: photoSize,
              fit: [photoSize, photoSize],
              align: 'center',
              valign: 'center'
            });
          } catch (e) {
            console.error('Error rendering photo in PDF:', e);
          }

          if (photo.note) {
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor(lightGray)
               .text(photo.note, xPos, yPos + photoSize + 4, { width: photoSize });
          }

          colIndex++;
          if (colIndex >= 2) {
            colIndex = 0;
            yPos += photoSize + (photo.note ? 28 : 14);
          }
        }

        // Advance if last row had only one photo
        if (colIndex === 1) {
          yPos += photoSize + 14;
        }
      }


      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateInvoicePDFBuffer,
  generateEstimatePDFBuffer
};