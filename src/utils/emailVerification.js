import { db } from '../firebase/firebase';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '../firebase/firebase';

/**
 * Generate a secure random token
 */
const generateToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Create verification token for a user
 */
export const createVerificationToken = async (userId, email) => {
  try {
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

    // Store token in Firestore
    await setDoc(doc(db, 'verificationTokens', token), {
      userId,
      email,
      createdAt: serverTimestamp(),
      expiresAt: expiresAt.toISOString(),
      used: false
    });

    return token;
  } catch (error) {
    console.error('Error creating verification token:', error);
    throw error;
  }
};

/**
 * Verify a token and mark user as verified
 */
export const verifyEmailToken = async (token) => {
  try {
    // Get token document
    const tokenDoc = await getDoc(doc(db, 'verificationTokens', token));

    if (!tokenDoc.exists()) {
      return { success: false, error: 'Invalid verification link' };
    }

    const tokenData = tokenDoc.data();

    // Check if already used
    if (tokenData.used) {
      return { success: false, error: 'This verification link has already been used' };
    }

    // Check if expired
    const expiresAt = new Date(tokenData.expiresAt);
    if (expiresAt < new Date()) {
      return { success: false, error: 'This verification link has expired' };
    }

    // Mark user as verified in users collection
    await setDoc(
      doc(db, 'users', tokenData.userId),
      { emailVerified: true, verifiedAt: serverTimestamp() },
      { merge: true }
    );

    // Mark token as used
    await setDoc(
      doc(db, 'verificationTokens', token),
      { used: true, usedAt: serverTimestamp() },
      { merge: true }
    );

    return { 
      success: true, 
      userId: tokenData.userId,
      email: tokenData.email 
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return { success: false, error: 'Verification failed. Please try again.' };
  }
};

/**
 * Check if a user's email is verified (custom system)
 */
export const isEmailVerifiedCustom = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() && userDoc.data().emailVerified === true;
  } catch (error) {
    console.error('Error checking verification status:', error);
    return false;
  }
};

/**
 * Send verification email via Firebase Cloud Function
 */
export const sendVerificationEmail = async (email, token) => {
  try {
    console.log('🔵 Sending verification email to:', email);
    
    // Get Firebase Functions instance
    const functions = getFunctions(auth.app);
    
    // Create verification link
    const verificationLink = `${window.location.origin}?token=${token}`;
    
    // Call the Firebase Cloud Function
    const sendEmail = httpsCallable(functions, 'sendVerificationEmail');
    const result = await sendEmail({
      email: email,
      verificationLink: verificationLink
    });

    console.log('✅ Verification email sent successfully:', result.data);
    return { success: true, data: result.data };
    
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send welcome email via Firebase Cloud Function
 */
export const sendWelcomeEmail = async (email, type = 'welcome') => {
  try {
    console.log('🔵 Sending welcome email to:', email);
    
    // Get Firebase Functions instance
    const functions = getFunctions(auth.app);
    
    // Call the Firebase Cloud Function
    const sendEmail = httpsCallable(functions, 'sendWelcomeEmail');
    const result = await sendEmail({
      email: email,
      type: type // 'welcome' or 'verification-reminder'
    });

    console.log('✅ Welcome email sent successfully:', result.data);
    return { success: true, data: result.data };
    
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
};