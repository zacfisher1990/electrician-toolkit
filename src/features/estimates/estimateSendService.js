import { getFunctions, httpsCallable } from 'firebase/functions';
import app, { auth } from '../../firebase/firebase';
import { downloadEstimatePDF } from './generateEstimatePDF';

// Initialize Firebase Functions with explicit region
const functions = getFunctions(app, 'us-central1');

// IMPORTANT: For local development, uncomment this:
// import { connectFunctionsEmulator } from 'firebase/functions';
// if (window.location.hostname === 'localhost') {
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }

/**
 * Send estimate via email using Firebase Cloud Function and Resend
 */
export const sendEstimateViaEmail = async (estimate, recipientEmail, message, userInfo) => {
  try {
    // Verify user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to send estimates');
    }

    console.log('Sending estimate email...', { estimate, recipientEmail });

    // Get the auth token to ensure it's fresh
    const token = await currentUser.getIdToken(true);
    console.log('User authenticated with token');

    // Call the Cloud Function
    const sendEstimateEmail = httpsCallable(functions, 'sendEstimateEmail');
    
    const result = await sendEstimateEmail({
      estimate,
      recipientEmail,
      message,
      userInfo
    });

    console.log('Estimate sent successfully:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error sending estimate:', error);
    
    // Better error messages
    if (error.code === 'unauthenticated') {
      throw new Error('Authentication failed. Please log out and log back in.');
    }
    
    if (error.code === 'functions/internal') {
      throw new Error('Server error sending estimate. Please try again.');
    }
    
    if (error.message?.includes('CORS')) {
      throw new Error('Connection error. Make sure your Firebase function is deployed.');
    }
    
    throw new Error(error.message || 'Failed to send estimate');
  }
};

/**
 * Download estimate as PDF
 */
export const downloadEstimate = (estimate, userInfo) => {
  try {
    const filename = `Estimate-${estimate.name || 'draft'}.pdf`;
    downloadEstimatePDF(estimate, userInfo, filename);
    return { success: true };
  } catch (error) {
    console.error('Error downloading estimate:', error);
    throw new Error('Failed to download estimate');
  }
};

/**
 * Get user/business info for estimate generation
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
        estimateTerms: userData.estimateTerms || 'This estimate is valid for 30 days from the date above. Actual costs may vary based on site conditions and material availability. A deposit may be required to begin work.'
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
    estimateTerms: 'This estimate is valid for 30 days from the date above. Actual costs may vary based on site conditions and material availability. A deposit may be required to begin work.'
  };
};