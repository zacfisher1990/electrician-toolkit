/**
 * Email HTML Templates
 * Professional email templates for invoices, estimates, verification, welcome emails,
 * and job invitations
 */

/**
 * Generate HTML email content for invoice
 */
function generateInvoiceEmailHTML(invoice, customMessage, userInfo, paymentLinkUrl = null) {

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
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${userInfo.businessName || 'Electrician Pro X'}</h1>
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

                  ${paymentLinkUrl ? `
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                    <tr>
                      <td align="center">
                        <a href="${paymentLinkUrl}" 
                           style="display: inline-block; 
                                  background-color: #10b981; 
                                  color: #ffffff; 
                                  padding: 16px 40px; 
                                  font-size: 16px; 
                                  font-weight: 700; 
                                  text-decoration: none; 
                                  border-radius: 8px;
                                  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25);">
                          💳 Pay Now - $${parseFloat(invoice.total || invoice.amount || 0).toFixed(2)}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 12px;">
                        <p style="color: #6b7280; margin: 0; font-size: 12px;">
                          Secure payment powered by Stripe
                        </p>
                      </td>
                    </tr>
                  </table>
                  ` : ''}
                  
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
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${userInfo.businessName || 'Electrician Pro X'}</h1>
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
 * Generate HTML email content for email verification
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
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">⚡ Electrician Pro X</h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">
                    Verify Your Email
                  </h2>
                  
                  <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    Click the button below to verify your email address (${email}).
                  </p>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      Verify Email
                    </a>
                  </div>

                  <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                    If the button doesn't work, copy and paste this link:<br>
                    <span style="color: #3b82f6; word-break: break-all;">${verificationLink}</span>
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    If you didn't request this, you can safely ignore this email.
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
      <title>Verify Your Email - Reminder</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">⚡ Electrician Pro X</h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">
                    Verification Email Sent
                  </h2>
                  
                  <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    We've sent a new verification email to <strong>${email}</strong>.
                  </p>

                  <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                      <strong>📧 Check your inbox</strong><br>
                      Click the verification link in the email we just sent you.
                    </p>
                  </div>

                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                      <strong>⚠️ Check your spam folder</strong><br>
                      The verification email might be in your spam/junk folder.
                    </p>
                  </div>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} Electrician Pro X. All rights reserved.
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
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">⚡ Electrician Pro X</h1>
                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Built by an electrician, for electricians</p>
                  </td>
                </tr>
                
                <!-- Welcome Message -->
                <tr>
                  <td style="padding: 40px 30px 20px;">
                    <h2 style="margin: 0 0 15px 0; color: #111827; font-size: 24px; font-weight: 600;">
                      Welcome to the team! 🎉
                    </h2>
                    
                    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      You just got access to the only app that combines <strong>NEC code calculators</strong> with full <strong>business management</strong> — no more juggling spreadsheets, paper estimates, and five different apps.
                    </p>
                  </td>
                </tr>

                <!-- App Screenshots -->
                <tr>
                  <td style="padding: 0 30px 20px; text-align: center;">
                    <img src="https://proxtrades.com/images/email/jobs-screenshot.png" alt="Job Management" style="max-width: 100%; border-radius: 8px;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 30px 30px; text-align: center;">
                    <img src="https://proxtrades.com/images/email/estimates-invoices-screenshot.png" alt="Estimates & Invoices" style="max-width: 100%; border-radius: 8px;" />
                  </td>
                </tr>

                <!-- Free Features -->
                <tr>
                  <td style="padding: 0 30px 30px;">
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px;">
                      <h3 style="margin: 0 0 15px 0; color: #166534; font-size: 18px; font-weight: 600;">
                        ✅ Free Forever
                      </h3>
                      <ul style="margin: 0; padding-left: 20px; color: #15803d; font-size: 14px; line-height: 1.8;">
                        <li>20+ NEC compliant electrical calculators</li>
                        <li>NEC reference tables</li>
                        <li>Log up to 3 jobs per month</li>
                        <li>Create up to 3 estimates per month</li>
                        <li>Create up to 3 invoices per month</li>
                        <li>Track job hours</li>
                        <li>Track work hours and revenue</li>
                        <li>Receive job invitations & invite others to jobs</li>
                      </ul>
                    </div>
                  </td>
                </tr>

                <!-- Pro Features -->
                <tr>
                  <td style="padding: 0 30px 30px;">
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 24px;">
                      <h3 style="margin: 0 0 5px 0; color: #92400e; font-size: 18px; font-weight: 600;">
                        ⭐ Upgrade to Pro
                      </h3>
                      <p style="margin: 0 0 15px 0; color: #a16207; font-size: 14px;">
                        For electricians who mean business
                      </p>
                      <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.8;">
                        <li><strong>Unlimited job logging</strong></li>
                        <li><strong>Unlimited estimates</strong></li>
                        <li><strong>Unlimited invoices</strong></li>
                      </ul>
                      <div style="text-align: center; border-top: 1px solid #f59e0b; padding-top: 20px;">
                        <p style="margin: 0 0 5px 0; color: #92400e; font-size: 14px;">
                          <strong>Lifetime Access</strong>
                        </p>
                        <p style="margin: 0 0 15px 0; color: #92400e; font-size: 28px; font-weight: 700;">
                          $119.99 <span style="font-size: 14px; font-weight: 500;">one-time</span>
                        </p>
                        <p style="margin: 0 0 5px 0; color: #a16207; font-size: 13px;">
                          — or —
                        </p>
                        <p style="margin: 0; color: #92400e; font-size: 20px; font-weight: 600;">
                          $9.99<span style="font-size: 14px; font-weight: 500;">/month</span>
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding: 0 30px 30px; text-align: center;">
                    <a href="https://apps.apple.com/app/electrician-pro-x/id6740127498" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; padding: 16px 40px; font-size: 18px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);">
                      Open the App →
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #1f2937; padding: 30px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                      © ${new Date().getFullYear()} Electrician Pro X. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      Questions? Reply to this email or contact support@proxtrades.com
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
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">⚡ Electrician Pro X</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">
                      Account Deleted Successfully
                    </h2>
                    
                    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      ${userName ? `Hi ${userName},` : 'Hi,'}<br><br>
                      This email confirms that your Electrician Pro X account (${userEmail}) has been permanently deleted.
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
                        Thank you for using Electrician Pro X. We're sorry to see you go!
                      </p>
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                      © ${new Date().getFullYear()} Electrician Pro X. All rights reserved.
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

