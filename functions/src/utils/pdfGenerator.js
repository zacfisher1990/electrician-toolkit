/**
 * PDF Generation Utilities
 * Functions to generate PDF buffers for invoices and estimates using PDFKit
 */

const PDFDocument = require('pdfkit');
const https = require('https');
const http = require('http');

async function fetchImageBuffer(url) {
  return new Promise((resolve, reject) => {
    if (!url) { resolve(null); return; }
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        fetchImageBuffer(response.headers.location).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) { resolve(null); return; }
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', () => resolve(null));
    }).on('error', () => resolve(null));
  });
}

function drawWatermark(doc, text, color = '#10b981') {
  const pageWidth  = doc.page.width;
  const pageHeight = doc.page.height;
  doc.save();
  doc.translate(pageWidth / 2, pageHeight / 2);
  doc.rotate(-35);
  // Set font before measuring so widthOfString is accurate
  doc.fontSize(90).font('Helvetica-Bold');
  const tw = doc.widthOfString(text);
  // Manually center with -tw/2 — align:'center' is unreliable in transformed space
  doc.fillColor(color).fillOpacity(0.08)
     .text(text, -tw / 2, -45, { lineBreak: false });
  doc.rect(-tw / 2 - 20, -55, tw + 40, 100).lineWidth(8).strokeColor(color).strokeOpacity(0.08).stroke();
  doc.restore();
  doc.fillOpacity(1).strokeOpacity(1);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const str = String(dateStr).split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Shared compact header — logo left, contact right. Returns yPos after header.
function drawHeader(doc, logoBuffer, userInfo, leftMargin, rightMargin, contentWidth) {
  const darkGray  = '#1f2937';
  const lightGray = '#6b7280';
  const yPos = 36;

  if (logoBuffer) {
    try { doc.image(logoBuffer, leftMargin, yPos, { height: 50, fit: [110, 50] }); }
    catch (e) { console.error('Logo error:', e); }
  }

  doc.fontSize(16).font('Helvetica-Bold').fillColor(darkGray)
     .text(userInfo.businessName || userInfo.company || 'Your Business Name',
           leftMargin, yPos, { width: contentWidth, align: 'right' });

  let contactY = yPos + 20;
  const contactLines = [
    userInfo.email,
    userInfo.phone,
    userInfo.address || userInfo.businessAddress,
    userInfo.licenseNumber ? `Lic# ${userInfo.licenseNumber}` : null,
  ].filter(Boolean);

  contactLines.forEach(line => {
    doc.fontSize(9).font('Helvetica').fillColor(lightGray)
       .text(line, leftMargin, contactY, { width: contentWidth, align: 'right' });
    contactY += 13;
  });

  return Math.max(yPos + 70, contactY + 10);
}

// Shared line items renderer — 2-column style matching HTML PDFs.
// Handles new schema (type/unitPrice) and falls back to legacy (rate).
function renderLineItems(doc, lineItems, leftMargin, rightMargin, contentWidth, startY) {
  const darkGray   = '#1f2937';
  const lightGray  = '#6b7280';
  const borderGray = '#e5e7eb';
  const bgGray     = '#f9fafb';
  let yPos = startY;

  lineItems.forEach(item => {
    if (yPos > doc.page.height - 100) { doc.addPage(); yPos = 50; }

    if (item.type === 'section') {
      doc.rect(leftMargin, yPos, contentWidth, 20).fill(bgGray);
      doc.fontSize(8).font('Helvetica-Bold').fillColor(lightGray)
         .text((item.title || '').toUpperCase(), leftMargin + 10, yPos + 6);
      yPos += 20;
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
    } else {
      const qty   = parseFloat(item.quantity) || 1;
      const price = parseFloat(item.unitPrice != null ? item.unitPrice : item.rate) || 0;
      const total = qty * price;
      const hasSubLine = qty !== 1;
      const rowH = hasSubLine ? 34 : 22;

      doc.fontSize(10).font('Helvetica').fillColor(darkGray)
         .text(item.description || '', leftMargin + 10, yPos + 5, { width: contentWidth * 0.72, lineBreak: false });

      if (hasSubLine) {
        const qtyDisplay = qty % 1 === 0 ? qty.toFixed(0) : qty.toFixed(2);
        doc.fontSize(8).font('Helvetica').fillColor(lightGray)
           .text(`${qtyDisplay} x $${price.toFixed(2)}`, leftMargin + 10, yPos + 19);
      }

      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkGray)
         .text(`$${total.toFixed(2)}`, leftMargin, yPos + 5, { width: contentWidth - 10, align: 'right' });

      yPos += rowH;
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
    }
  });

  return yPos;
}

