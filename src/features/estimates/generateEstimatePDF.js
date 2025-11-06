// src/features/estimates/generateEstimatePDF.js
import { jsPDF } from 'jspdf';

/**
 * Generates a professional PDF estimate
 * @param {Object} estimate - The estimate data
 * @param {Object} userInfo - User/business information
 * @returns {Blob} PDF blob that can be downloaded or sent via email
 */
export const generateEstimatePDF = (estimate, userInfo = {}) => {
  try {
    console.log('Starting PDF generation with:', { estimate, userInfo });
    
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

    // Helper function to add text
    const addText = (text, x, y, options = {}) => {
      if (Array.isArray(text)) {
        text.forEach((line, index) => {
          const lineStr = line !== undefined && line !== null ? String(line) : '';
          if (lineStr) {
            doc.setFontSize(options.size || 10);
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
      
      const textStr = text !== undefined && text !== null ? String(text) : '';
      
      doc.setFontSize(options.size || 10);
      if (options.color && Array.isArray(options.color)) {
        doc.setTextColor(...options.color);
      } else {
        doc.setTextColor(...darkGray);
      }
      doc.setFont(options.font || 'helvetica', options.style || 'normal');
      
      if (textStr || textStr === '') {
        doc.text(textStr, x, y, options.align ? { align: options.align } : undefined);
      }
    };

    // Header - Company Info with Logo
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
    
    addText(userInfo.businessName || 'Your Business Name', logoX, 15, {
      size: 20,
      style: 'bold',
      color: [255, 255, 255]
    });
    
    addText(userInfo.email || '', logoX, 25, {
      size: 10,
      color: [255, 255, 255]
    });
    
    addText(userInfo.phone || '', logoX, 32, {
      size: 10,
      color: [255, 255, 255]
    });

    yPosition = 55;

    // Estimate Title and Number
    addText('ESTIMATE', margin, yPosition, {
      size: 24,
      style: 'bold',
      color: primaryColor
    });

    addText(`#${estimate.estimateNumber || 'N/A'}`, pageWidth - margin, yPosition, {
      size: 12,
      style: 'bold',
      align: 'right'
    });

    yPosition += 15;

    // Estimate Details - Two columns
    // Left column - Estimate For
    addText('ESTIMATE FOR:', margin, yPosition, {
      size: 10,
      style: 'bold'
    });
    
    yPosition += 7;
    addText(estimate.clientName || estimate.client || 'Client Name', margin, yPosition, {
      size: 11
    });
    
    if (estimate.clientAddress) {
      yPosition += 6;
      addText(estimate.clientAddress, margin, yPosition, {
        size: 9,
        color: lightGray
      });
    }
    
    if (estimate.clientEmail) {
      yPosition += 6;
      addText(estimate.clientEmail, margin, yPosition, {
        size: 9,
        color: lightGray
      });
    }
    
    if (estimate.clientPhone) {
      yPosition += 6;
      addText(estimate.clientPhone, margin, yPosition, {
        size: 9,
        color: lightGray
      });
    }

    // Right column - Estimate Details
    const rightColX = pageWidth - margin - 60;
    let rightYPosition = 70;

    addText('Estimate Date:', rightColX, rightYPosition, {
      size: 9,
      color: lightGray
    });
    addText(
      estimate.date 
        ? new Date(estimate.date).toLocaleDateString() 
        : new Date().toLocaleDateString(), 
      pageWidth - margin, 
      rightYPosition, 
      {
        size: 9,
        align: 'right'
      }
    );

    rightYPosition += 6;
    addText('Valid Until:', rightColX, rightYPosition, {
      size: 9,
      color: lightGray
    });
    addText(estimate.validUntil || estimate.expiryDate || '30 Days', pageWidth - margin, rightYPosition, {
      size: 9,
      align: 'right'
    });

    rightYPosition += 6;
    addText('Status:', rightColX, rightYPosition, {
      size: 9,
      color: lightGray
    });
    
    // Status badge
    const statusColor = estimate.status === 'Accepted' ? [16, 185, 129] :
                        estimate.status === 'Pending' ? [245, 158, 11] :
                        estimate.status === 'Declined' ? [239, 68, 68] : lightGray;
    
    doc.setFillColor(...statusColor);
    const statusText = estimate.status || 'Pending';
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
    const lineItems = estimate.lineItems || [];
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

    yPosition += 10;

    // Totals section
    const totalsX = pageWidth - margin - 60;
    
    // Calculate subtotal from line items if not provided
    const calculateSubtotal = () => {
      if (estimate.subtotal) return estimate.subtotal;
      if (estimate.lineItems && estimate.lineItems.length > 0) {
        return estimate.lineItems.reduce((sum, item) => {
          return sum + ((item.quantity || 1) * (item.rate || 0));
        }, 0);
      }
      return estimate.amount || estimate.total || 0;
    };
    
    const subtotal = calculateSubtotal();
    const tax = parseFloat(estimate.tax || 0);
    const discount = parseFloat(estimate.discount || 0);
    const finalTotal = estimate.total || estimate.amount || (subtotal + tax - discount);
    
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
      addText(`Tax (${estimate.taxRate || 0}%):`, totalsX, yPosition, {
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
    addText('ESTIMATED TOTAL:', totalsX, yPosition, {
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
    if (estimate.notes) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      addText('Notes:', margin, yPosition, {
        size: 10,
        style: 'bold'
      });
      yPosition += 7;
      
      const notesText = String(estimate.notes || '');
      if (notesText) {
        const notesLines = doc.splitTextToSize(notesText, pageWidth - (2 * margin));
        addText(notesLines, margin, yPosition, {
          size: 9,
          color: lightGray
        });
        yPosition += notesLines.length * 5;
      }
    }

    // Terms and conditions
    if (estimate.terms || userInfo.estimateTerms) {
      yPosition += 10;
      
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      addText('Terms & Conditions:', margin, yPosition, {
        size: 10,
        style: 'bold'
      });
      yPosition += 7;
      
      const terms = String(estimate.terms || userInfo.estimateTerms || '');
      if (terms) {
        const termsLines = doc.splitTextToSize(terms, pageWidth - (2 * margin));
        addText(termsLines, margin, yPosition, {
          size: 9,
          color: lightGray
        });
      }
    }

    // Footer
    const footerY = pageHeight - 15;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    addText('Thank you for considering our services!', pageWidth / 2, footerY, {
      size: 9,
      color: lightGray,
      align: 'center'
    });

    console.log('PDF generation completed successfully');
    
    // Return the PDF as a blob
    return doc.output('blob');
    
  } catch (error) {
    console.error('Error in generateEstimatePDF:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

/**
 * Downloads the estimate PDF
 */
export const downloadEstimatePDF = (estimate, userInfo, filename) => {
  try {
    console.log('Starting download...', { estimate, userInfo, filename });
    
    if (!estimate) {
      throw new Error('Estimate is required');
    }
    
    const pdfBlob = generateEstimatePDF(estimate, userInfo);
    
    if (!pdfBlob) {
      throw new Error('Failed to generate PDF blob');
    }
    
    console.log('Creating download link...');
    
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `Estimate-${estimate.estimateNumber || 'draft'}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('Download completed and cleaned up');
    }, 100);
    
  } catch (error) {
    console.error('Error in downloadEstimatePDF:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};