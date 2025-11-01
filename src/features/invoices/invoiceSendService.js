import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import app, { auth } from '../../firebase/firebase';
import { downloadInvoicePDF } from './generateInvoicePDF';

// Initialize Firebase Functions with explicit region
const functions = getFunctions(app, 'us-central1');

// Uncomment for local testing:
// if (window.location.hostname === 'localhost') {
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }

/**
 * Send invoice via email using Firebase Cloud Function and Resend
 */
export const sendInvoiceViaEmail = async (invoice, recipientEmail, message, userInfo) => {
  try {
    // Verify user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to send invoices');
    }

    console.log('Sending invoice email...', { invoice, recipientEmail });

    // Call the Cloud Function with explicit region
    const sendInvoiceEmail = httpsCallable(functions, 'sendInvoiceEmail');
    
    const result = await sendInvoiceEmail({
      invoice,
      recipientEmail,
      message,
      userInfo
    });

    console.log('Invoice sent successfully:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error sending invoice:', error);
    
    // Provide more helpful error messages
    if (error.code === 'unauthenticated') {
      throw new Error('Authentication failed. Please log out and log back in.');
    }
    
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