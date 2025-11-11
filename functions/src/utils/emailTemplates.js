/**
 * Email HTML Templates
 * Professional email templates for invoices, estimates, verification, and welcome emails
 */

/**
 * Generate HTML email content for invoice
 */
function generateInvoiceEmailHTML(invoice, customMessage, userInfo) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${invoice.invoiceNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="background-color: #3b82f6; padding: 30px; text-align: center;">
                  ${userInfo.companyLogo ? `
                    <img src="${userInfo.companyLogo}" alt="${userInfo.businessName || 'Company Logo'}" style="max-width: 120px; max-height: 120px; margin-bottom: 15px; background: white; padding: 10px; border-radius: 8px;" />
                  ` : ''}
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${userInfo.businessName || 'Electrician Toolkit'}</h1>
                  <p style="color: #ffffff; margin: 10px 0 0; font-size: 14px;">${userInfo.email || ''}</p>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #111827; margin: 0 0 20px; font-size: 20px;">Invoice #${invoice.invoiceNumber || 'N/A'}</h2>
                  
                  ${customMessage ? `
                    <p style="color: #6b7280; margin: 0 0 20px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${customMessage}</p>
                  ` : ''}
                  
                  <table width="100%" cellpadding="10" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; margin: 20px 0;">
                    <tr style="background-color: #f9fafb;">
                      <td style="color: #6b7280; font-size: 14px;">Invoice Date:</td>
                      <td align="right" style="color: #111827; font-size: 14px; font-weight: 600;">${invoice.date || new Date().toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Due Date:</td>
                      <td align="right" style="color: #111827; font-size: 14px; font-weight: 600; border-top: 1px solid #e5e7eb;">${invoice.dueDate || 'Upon Receipt'}</td>
                    </tr>
                    <tr style="background-color: #f9fafb;">
                      <td style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Amount Due:</td>
                      <td align="right" style="color: #3b82f6; font-size: 18px; font-weight: 700; border-top: 1px solid #e5e7eb;">$${parseFloat(invoice.total || invoice.amount || 0).toFixed(2)}</td>
                    </tr>
                  </table>
                  
                  <p style="color: #6b7280; margin: 20px 0 0; font-size: 13px;">
                    The invoice is attached as a PDF. If you have any questions, please don't hesitate to reach out.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                    Thank you for your business!
                  </p>
                  ${userInfo.phone ? `
                    <p style="color: #9ca3af; margin: 10px 0 0; font-size: 12px;">
                      ${userInfo.phone}
                    </p>
                  ` : ''}
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

/**
 * Generate HTML email content for estimate
 */
function generateEstimateEmailHTML(estimate, customMessage, userInfo) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Estimate: ${estimate.name}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="background-color: #10b981; padding: 30px; text-align: center;">
                  ${userInfo.companyLogo ? `
                    <img src="${userInfo.companyLogo}" alt="${userInfo.businessName || 'Company Logo'}" style="max-width: 120px; max-height: 120px; margin-bottom: 15px; background: white; padding: 10px; border-radius: 8px;" />
                  ` : ''}
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${userInfo.businessName || 'Electrician Toolkit'}</h1>
                  <p style="color: #ffffff; margin: 10px 0 0; font-size: 14px;">${userInfo.email || ''}</p>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #111827; margin: 0 0 20px; font-size: 20px;">Estimate: ${estimate.name || 'Your Project'}</h2>
                  
                  ${customMessage ? `
                    <p style="color: #6b7280; margin: 0 0 20px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${customMessage}</p>
                  ` : ''}
                  
                  <table width="100%" cellpadding="10" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; margin: 20px 0;">
                    <tr style="background-color: #f9fafb;">
                      <td style="color: #6b7280; font-size: 14px;">Estimate Date:</td>
                      <td align="right" style="color: #111827; font-size: 14px; font-weight: 600;">${estimate.createdAt?.seconds ? new Date(estimate.createdAt.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Valid Until:</td>
                      <td align="right" style="color: #111827; font-size: 14px; font-weight: 600; border-top: 1px solid #e5e7eb;">${(() => {
                        const date = estimate.createdAt?.seconds ? new Date(estimate.createdAt.seconds * 1000) : new Date();
                        date.setDate(date.getDate() + 30);
                        return date.toLocaleDateString();
                      })()}</td>
                    </tr>
                    <tr style="background-color: #f9fafb;">
                      <td style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Total:</td>
                      <td align="right" style="color: #10b981; font-size: 18px; font-weight: 700; border-top: 1px solid #e5e7eb;">$${parseFloat(estimate.total || 0).toFixed(2)}</td>
                    </tr>
                  </table>
                  
                  <p style="color: #6b7280; margin: 20px 0 0; font-size: 13px;">
                    The estimate is attached as a PDF. This estimate is valid for 30 days. If you have any questions, please don't hesitate to reach out.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                    Thank you for considering our services!
                  </p>
                  ${userInfo.phone ? `
                    <p style="color: #9ca3af; margin: 10px 0 0; font-size: 12px;">
                      ${userInfo.phone}
                    </p>
                  ` : ''}
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

/**
 * Generate HTML for verification email with link
 */
function generateVerificationEmailHTML(email, verificationLink) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">⚡</h1>
                    <h2 style="margin: 10px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 600;">Verify Your Email</h2>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <h3 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600;">
                      Welcome to ProXTrades! 🚀
                    </h3>
                    
                    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      Thanks for signing up! Please verify your email address to activate your account and start managing your electrical business.
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${verificationLink}" 
                             style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                      Or copy and paste this link into your browser:<br>
                      <a href="${verificationLink}" style="color: #3b82f6; word-break: break-all;">
                        ${verificationLink}
                      </a>
                    </p>

                    <div style="margin-top: 30px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                        <strong>⏰ This link expires in 24 hours</strong><br>
                        Please verify your email soon to ensure uninterrupted access.
                      </p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                        If you didn't create an account with ProXTrades, you can safely ignore this email.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                      © ${new Date().getFullYear()} ProXTrades. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      This is an automated email, please do not reply.
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

/**
 * Generate HTML for verification reminder email
 */
function generateVerificationReminderHTML(email) {
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
                
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">⚡ ProXTrades</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">
                      📧 Check Your Email
                    </h2>
                    
                    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      We've sent a verification email to <strong>${email}</strong>
                    </p>

                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                        <strong>📥 Check your spam/junk folder</strong><br>
                        Verification emails sometimes end up there. If you find it, mark it as "Not Spam" to ensure future emails arrive in your inbox.
                      </p>
                    </div>
                    
                    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      Click the verification link in that email to activate your account and start using ProXTrades!
                    </p>

                    <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                        <strong>Didn't receive the email?</strong><br>
                        • Wait a few minutes and check again<br>
                        • Check your spam/junk folder<br>
                        • Make sure ${email} is correct
                      </p>
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                      © ${new Date().getFullYear()} ProXTrades. All rights reserved.
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

/**
 * Generate HTML for welcome email
 */
function generateWelcomeHTML(email) {
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
                
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">⚡</h1>
                    <h2 style="margin: 10px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 600;">Welcome to ProXTrades!</h2>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <h3 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600;">
                      You're almost ready to go! 🚀
                    </h3>
                    
                    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      Thanks for signing up! To get started, please verify your email address.
                    </p>

                    <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                        <strong>📧 Check your inbox</strong><br>
                        We've sent a verification email to <strong>${email}</strong>. Click the link in that email to verify your account.
                      </p>
                    </div>

                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                        <strong>⚠️ Check your spam folder</strong><br>
                        The verification email might be in your spam/junk folder. If you find it there, mark it as "Not Spam".
                      </p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                      <h4 style="margin: 0 0 15px 0; color: #111827; font-size: 16px; font-weight: 600;">
                        What's Next?
                      </h4>
                      <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                        <li>Verify your email address</li>
                        <li>Log in to your account</li>
                        <li>Start managing your electrical jobs</li>
                        <li>Create professional estimates and invoices</li>
                        <li>Track your business all in one place</li>
                      </ul>
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                      © ${new Date().getFullYear()} ProXTrades. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      If you didn't create an account, you can safely ignore this email.
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

/**
 * Generate HTML for account deletion confirmation email
 */
function generateAccountDeletionHTML(userEmail, userName) {
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
                
                <tr>
                  <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">⚡ ProXTrades</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">
                      Account Deleted Successfully
                    </h2>
                    
                    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      ${userName ? `Hi ${userName},` : 'Hi,'}<br><br>
                      This email confirms that your ProXTrades account (${userEmail}) has been permanently deleted.
                    </p>

                    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                        <strong>⚠️ This action is permanent</strong><br>
                        All your data has been removed from our systems, including:
                      </p>
                      <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #991b1b; font-size: 14px; line-height: 1.8;">
                        <li>Jobs and project information</li>
                        <li>Estimates and invoices</li>
                        <li>Client data</li>
                        <li>Photos and documents</li>
                        <li>Profile settings</li>
                      </ul>
                    </div>

                    <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                        <strong>💡 Changed your mind?</strong><br>
                        You can create a new account anytime at electrician-toolkit.com. However, your previous data cannot be recovered.
                      </p>
                    </div>
                    
                    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      If you didn't request this deletion or believe this was done in error, please contact our support team immediately.
                    </p>

                    <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Thank you for using ProXTrades. We're sorry to see you go!
                      </p>
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                      © ${new Date().getFullYear()} ProXTrades. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      This is an automated confirmation email.
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

module.exports = {
  generateInvoiceEmailHTML,
  generateEstimateEmailHTML,
  generateVerificationEmailHTML,
  generateVerificationReminderHTML,
  generateWelcomeHTML,
  generateAccountDeletionHTML
};