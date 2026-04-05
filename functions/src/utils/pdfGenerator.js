/**
 * pdfGenerator.js — Cloud Function PDF buffer generator (PDFKit)
 *
 * Matches the layout of generateInvoicePDF.js / generateEstimatePDF.js:
 *   • Logo/initial left · company info · yellow bottom border · title + badge right
 *   • 3-col meta row (Bill To / Date / Due Date)
 *   • 4-col line items table (Description · Qty · Unit Price · Amount)
 *   • Right-aligned stacked totals
 *   • Yellow left-bar accent for Notes
 *   • Shared footer
 */

const PDFDocument = require('pdfkit');
const https = require('https');
const http  = require('http');

// ─── Image fetch ──────────────────────────────────────────────────────────────

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
      response.on('data',  chunk => chunks.push(chunk));
      response.on('end',   ()    => resolve(Buffer.concat(chunks)));
      response.on('error', ()    => resolve(null));
    }).on('error', () => resolve(null));
  });
}

// ─── Watermark ────────────────────────────────────────────────────────────────

function drawWatermark(doc, text, color = '#10b981') {
  const pageWidth  = doc.page.width;
  const pageHeight = doc.page.height;
  doc.save();
  doc.translate(pageWidth / 2, pageHeight / 2);
  doc.rotate(-35);
  doc.fontSize(90).font('Helvetica-Bold');
  const tw = doc.widthOfString(text);
  doc.fillColor(color).fillOpacity(0.08)
     .text(text, -tw / 2, -45, { lineBreak: false });
  doc.rect(-tw / 2 - 20, -55, tw + 40, 100)
     .lineWidth(8).strokeColor(color).strokeOpacity(0.08).stroke();
  doc.restore();
  doc.fillOpacity(1).strokeOpacity(1);
}

// ─── Date helper ──────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '';
  const str = String(dateStr).split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ─── Shared page header ───────────────────────────────────────────────────────
// Logo/initial + company info on left; title + number + status badge on right.
// Yellow bottom border line. Returns yPos immediately below the border.

function drawPageHeader(doc, logoBuffer, userInfo, leftMargin, rightMargin, contentWidth, titleText, docNumber, status) {
  const darkGray  = '#1f2937';
  const lightGray = '#6b7280';
  const yellow    = '#F7C600';
  const leftSideW = Math.floor(contentWidth * 0.52); // left col max width

  const startY = 36;
  let leftY  = startY;
  let rightY = startY;

  // ── Left: logo or yellow initial block ──────────────────────────────────────
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, leftMargin, leftY, { height: 52, fit: [130, 52] });
      leftY += 62;
    } catch (e) { /* skip broken logo */ }
  } else {
    const initial = ((userInfo.businessName || userInfo.company || '?').charAt(0)).toUpperCase();
    doc.roundedRect(leftMargin, leftY, 40, 40, 6).fill(yellow);
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#000000')
       .text(initial, leftMargin, leftY + 11, { width: 40, align: 'center', lineBreak: false });
    leftY += 50;
  }

  // Company name
  const businessName = userInfo.businessName || userInfo.company || '';
  if (businessName) {
    doc.fontSize(13).font('Helvetica-Bold').fillColor(darkGray)
       .text(businessName, leftMargin, leftY, { width: leftSideW, lineBreak: false });
    leftY += 17;
  }

  // Contact lines
  const ownerName = userInfo.displayName || '';
  const contactLines = [
    ownerName && ownerName !== businessName ? ownerName : null,
    userInfo.address || userInfo.businessAddress || null,
    userInfo.phone   || null,
    userInfo.email   || null,
    userInfo.licenseNumber ? `License #${userInfo.licenseNumber}` : null,
  ].filter(Boolean);

  contactLines.forEach(line => {
    doc.fontSize(9).font('Helvetica').fillColor(lightGray)
       .text(String(line), leftMargin, leftY, { width: leftSideW, lineBreak: false });
    leftY += 13;
  });

  // ── Right: document title ────────────────────────────────────────────────────
  doc.fontSize(26).font('Helvetica-Bold').fillColor(darkGray)
     .text(titleText, leftMargin, rightY, { width: contentWidth, align: 'right', lineBreak: false });
  rightY += 34;

  // Document number
  const numStr = docNumber || '—';
  doc.fontSize(11).font('Helvetica').fillColor(lightGray)
     .text(numStr, leftMargin, rightY, { width: contentWidth, align: 'right', lineBreak: false });
  rightY += 18;

  // Status badge (pill)
  const statusText   = String(status || 'Draft');
  const badgeScheme  = {
    paid:     { bg: '#d1fae5', fg: '#065f46' },
    sent:     { bg: '#dbeafe', fg: '#1e40af' },
    overdue:  { bg: '#fee2e2', fg: '#991b1b' },
    partial:  { bg: '#fef3c7', fg: '#92400e' },
    accepted: { bg: '#d1fae5', fg: '#065f46' },
    declined: { bg: '#fee2e2', fg: '#991b1b' },
    expired:  { bg: '#f3f4f6', fg: '#374151' },
  };
  const scheme = badgeScheme[statusText.toLowerCase()] || { bg: '#f3f4f6', fg: '#374151' };

  doc.fontSize(8).font('Helvetica-Bold');
  const badgeLabel = statusText.toUpperCase();
  const badgeTxtW  = doc.widthOfString(badgeLabel);
  const badgeW     = badgeTxtW + 20;
  const badgeH     = 16;
  const badgeX     = rightMargin - badgeW;

  doc.roundedRect(badgeX, rightY, badgeW, badgeH, badgeH / 2).fill(scheme.bg);
  doc.fontSize(8).font('Helvetica-Bold').fillColor(scheme.fg)
     .text(badgeLabel, badgeX, rightY + 4, { width: badgeW, align: 'center', lineBreak: false });
  rightY += badgeH + 8;

  // ── Yellow separator ─────────────────────────────────────────────────────────
  const headerBottom = Math.max(leftY, rightY) + 12;
  doc.moveTo(leftMargin, headerBottom)
     .lineTo(rightMargin, headerBottom)
     .lineWidth(2.5).stroke(yellow);

  return headerBottom + 18;
}