// Build normalised lineItems from invoice (new or legacy schema)
function normaliseInvoiceLineItems(invoice) {
  const raw = invoice.lineItems || [];
  if (raw.length > 0 && (raw[0].type === 'item' || raw[0].type === 'section')) return raw;
  const items = [];
  const laborHours = parseFloat(invoice.laborHours || 0);
  const laborRate  = parseFloat(invoice.laborRate  || 0);
  if (laborHours > 0 && laborRate > 0)
    items.push({ type: 'item', description: 'Labor', quantity: laborHours, unitPrice: laborRate });
  raw.forEach(i => items.push({ type: 'item', description: i.description || '', quantity: i.quantity || 1, unitPrice: i.rate || i.price || 0 }));
  (invoice.additionalItems || []).forEach(i => items.push({ type: 'item', description: i.description || '', quantity: 1, unitPrice: parseFloat(i.amount) || 0 }));
  return items;
}

// Build normalised lineItems from estimate (new or legacy schema)
function normaliseEstimateLineItems(estimate) {
  const raw = estimate.lineItems || [];
  if (raw.length > 0 && (raw[0].type === 'item' || raw[0].type === 'section')) return raw;
  const items = [];
  if (estimate.laborHours && estimate.laborRate)
    items.push({ type: 'item', description: 'Labor', quantity: parseFloat(estimate.laborHours), unitPrice: parseFloat(estimate.laborRate) });
  (estimate.materials || []).forEach(m => items.push({ type: 'item', description: m.name || 'Material', quantity: parseFloat(m.quantity) || 1, unitPrice: parseFloat(m.cost) || 0 }));
  (estimate.additionalItems || []).forEach(i => items.push({ type: 'item', description: i.description || 'Item', quantity: 1, unitPrice: parseFloat(i.amount) || 0 }));
  return items;
}

// ─────────────────────────────────────────────────────────────────────────────
// Invoice PDF Buffer
// ─────────────────────────────────────────────────────────────────────────────

