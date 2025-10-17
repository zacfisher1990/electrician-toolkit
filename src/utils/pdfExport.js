import jsPDF from 'jspdf';

/**
 * Universal PDF export function for all calculators
 * @param {Object} data - Calculator data to export
 * @param {string} data.calculatorName - Name of the calculator
 * @param {Object} data.inputs - Input values object
 * @param {Object} data.results - Results object
 * @param {string|Array} data.necReferences - NEC code references (string or array)
 * @param {Object} data.additionalInfo - Optional additional calculation details
 */
export const exportToPDF = (data) => {
  const { calculatorName, inputs, results, necReferences, additionalInfo } = data;
  
  // Create new PDF document (letter size)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrap
  const addWrappedText = (text, x, y, maxWidth, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * (fontSize * 0.4); // Return height used
  };

  // Header
  doc.setFillColor(37, 99, 235); // Blue header
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Electrician Toolkit', margin, 12);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(calculatorName, margin, 19);

  // Date
  doc.setFontSize(9);
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(today, pageWidth - margin - doc.getTextWidth(today), 19);

  yPosition = 35;

  // Reset text color for content
  doc.setTextColor(0, 0, 0);

  // Inputs Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Input Parameters', margin, yPosition);
  yPosition += 7;

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Add inputs
  Object.entries(inputs).forEach(([key, value]) => {
    checkNewPage(10);
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
    
    doc.setFont('helvetica', 'bold');
    const labelText = `${capitalizedLabel}:`;
    doc.text(labelText, margin + 5, yPosition);
    
    // Calculate width of label to position value appropriately
    const labelWidth = doc.getTextWidth(labelText);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 5 + labelWidth + 3, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // Results Section
  checkNewPage(20);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Results', margin, yPosition);
  yPosition += 7;

  doc.setDrawColor(37, 99, 235);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Add results
  Object.entries(results).forEach(([key, value]) => {
    checkNewPage(10);
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
    
    doc.setFont('helvetica', 'bold');
    const labelText = `${capitalizedLabel}:`;
    doc.text(labelText, margin + 5, yPosition);
    
    // Handle different value types
    let displayValue = String(value);
    if (typeof value === 'boolean') {
      displayValue = value ? 'Yes' : 'No';
    }
    
    // Calculate width of label to position value appropriately
    const labelWidth = doc.getTextWidth(labelText);
    doc.setFont('helvetica', 'normal');
    doc.text(displayValue, margin + 5 + labelWidth + 3, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // Additional Info Section (if provided)
  if (additionalInfo && Object.keys(additionalInfo).length > 0) {
    checkNewPage(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Calculation Details', margin, yPosition);
    yPosition += 7;

    doc.setDrawColor(37, 99, 235);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    Object.entries(additionalInfo).forEach(([key, value]) => {
      checkNewPage(10);
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
      
      const height = addWrappedText(`${capitalizedLabel}: ${value}`, margin + 5, yPosition, contentWidth - 10, 10);
      yPosition += height + 2;
    });

    yPosition += 5;
  }

  // NEC References Section
  if (necReferences) {
    checkNewPage(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('NEC Code References', margin, yPosition);
    yPosition += 7;

    doc.setDrawColor(37, 99, 235);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Handle both string and array formats
    const references = Array.isArray(necReferences) ? necReferences : [necReferences];
    
    references.forEach((ref) => {
      checkNewPage(15);
      const height = addWrappedText(`• ${ref}`, margin + 5, yPosition, contentWidth - 10, 10);
      yPosition += height + 2;
    });
  }

  // Footer
  const footerY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  const disclaimer = 'This calculation is for reference only. Always verify with current NEC and local codes.';
  const disclaimerWidth = doc.getTextWidth(disclaimer);
  doc.text(disclaimer, (pageWidth - disclaimerWidth) / 2, footerY);

  // Generate filename
  const calculatorSlug = calculatorName.toLowerCase().replace(/\s+/g, '-');
  const dateSlug = new Date().toISOString().split('T')[0];
  const filename = `${calculatorSlug}-${dateSlug}.pdf`;

  // Save the PDF
  doc.save(filename);
};