// ─── 4-column line items table ────────────────────────────────────────────────
// Handles new schema (type/unitPrice) and legacy (rate).

function renderLineItems(doc, lineItems, leftMargin, rightMargin, contentWidth, startY) {
  const darkGray   = '#1f2937';
  const mediumGray = '#374151';
  const lightGray  = '#6b7280';
  const borderGray = '#e5e7eb';
  const faintLine  = '#f3f4f6';
  const bgGray     = '#f9fafb';

  // Column x positions and widths
  const descW = Math.floor(contentWidth * 0.50);
  const qtyW  = Math.floor(contentWidth * 0.10);
  const unitW = Math.floor(contentWidth * 0.20);
  const amtW  = contentWidth - descW - qtyW - unitW;

  const descX = leftMargin;
  const qtyX  = descX + descW;
  const unitX = qtyX  + qtyW;
  const amtX  = unitX + unitW;

  let yPos = startY;

  // ── Table header row ──────────────────────────────────────────────────────
  doc.rect(leftMargin, yPos, contentWidth, 20).fill(bgGray);
  doc.fontSize(8).font('Helvetica-Bold').fillColor(lightGray);
  doc.text('DESCRIPTION', descX + 8, yPos + 6, { width: descW - 16, lineBreak: false });
  doc.text('QTY',        qtyX,       yPos + 6, { width: qtyW,        align: 'center', lineBreak: false });
  doc.text('UNIT PRICE', unitX,      yPos + 6, { width: unitW,       align: 'right',  lineBreak: false });
  doc.text('AMOUNT',     amtX,       yPos + 6, { width: amtW - 8,    align: 'right',  lineBreak: false });
  yPos += 20;
  doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(1.5).stroke(borderGray);

  // ── Rows ──────────────────────────────────────────────────────────────────
  lineItems.forEach(item => {
    if (yPos > doc.page.height - 100) { doc.addPage(); yPos = 50; }

    if (item.type === 'section') {
      // Section header — uppercase divider row
      yPos += 4;
      doc.fontSize(8).font('Helvetica-Bold').fillColor(lightGray)
         .text((item.title || '').toUpperCase(), descX + 8, yPos + 4,
               { width: contentWidth - 16, lineBreak: false });
      yPos += 18;
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);

    } else {
      const qty   = parseFloat(item.quantity) || 1;
      const price = parseFloat(item.unitPrice != null ? item.unitPrice : item.rate) || 0;
      const total = qty * price;
      const qtyDisplay = qty !== 1
        ? (qty % 1 === 0 ? qty.toFixed(0) : qty.toFixed(2))
        : '\u2014'; // em dash

      const rowH = 26;

      doc.fontSize(10).font('Helvetica').fillColor(darkGray)
         .text(item.description || '', descX + 8, yPos + 7,
               { width: descW - 16, lineBreak: false, ellipsis: true });

      doc.fontSize(10).font('Helvetica').fillColor(lightGray)
         .text(qtyDisplay, qtyX, yPos + 7,
               { width: qtyW, align: 'center', lineBreak: false });

      doc.fontSize(10).font('Helvetica').fillColor(mediumGray)
         .text(`$${price.toFixed(2)}`, unitX, yPos + 7,
               { width: unitW, align: 'right', lineBreak: false });

      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkGray)
         .text(`$${total.toFixed(2)}`, amtX, yPos + 7,
               { width: amtW - 8, align: 'right', lineBreak: false });

      yPos += rowH;
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(faintLine);
    }
  });

  return yPos;
}

// ─── Schema normalisers ───────────────────────────────────────────────────────

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

// ─── Shared drawing helpers ───────────────────────────────────────────────────

