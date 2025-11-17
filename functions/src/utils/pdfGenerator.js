/**
 * PDF Generation Utilities
 * Functions to generate PDF buffers for invoices and estimates using PDFKit
 */

const PDFDocument = require('pdfkit');

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

      // Totals - Just show TOTAL, no subtotal/tax needed for electrical invoices
      yPos += 20;
      const totalLabelX = doc.page.width - 200;

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

module.exports = {
  generateInvoicePDFBuffer,
  generateEstimatePDFBuffer
};