async function generateInvoicePDFBuffer(invoice, userInfo = {}, paymentMethods = [], paymentLinkUrl = '') {
  let logoBuffer = null;
  if (userInfo.companyLogo) {
    try { logoBuffer = await fetchImageBuffer(userInfo.companyLogo); } catch (e) {}
  }

  let qrBuffer = null;
  const stripeUrl = paymentLinkUrl || invoice.paymentLinkUrl || '';
  if (stripeUrl && invoice.status !== 'Paid') {
    try {
      qrBuffer = await fetchImageBuffer(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(stripeUrl)}&margin=6&color=1f2937`);
    } catch (e) {}
  }

  const photoData = [];
  for (const photo of (invoice.photos || [])) {
    const url = typeof photo === 'string' ? photo : photo?.url || photo?.uri || photo?.downloadURL || null;
    if (url) {
      try {
        const buffer = await fetchImageBuffer(url);
        if (buffer) photoData.push({ buffer, note: typeof photo === 'object' ? photo.note || '' : '' });
      } catch (e) {}
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'LETTER' });
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const darkGray   = '#1f2937';
      const mediumGray = '#4b5563';
      const lightGray  = '#6b7280';
      const borderGray = '#e5e7eb';
      const bgGray     = '#f9fafb';
      const leftMargin   = 40;
      const rightMargin  = doc.page.width - 40;
      const contentWidth = doc.page.width - 80;

      // Header
      let yPos = drawHeader(doc, logoBuffer, userInfo, leftMargin, rightMargin, contentWidth);
      const isPaid = invoice.status === 'Paid';
      if (isPaid) drawWatermark(doc, 'PAID');
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
      yPos += 14;

      // Title
      doc.fontSize(22).font('Helvetica-Bold').fillColor(darkGray).text('INVOICE', leftMargin, yPos);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(darkGray)
         .text(`#${invoice.invoiceNumber || 'N/A'}`, leftMargin, yPos + 4, { width: contentWidth, align: 'right' });
      yPos += 38;

      // Meta
      const colWidth   = contentWidth / 2;
      const rightColX  = leftMargin + colWidth;
      const metaStartY = yPos;

      doc.fontSize(8).font('Helvetica').fillColor(lightGray).text('BILL TO', leftMargin, yPos);
      let clientY = yPos + 12;
      if (invoice.clientCompany) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor(darkGray).text(invoice.clientCompany, leftMargin, clientY);
        clientY += 14;
      }
      if (invoice.clientName || invoice.client) {
        doc.fontSize(11).font('Helvetica').fillColor(darkGray).text(invoice.clientName || invoice.client, leftMargin, clientY);
        clientY += 14;
      }
      [invoice.clientEmail, invoice.clientPhone, invoice.clientAddress].filter(Boolean).forEach(line => {
        doc.fontSize(9).font('Helvetica').fillColor(lightGray).text(line, leftMargin, clientY);
        clientY += 12;
      });

      doc.fontSize(8).font('Helvetica').fillColor(lightGray).text('INVOICE DATE', rightColX, metaStartY, { width: colWidth, align: 'right' });
      doc.fontSize(11).font('Helvetica-Bold').fillColor(darkGray)
         .text(invoice.date ? formatDate(invoice.date) : new Date().toLocaleDateString(), rightColX, metaStartY + 12, { width: colWidth, align: 'right' });
      doc.fontSize(8).font('Helvetica').fillColor(lightGray).text('DUE DATE', rightColX, metaStartY + 32, { width: colWidth, align: 'right' });
      doc.fontSize(11).font('Helvetica-Bold').fillColor(darkGray)
         .text(invoice.dueDate ? formatDate(invoice.dueDate) : 'Upon Receipt', rightColX, metaStartY + 44, { width: colWidth, align: 'right' });

      // Status badge
      const statusColors = { Paid: '#10b981', Pending: '#f59e0b', Overdue: '#ef4444' };
      const statusColor  = statusColors[invoice.status] || lightGray;
      const statusText   = invoice.status || 'Pending';
      const statusW      = doc.widthOfString(statusText, { fontSize: 9 }) + 16;
      doc.rect(rightMargin - statusW, metaStartY + 66, statusW, 18).fill(statusColor);
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff').text(statusText, rightMargin - statusW + 8, metaStartY + 71);

      yPos = Math.max(clientY, metaStartY + 90) + 12;
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
      yPos += 14;

      // Line items
      const lineItems = normaliseInvoiceLineItems(invoice);
      if (lineItems.length > 0) yPos = renderLineItems(doc, lineItems, leftMargin, rightMargin, contentWidth, yPos);

      // Total
      yPos += 14;
      doc.moveTo(leftMargin + contentWidth * 0.55, yPos).lineTo(rightMargin, yPos).lineWidth(2).stroke(darkGray);
      yPos += 12;

      const isPartial = invoice.status === 'Partial' && invoice.amountPaid > 0 && invoice.balance != null;
      const totalAmt  = parseFloat(invoice.total || invoice.amount || 0);

      if (isPartial) {
        doc.fontSize(10).font('Helvetica').fillColor(mediumGray).text('Subtotal:', leftMargin + contentWidth * 0.55, yPos);
        doc.fontSize(10).font('Helvetica').fillColor(darkGray).text(`$${totalAmt.toFixed(2)}`, leftMargin, yPos, { width: contentWidth, align: 'right' });
        yPos += 18;
        doc.fontSize(10).font('Helvetica').fillColor('#10b981').text('Deposit Received:', leftMargin + contentWidth * 0.55, yPos);
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#10b981').text(`-$${parseFloat(invoice.amountPaid||0).toFixed(2)}`, leftMargin, yPos, { width: contentWidth, align: 'right' });
        yPos += 14;
        doc.moveTo(leftMargin + contentWidth * 0.55, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
        yPos += 10;
        doc.fontSize(12).font('Helvetica-Bold').fillColor(darkGray).text('BALANCE DUE:', leftMargin + contentWidth * 0.55, yPos);
        doc.fontSize(18).font('Helvetica-Bold').fillColor(darkGray).text(`$${parseFloat(invoice.balance||0).toFixed(2)}`, leftMargin, yPos - 3, { width: contentWidth, align: 'right' });
      } else if (isPaid) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor(darkGray).text('TOTAL:', leftMargin + contentWidth * 0.55, yPos);
        doc.fontSize(18).font('Helvetica-Bold').fillColor(darkGray).text(`$${totalAmt.toFixed(2)}`, leftMargin, yPos - 3, { width: contentWidth, align: 'right' });
        yPos += 28;
        doc.moveTo(leftMargin + contentWidth * 0.55, yPos).lineTo(rightMargin, yPos).lineWidth(2).stroke('#10b981');
        yPos += 12;
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#10b981').text('AMOUNT DUE:', leftMargin + contentWidth * 0.55, yPos);
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#10b981').text('$0.00', leftMargin, yPos - 3, { width: contentWidth, align: 'right' });
      } else {
        doc.fontSize(12).font('Helvetica-Bold').fillColor(darkGray).text('TOTAL:', leftMargin + contentWidth * 0.55, yPos);
        doc.fontSize(18).font('Helvetica-Bold').fillColor(darkGray).text(`$${totalAmt.toFixed(2)}`, leftMargin, yPos - 3, { width: contentWidth, align: 'right' });
      }

      // Notes
      if (invoice.notes) {
        yPos += 40;
        doc.fontSize(10).font('Helvetica-Bold').fillColor(darkGray).text('Notes', leftMargin, yPos);
        yPos += 14;
        doc.fontSize(9).font('Helvetica').fillColor(lightGray).text(invoice.notes, leftMargin, yPos, { width: contentWidth });
        yPos += doc.heightOfString(invoice.notes, { width: contentWidth }) + 4;
      }

      // Site Photos
      if (photoData.length > 0) {
        yPos += 30;
        if (yPos > doc.page.height - 150) { doc.addPage(); yPos = 50; }
        doc.fontSize(10).font('Helvetica-Bold').fillColor(darkGray).text('Site Photos', leftMargin, yPos);
        yPos += 16;
        const photoSize = (contentWidth - 10) / 2;
        let colIndex = 0;
        for (const photo of photoData) {
          if (yPos > doc.page.height - photoSize - 80) { doc.addPage(); yPos = 50; colIndex = 0; }
          const xPos = colIndex === 0 ? leftMargin : leftMargin + photoSize + 10;
          try { doc.image(photo.buffer, xPos, yPos, { width: photoSize, height: photoSize, fit: [photoSize, photoSize], align: 'center', valign: 'center' }); } catch (e) {}
          if (photo.note) doc.fontSize(8).font('Helvetica').fillColor(lightGray).text(photo.note, xPos, yPos + photoSize + 4, { width: photoSize });
          colIndex++;
          if (colIndex >= 2) { colIndex = 0; yPos += photoSize + (photo.note ? 28 : 14); }
        }
        if (colIndex === 1) yPos += photoSize + 14;
      }

      // Payment Methods
      function pmDetail(method) {
        const d = method.handle || method.username || method.info || method.details || method.accountInfo || method.phone || '';
        if (d) return d;
        if (method.url && !method.url.startsWith('http')) return method.url;
        const t = (method.type || '').toLowerCase();
        if (t === 'cash') return 'Cash accepted';
        if (t === 'check') return `Make checks payable to ${userInfo.businessName || 'contractor'}`;
        if (method.url) { try { const u = new URL(method.url); return (u.hostname + u.pathname).replace(/\/+$/, ''); } catch (_) { return method.url; } }
        return '';
      }
      const otherMethods = (Array.isArray(paymentMethods) ? paymentMethods : [])
        .filter(m => !((m.type || m.name || '').toLowerCase().includes('stripe') || (m.type || m.name || '').toLowerCase().includes('card')));

      if (otherMethods.length > 0) {
        yPos += 36;
        if (yPos > doc.page.height - 120) { doc.addPage(); yPos = 50; }
        doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
        yPos += 16;
        doc.fontSize(9).font('Helvetica-Bold').fillColor(lightGray).text('PAYMENT OPTIONS', leftMargin, yPos);
        yPos += 12;
        const colW = (contentWidth - 10) / 2;
        let pmColIndex = 0;
        otherMethods.forEach(method => {
          const detail = pmDetail(method);
          const cardH  = detail ? 50 : 34;
          if (yPos > doc.page.height - cardH - 20) { doc.addPage(); yPos = 50; pmColIndex = 0; }
          const pmX = pmColIndex === 0 ? leftMargin : leftMargin + colW + 10;
          doc.rect(pmX, yPos, colW, cardH).fill(bgGray);
          doc.rect(pmX, yPos, 3, cardH).fill('#10b981');
          doc.fontSize(10).font('Helvetica-Bold').fillColor(darkGray).text(method.name || method.type || '', pmX + 12, yPos + (detail ? 8 : 12), { width: colW - 22 });
          if (detail) doc.fontSize(8).font('Helvetica').fillColor(mediumGray).text(detail, pmX + 12, yPos + 26, { width: colW - 22, ellipsis: true });
          pmColIndex++;
          if (pmColIndex >= 2) { pmColIndex = 0; yPos += cardH + 8; }
        });
        if (pmColIndex === 1) yPos += (pmDetail(otherMethods[otherMethods.length - 1]) ? 50 : 34) + 8;
      }

      // Stripe QR
      if (!isPaid && stripeUrl) {
        yPos += 28;
        if (yPos > doc.page.height - 150) { doc.addPage(); yPos = 50; }
        doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
        yPos += 16;
        doc.fontSize(9).font('Helvetica-Bold').fillColor(lightGray).text('PAY BY CARD', leftMargin, yPos);
        yPos += 12;
        if (qrBuffer) {
          const qrSize = 100;
          doc.rect(leftMargin, yPos, contentWidth, qrSize + 20).fill('#f0fdf4');
          doc.rect(leftMargin, yPos, 3, qrSize + 20).fill('#10b981');
          try { doc.image(qrBuffer, leftMargin + 14, yPos + 10, { width: qrSize, height: qrSize }); } catch (e) {}
          const tx = leftMargin + qrSize + 28;
          const tw = contentWidth - qrSize - 32;
          doc.fontSize(13).font('Helvetica-Bold').fillColor(darkGray).text('Pay Securely Online', tx, yPos + 14, { width: tw });
          doc.fontSize(9).font('Helvetica').fillColor(mediumGray).text('Scan the QR code with your phone\ncamera to pay by credit or debit card.', tx, yPos + 34, { width: tw });
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#4f46e5').text('\u27a4  Pay Here', tx, yPos + 74, { width: tw });
          yPos += qrSize + 30;
        } else {
          doc.rect(leftMargin, yPos, contentWidth, 46).fill('#f0fdf4');
          doc.rect(leftMargin, yPos, 3, 46).fill('#10b981');
          doc.fontSize(10).font('Helvetica-Bold').fillColor(darkGray).text('Pay Securely Online', leftMargin + 14, yPos + 8, { width: contentWidth - 20 });
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#4f46e5').text('Visit the payment link in your invoice email to pay online.', leftMargin + 14, yPos + 26, { width: contentWidth - 20 });
          yPos += 56;
        }
      }

      doc.end();
    } catch (error) { reject(error); }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Estimate PDF Buffer
// ─────────────────────────────────────────────────────────────────────────────

async function generateEstimatePDFBuffer(estimate, userInfo = {}) {
  let logoBuffer = null;
  if (userInfo.companyLogo) {
    try { logoBuffer = await fetchImageBuffer(userInfo.companyLogo); } catch (e) {}
  }

  const photoData = [];
  for (const photo of (estimate.photos || [])) {
    const url = typeof photo === 'string' ? photo : photo?.url || photo?.uri || photo?.downloadURL || null;
    if (url) {
      try {
        const buffer = await fetchImageBuffer(url);
        if (buffer) photoData.push({ buffer, note: typeof photo === 'object' ? photo.note || '' : '' });
      } catch (e) {}
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'LETTER' });
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const darkGray   = '#1f2937';
      const mediumGray = '#4b5563';
      const lightGray  = '#6b7280';
      const borderGray = '#e5e7eb';
      const bgGray     = '#f9fafb';
      const leftMargin   = 40;
      const rightMargin  = doc.page.width - 40;
      const contentWidth = doc.page.width - 80;

      // Header
      let yPos = drawHeader(doc, logoBuffer, userInfo, leftMargin, rightMargin, contentWidth);
      const isAccepted = estimate.status === 'Accepted';
      if (isAccepted) drawWatermark(doc, 'ACCEPTED');
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
      yPos += 14;

      // Title
      doc.fontSize(22).font('Helvetica-Bold').fillColor(darkGray).text('ESTIMATE', leftMargin, yPos);
      if (estimate.estimateNumber) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor(darkGray)
           .text(`#${estimate.estimateNumber}`, leftMargin, yPos + 4, { width: contentWidth, align: 'right' });
      }
      yPos += 38;

      // Meta
      const colWidth   = contentWidth / 2;
      const rightColX  = leftMargin + colWidth;
      const metaStartY = yPos;

      doc.fontSize(8).font('Helvetica').fillColor(lightGray).text('ESTIMATE NAME', leftMargin, yPos);
      doc.fontSize(11).font('Helvetica-Bold').fillColor(darkGray).text(estimate.name || 'Untitled Estimate', leftMargin, yPos + 12);

      let clientY = yPos + 32;
      if (estimate.clientName || estimate.clientCompany) {
        doc.fontSize(8).font('Helvetica').fillColor(lightGray).text('CLIENT', leftMargin, clientY);
        clientY += 12;
        if (estimate.clientCompany) {
          doc.fontSize(11).font('Helvetica-Bold').fillColor(darkGray).text(estimate.clientCompany, leftMargin, clientY);
          clientY += 14;
        }
        if (estimate.clientName) {
          doc.fontSize(11).font('Helvetica').fillColor(darkGray).text(estimate.clientName, leftMargin, clientY);
          clientY += 14;
        }
        [estimate.clientEmail, estimate.clientPhone, estimate.clientAddress].filter(Boolean).forEach(line => {
          doc.fontSize(9).font('Helvetica').fillColor(lightGray).text(line, leftMargin, clientY);
          clientY += 12;
        });
      }

      const estimateDate = estimate.createdAt?.seconds
        ? new Date(estimate.createdAt.seconds * 1000)
        : estimate.createdAt ? new Date(estimate.createdAt) : new Date();
      const validDate = new Date(estimateDate);
      validDate.setDate(validDate.getDate() + 30);

      doc.fontSize(8).font('Helvetica').fillColor(lightGray).text('ESTIMATE DATE', rightColX, metaStartY, { width: colWidth, align: 'right' });
      doc.fontSize(11).font('Helvetica-Bold').fillColor(darkGray)
         .text(formatDate(estimateDate.toISOString().split('T')[0]), rightColX, metaStartY + 12, { width: colWidth, align: 'right' });
      doc.fontSize(8).font('Helvetica').fillColor(lightGray).text('VALID UNTIL', rightColX, metaStartY + 32, { width: colWidth, align: 'right' });
      doc.fontSize(11).font('Helvetica-Bold').fillColor(darkGray)
         .text(formatDate(validDate.toISOString().split('T')[0]), rightColX, metaStartY + 44, { width: colWidth, align: 'right' });

      yPos = Math.max(clientY, metaStartY + 62) + 12;
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
      yPos += 14;

      // Line items
      const lineItems = normaliseEstimateLineItems(estimate);
      if (lineItems.length > 0) yPos = renderLineItems(doc, lineItems, leftMargin, rightMargin, contentWidth, yPos);

      // Total
      yPos += 14;
      doc.moveTo(leftMargin + contentWidth * 0.55, yPos).lineTo(rightMargin, yPos).lineWidth(2).stroke(darkGray);
      yPos += 12;
      doc.fontSize(12).font('Helvetica-Bold').fillColor(darkGray).text('TOTAL ESTIMATE:', leftMargin + contentWidth * 0.45, yPos);
      doc.fontSize(18).font('Helvetica-Bold').fillColor(darkGray)
         .text(`$${parseFloat(estimate.total || 0).toFixed(2)}`, leftMargin, yPos - 3, { width: contentWidth, align: 'right' });

      // Deposit
      if (estimate.requireDeposit && estimate.depositAmount) {
        yPos += 32;
        const depositLabel = estimate.depositType === 'percent'
          ? `${estimate.depositValue}% deposit due at acceptance`
          : `$${parseFloat(estimate.depositValue).toFixed(2)} deposit due at acceptance`;
        doc.rect(leftMargin + contentWidth * 0.35, yPos, contentWidth * 0.65, 28).fill('#fffbeb');
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#92400e').text('Deposit Required:', leftMargin + contentWidth * 0.37, yPos + 9);
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#92400e').text(`$${parseFloat(estimate.depositAmount).toFixed(2)}`, leftMargin, yPos + 9, { width: contentWidth - 10, align: 'right' });
        yPos += 32;
        doc.fontSize(8).font('Helvetica').fillColor('#b45309').text(depositLabel, leftMargin, yPos, { width: contentWidth, align: 'right' });
      }

      // Notes
      if (estimate.notes) {
        yPos += 36;
        if (yPos > doc.page.height - 150) { doc.addPage(); yPos = 50; }
        doc.fontSize(10).font('Helvetica-Bold').fillColor(darkGray).text('Notes', leftMargin, yPos);
        yPos += 14;
        doc.fontSize(9).font('Helvetica').fillColor(lightGray).text(estimate.notes, leftMargin, yPos, { width: contentWidth });
        yPos += doc.heightOfString(estimate.notes, { width: contentWidth }) + 4;
      }

      // Terms
      if (estimate.terms || userInfo.estimateTerms) {
        yPos += 30;
        if (yPos > doc.page.height - 150) { doc.addPage(); yPos = 50; }
        doc.fontSize(10).font('Helvetica-Bold').fillColor(darkGray).text('Terms & Conditions', leftMargin, yPos);
        yPos += 14;
        const termsText = estimate.terms || userInfo.estimateTerms;
        doc.fontSize(8).font('Helvetica').fillColor(lightGray).text(termsText, leftMargin, yPos, { width: contentWidth });
        yPos += doc.heightOfString(termsText, { width: contentWidth }) + 4;
      }

      // Contract + Signature
      if (estimate.includeContract && estimate.contractText) {
        yPos += 30;
        if (yPos > doc.page.height - 100) { doc.addPage(); yPos = 50; }
        doc.fontSize(10).font('Helvetica-Bold').fillColor(darkGray).text('Contract / Disclaimer', leftMargin, yPos);
        yPos += 14;
        doc.fontSize(8).font('Helvetica').fillColor(lightGray).text(estimate.contractText, leftMargin, yPos, { width: contentWidth });
        yPos += doc.heightOfString(estimate.contractText, { width: contentWidth }) + 10;

        if (yPos > doc.page.height - 160) { doc.addPage(); yPos = 50; }
        yPos += 24;
        doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
        yPos += 18;
        doc.fontSize(9).font('Helvetica-Oblique').fillColor(mediumGray)
           .text('By signing below, I agree to the terms and conditions outlined above.', leftMargin, yPos, { width: contentWidth });
        yPos += 32;

        const sigGap = 20;
        const sigW   = (contentWidth - sigGap * 2) * 0.38;
        const nameW  = (contentWidth - sigGap * 2) * 0.38;
        const dateW  = contentWidth - sigW - nameW - sigGap * 2;
        const sigX   = leftMargin;
        const nameX  = sigX  + sigW  + sigGap;
        const dateX  = nameX + nameW + sigGap;

        doc.moveTo(sigX,  yPos).lineTo(sigX  + sigW,  yPos).lineWidth(0.75).stroke(darkGray);
        doc.fontSize(8).font('Helvetica').fillColor(lightGray).text('CLIENT SIGNATURE', sigX, yPos + 5);
        doc.moveTo(nameX, yPos).lineTo(nameX + nameW, yPos).lineWidth(0.75).stroke(darkGray);
        doc.fontSize(8).font('Helvetica').fillColor(lightGray).text('PRINTED NAME', nameX, yPos + 5);
        doc.moveTo(dateX, yPos).lineTo(dateX + dateW, yPos).lineWidth(0.75).stroke(darkGray);
        doc.fontSize(8).font('Helvetica').fillColor(lightGray).text('DATE', dateX, yPos + 5);
        yPos += 28;
      }

      // E-signature
      if (estimate.signatureName) {
        if (yPos > doc.page.height - 120) { doc.addPage(); yPos = 50; }
        yPos += 16;
        doc.rect(leftMargin, yPos, contentWidth, 60).fill('#f0fdf4');
        doc.rect(leftMargin, yPos, contentWidth, 60).lineWidth(0.5).stroke('#bbf7d0');
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#166534').text('ELECTRONICALLY SIGNED', leftMargin + 12, yPos + 10);
        doc.fontSize(12).font('Helvetica-Bold').fillColor(darkGray).text(estimate.signatureName, leftMargin + 12, yPos + 24);
        const sigDateStr = estimate.signatureTimestampISO
          ? new Date(estimate.signatureTimestampISO).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
          : 'Date on record';
        doc.fontSize(9).font('Helvetica').fillColor(lightGray).text(sigDateStr, leftMargin + 12, yPos + 42);
        yPos += 76;
      }

      // Site Photos
      if (photoData.length > 0) {
        yPos += 30;
        if (yPos > doc.page.height - 150) { doc.addPage(); yPos = 50; }
        doc.fontSize(10).font('Helvetica-Bold').fillColor(darkGray).text('Site Photos', leftMargin, yPos);
        yPos += 16;
        const photoSize = (contentWidth - 10) / 2;
        let colIndex = 0;
        for (const photo of photoData) {
          if (yPos > doc.page.height - photoSize - 80) { doc.addPage(); yPos = 50; colIndex = 0; }
          const xPos = colIndex === 0 ? leftMargin : leftMargin + photoSize + 10;
          try { doc.image(photo.buffer, xPos, yPos, { width: photoSize, height: photoSize, fit: [photoSize, photoSize], align: 'center', valign: 'center' }); } catch (e) {}
          if (photo.note) doc.fontSize(8).font('Helvetica').fillColor(lightGray).text(photo.note, xPos, yPos + photoSize + 4, { width: photoSize });
          colIndex++;
          if (colIndex >= 2) { colIndex = 0; yPos += photoSize + (photo.note ? 28 : 14); }
        }
        if (colIndex === 1) yPos += photoSize + 14;
      }

      doc.end();
    } catch (error) { reject(error); }
  });
}

module.exports = {
  generateInvoicePDFBuffer,
  generateEstimatePDFBuffer,
};