/**
 * Generate HTML email for job invitation
 */
function generateJobInvitationEmailHTML(data) {
  const {
    inviteeEmail,
    jobTitle,
    jobClient,
    jobLocation,
    jobDate,
    inviterName,
    inviterEmail,
    inviterBusinessName
  } = data;

  const formattedDate = jobDate 
    ? new Date(jobDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'TBD';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Invitation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">⚡ Electrician Pro X</h1>
                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Job Invitation</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">
                      You're Invited to Join a Job! 🔧
                    </h2>
                    
                    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      <strong>${inviterName || inviterBusinessName || inviterEmail}</strong> has invited you to join their team on a job.
                    </p>

                    <!-- Job Details Card -->
                    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                      <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px; font-weight: 600;">
                        ${jobTitle}
                      </h3>
                      
                      <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                          <td style="color: #6b7280; font-size: 14px; width: 100px;">
                            👤 Client:
                          </td>
                          <td style="color: #111827; font-size: 14px; font-weight: 500;">
                            ${jobClient}
                          </td>
                        </tr>
                        ${jobLocation ? `
                        <tr>
                          <td style="color: #6b7280; font-size: 14px;">
                            📍 Location:
                          </td>
                          <td style="color: #111827; font-size: 14px; font-weight: 500;">
                            ${jobLocation}
                          </td>
                        </tr>
                        ` : ''}
                        ${jobDate ? `
                        <tr>
                          <td style="color: #6b7280; font-size: 14px;">
                            📅 Date:
                          </td>
                          <td style="color: #111827; font-size: 14px; font-weight: 500;">
                            ${formattedDate}
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                    </div>

                    <!-- Permissions Notice -->
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                        <strong>⚡ What you'll be able to do:</strong><br>
                        • View job details and notes<br>
                        • Clock in and out to track your time<br>
                        • View job photos<br><br>
                        <em>Note: You won't have access to costs, estimates, or invoices.</em>
                      </p>
                    </div>

                    <!-- CTA -->
                    <div style="text-align: center; margin: 30px 0;">
                      <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">
                        Log in to your Electrician Pro X account to accept or decline this invitation:
                      </p>
                      <a href="https://electrician-toolkit.vercel.app" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                        View Invitation
                      </a>
                    </div>

                    <!-- Don't have account notice -->
                    <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                        <strong>📱 Don't have an account yet?</strong><br>
                        Create a free Electrician Pro X account using this email address (${inviteeEmail}) to accept this invitation.
                      </p>
                    </div>

                    <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px;">
                      This invitation was sent by ${inviterEmail}. If you don't recognize this sender, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                      © ${new Date().getFullYear()} Electrician Pro X. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      Professional electrical business management
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
 * Generate HTML email for invitation accepted notification
 */
function generateInvitationAcceptedEmailHTML(data) {
  const {
    ownerEmail,
    inviteeName,
    inviteeEmail,
    jobTitle,
    jobClient,
    acceptedAt
  } = data;

  const formattedDate = acceptedAt?.toDate 
    ? acceptedAt.toDate().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation Accepted</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">⚡ Electrician Pro X</h1>
                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Team Update</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">
                      ✅ Invitation Accepted!
                    </h2>
                    
                    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      Great news! <strong>${inviteeName}</strong> has accepted your invitation to join the job.
                    </p>

                    <!-- Details Card -->
                    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                      <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                          <td style="color: #6b7280; font-size: 14px; width: 120px;">
                            🔧 Job:
                          </td>
                          <td style="color: #111827; font-size: 14px; font-weight: 600;">
                            ${jobTitle}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #6b7280; font-size: 14px;">
                            👤 Client:
                          </td>
                          <td style="color: #111827; font-size: 14px; font-weight: 500;">
                            ${jobClient}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #6b7280; font-size: 14px;">
                            👷 Team Member:
                          </td>
                          <td style="color: #111827; font-size: 14px; font-weight: 500;">
                            ${inviteeName}<br>
                            <span style="color: #6b7280; font-size: 12px;">${inviteeEmail}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #6b7280; font-size: 14px;">
                            ⏰ Accepted:
                          </td>
                          <td style="color: #111827; font-size: 14px; font-weight: 500;">
                            ${formattedDate}
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Info Notice -->
                    <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                        <strong>📊 Team member permissions:</strong><br>
                        • Can view job details and clock in/out<br>
                        • Cannot see costs, estimates, or invoices<br>
                        • Their time tracking is separate from yours
                      </p>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://electrician-toolkit.vercel.app" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                        View Job Details
                      </a>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                      © ${new Date().getFullYear()} Electrician Pro X. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      Professional electrical business management
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
  generateAccountDeletionHTML,
  generateJobInvitationEmailHTML,
  generateInvitationAcceptedEmailHTML
};