const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const { Resend } = require('resend');

// Define the Resend API key parameter
const resendApiKey = defineString('RESEND_API_KEY');

// Delete User Account Cloud Function
// This function deletes all user data from Firestore and Storage, and sends a confirmation email
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

    // Get user data before deletion (for the email)
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const userEmail = userData?.email || request.auth.token.email;
    const userName = userData?.fullName || userData?.businessName || 'User';

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

    // Step 7: Send deletion confirmation email
    console.log('Sending account deletion confirmation email...');
    try {
      const apiKey = resendApiKey.value();
      
      if (apiKey && userEmail) {
        const resend = new Resend(apiKey);
        
        await resend.emails.send({
          from: 'ProXTrades <support@proxtrades.com>',
          to: userEmail,
          subject: 'Account Deletion Confirmation - ProXTrades',
          html: generateDeletionEmailHTML(userName, userEmail)
        });
        
        console.log('Deletion confirmation email sent successfully');
      } else {
        console.log('Skipping email - API key or user email not available');
      }
    } catch (emailError) {
      // Don't fail the entire operation if email fails
      console.error('Failed to send deletion email:', emailError);
    }

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

/**
 * Generate the HTML for the account deletion confirmation email
 */
function generateDeletionEmailHTML(userName, userEmail) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">⚡ ProXTrades</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">
                      Account Deletion Confirmed
                    </h2>
                    
                    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      Hi ${userName},
                    </p>
                    
                    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      This email confirms that your ProXTrades account (<strong>${userEmail}</strong>) has been permanently deleted.
                    </p>

                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; line-height: 1.6; font-weight: 600;">
                        ⚠️ The following data has been permanently removed:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.8;">
                        <li>All jobs and job history</li>
                        <li>All estimates and invoices</li>
                        <li>All client information</li>
                        <li>All uploaded photos and documents</li>
                        <li>Your profile and company information</li>
                        <li>All app data and settings</li>
                      </ul>
                    </div>
                    
                    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      This action cannot be undone. All your data has been permanently removed from our systems.
                    </p>

                    <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 15px 0; color: #111827; font-size: 16px; font-weight: 600;">
                        Changed your mind?
                      </p>
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        You can always create a new account at <a href="https://electricianprox.com" style="color: #3b82f6; text-decoration: none;">electricianprox.com</a>, but you'll need to start fresh as all your previous data has been deleted.
                      </p>
                    </div>

                    <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                      <p style="margin: 0 0 10px 0; color: #111827; font-size: 14px; font-weight: 600;">
                        Have questions?
                      </p>
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If you didn't request this deletion or have any questions, please contact us immediately at <a href="mailto:support@proxtrades.com" style="color: #3b82f6; text-decoration: none;">support@proxtrades.com</a>
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                      © ${new Date().getFullYear()} ProXTrades. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      This is an automated confirmation email for account deletion.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}