// Draw a section label row (uppercase gray label + value)
function drawMetaCol(doc, labelText, valueText, subLines, x, y, width) {
  const lightGray = '#6b7280';
  const darkGray  = '#1f2937';

  doc.fontSize(8).font('Helvetica-Bold').fillColor(lightGray)
     .text(labelText.toUpperCase(), x, y, { width, lineBreak: false });
  let cy = y + 13;

  if (valueText) {
    doc.fontSize(12).font('Helvetica-Bold').fillColor(darkGray)
       .text(String(valueText), x, cy, { width, lineBreak: false, ellipsis: true });
    cy += 16;
  }

  (subLines || []).filter(Boolean).forEach(line => {
    doc.fontSize(9).font('Helvetica').fillColor(lightGray)
       .text(String(line), x, cy, { width, lineBreak: false, ellipsis: true });
    cy += 13;
  });

  return cy; // bottom of this column
}

// Draw notes/terms box with yellow left-bar accent
function drawAccentBox(doc, labelText, bodyText, leftMargin, contentWidth, yPos, accentColor, bgColor, labelColor, textColor) {
  const lineH    = 13;
  const padding  = { top: 10, side: 14, gap: 8 };
  const textW    = contentWidth - padding.side * 2 - 3; // 3 = accent bar width
  const textH    = doc.fontSize(9).font('Helvetica').heightOfString(bodyText, { width: textW });
  const boxH     = padding.top + lineH + padding.gap + textH + padding.top;

  doc.rect(leftMargin,     yPos, 3,             boxH).fill(accentColor);
  doc.rect(leftMargin + 3, yPos, contentWidth - 3, boxH).fill(bgColor);

  const textX = leftMargin + 3 + padding.side;
  doc.fontSize(8).font('Helvetica-Bold').fillColor(labelColor)
     .text(labelText.toUpperCase(), textX, yPos + padding.top, { width: textW, lineBreak: false });

  doc.fontSize(9).font('Helvetica').fillColor(textColor)
     .text(bodyText, textX, yPos + padding.top + lineH + padding.gap, { width: textW });

  return yPos + boxH + 16;
}

// Draw a neutral card box (gray bg + border) with a label + body text
function drawCardBox(doc, labelText, bodyText, leftMargin, contentWidth, yPos, fontSize = 9) {
  const lightGray = '#6b7280';
  const darkGray  = '#1f2937';
  const bgGray    = '#f9fafb';
  const borderGray = '#e5e7eb';
  const pad       = 14;
  const textW     = contentWidth - pad * 2;
  const labelH    = 10;
  const textH     = doc.fontSize(fontSize).font('Helvetica').heightOfString(bodyText, { width: textW });
  const boxH      = pad + labelH + 8 + textH + pad;

  doc.rect(leftMargin, yPos, contentWidth, boxH).fill(bgGray);
  doc.rect(leftMargin, yPos, contentWidth, boxH).lineWidth(0.5).stroke(borderGray);

  doc.fontSize(8).font('Helvetica-Bold').fillColor(lightGray)
     .text(labelText.toUpperCase(), leftMargin + pad, yPos + pad, { width: textW, lineBreak: false });

  doc.fontSize(fontSize).font('Helvetica').fillColor(darkGray)
     .text(bodyText, leftMargin + pad, yPos + pad + labelH + 8, { width: textW });

  return yPos + boxH + 16;
}

// Draw right-aligned totals row
function drawTotalsRow(doc, labelText, amountText, leftMargin, contentWidth, yPos, labelColor, amountColor, fontSize = 11, fontStyle = 'Helvetica') {
  const totalsX = leftMargin + Math.floor(contentWidth * 0.50);
  const totalsW = contentWidth - Math.floor(contentWidth * 0.50);

  doc.fontSize(fontSize).font(fontStyle).fillColor(labelColor)
     .text(labelText, totalsX, yPos, { width: totalsW * 0.55, lineBreak: false });
  doc.fontSize(fontSize).font(fontStyle === 'Helvetica' ? 'Helvetica' : 'Helvetica-Bold').fillColor(amountColor)
     .text(amountText, totalsX, yPos, { width: totalsW, align: 'right', lineBreak: false });

  return yPos + fontSize + 7;
}

