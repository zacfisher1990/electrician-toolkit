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
 * Generate PDF buffer for the invoice using PDFKit
 * Design matches the in-app preview with white card style
 */
async function generateInvoicePDFBuffer(invoice, userInfo = {}) {
  // Fetch logo if available
  let logoBuffer = null;
  if (userInfo.companyLogo) {
    try {
      logoBuffer = await fetchImageBuffer(userInfo.companyLogo);
    } catch (error) {
      console.error('Error fetching logo:', error);
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
      const primaryYellow = '#F7C600';
      const darkGray = '#1f2937';
      const mediumGray = '#4b5563';
      const lightGray = '#6b7280';
      const borderGray = '#e5e7eb';
      const bgGray = '#f9fafb';

      // Page background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f3f4f6');

      // White card area
      const cardX = 40;
      const cardY = 40;
      const cardWidth = doc.page.width - 80;
      const cardHeight = doc.page.height - 80;
      
      // Card shadow effect (subtle)
      doc.rect(cardX + 2, cardY + 2, cardWidth, cardHeight).fill('#e5e7eb');
      doc.rect(cardX, cardY, cardWidth, cardHeight).fill('#ffffff');

      let yPos = cardY + 30;
      const leftMargin = cardX + 30;
      const rightMargin = cardX + cardWidth - 30;
      const contentWidth = cardWidth - 60;

      // Header section - Logo and Company Info
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, leftMargin, yPos, { height: 60, fit: [120, 60] });
        } catch (e) {
          console.error('Error adding logo to PDF:', e);
        }
      }

      // Company info - right aligned
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(userInfo.businessName || 'Your Business Name', leftMargin, yPos, {
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

      yPos += 80;

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

      if (invoice.clientName || invoice.client) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(lightGray)
           .text('CLIENT', leftMargin, yPos + 35);
        
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor(darkGray)
           .text(invoice.clientName || invoice.client, leftMargin, yPos + 47);
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
         .text(invoice.date || new Date().toLocaleDateString(), rightColX, yPos + 12, { width: colWidth, align: 'right' });

      doc.fontSize(9)
         .font('Helvetica')
         .fillColor(lightGray)
         .text('DUE DATE', rightColX, yPos + 35, { width: colWidth, align: 'right' });
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(invoice.dueDate || 'Upon Receipt', rightColX, yPos + 47, { width: colWidth, align: 'right' });

      yPos += 80;

      // Divider
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).stroke(borderGray);
      yPos += 20;

      // Line Items
      const items = invoice.lineItems || invoice.items || [];
      
      if (items.length > 0) {
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

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text('TOTAL:', leftMargin + contentWidth * 0.6, yPos);

      const totalAmount = `$${parseFloat(invoice.total || invoice.amount || 0).toFixed(2)}`;
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor(primaryYellow)
         .text(totalAmount, leftMargin, yPos - 3, { width: contentWidth, align: 'right' });

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

      // Footer
      const footerY = cardY + cardHeight - 40;
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(lightGray)
         .text('Thank you for your business!', leftMargin, footerY, { 
           width: contentWidth, 
           align: 'center' 
         });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate PDF buffer for the estimate using PDFKit
 * Design matches the in-app preview with white card style
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

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors matching in-app preview
      const primaryYellow = '#F7C600';
      const darkGray = '#1f2937';
      const mediumGray = '#4b5563';
      const lightGray = '#6b7280';
      const borderGray = '#e5e7eb';
      const bgGray = '#f9fafb';

      // Page background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f3f4f6');

      // White card area
      const cardX = 40;
      const cardY = 40;
      const cardWidth = doc.page.width - 80;
      const cardHeight = doc.page.height - 80;
      
      // Card shadow effect (subtle)
      doc.rect(cardX + 2, cardY + 2, cardWidth, cardHeight).fill('#e5e7eb');
      doc.rect(cardX, cardY, cardWidth, cardHeight).fill('#ffffff');

      let yPos = cardY + 30;
      const leftMargin = cardX + 30;
      const rightMargin = cardX + cardWidth - 30;
      const contentWidth = cardWidth - 60;

      // Header section - Logo and Company Info
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, leftMargin, yPos, { height: 60, fit: [120, 60] });
        } catch (e) {
          console.error('Error adding logo to PDF:', e);
        }
      }

      // Company info - right aligned
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(userInfo.businessName || 'Your Business Name', leftMargin, yPos, {
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

      yPos += 80;

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
      if (estimate.clientName) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(lightGray)
           .text('CLIENT', leftMargin, yPos + 35);
        
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor(darkGray)
           .text(estimate.clientName, leftMargin, yPos + 47);
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
         .text(estimateDate.toLocaleDateString(), rightColX, yPos + 12, { width: colWidth, align: 'right' });

      doc.fontSize(9)
         .font('Helvetica')
         .fillColor(lightGray)
         .text('VALID UNTIL', rightColX, yPos + 35, { width: colWidth, align: 'right' });
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(darkGray)
         .text(validDate.toLocaleDateString(), rightColX, yPos + 47, { width: colWidth, align: 'right' });

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
            // Redraw card background on new page
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f3f4f6');
            doc.rect(cardX, 20, cardWidth, doc.page.height - 40).fill('#ffffff');
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
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f3f4f6');
            doc.rect(cardX, 20, cardWidth, doc.page.height - 40).fill('#ffffff');
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
         .fillColor(primaryYellow)
         .text(totalAmount, leftMargin, yPos - 3, { width: contentWidth, align: 'right' });

      // Notes
      if (estimate.notes) {
        yPos += 50;
        
        if (yPos > doc.page.height - 100) {
          doc.addPage();
          doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f3f4f6');
          doc.rect(cardX, 20, cardWidth, doc.page.height - 40).fill('#ffffff');
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
          doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f3f4f6');
          doc.rect(cardX, 20, cardWidth, doc.page.height - 40).fill('#ffffff');
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

      // Footer
      const footerY = cardY + cardHeight - 40;
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(lightGray)
         .text('Thank you for considering our services!', leftMargin, footerY, { 
           width: contentWidth, 
           align: 'center' 
         });

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