/**
 * Cloud Functions: Job Invitation Emails
 * Sends email notifications for job invitations and acceptance
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
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
 * Cloud Function to send job invitation email
 * Called when a job owner invites an electrician to a job
 */
const sendJobInvitationEmail = onCall(
  { cors: true },
  async (request) => {
    // Get API key
    const apiKey = resendApiKey.value();
    
    if (!apiKey) {
      throw new HttpsError(
        'failed-precondition',
        'Resend API key is not configured. Please set RESEND_API_KEY environment variable.'
      );
    }

    // Initialize Resend
    const resend = new Resend(apiKey);
    
    // Verify user is authenticated
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'User must be authenticated to send invitations.'
      );
    }

    const { 
      inviteeEmail, 
      jobTitle, 
      jobClient, 
      jobLocation, 
      jobDate,
      inviterName,
      inviterEmail,
      inviterBusinessName
    } = request.data;

    if (!inviteeEmail || !jobTitle) {
      throw new HttpsError(
        'invalid-argument',
        'Invitee email and job title are required.'
      );
    }

    try {
      console.log('Sending job invitation email to:', inviteeEmail);

      const emailData = await resend.emails.send({
        from: `${inviterBusinessName || 'ProXTrades'} <invitations@proxtrades.com>`,
        replyTo: inviterEmail,
        to: inviteeEmail,
        subject: `⚡ You're Invited to Join a Job - ${jobTitle}`,
        html: generateJobInvitationEmailHTML({
          inviteeEmail,
          jobTitle,
          jobClient,
          jobLocation,
          jobDate,
          inviterName,
          inviterEmail,
          inviterBusinessName
        })
      });

      console.log('Invitation email sent successfully:', emailData.id);

      return {
        success: true,
        messageId: emailData.id,
        message: 'Invitation email sent successfully!'
      };

    } catch (error) {
      console.error('Error sending invitation email:', error);
      throw new HttpsError(
        'internal',
        `Failed to send invitation email: ${error.message}`
      );
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
        from: 'ProXTrades <notifications@proxtrades.com>',
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

module.exports = { 
  sendJobInvitationEmail,
  notifyInvitationAccepted
};