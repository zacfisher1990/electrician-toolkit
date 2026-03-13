/**
 * Cloud Function: Handle Estimate Response
 * Public HTTP endpoint — no auth required.
 * Called when a client clicks Accept / Reject / Request Changes in the estimate email.
 *
 * Query params:
 *   estimateId  - Firestore estimate document ID
 *   action      - "accept" | "reject" | "requestChanges"
 *   token       - responseToken stored on the estimate doc (prevents unauthorized actions)
 *   userId      - contractor's Firebase UID (to send them a notification)
 */

const { onRequest } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { Resend } = require('resend');

const resendApiKey = defineString('RESEND_API_KEY');

// Map action param → human-readable label and Firestore status value
const ACTION_MAP = {
  accept: {
    status: 'Accepted',
    label: 'accepted',
    emoji: '✅',
    color: '#16a34a',
    clientMessage: 'You have accepted this estimate. The contractor will be in touch shortly to schedule the work.',
    contractorSubject: '✅ Estimate Accepted',
    contractorBody: (estimate, clientName) =>
      `Great news! ${clientName || 'Your client'} has accepted estimate <strong>${estimate.estimateNumber || estimate.name}</strong> for <strong>$${parseFloat(estimate.total || 0).toFixed(2)}</strong>.`,
  },
  reject: {
    status: 'Rejected',
    label: 'declined',
    emoji: '✗',
    color: '#dc2626',
    clientMessage: 'You have declined this estimate. The contractor has been notified.',
    contractorSubject: '✗ Estimate Declined',
    contractorBody: (estimate, clientName) =>
      `${clientName || 'Your client'} has declined estimate <strong>${estimate.estimateNumber || estimate.name}</strong> for <strong>$${parseFloat(estimate.total || 0).toFixed(2)}</strong>.`,
  },
  requestChanges: {
    status: 'Changes Requested',
    label: 'requested changes on',
    emoji: '🔄',
    color: '#d97706',
    clientMessage: 'Your request for changes has been sent. The contractor will follow up with a revised estimate.',
    contractorSubject: '🔄 Client Requested Changes',
    contractorBody: (estimate, clientName) =>
      `${clientName || 'Your client'} has requested changes to estimate <strong>${estimate.estimateNumber || estimate.name}</strong> for <strong>$${parseFloat(estimate.total || 0).toFixed(2)}</strong>. Please follow up with a revised estimate.`,
  },
};

/**
 * Returns a simple branded HTML page shown to the client after they click a button
 */
