import { jsPDF } from 'jspdf';

/**
 * Generates a professional PDF invoice
 * @param {Object} invoice - The invoice data
 * @param {Object} userInfo - User/business information (name, address, phone, email, etc.)
 * @returns {Blob} PDF blob that can be downloaded or sent via email
 */
export const generateInvoicePDF = (invoice, userInfo = {}) => {
  try {
    console.log('Starting PDF generation with:', { invoice, userInfo });
    
    const doc = new jsPDF();
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Colors
    const primaryColor = [59, 130, 246]; // Blue
    const darkGray = [31, 41, 55];
    const lightGray = [107, 114, 128];

    // Helper function to add text - FINAL FIXED VERSION
    const addText = (text, x, y, options = {}) => {
      // Handle arrays (from splitTextToSize)
      if (Array.isArray(text)) {
        text.forEach((line, index) => {
          const lineStr = line !== undefined && line !== null ? String(line) : '';
          if (lineStr) {
            doc.setFontSize(options.size || 10);
            // FIX: Spread the color array properly
            if (options.color && Array.isArray(options.color)) {
              doc.setTextColor(...options.color);
            } else {
              doc.setTextColor(...darkGray);
            }
            doc.setFont(options.font || 'helvetica', options.style || 'normal');
            doc.text(lineStr, x, y + (index * 5), options.align ? { align: options.align } : undefined);
          }
        });
        return;
      }
      
      // Convert text to string and handle undefined/null
      const textStr = text !== undefined && text !== null ? String(text) : '';
      
      doc.setFontSize(options.size || 10);
      // FIX: Spread the color array properly
      if (options.color && Array.isArray(options.color)) {
        doc.setTextColor(...options.color);
      } else {
        doc.setTextColor(...darkGray);
      }
      doc.setFont(options.font || 'helvetica', options.style || 'normal');
      
      // Only render if we have text
      if (textStr || textStr === '') {
        doc.text(textStr, x, y, options.align ? { align: options.align } : undefined);
      }
    };

    // Header - Company Info
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    addText(userInfo.businessName || 'Your Business Name', margin, 15, {
      size: 20,
      style: 'bold',
      color: [255, 255, 255]
    });
    
    addText(userInfo.email || '', margin, 25, {
      size: 10,
      color: [255, 255, 255]
    });
    
    addText(userInfo.phone || '', margin, 32, {
      size: 10,
      color: [255, 255, 255]
    });

    yPosition = 55;

    // Invoice Title and Number
    addText('INVOICE', margin, yPosition, {
      size: 24,
      style: 'bold',
      color: primaryColor
    });

    addText(`#${invoice.invoiceNumber || 'N/A'}`, pageWidth - margin, yPosition, {
      size: 12,
      style: 'bold',
      align: 'right'
    });

    yPosition += 15;

    // Invoice Details - Two columns
    // Left column - Bill To
    addText('BILL TO:', margin, yPosition, {
      size: 10,
      style: 'bold'
    });
    
    yPosition += 7;
    addText(invoice.clientName || invoice.client || 'Client Name', margin, yPosition, {
      size: 11
    });
    
    if (invoice.clientAddress) {
      yPosition += 6;
      addText(invoice.clientAddress, margin, yPosition, {
        size: 9,
        color: lightGray
      });
    }
    
    if (invoice.clientEmail) {
      yPosition += 6;
      addText(invoice.clientEmail, margin, yPosition, {
        size: 9,
        color: lightGray
      });
    }
    
    if (invoice.clientPhone) {
      yPosition += 6;
      addText(invoice.clientPhone, margin, yPosition, {
        size: 9,
        color: lightGray
      });
    }

    // Right column - Invoice Details
    const rightColX = pageWidth - margin - 60;
    let rightYPosition = 70;

    addText('Invoice Date:', rightColX, rightYPosition, {
      size: 9,
      color: lightGray
    });
    addText(
      invoice.date 
        ? new Date(invoice.date).toLocaleDateString() 
        : new Date().toLocaleDateString(), 
      pageWidth - margin, 
      rightYPosition, 
      {
        size: 9,
        align: 'right'
      }
    );

    rightYPosition += 6;
    addText('Due Date:', rightColX, rightYPosition, {
      size: 9,
      color: lightGray
    });
    addText(invoice.dueDate || 'Upon Receipt', pageWidth - margin, rightYPosition, {
      size: 9,
      align: 'right'
    });

    rightYPosition += 6;
    addText('Status:', rightColX, rightYPosition, {
      size: 9,
      color: lightGray
    });
    
    // Status badge
    const statusColor = invoice.status === 'Paid' ? [16, 185, 129] :
                        invoice.status === 'Pending' ? [245, 158, 11] :
                        invoice.status === 'Overdue' ? [239, 68, 68] : lightGray;
    
    doc.setFillColor(...statusColor);
    const statusText = invoice.status || 'Pending';
    const statusWidth = doc.getTextWidth(statusText) + 8;
    doc.roundedRect(pageWidth - margin - statusWidth, rightYPosition - 4, statusWidth, 6, 1, 1, 'F');
    
    addText(statusText, pageWidth - margin, rightYPosition, {
      size: 8,
      style: 'bold',
      color: [255, 255, 255],
      align: 'right'
    });

    yPosition = Math.max(yPosition, rightYPosition) + 15;

    // Line items table
    yPosition += 5;
    
    // Table header
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPosition, pageWidth - (2 * margin), 8, 'F');
    
    yPosition += 6;
    
    addText('Description', margin + 2, yPosition, {
      size: 9,
      style: 'bold'
    });
    
    addText('Qty', pageWidth - margin - 60, yPosition, {
      size: 9,
      style: 'bold'
    });
    
    addText('Rate', pageWidth - margin - 40, yPosition, {
      size: 9,
      style: 'bold'
    });
    
    addText('Amount', pageWidth - margin, yPosition, {
      size: 9,
      style: 'bold',
      align: 'right'
    });

    yPosition += 8;

    // Line items
    const lineItems = invoice.lineItems || [];
    lineItems.forEach((item, index) => {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }

      addText(item.description || '', margin + 2, yPosition, {
        size: 9
      });
      
      addText(String(item.quantity || 1), pageWidth - margin - 60, yPosition, {
        size: 9
      });
      
      addText(`$${parseFloat(item.rate || 0).toFixed(2)}`, pageWidth - margin - 40, yPosition, {
        size: 9
      });
      
      const amount = (item.quantity || 1) * (item.rate || 0);
      addText(`$${amount.toFixed(2)}`, pageWidth - margin, yPosition, {
        size: 9,
        align: 'right'
      });

      yPosition += 7;
      
      // Add separator line
      if (index < lineItems.length - 1) {
        doc.setDrawColor(229, 231, 235);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      }
    });

   // EXACT REPLACEMENT for generateInvoicePDF.js lines 227-287