// Draw footer
function drawFooter(doc, leftMargin, contentWidth, yPos, licenseNumber) {
  const parts = [
    'Generated by Electrician Pro X',
  ].filter(Boolean).join('  ·  ');

  doc.moveTo(leftMargin, yPos).lineTo(leftMargin + contentWidth, yPos).lineWidth(0.5).stroke('#e5e7eb');
  doc.fontSize(8).font('Helvetica').fillColor('#9ca3af')
     .text(parts, leftMargin, yPos + 10, { width: contentWidth, align: 'center', lineBreak: false });
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
      qrBuffer = await fetchImageBuffer(
        `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(stripeUrl)}&margin=6&color=1f2937`
      );
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
      const doc = new PDFDocument({ margin: 0, size: 'LETTER' });
      const chunks = [];
      doc.on('data',  chunk => chunks.push(chunk));
      doc.on('end',   ()    => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const darkGray   = '#1f2937';
      const mediumGray = '#4b5563';
      const lightGray  = '#6b7280';
      const borderGray = '#e5e7eb';
      const green      = '#059669';
      const leftMargin   = 48;
      const rightMargin  = doc.page.width - 48;
      const contentWidth = doc.page.width - 96;

      const isPaid    = invoice.status === 'Paid';
      const isPartial = invoice.status === 'Partial' && invoice.amountPaid > 0 && invoice.balance != null;

      if (isPaid) drawWatermark(doc, 'PAID');

      // ── Header ─────────────────────────────────────────────────────────────
      const docNumber = invoice.invoiceNumber ? String(invoice.invoiceNumber) : null;
      let yPos = drawPageHeader(doc, logoBuffer, userInfo, leftMargin, rightMargin, contentWidth,
                                'INVOICE', docNumber, invoice.status || 'Draft');

      // ── 3-col meta row ─────────────────────────────────────────────────────
      const col1W = Math.floor(contentWidth * 0.40);
      const col2W = Math.floor(contentWidth * 0.30);
      const col3W = contentWidth - col1W - col2W;
      const col1X = leftMargin;
      const col2X = leftMargin + col1W;
      const col3X = leftMargin + col1W + col2W;
      const metaStartY = yPos;

      // Col 1: Bill to
      const clientName    = invoice.clientName || invoice.client || '';
      const clientCompany = invoice.clientCompany || '';
      const primaryClient = clientName || clientCompany;
      const clientSubLines = [
        clientName && clientCompany ? clientCompany : null,
        invoice.clientAddress,
        invoice.clientPhone,
        invoice.clientEmail,
      ];
      const col1Bottom = drawMetaCol(doc, 'Bill To', primaryClient, clientSubLines, col1X, metaStartY, col1W - 16);

      // Col 2: Invoice date
      const col2Bottom = drawMetaCol(doc, 'Invoice Date',
        invoice.date ? formatDate(invoice.date) : new Date().toLocaleDateString(),
        [], col2X, metaStartY, col2W - 8);

      // Col 3: Due date
      const col3Bottom = drawMetaCol(doc, 'Due Date',
        invoice.dueDate ? formatDate(invoice.dueDate) : 'Upon Receipt',
        [invoice.paymentTerms || null],
        col3X, metaStartY, col3W);

      yPos = Math.max(col1Bottom, col2Bottom, col3Bottom) + 20;
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
      yPos += 16;

      // ── Line items ──────────────────────────────────────────────────────────
      const lineItems = normaliseInvoiceLineItems(invoice);
      if (lineItems.length > 0) {
        yPos = renderLineItems(doc, lineItems, leftMargin, rightMargin, contentWidth, yPos);
      }
      yPos += 16;

      // ── Totals ──────────────────────────────────────────────────────────────
      // Compute subtotal, tax, discount from lineItems with legacy fallback
      const subtotal = lineItems
        .filter(i => i.type === 'item' || !i.type)
        .reduce((s, i) => s + (parseFloat(i.quantity) || 1) * (parseFloat(i.unitPrice != null ? i.unitPrice : i.rate) || 0), 0)
        || parseFloat(invoice.total || invoice.amount || 0);

      const taxRate     = parseFloat(invoice.taxRate || 0);
      const taxAmount   = taxRate > 0 ? subtotal * (taxRate / 100) : parseFloat(invoice.taxAmount || 0);
      const discount    = parseFloat(invoice.discount || 0);
      const discountType = invoice.discountType || 'fixed';
      const discountAmt = discountType === 'percent' ? subtotal * (discount / 100) : discount;
      const hasTaxOrDiscount = taxAmount > 0 || discountAmt > 0;
      const grandTotal  = subtotal + taxAmount - discountAmt;

      // Separator above totals (right half only)
      const totalsStartX = leftMargin + Math.floor(contentWidth * 0.50);
      doc.moveTo(totalsStartX, yPos).lineTo(rightMargin, yPos).lineWidth(2).stroke(darkGray);
      yPos += 10;

      if (isPartial) {
        const totalAmt = parseFloat(invoice.total || invoice.amount || subtotal);
        yPos = drawTotalsRow(doc, 'Subtotal', `$${totalAmt.toFixed(2)}`, leftMargin, contentWidth, yPos, lightGray, darkGray);
        yPos = drawTotalsRow(doc, 'Deposit received', `-$${parseFloat(invoice.amountPaid || 0).toFixed(2)}`, leftMargin, contentWidth, yPos, green, green);
        doc.moveTo(totalsStartX, yPos + 2).lineTo(rightMargin, yPos + 2).lineWidth(1).stroke(borderGray);
        yPos += 10;
        yPos = drawTotalsRow(doc, 'Balance due', `$${parseFloat(invoice.balance || 0).toFixed(2)}`, leftMargin, contentWidth, yPos, darkGray, darkGray, 14, 'Helvetica-Bold');

      } else if (isPaid) {
        if (hasTaxOrDiscount) {
          yPos = drawTotalsRow(doc, 'Subtotal', `$${subtotal.toFixed(2)}`, leftMargin, contentWidth, yPos, lightGray, darkGray);
          if (taxAmount > 0) yPos = drawTotalsRow(doc, `Tax${taxRate > 0 ? ` (${taxRate}%)` : ''}`, `$${taxAmount.toFixed(2)}`, leftMargin, contentWidth, yPos, lightGray, darkGray);
          if (discountAmt > 0) yPos = drawTotalsRow(doc, 'Discount', `-$${discountAmt.toFixed(2)}`, leftMargin, contentWidth, yPos, green, green);
        }
        yPos = drawTotalsRow(doc, 'Total', `$${grandTotal.toFixed(2)}`, leftMargin, contentWidth, yPos, darkGray, darkGray, 14, 'Helvetica-Bold');
        doc.moveTo(totalsStartX, yPos + 2).lineTo(rightMargin, yPos + 2).lineWidth(2).stroke(green);
        yPos += 10;
        yPos = drawTotalsRow(doc, 'Amount due', '$0.00', leftMargin, contentWidth, yPos, green, green, 14, 'Helvetica-Bold');

      } else {
        if (hasTaxOrDiscount) {
          yPos = drawTotalsRow(doc, 'Subtotal', `$${subtotal.toFixed(2)}`, leftMargin, contentWidth, yPos, lightGray, darkGray);
          if (taxAmount > 0) yPos = drawTotalsRow(doc, `Tax${taxRate > 0 ? ` (${taxRate}%)` : ''}`, `$${taxAmount.toFixed(2)}`, leftMargin, contentWidth, yPos, lightGray, darkGray);
          if (discountAmt > 0) yPos = drawTotalsRow(doc, 'Discount', `-$${discountAmt.toFixed(2)}`, leftMargin, contentWidth, yPos, green, green);
        }
        yPos = drawTotalsRow(doc, 'Total due', `$${grandTotal.toFixed(2)}`, leftMargin, contentWidth, yPos, darkGray, green, 14, 'Helvetica-Bold');
      }

      yPos += 28;

      // ── Notes ───────────────────────────────────────────────────────────────
      if (invoice.notes) {
        if (yPos > doc.page.height - 150) { doc.addPage(); yPos = 50; }
        yPos = drawAccentBox(doc, 'Notes', invoice.notes,
          leftMargin, contentWidth, yPos,
          '#F7C600', '#fffbeb', '#92400e', darkGray);
      }

      // ── Site Photos ─────────────────────────────────────────────────────────
      if (photoData.length > 0) {
        if (yPos > doc.page.height - 150) { doc.addPage(); yPos = 50; }
        doc.fontSize(8).font('Helvetica-Bold').fillColor(lightGray)
           .text('SITE PHOTOS', leftMargin, yPos);
        yPos += 14;
        const photoSize = Math.floor((contentWidth - 10) / 2);
        let colIdx = 0;
        for (const photo of photoData) {
          if (yPos > doc.page.height - photoSize - 80) { doc.addPage(); yPos = 50; colIdx = 0; }
          const xPos = colIdx === 0 ? leftMargin : leftMargin + photoSize + 10;
          try {
            doc.image(photo.buffer, xPos, yPos, { width: photoSize, height: photoSize, fit: [photoSize, photoSize], align: 'center', valign: 'center' });
          } catch (e) {}
          if (photo.note) {
            doc.fontSize(8).font('Helvetica').fillColor(lightGray).text(photo.note, xPos, yPos + photoSize + 4, { width: photoSize });
          }
          colIdx++;
          if (colIdx >= 2) { colIdx = 0; yPos += photoSize + (photo.note ? 28 : 14); }
        }
        if (colIdx === 1) yPos += photoSize + 14;
        yPos += 16;
      }

      // ── Payment methods ──────────────────────────────────────────────────────
      function pmDetail(method) {
        const d = method.handle || method.username || method.info || method.details || method.accountInfo || method.phone || '';
        if (d) return d;
        if (method.url && !method.url.startsWith('http')) return method.url;
        const t = (method.type || '').toLowerCase();
        if (t === 'cash')  return 'Cash accepted';
        if (t === 'check') return `Make checks payable to ${userInfo.businessName || userInfo.company || 'contractor'}`;
        if (method.url) {
          try { const u = new URL(method.url); return (u.hostname + u.pathname).replace(/\/+$/, ''); }
          catch (_) { return method.url; }
        }
        return '';
      }

      const otherMethods = (Array.isArray(paymentMethods) ? paymentMethods : [])
        .filter(m => {
          const t = ((m.type || '') + (m.name || '')).toLowerCase();
          return !t.includes('stripe') && !t.includes('card');
        });

      if (otherMethods.length > 0) {
        if (yPos > doc.page.height - 120) { doc.addPage(); yPos = 50; }
        const pmLabelH = 10;
        const pmItemH  = 18;
        const pmBoxH   = 14 + pmLabelH + 8 + otherMethods.length * pmItemH + 14;

        doc.rect(leftMargin, yPos, contentWidth, pmBoxH).fill('#f9fafb');
        doc.rect(leftMargin, yPos, contentWidth, pmBoxH).lineWidth(0.5).stroke(borderGray);

        doc.fontSize(8).font('Helvetica-Bold').fillColor(lightGray)
           .text('PAYMENT METHODS ACCEPTED', leftMargin + 14, yPos + 14, { width: contentWidth - 28, lineBreak: false });

        let pmY = yPos + 14 + pmLabelH + 8;
        otherMethods.forEach(method => {
          const detail = pmDetail(method);
          const nameText = method.name || method.type || '';
          doc.fontSize(10).font('Helvetica-Bold').fillColor(darkGray)
             .text(nameText, leftMargin + 14, pmY, { width: 120, lineBreak: false });
          if (detail) {
            doc.fontSize(10).font('Helvetica').fillColor(lightGray)
               .text(` — ${detail}`, leftMargin + 14 + 120 + 4, pmY, { width: contentWidth - 28 - 130, lineBreak: false });
          }
          pmY += pmItemH;
        });

        yPos += pmBoxH + 16;
      }

      // ── Stripe QR ────────────────────────────────────────────────────────────
      if (!isPaid && stripeUrl) {
        if (yPos > doc.page.height - 150) { doc.addPage(); yPos = 50; }
        const qrSize  = 90;
        const cardH   = qrSize + 28;
        doc.rect(leftMargin, yPos, contentWidth, cardH).fill('#f0fdf4');
        doc.rect(leftMargin, yPos, contentWidth, cardH).lineWidth(0.5).stroke('#bbf7d0');

        if (qrBuffer) {
          try { doc.image(qrBuffer, leftMargin + 14, yPos + 14, { width: qrSize, height: qrSize }); } catch (e) {}
        }
        const tx = leftMargin + (qrBuffer ? qrSize + 28 : 14);
        const tw = contentWidth - (qrBuffer ? qrSize + 32 : 28);

        doc.fontSize(8).font('Helvetica-Bold').fillColor('#166634')
           .text('PAY BY CARD', tx, yPos + 14, { width: tw, lineBreak: false });
        doc.fontSize(12).font('Helvetica-Bold').fillColor(darkGray)
           .text('Pay Securely Online', tx, yPos + 26, { width: tw, lineBreak: false });
        doc.fontSize(9).font('Helvetica').fillColor(mediumGray)
           .text('Scan the QR code with your phone to pay by credit or debit card.', tx, yPos + 44, { width: tw });
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#4f46e5')
           .text('\u27a4  Pay Here', tx, yPos + 74, { width: tw, lineBreak: false });

        yPos += cardH + 24;
      }

      // ── Footer ───────────────────────────────────────────────────────────────
      if (yPos > doc.page.height - 60) { doc.addPage(); yPos = 50; }
      drawFooter(doc, leftMargin, contentWidth, yPos, userInfo.licenseNumber);

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
      const doc = new PDFDocument({ margin: 0, size: 'LETTER' });
      const chunks = [];
      doc.on('data',  chunk => chunks.push(chunk));
      doc.on('end',   ()    => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const darkGray   = '#1f2937';
      const mediumGray = '#4b5563';
      const lightGray  = '#6b7280';
      const borderGray = '#e5e7eb';
      const green      = '#059669';
      const leftMargin   = 48;
      const rightMargin  = doc.page.width - 48;
      const contentWidth = doc.page.width - 96;

      const isAccepted = estimate.status === 'Accepted';
      if (isAccepted) drawWatermark(doc, 'ACCEPTED');

      // Resolve estimate date
      const estimateDate = estimate.createdAt?.seconds
        ? new Date(estimate.createdAt.seconds * 1000)
        : estimate.createdAt ? new Date(estimate.createdAt) : new Date();
      const validDate = new Date(estimateDate);
      validDate.setDate(validDate.getDate() + 30);
      const estimateDateStr  = formatDate(estimateDate.toISOString().split('T')[0]);
      const validUntilStr    = formatDate(validDate.toISOString().split('T')[0]);

      // ── Header ───────────────────────────────────────────────────────────────
      const docNumber = estimate.estimateNumber ? String(estimate.estimateNumber) : null;
      let yPos = drawPageHeader(doc, logoBuffer, userInfo, leftMargin, rightMargin, contentWidth,
                                'ESTIMATE', docNumber, estimate.status || 'Draft');

      // ── Project name row ─────────────────────────────────────────────────────
      if (estimate.name) {
        doc.fontSize(8).font('Helvetica-Bold').fillColor(lightGray)
           .text('PROJECT', leftMargin, yPos, { lineBreak: false });
        yPos += 13;
        doc.fontSize(14).font('Helvetica-Bold').fillColor(darkGray)
           .text(estimate.name, leftMargin, yPos, { width: contentWidth, lineBreak: false });
        yPos += 20;
        doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke('#f3f4f6');
        yPos += 16;
      }

      // ── 3-col meta row ────────────────────────────────────────────────────────
      const col1W = Math.floor(contentWidth * 0.40);
      const col2W = Math.floor(contentWidth * 0.30);
      const col3W = contentWidth - col1W - col2W;
      const col1X = leftMargin;
      const col2X = leftMargin + col1W;
      const col3X = leftMargin + col1W + col2W;
      const metaStartY = yPos;

      const clientName    = estimate.clientName    || '';
      const clientCompany = estimate.clientCompany || '';
      const primaryClient = clientName || clientCompany;
      const hasClient     = !!primaryClient;

      const col1Bottom = drawMetaCol(doc,
        hasClient ? 'Prepared For' : 'Prepared By',
        primaryClient || userInfo.businessName || userInfo.company || '',
        hasClient ? [
          clientName && clientCompany ? clientCompany : null,
          estimate.clientAddress,
          estimate.clientPhone,
          estimate.clientEmail,
        ] : [],
        col1X, metaStartY, col1W - 16);

      const col2Bottom = drawMetaCol(doc, 'Estimate Date', estimateDateStr,  [], col2X, metaStartY, col2W - 8);
      const col3Bottom = drawMetaCol(doc, 'Valid Until',   validUntilStr,    [], col3X, metaStartY, col3W);

      yPos = Math.max(col1Bottom, col2Bottom, col3Bottom) + 20;
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
      yPos += 16;

      // ── Line items ────────────────────────────────────────────────────────────
      const lineItems = normaliseEstimateLineItems(estimate);
      if (lineItems.length > 0) {
        yPos = renderLineItems(doc, lineItems, leftMargin, rightMargin, contentWidth, yPos);
      }
      yPos += 16;

      // ── Total ─────────────────────────────────────────────────────────────────
      const computedTotal = lineItems
        .filter(i => i.type === 'item' || !i.type)
        .reduce((s, i) => s + (parseFloat(i.quantity) || 1) * (parseFloat(i.unitPrice != null ? i.unitPrice : i.rate) || 0), 0)
        || parseFloat(estimate.total || 0);

      const totalsStartX = leftMargin + Math.floor(contentWidth * 0.50);
      doc.moveTo(totalsStartX, yPos).lineTo(rightMargin, yPos).lineWidth(2).stroke(darkGray);
      yPos += 10;
      yPos = drawTotalsRow(doc, 'Total estimate', `$${computedTotal.toFixed(2)}`,
                           leftMargin, contentWidth, yPos, darkGray, green, 14, 'Helvetica-Bold');
      yPos += 8;

      // ── Deposit required ──────────────────────────────────────────────────────
      if (estimate.requireDeposit && estimate.depositAmount) {
        if (yPos > doc.page.height - 80) { doc.addPage(); yPos = 50; }
        const depositLabel = estimate.depositType === 'percent'
          ? `${estimate.depositValue}% deposit due at acceptance`
          : `$${parseFloat(estimate.depositValue).toFixed(2)} deposit due at acceptance`;

        const depBoxH = 32;
        doc.rect(leftMargin, yPos, contentWidth, depBoxH).fill('#fffbeb');
        doc.rect(leftMargin, yPos, contentWidth, depBoxH).lineWidth(0.5).stroke('#f59e0b');

        doc.fontSize(10).font('Helvetica-Bold').fillColor('#92400e')
           .text('Deposit Required:', leftMargin + 14, yPos + 10, { lineBreak: false });
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#92400e')
           .text(`$${parseFloat(estimate.depositAmount).toFixed(2)}`, leftMargin, yPos + 10,
                 { width: contentWidth - 14, align: 'right', lineBreak: false });
        doc.fontSize(8).font('Helvetica').fillColor('#b45309')
           .text(depositLabel, leftMargin + 14, yPos + 22, { width: contentWidth - 28, lineBreak: false });

        yPos += depBoxH + 20;
      }

      // ── Notes ─────────────────────────────────────────────────────────────────
      if (estimate.notes) {
        if (yPos > doc.page.height - 150) { doc.addPage(); yPos = 50; }
        yPos = drawAccentBox(doc, 'Notes', estimate.notes,
          leftMargin, contentWidth, yPos,
          '#F7C600', '#fffbeb', '#92400e', darkGray);
      }

      // ── Site Photos ───────────────────────────────────────────────────────────
      if (photoData.length > 0) {
        if (yPos > doc.page.height - 150) { doc.addPage(); yPos = 50; }
        doc.fontSize(8).font('Helvetica-Bold').fillColor(lightGray)
           .text('SITE PHOTOS', leftMargin, yPos);
        yPos += 14;
        const photoSize = Math.floor((contentWidth - 10) / 2);
        let colIdx = 0;
        for (const photo of photoData) {
          if (yPos > doc.page.height - photoSize - 80) { doc.addPage(); yPos = 50; colIdx = 0; }
          const xPos = colIdx === 0 ? leftMargin : leftMargin + photoSize + 10;
          try {
            doc.image(photo.buffer, xPos, yPos, { width: photoSize, height: photoSize, fit: [photoSize, photoSize], align: 'center', valign: 'center' });
          } catch (e) {}
          if (photo.note) {
            doc.fontSize(8).font('Helvetica').fillColor(lightGray).text(photo.note, xPos, yPos + photoSize + 4, { width: photoSize });
          }
          colIdx++;
          if (colIdx >= 2) { colIdx = 0; yPos += photoSize + (photo.note ? 28 : 14); }
        }
        if (colIdx === 1) yPos += photoSize + 14;
        yPos += 16;
      }

      // ── Terms & Conditions ────────────────────────────────────────────────────
      if (estimate.terms || userInfo.estimateTerms) {
        if (yPos > doc.page.height - 150) { doc.addPage(); yPos = 50; }
        yPos = drawCardBox(doc, 'Terms & Conditions',
          estimate.terms || userInfo.estimateTerms,
          leftMargin, contentWidth, yPos, 9);
      }

      // ── Contract + Signature ──────────────────────────────────────────────────
      if (estimate.includeContract && estimate.contractText) {
        if (yPos > doc.page.height - 120) { doc.addPage(); yPos = 50; }
        yPos = drawCardBox(doc, 'Contract / Disclaimer', estimate.contractText,
                           leftMargin, contentWidth, yPos, 8);

        // E-signature block
        if (estimate.signatureName) {
          if (yPos > doc.page.height - 80) { doc.addPage(); yPos = 50; }
          const sigBoxH = 64;
          doc.rect(leftMargin, yPos, contentWidth, sigBoxH).fill('#f0fdf4');
          doc.rect(leftMargin, yPos, contentWidth, sigBoxH).lineWidth(0.5).stroke('#bbf7d0');

          doc.fontSize(8).font('Helvetica-Bold').fillColor('#166534')
             .text('ELECTRONICALLY SIGNED', leftMargin + 14, yPos + 12, { lineBreak: false });
          doc.fontSize(12).font('Helvetica-Bold').fillColor(darkGray)
             .text(estimate.signatureName, leftMargin + 14, yPos + 26, { lineBreak: false });
          const sigDateStr = estimate.signatureTimestampISO
            ? new Date(estimate.signatureTimestampISO).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
            : 'Date on record';
          doc.fontSize(9).font('Helvetica').fillColor(lightGray)
             .text(sigDateStr, leftMargin + 14, yPos + 44, { lineBreak: false });
          yPos += sigBoxH + 20;

        } else {
          // Blank signature lines
          if (yPos > doc.page.height - 120) { doc.addPage(); yPos = 50; }
          yPos += 8;
          doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).lineWidth(0.5).stroke(borderGray);
          yPos += 16;
          doc.fontSize(9).font('Helvetica-Oblique').fillColor(mediumGray)
             .text('By signing below, I agree to the terms and conditions outlined above.',
                   leftMargin, yPos, { width: contentWidth });
          yPos += 32;

          const gap  = 20;
          const sigW = Math.floor((contentWidth - gap * 2) * 0.38);
          const namW = Math.floor((contentWidth - gap * 2) * 0.38);
          const datW = contentWidth - sigW - namW - gap * 2;
          const sigX = leftMargin;
          const namX = sigX + sigW + gap;
          const datX = namX + namW + gap;

          doc.moveTo(sigX, yPos).lineTo(sigX + sigW, yPos).lineWidth(0.75).stroke(darkGray);
          doc.fontSize(8).font('Helvetica').fillColor(lightGray).text('CLIENT SIGNATURE', sigX, yPos + 5, { lineBreak: false });

          doc.moveTo(namX, yPos).lineTo(namX + namW, yPos).lineWidth(0.75).stroke(darkGray);
          doc.fontSize(8).font('Helvetica').fillColor(lightGray).text('PRINTED NAME', namX, yPos + 5, { lineBreak: false });

          doc.moveTo(datX, yPos).lineTo(datX + datW, yPos).lineWidth(0.75).stroke(darkGray);
          doc.fontSize(8).font('Helvetica').fillColor(lightGray).text('DATE', datX, yPos + 5, { lineBreak: false });

          yPos += 28;
        }
      }

      // ── Footer ────────────────────────────────────────────────────────────────
      yPos += 16;
      if (yPos > doc.page.height - 60) { doc.addPage(); yPos = 50; }
      drawFooter(doc, leftMargin, contentWidth, yPos, userInfo.licenseNumber);

      doc.end();
    } catch (error) { reject(error); }
  });
}

module.exports = {
  generateInvoicePDFBuffer,
  generateEstimatePDFBuffer,
};