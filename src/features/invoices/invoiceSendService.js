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
 * Fetches from user profile in Firestore
 */
export const getUserBusinessInfo = async (userId) => {
  try {
    if (!userId) {
      console.warn('No userId provided, using defaults');
      return getDefaultBusinessInfo();
    }

    // Import Firestore functions
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('../../firebase/firebase');
    
    // Fetch user profile from Firestore
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      return {
        businessName: userData.company || userData.displayName || 'Electrician Toolkit',
        companyLogo: userData.companyLogo || null, // Company logo URL from profile
        email: userData.email || auth.currentUser?.email || 'onboarding@resend.dev',
        phone: userData.phone || '',
        address: userData.address || '',
        paymentInstructions: userData.paymentInstructions || 'Payment can be made via check, cash, or bank transfer. Please include invoice number on payment.'
      };
    }
    
    // If no user document found, use defaults
    return getDefaultBusinessInfo();
  } catch (error) {
    console.error('Error getting user business info:', error);
    return getDefaultBusinessInfo();
  }
};

/**
 * Get default business info as fallback
 */
const getDefaultBusinessInfo = () => {
  return {
    businessName: 'Electrician Toolkit',
    companyLogo: null,
    email: 'onboarding@resend.dev',
    phone: '(555) 123-4567',
    address: '123 Main St, City, State 12345',
    paymentInstructions: 'Payment can be made via check, cash, or bank transfer. Please include invoice number on payment.'
  };
};