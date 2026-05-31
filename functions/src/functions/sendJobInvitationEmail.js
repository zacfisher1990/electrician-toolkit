/**
 * Cloud Functions: Job Invitation Emails
 * Sends email notifications for job invitations and acceptance
 */

const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const { Resend } = require('resend');
const { admin } = require('../config/firebaseAdmin');
const { 
  generateJobInvitationEmailHTML, 
  generateInvitationAcceptedEmailHTML 
} = require('../utils/emailTemplates');

// Define the Resend API key parameter
const resendApiKey = defineString('RESEND_API_KEY');

/**
 * Firestore Trigger: Auto-send email when invitation is created
 * This eliminates the need to call a separate function from the frontend
 */
const sendJobInvitationEmail = onDocumentCreated(
  'jobInvitations/{invitationId}',
  async (event) => {
    const invitationData = event.data.data();
    
    const apiKey = resendApiKey.value();
    
    if (!apiKey) {
      console.error('Resend API key not configured, skipping invitation email');
      return null;
    }

    const resend = new Resend(apiKey);

    try {
      // Get the inviter's user info for business name
      const db = admin.firestore();
      let inviterBusinessName = 'ProXTrades';
      let inviterName = invitationData.jobOwnerEmail;
      
      if (invitationData.jobOwnerId) {
        const inviterDoc = await db.collection('users').doc(invitationData.jobOwnerId).get();
        if (inviterDoc.exists) {
          const inviterData = inviterDoc.data();
          inviterBusinessName = inviterData.businessName || 'ProXTrades';
          inviterName = inviterData.name || inviterData.businessName || invitationData.jobOwnerEmail;
        }
      }

      console.log('Sending job invitation email to:', invitationData.invitedEmail);

      const { data: emailData, error: emailError } = await resend.emails.send({
        from: `${inviterBusinessName} <invitations@electricianprox.com>`,
        replyTo: invitationData.jobOwnerEmail,
        to: invitationData.invitedEmail,
        subject: `⚡ You're Invited to Join a Job - ${invitationData.jobTitle}`,
        html: generateJobInvitationEmailHTML({
          inviteeEmail: invitationData.invitedEmail,
          jobTitle: invitationData.jobTitle,
          jobClient: invitationData.jobClient,
          jobLocation: invitationData.jobLocation,
          jobDate: invitationData.jobDate,
          inviterName,
          inviterEmail: invitationData.jobOwnerEmail,
          inviterBusinessName
        })
      });

      if (emailError) {
        throw new Error(emailError.message || 'Failed to send email');
      }

      console.log('Invitation email sent successfully:', emailData?.id);

      // Update the invitation document to mark email as sent
      await event.data.ref.update({
        emailSent: true,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        emailId: emailData?.id || null
      });

      return { success: true, emailId: emailData?.id };

    } catch (error) {
      console.error('Error sending invitation email:', error);
      
      // Update the invitation to mark email as failed
      await event.data.ref.update({
        emailSent: false,
        emailError: error.message
      });
      
      return { success: false, error: error.message };
    }
  }
);

/**
 * Firestore Trigger: Notify job owner when invitation is accepted
 * Triggered when invitation status changes to 'accepted'
 */
const notifyInvitationAccepted = onDocumentUpdated(
  'jobInvitations/{invitationId}',
  async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    // Only proceed if status changed to 'accepted'
    if (beforeData.status === 'accepted' || afterData.status !== 'accepted') {
      console.log('Invitation status not changed to accepted, skipping notification');
      return null;
    }

    const apiKey = resendApiKey.value();
    
    if (!apiKey) {
      console.error('Resend API key not configured, skipping notification');
      return null;
    }

    const resend = new Resend(apiKey);

    try {
      console.log('Sending acceptance notification to job owner:', afterData.jobOwnerEmail);

      // Get invitee info (the person who accepted)
      const db = admin.firestore();
      let inviteeName = afterData.invitedEmail;
      
      if (afterData.acceptedUserId) {
        const inviteeDoc = await db.collection('users').doc(afterData.acceptedUserId).get();
        if (inviteeDoc.exists) {
          const inviteeData = inviteeDoc.data();
          inviteeName = inviteeData.businessName || inviteeData.name || afterData.invitedEmail;
        }
      }

      await resend.emails.send({
        from: 'ProXTrades <notifications@electricianprox.com>',
        to: afterData.jobOwnerEmail,
        subject: `✅ ${inviteeName} Accepted Your Job Invitation`,
        html: generateInvitationAcceptedEmailHTML({
          ownerEmail: afterData.jobOwnerEmail,
          inviteeName,
          inviteeEmail: afterData.invitedEmail,
          jobTitle: afterData.jobTitle,
          jobClient: afterData.jobClient,
          acceptedAt: afterData.acceptedAt
        })
      });

      console.log('Acceptance notification sent successfully');
      return { success: true };

    } catch (error) {
      console.error('Error sending acceptance notification:', error);
      // Don't throw - this is a background function
      return { success: false, error: error.message };
    }
  }
);

/**
 * Callable Function: Accept a job invitation
 *
 * Runs with admin privileges so it can update both the jobInvitations document
 * and the owner's job document without hitting Firestore security rules.
 * The client calls this instead of writing to Firestore directly.
 */
const acceptInvitation = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const { invitationId } = request.data;
  if (!invitationId) {
    throw new HttpsError('invalid-argument', 'invitationId is required');
  }

  const db = admin.firestore();
  const invitationRef = db.collection('jobInvitations').doc(invitationId);
  const invitationSnap = await invitationRef.get();

  if (!invitationSnap.exists) {
    throw new HttpsError('not-found', 'Invitation not found');
  }

  const invitation = invitationSnap.data();
  const callerEmail = request.auth.token.email || '';

  // Verify this invitation belongs to the caller
  if (invitation.invitedEmail.toLowerCase() !== callerEmail.toLowerCase()) {
    throw new HttpsError('permission-denied', 'This invitation is not for you');
  }

  if (invitation.status !== 'pending') {
    throw new HttpsError('failed-precondition', `Invitation is already ${invitation.status}`);
  }

  const callerUid = request.auth.uid;
  const now = admin.firestore.FieldValue.serverTimestamp();

  // 1. Update invitation status
  await invitationRef.update({
    status: 'accepted',
    acceptedAt: now,
    acceptedByUid: callerUid,
  });

  // 2. Update the owner's job document
  const jobRef = db.doc(`users/${invitation.jobOwnerId}/jobs/${invitation.jobId}`);
  const jobSnap = await jobRef.get();

  if (jobSnap.exists) {
    const job = jobSnap.data();
    const updatedElectricians = (job.invitedElectricians || []).map(inv =>
      inv.email && inv.email.toLowerCase() === callerEmail.toLowerCase()
        ? { ...inv, status: 'accepted', acceptedAt: new Date().toISOString(), acceptedByUid: callerUid }
        : inv
    );

    await jobRef.update({
      invitedElectricians: updatedElectricians,
      sharedWith: admin.firestore.FieldValue.arrayUnion(callerUid),
      updatedAt: now,
    });

    console.log(`✅ acceptInvitation: job ${invitation.jobId} updated for ${callerEmail}`);
  } else {
    console.warn(`acceptInvitation: job ${invitation.jobId} not found`);
  }

  return {
    jobId: invitation.jobId,
    jobOwnerId: invitation.jobOwnerId,
    jobTitle: invitation.jobTitle,
  };
});

module.exports = { 
  sendJobInvitationEmail,
  notifyInvitationAccepted,
  acceptInvitation,
};