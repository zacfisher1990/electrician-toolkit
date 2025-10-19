import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, type = 'welcome' } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    let subject, html;

    if (type === 'verification-reminder') {
      // Reminder email when user requests resend
      subject = '⚡ Verify Your Email - Electrician Toolkit';
      html = `
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
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">⚡ Electrician Toolkit</h1>
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
                          Click the verification link in that email to activate your account and start using Electrician Toolkit!
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
                          © ${new Date().getFullYear()} Electrician Toolkit. All rights reserved.
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
    } else {
      // Welcome email (original)
      subject = '🎉 Welcome to Electrician Toolkit!';
      html = `
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
                        <h2 style="margin: 10px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 600;">Welcome to Electrician Toolkit!</h2>
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
                            <li>Create estimates and invoices</li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                          © ${new Date().getFullYear()} Electrician Toolkit. All rights reserved.
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

    // Send email via Resend
    const data = await resend.emails.send({
      from: 'Electrician Toolkit <onboarding@resend.dev>',
      to: email,
      subject: subject,
      html: html
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        messageId: data.id 
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message 
      })
    };
  }
};