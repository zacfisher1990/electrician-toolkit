/**
 * Firebase Cloud Functions v2 - Main Entry Point
 * 
 * This file exports all cloud functions by importing them from their modular files.
 * Each function is organized in its own file for better maintainability.
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
const { sendVerificationEmail } = require('./src/functions/sendVerificationEmail');
const { sendWelcomeEmail } = require('./src/functions/sendWelcomeEmail');
const { deleteUserAccount } = require('./src/functions/deleteUserAccount');

// Export all functions
exports.sendInvoiceEmail = sendInvoiceEmail;
exports.sendEstimateEmail = sendEstimateEmail;
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.deleteUserAccount = deleteUserAccount;