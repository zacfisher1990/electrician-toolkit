import { jsPDF } from 'jspdf';

/**
 * Generate a PDF for a weekly time card
 * @param {Object} weekData - Week data with sessions
 * @param {Object} dailyBreakdown - Daily breakdown of sessions
 * @param {Object} userInfo - User information (name, email, company)
 * @returns {jsPDF} PDF document
 */
export const generateTimeCardPDF = (weekData, dailyBreakdown, userInfo = {}) => {
  try {
    const doc = new jsPDF();
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Colors
    const primaryBlue = [59, 130, 246]; // #3b82f6
    const darkGray = [55, 65, 81]; // #374151
    const lightGray = [156, 163, 175]; // #9ca3af
    const green = [16, 185, 129]; // #10b981

    // Helper function to add text
    const addText = (text, x, y, options = {}) => {
      const textStr = text !== undefined && text !== null ? String(text) : '';
      
      doc.setFontSize(options.size || 10);
      if (options.color && Array.isArray(options.color)) {
        doc.setTextColor(...options.color);
      } else {
        doc.setTextColor(...darkGray);
      }
      doc.setFont(options.font || 'helvetica', options.style || 'normal');
      
      doc.text(textStr, x, y, options.align ? { align: options.align } : undefined);
    };

    // Check if we need a new page
    const checkNewPage = (spaceNeeded = 40) => {
      if (yPosition + spaceNeeded > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // ===========================
    // HEADER SECTION
    // ===========================
    
    // Blue header bar
    doc.setFillColor(...primaryBlue);
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
        console.error('Error adding logo:', error);
      }
    }
    
    // Company Name
    addText(userInfo.companyName || 'Electrician Pro X', logoX, 15, {
      size: 20,
      style: 'bold',
      color: [255, 255, 255]
    });
    
    // Contact info
    if (userInfo.email) {
      addText(userInfo.email, logoX, 25, {
        size: 10,
        color: [255, 255, 255]
      });
    }
    
    if (userInfo.phone) {
      addText(userInfo.phone, logoX, 32, {
        size: 10,
        color: [255, 255, 255]
      });
    }

    yPosition = 55;

    // ===========================
    // TITLE SECTION
    // ===========================
    
    addText('WEEKLY TIME CARD', margin, yPosition, {
      size: 24,
      style: 'bold',
      color: primaryBlue
    });

    yPosition += 15;

    // Week Range
    const weekStart = new Date(weekData.weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const formatWeekRange = () => {
      const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
      const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
      const startDay = weekStart.getDate();
      const endDay = weekEnd.getDate();
      const year = weekStart.getFullYear();

      if (startMonth === endMonth) {
        return `${startMonth} ${startDay} - ${endDay}, ${year}`;
      } else {
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
      }
    };
    
    addText(formatWeekRange(), margin, yPosition, {
      size: 14,
      style: 'bold'
    });

    yPosition += 10;

    // Employee Info
    if (userInfo.name || userInfo.email) {
      if (userInfo.name) {
        addText(`Employee: ${userInfo.name}`, margin, yPosition, {
          size: 10,
          color: lightGray
        });
        yPosition += 5;
      }
      if (userInfo.email) {
        addText(`Email: ${userInfo.email}`, margin, yPosition, {
          size: 10,
          color: lightGray
        });
        yPosition += 5;
      }
    }

    yPosition += 10;

    // ===========================
    // SUMMARY BOX
    // ===========================
    
    const summaryBoxY = yPosition;
    const summaryBoxHeight = 25;
    
    // Background
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, summaryBoxY, pageWidth - 2 * margin, summaryBoxHeight, 'F');
    
    // Border
    doc.setDrawColor(...primaryBlue);
    doc.setLineWidth(0.5);
    doc.rect(margin, summaryBoxY, pageWidth - 2 * margin, summaryBoxHeight);
    
    // Summary text
    const summaryTextY = summaryBoxY + 10;
    
    addText(`Total Jobs: ${weekData.jobsWorked}`, margin + 5, summaryTextY, {
      size: 11
    });
    
    addText(`Total Sessions: ${weekData.sessions.length}`, margin + 5, summaryTextY + 6, {
      size: 11
    });
    
    // Total hours - highlighted
    const formatHours = (hours) => {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      if (h === 0) return `${m}m`;
      if (m === 0) return `${h}h`;
      return `${h}h ${m}m`;
    };
    
    addText(`Total Hours: ${formatHours(weekData.totalHours)}`, pageWidth - margin - 5, summaryTextY + 3, {
      size: 12,
      style: 'bold',
      color: green,
      align: 'right'
    });

    yPosition = summaryBoxY + summaryBoxHeight + 15;

    // ===========================
    // DAILY BREAKDOWN
    // ===========================
    
    addText('Daily Breakdown', margin, yPosition, {
      size: 12,
      style: 'bold'
    });
    
    yPosition += 10;

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    daysOfWeek.forEach((day, index) => {
      const dayData = dailyBreakdown[index];
      if (!dayData) return;
      
      checkNewPage(40);
      
      // Day header with background
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 10, 'F');
      
      // Day name
      addText(day, margin + 3, yPosition, {
        size: 11,
        style: 'bold'
      });
      
      // Day total hours
      const dayHoursText = dayData.totalHours > 0 ? formatHours(dayData.totalHours) : 'No hours';
      addText(dayHoursText, pageWidth - margin - 3, yPosition, {
        size: 11,
        style: 'bold',
        color: dayData.totalHours > 0 ? green : lightGray,
        align: 'right'
      });
      
      yPosition += 10;
      
      // Sessions for the day
      if (dayData.sessions.length === 0) {
        addText('No work sessions', margin + 5, yPosition, {
          size: 9,
          color: lightGray
        });
        yPosition += 12;
      } else {
        dayData.sessions.forEach((session, sessionIdx) => {
          checkNewPage(25);
          
          // Session box background
          doc.setFillColor(255, 255, 255);
          const sessionBoxHeight = 18;
          doc.rect(margin + 3, yPosition - 4, pageWidth - 2 * margin - 6, sessionBoxHeight, 'F');
          
          // Border
          doc.setDrawColor(229, 231, 235);
          doc.setLineWidth(0.3);
          doc.rect(margin + 3, yPosition - 4, pageWidth - 2 * margin - 6, sessionBoxHeight);
          
          // Job title
          addText(session.jobTitle || 'Untitled Job', margin + 6, yPosition, {
            size: 10,
            style: 'bold'
          });
          
          // Session duration
          addText(formatHours(session.duration), pageWidth - margin - 6, yPosition, {
            size: 10,
            style: 'bold',
            color: primaryBlue,
            align: 'right'
          });
          
          yPosition += 6;
          
          // Time range
          const formatTime = (dateString) => {
            return new Date(dateString).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
          };
          
          addText(`${formatTime(session.startTime)} - ${formatTime(session.endTime)}`, margin + 6, yPosition, {
            size: 9,
            color: lightGray
          });
          
          // Client (if available)
          if (session.jobClient) {
            addText(`Client: ${session.jobClient}`, pageWidth - margin - 6, yPosition, {
              size: 9,
              color: lightGray,
              align: 'right'
            });
          }
          
          yPosition += 12;
        });
        
        // Daily total if multiple sessions
        if (dayData.sessions.length > 1) {
          doc.setDrawColor(...darkGray);
          doc.setLineWidth(0.5);
          doc.line(pageWidth - margin - 60, yPosition, pageWidth - margin - 3, yPosition);
          yPosition += 5;
          
          addText('Daily Total:', pageWidth - margin - 50, yPosition, {
            size: 10,
            style: 'bold'
          });
          
          addText(formatHours(dayData.totalHours), pageWidth - margin - 6, yPosition, {
            size: 10,
            style: 'bold',
            color: green,
            align: 'right'
          });
          
          yPosition += 10;
        }
      }
      
      yPosition += 5;
    });

    // ===========================
    // SIGNATURE SECTION
    // ===========================
    
    checkNewPage(40);
    
    yPosition += 10;
    
    const signatureWidth = 70;
    const leftSignatureX = margin;
    const rightSignatureX = pageWidth - margin - signatureWidth;
    
    // Line above signatures
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
    
    // Employee signature
    addText('Employee Signature:', leftSignatureX, yPosition, {
      size: 10
    });
    doc.setDrawColor(...lightGray);
    doc.line(leftSignatureX, yPosition + 10, leftSignatureX + signatureWidth, yPosition + 10);
    addText('Date: _______________', leftSignatureX, yPosition + 15, {
      size: 8,
      color: lightGray
    });
    
    // Supervisor signature
    addText('Supervisor Signature:', rightSignatureX, yPosition, {
      size: 10
    });
    doc.setDrawColor(...lightGray);
    doc.line(rightSignatureX, yPosition + 10, rightSignatureX + signatureWidth, yPosition + 10);
    addText('Date: _______________', rightSignatureX, yPosition + 15, {
      size: 8,
      color: lightGray
    });

    // ===========================
    // FOOTER (on every page)
    // ===========================
    
    const totalPages = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      const footerY = pageHeight - 15;
      
      // Separator line
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      
      // Page number
      addText(`Page ${i} of ${totalPages}`, pageWidth / 2, footerY, {
        size: 8,
        color: lightGray,
        align: 'center'
      });
      
      // Timestamp
      addText(`Generated: ${new Date().toLocaleString()}`, margin, footerY, {
        size: 8,
        color: lightGray
      });
      
      // Branding
      addText('Electrician Pro X', pageWidth - margin, footerY, {
        size: 8,
        color: lightGray,
        align: 'right'
      });
    }

    return doc;
    
  } catch (error) {
    console.error('Error in generateTimeCardPDF:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

/**
 * Download PDF to device
 * @param {jsPDF} pdf - PDF document
 * @param {string} filename - Filename for download
 */
export const downloadTimeCardPDF = (pdf, filename) => {
  try {
    pdf.save(filename);
  } catch (error) {
    console.error('Error in downloadTimeCardPDF:', error);
    throw error;
  }
};

/**
 * Get PDF as blob for email attachment
 * @param {jsPDF} pdf - PDF document
 * @returns {Blob} PDF blob
 */
export const getTimeCardPDFBlob = (pdf) => {
  return pdf.output('blob');
};

/**
 * Get PDF as base64 string for email attachment
 * @param {jsPDF} pdf - PDF document
 * @returns {string} Base64 encoded PDF
 */
export const getTimeCardPDFBase64 = (pdf) => {
  return pdf.output('dataurlstring').split(',')[1];
};

/**
 * Generate filename for time card
 * @param {Date} weekStart - Start of week
 * @param {string} userName - User's name
 * @returns {string} Filename
 */
export const generateTimeCardFilename = (weekStart, userName = 'TimeCard') => {
  const weekStartDate = new Date(weekStart);
  const year = weekStartDate.getFullYear();
  const month = String(weekStartDate.getMonth() + 1).padStart(2, '0');
  const day = String(weekStartDate.getDate()).padStart(2, '0');
  
  const sanitizedName = userName.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${sanitizedName}_TimeCard_${year}-${month}-${day}.pdf`;
};