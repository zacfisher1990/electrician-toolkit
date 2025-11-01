import { getFunctions, httpsCallable } from 'firebase/functions';
import app, { auth } from '../../firebase/firebase'; // Import both app and auth
import { downloadInvoicePDF } from './generateInvoicePDF';

// Initialize Firebase Functions with the app instance
const functions = getFunctions(app);

/**
 * Send invoice via email using Firebase Cloud Function and Resend
 */
export const sendInvoiceViaEmail = async (invoice, recipientEmail, message, userInfo) => {
  try {
    // Make sure user is authenticated
    if (!auth.currentUser) {
      throw new Error('User must be logged in to send invoices');
    }

    // Call the Cloud Function
    const sendInvoiceEmail = httpsCallable(functions, 'sendInvoiceEmail');
    
    const result = await sendInvoiceEmail({
      invoice,
      recipientEmail,
      message,
      userInfo
    });

    return result.data;
  } catch (error) {
    console.error('Error sending invoice:', error);
    throw new Error(error.message || 'Failed to send invoice');
  }
};

/**
 * Download invoice as PDF
 */
export const downloadInvoice = (invoice, userInfo) => {
  try {
    const filename = `Invoice-${invoice.invoiceNumber || 'draft'}.pdf`;
    downloadInvoicePDF(invoice, userInfo, filename);
    return { success: true };
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw new Error('Failed to download invoice');
  }
};

/**
 * Get user/business info for invoice generation
 * This should fetch from your user profile or settings
 */
export const getUserBusinessInfo = async (userId) => {
  // TODO: Implement fetching user business info from Firestore
  // For now, return default values that will work
  return {
    businessName: 'Electrician Toolkit',
    email: 'onboarding@resend.dev', // Using Resend's test email
    phone: '(555) 123-4567',
    address: '123 Main St, City, State 12345',
    paymentInstructions: 'Payment can be made via check, cash, or bank transfer. Please include invoice number on payment.'
  };
};