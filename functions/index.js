/**
 * Firebase Cloud Functions v2 - Main Entry Point
 * 
 * This file exports all cloud functions by importing them from their modular files.
 * Each function is organized in its own file for better maintainability.
 * 
 * UPDATED: Removed custom email verification functions as we now use
 * Firebase's built-in email verification system.
 * 
 * Installation:
 * 1. cd functions
 * 2. npm install resend pdfkit
 * 3. Set config: firebase functions:config:set resend.api_key="your_key_here"
 * 4. For local: Add RESEND_API_KEY to functions/.env
 * 5. Deploy: firebase deploy --only functions
 */

// Import all cloud functions
const { sendInvoiceEmail } = require('./src/functions/sendInvoiceEmail');
const { sendEstimateEmail } = require('./src/functions/sendEstimateEmail');
const { deleteUserAccount } = require('./src/functions/deleteUserAccount');
const { sendJobInvitationEmail, notifyInvitationAccepted } = require('./src/functions/sendJobInvitationEmail'); 

// Optional: Keep welcome email if you still want to send custom welcome emails
// const { sendWelcomeEmail } = require('./src/functions/sendWelcomeEmail');

// Export all functions
exports.sendInvoiceEmail = sendInvoiceEmail;
exports.sendEstimateEmail = sendEstimateEmail;
exports.deleteUserAccount = deleteUserAccount;
exports.sendJobInvitationEmail = sendJobInvitationEmail; 
exports.notifyInvitationAccepted = notifyInvitationAccepted;
// Optional: Export welcome email if you kept it above
// exports.sendWelcomeEmail = sendWelcomeEmail;