function buildResponsePage(title, message, color, emoji) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} — Electrician Pro X</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #111827;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .card {
          background: #1f2937;
          border-radius: 16px;
          padding: 48px 40px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          border-top: 4px solid ${color};
        }
        .emoji { font-size: 56px; margin-bottom: 20px; }
        .brand {
          color: #F7C600;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 16px; }
        p { color: #9ca3af; font-size: 15px; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="brand">⚡ Electrician Pro X</div>
        <div class="emoji">${emoji}</div>
        <h1>${title}</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `;
}

const handleEstimateResponse = onRequest(
  { cors: false },
  async (req, res) => {
    const { estimateId, action, token, userId } = req.query;

    // --- Validate required params ---
    if (!estimateId || !action || !token || !userId) {
      res.status(400).send(buildResponsePage(
        'Invalid Link',
        'This link is missing required information. Please contact your contractor.',
        '#dc2626',
        '⚠️'
      ));
      return;
    }

    const actionConfig = ACTION_MAP[action];
    if (!actionConfig) {
      res.status(400).send(buildResponsePage(
        'Invalid Action',
        'This link contains an unrecognized action. Please contact your contractor.',
        '#dc2626',
        '⚠️'
      ));
      return;
    }

    const db = getFirestore();

    try {
      // --- Fetch the estimate doc ---
      const estimateRef = db.collection('estimates').doc(estimateId);
      const estimateSnap = await estimateRef.get();

      if (!estimateSnap.exists) {
        res.status(404).send(buildResponsePage(
          'Estimate Not Found',
          'This estimate could not be found. It may have been deleted.',
          '#dc2626',
          '🔍'
        ));
        return;
      }

      const estimate = { id: estimateSnap.id, ...estimateSnap.data() };

      // --- Validate the token ---
      if (!estimate.responseToken || estimate.responseToken !== token) {
        res.status(403).send(buildResponsePage(
          'Link Expired or Invalid',
          'This link is no longer valid. A new link will be included if the estimate is resent.',
          '#dc2626',
          '🔒'
        ));
        return;
      }

      // --- Idempotency: already responded ---
      const alreadyResponded = ['Accepted', 'Rejected', 'Changes Requested'].includes(estimate.status);
      if (alreadyResponded) {
        res.send(buildResponsePage(
          'Already Responded',
          `This estimate has already been ${estimate.status.toLowerCase()}. No further action is needed.`,
          '#6b7280',
          'ℹ️'
        ));
        return;
      }

      // --- Update Firestore ---
      await estimateRef.update({
        status: actionConfig.status,
        respondedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        // Invalidate the token so the link can't be reused
        responseToken: FieldValue.delete(),
      });

      // --- Fetch contractor user doc for email + FCM token ---
      const userSnap = await db.collection('users').doc(userId).get();
      const contractor = userSnap.exists ? userSnap.data() : {};
      const contractorEmail = contractor.email || null;
      const fcmToken = contractor.fcmToken || null;
      const businessName = contractor.businessName || contractor.displayName || 'Electrician Pro X';
      const clientName = estimate.clientName || 'Your client';

      // --- Send contractor notification email ---
      if (contractorEmail) {
        try {
          const resend = new Resend(resendApiKey.value());
          await resend.emails.send({
            from: 'Electrician Pro X <notifications@proxtrades.com>',
            to: contractorEmail,
            subject: `${actionConfig.contractorSubject} — ${estimate.name || estimate.estimateNumber || 'Estimate'}`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f9fafb;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
                  <tr><td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                      <tr>
                        <td style="background:#292929;padding:30px;text-align:center;border-bottom:4px solid #F7C600;">
                          <h1 style="color:#F7C600;margin:0;font-size:22px;">⚡ Electrician Pro X</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:40px 30px;">
                          <h2 style="color:#111827;margin:0 0 16px;font-size:20px;">${actionConfig.contractorSubject}</h2>
                          <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
                            ${actionConfig.contractorBody(estimate, clientName)}
                          </p>
                          <table width="100%" cellpadding="12" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;">
                            <tr style="background:#f9fafb;">
                              <td style="color:#6b7280;font-size:14px;">Estimate:</td>
                              <td align="right" style="color:#111827;font-size:14px;font-weight:600;">${estimate.name || estimate.estimateNumber || '—'}</td>
                            </tr>
                            <tr>
                              <td style="color:#6b7280;font-size:14px;border-top:1px solid #e5e7eb;">Client:</td>
                              <td align="right" style="color:#111827;font-size:14px;font-weight:600;border-top:1px solid #e5e7eb;">${clientName}</td>
                            </tr>
                            <tr style="background:#f9fafb;">
                              <td style="color:#6b7280;font-size:14px;border-top:1px solid #e5e7eb;">Total:</td>
                              <td align="right" style="color:#F7C600;font-size:18px;font-weight:700;border-top:1px solid #e5e7eb;">$${parseFloat(estimate.total || 0).toFixed(2)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="background:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #e5e7eb;">
                          <p style="color:#9ca3af;margin:0;font-size:12px;">Open Electrician Pro X to view and manage this estimate.</p>
                        </td>
                      </tr>
                    </table>
                  </td></tr>
                </table>
              </body>
              </html>
            `,
          });
          console.log('Contractor notification email sent to:', contractorEmail);
        } catch (emailError) {
          // Don't fail the whole request if email fails
          console.error('Failed to send contractor notification email:', emailError);
        }
      }

      // --- Send push notification via FCM ---
      if (fcmToken) {
        try {
          await getMessaging().send({
            token: fcmToken,
            notification: {
              title: `${actionConfig.emoji} Estimate ${actionConfig.status}`,
              body: `${clientName} has ${actionConfig.label} ${estimate.name || estimate.estimateNumber || 'an estimate'}.`,
            },
            data: {
              type: 'estimate_response',
              estimateId: estimateId,
              status: actionConfig.status,
            },
          });
          console.log('Push notification sent');
        } catch (fcmError) {
          // Don't fail the whole request if push fails
          console.error('Failed to send push notification:', fcmError);
        }
      }

      // --- Return success page to client ---
      res.send(buildResponsePage(
        actionConfig.status,
        actionConfig.clientMessage,
        actionConfig.color,
        actionConfig.emoji
      ));

    } catch (error) {
      console.error('handleEstimateResponse error:', error);
      res.status(500).send(buildResponsePage(
        'Something Went Wrong',
        'We were unable to process your response. Please try again or contact your contractor directly.',
        '#dc2626',
        '⚠️'
      ));
    }
  }
);

module.exports = { handleEstimateResponse };