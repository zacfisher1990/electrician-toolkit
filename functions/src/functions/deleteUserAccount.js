/**
 * Cloud Function: Delete User Account
 * Deletes user account and all associated data from Firestore and Storage
 * Sends a confirmation email to the user
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const { Resend } = require('resend');
const { admin } = require('../config/firebaseAdmin');
const { generateAccountDeletionHTML } = require('../utils/emailTemplates');

// Define the Resend API key parameter
const resendApiKey = defineString('RESEND_API_KEY');

/**
 * Cloud Function to delete user account and all associated data
 */
const deleteUserAccount = onCall(async (request) => {
  const userId = request.auth?.uid;

  // Check authentication
  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    console.log(`Starting account deletion for user: ${userId}`);

    const db = admin.firestore();
    const storage = admin.storage();
    const bucket = storage.bucket();

    // Get user info before deletion (for email)
    console.log('Fetching user information...');
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const userEmail = userData?.email || request.auth.token.email;
    const userName = userData?.businessName || userData?.name || null;

    // Step 1: Delete all jobs and their subcollections
    console.log('Deleting jobs...');
    const jobsRef = db.collection('users').doc(userId).collection('jobs');
    const jobsSnapshot = await jobsRef.get();
    
    const jobDeletionPromises = [];
    for (const jobDoc of jobsSnapshot.docs) {
      // Delete estimates subcollection
      const estimatesRef = jobDoc.ref.collection('estimates');
      const estimatesSnapshot = await estimatesRef.get();
      estimatesSnapshot.docs.forEach(doc => {
        jobDeletionPromises.push(doc.ref.delete());
      });

      // Delete invoices subcollection
      const invoicesRef = jobDoc.ref.collection('invoices');
      const invoicesSnapshot = await invoicesRef.get();
      invoicesSnapshot.docs.forEach(doc => {
        jobDeletionPromises.push(doc.ref.delete());
      });

      // Delete the job document
      jobDeletionPromises.push(jobDoc.ref.delete());
    }
    await Promise.all(jobDeletionPromises);
    console.log(`Deleted ${jobsSnapshot.size} jobs`);

    // Step 2: Delete all estimates (top-level)
    console.log('Deleting top-level estimates...');
    const estimatesRef = db.collection('users').doc(userId).collection('estimates');
    const estimatesSnapshot = await estimatesRef.get();
    const estimateDeletionPromises = estimatesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(estimateDeletionPromises);
    console.log(`Deleted ${estimatesSnapshot.size} estimates`);

    // Step 3: Delete all invoices (top-level)
    console.log('Deleting top-level invoices...');
    const invoicesRef = db.collection('users').doc(userId).collection('invoices');
    const invoicesSnapshot = await invoicesRef.get();
    const invoiceDeletionPromises = invoicesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(invoiceDeletionPromises);
    console.log(`Deleted ${invoicesSnapshot.size} invoices`);

    // Step 4: Delete email verification tokens
    console.log('Deleting email verification tokens...');
    const tokensRef = db.collection('emailVerificationTokens');
    const tokensSnapshot = await tokensRef.where('userId', '==', userId).get();
    const tokenDeletionPromises = tokensSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(tokenDeletionPromises);
    console.log(`Deleted ${tokensSnapshot.size} verification tokens`);

    // Step 5: Delete user document
    console.log('Deleting user document...');
    await db.collection('users').doc(userId).delete();

    // Step 6: Delete all Storage files
    console.log('Deleting Storage files...');
    const deleteStorageFolder = async (prefix) => {
      try {
        const [files] = await bucket.getFiles({ prefix });
        const deletionPromises = files.map(file => file.delete().catch(err => {
          console.warn(`Failed to delete file ${file.name}:`, err.message);
        }));
        await Promise.all(deletionPromises);
        return files.length;
      } catch (error) {
        console.warn(`Error accessing folder ${prefix}:`, error.message);
        return 0;
      }
    };

    const profilePhotoCount = await deleteStorageFolder(`profile-photos/${userId}`);
    const companyLogoCount = await deleteStorageFolder(`company-logos/${userId}`);
    const jobPhotosCount = await deleteStorageFolder(`job-photos/${userId}`);
    
    console.log(`Deleted ${profilePhotoCount} profile photos`);
    console.log(`Deleted ${companyLogoCount} company logos`);
    console.log(`Deleted ${jobPhotosCount} job photos`);

    console.log(`✅ Successfully deleted all data for user: ${userId}`);

    // Step 7: Send confirmation email
    if (userEmail) {
      try {
        console.log('Sending account deletion confirmation email to:', userEmail);
        
        const apiKey = resendApiKey.value();
        
        if (apiKey) {
          const resend = new Resend(apiKey);
          
          await resend.emails.send({
            from: 'ProXTrades <account@proxtrades.com>',
            to: userEmail,
            subject: 'Account Deleted - ProXTrades',
            html: generateAccountDeletionHTML(userEmail, userName)
          });
          
          console.log('Account deletion confirmation email sent successfully');
        } else {
          console.warn('Resend API key not configured, skipping email');
        }
      } catch (emailError) {
        // Don't fail the deletion if email fails
        console.error('Failed to send confirmation email:', emailError);
      }
    }

    return {
      success: true,
      message: 'Account and all associated data deleted successfully'
    };

  } catch (error) {
    console.error('Error deleting user account:', error);
    throw new HttpsError('internal', `Failed to delete account: ${error.message}`);
  }
});

module.exports = { deleteUserAccount };