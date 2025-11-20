import { functions } from './../../firebase/firebase';
import { httpsCallable } from 'firebase/functions';

/**
 * Send time card email via Cloud Function
 * @param {Object} params - Email parameters
 * @param {string} params.recipientEmail - Recipient's email address
 * @param {string} params.recipientName - Recipient's name (optional)
 * @param {string} params.weekRange - Week range display (e.g., "Nov 10 - 16, 2025")
 * @param {string} params.pdfBase64 - Base64 encoded PDF
 * @param {string} params.fileName - PDF filename
 * @param {string} params.senderName - Sender's name (optional)
 * @param {string} params.senderEmail - Sender's email for BCC (optional)
 * @returns {Promise<Object>} Result with success status
 */
export const sendTimeCardEmail = async ({
  recipientEmail,
  recipientName,
  weekRange,
  pdfBase64,
  fileName,
  senderName,
  senderEmail
}) => {
  try {
    const sendEmail = httpsCallable(functions, 'sendTimeCardEmail');
    
    const result = await sendEmail({
      recipientEmail,
      recipientName,
      weekRange,
      pdfBase64,
      fileName,
      senderName,
      senderEmail
    });

    return result.data;
  } catch (error) {
    console.error('Error sending time card email:', error);
    throw error;
  }
};

/**
 * Validate email address format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};