const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Delete User Account Cloud Function
// This function deletes all user data from Firestore and Storage
exports.deleteUserAccount = onCall(async (request) => {
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
      const [files] = await bucket.getFiles({ prefix });
      const deletionPromises = files.map(file => file.delete());
      await Promise.all(deletionPromises);
      return files.length;
    };

    const profilePhotoCount = await deleteStorageFolder(`profile-photos/${userId}`);
    const companyLogoCount = await deleteStorageFolder(`company-logos/${userId}`);
    const jobPhotosCount = await deleteStorageFolder(`job-photos/${userId}`);
    
    console.log(`Deleted ${profilePhotoCount} profile photos`);
    console.log(`Deleted ${companyLogoCount} company logos`);
    console.log(`Deleted ${jobPhotosCount} job photos`);

    console.log(`✅ Successfully deleted all data for user: ${userId}`);

    return {
      success: true,
      message: 'Account and all associated data deleted successfully'
    };

  } catch (error) {
    console.error('Error deleting user account:', error);
    throw new HttpsError('internal', `Failed to delete account: ${error.message}`);
  }
});