// This fixes the $0.00 subtotal and total issue

  yPosition += 10;

  // Totals section
  const totalsX = pageWidth - margin - 60;
  
  // Calculate subtotal from line items if not provided
  const calculateSubtotal = () => {
    // First, try to use provided subtotal
    if (invoice.subtotal) return invoice.subtotal;
    
    // Otherwise, calculate from line items
    if (invoice.lineItems && invoice.lineItems.length > 0) {
      return invoice.lineItems.reduce((sum, item) => {
        return sum + ((item.quantity || 1) * (item.rate || 0));
      }, 0);
    }
    
    // Fallback to amount or total
    return invoice.amount || invoice.total || 0;
  };
  
  const subtotal = calculateSubtotal();
  const tax = parseFloat(invoice.tax || 0);
  const discount = parseFloat(invoice.discount || 0);
  const finalTotal = invoice.total || invoice.amount || (subtotal + tax - discount);
  
  // Subtotal
  addText('Subtotal:', totalsX, yPosition, {
    size: 10,
    color: lightGray
  });
  addText(`$${parseFloat(subtotal).toFixed(2)}`, pageWidth - margin, yPosition, {
    size: 10,
    align: 'right'
  });

  yPosition += 7;

  // Tax (if applicable)
  if (tax > 0) {
    addText(`Tax (${invoice.taxRate || 0}%):`, totalsX, yPosition, {
      size: 10,
      color: lightGray
    });
    addText(`$${tax.toFixed(2)}`, pageWidth - margin, yPosition, {
      size: 10,
      align: 'right'
    });
    yPosition += 7;
  }

  // Discount (if applicable)
  if (discount > 0) {
    addText('Discount:', totalsX, yPosition, {
      size: 10,
      color: lightGray
    });
    addText(`-$${discount.toFixed(2)}`, pageWidth - margin, yPosition, {
      size: 10,
      color: [239, 68, 68],
      align: 'right'
    });
    yPosition += 7;
  }

  // Line before total
  doc.setDrawColor(...darkGray);
  doc.setLineWidth(0.5);
  doc.line(totalsX, yPosition, pageWidth - margin, yPosition);
  yPosition += 7;

  // Total
  addText('TOTAL:', totalsX, yPosition, {
    size: 12,
    style: 'bold'
  });
  addText(`$${parseFloat(finalTotal).toFixed(2)}`, pageWidth - margin, yPosition, {
    size: 14,
    style: 'bold',
    color: primaryColor,
    align: 'right'
  });

  yPosition += 15;

    // Notes section (if applicable)
    if (invoice.notes) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      addText('Notes:', margin, yPosition, {
        size: 10,
        style: 'bold'
      });
      yPosition += 7;
      
      // Ensure notes is a string before splitting
      const notesText = String(invoice.notes || '');
      if (notesText) {
        const notesLines = doc.splitTextToSize(notesText, pageWidth - (2 * margin));
        addText(notesLines, margin, yPosition, {
          size: 9,
          color: lightGray
        });
        yPosition += notesLines.length * 5;
      }
    }

    // Payment instructions (if applicable)
    if (invoice.paymentInstructions || userInfo.paymentInstructions) {
      yPosition += 10;
      
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      addText('Payment Instructions:', margin, yPosition, {
        size: 10,
        style: 'bold'
      });
      yPosition += 7;
      
      // Ensure instructions is a string before splitting
      const instructions = String(invoice.paymentInstructions || userInfo.paymentInstructions || '');
      if (instructions) {
        const instructionLines = doc.splitTextToSize(instructions, pageWidth - (2 * margin));
        addText(instructionLines, margin, yPosition, {
          size: 9,
          color: lightGray
        });
      }
    }

    // Footer
    const footerY = pageHeight - 15;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    addText('Thank you for your business!', pageWidth / 2, footerY, {
      size: 9,
      color: lightGray,
      align: 'center'
    });

    console.log('PDF generation completed successfully');
    
    // Return the PDF as a blob
    return doc.output('blob');
    
  } catch (error) {
    console.error('Error in generateInvoicePDF:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

/**
 * Downloads the invoice PDF
 */
export const downloadInvoicePDF = (invoice, userInfo, filename) => {
  try {
    console.log('Starting download...', { invoice, userInfo, filename });
    
    if (!invoice) {
      throw new Error('Invoice is required');
    }
    
    const pdfBlob = generateInvoicePDF(invoice, userInfo);
    
    if (!pdfBlob) {
      throw new Error('Failed to generate PDF blob');
    }
    
    console.log('Creating download link...');
    
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `Invoice-${invoice.invoiceNumber || 'draft'}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('Download completed and cleaned up');
    }, 100);
    
  } catch (error) {
    console.error('Error in downloadInvoicePDF:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};