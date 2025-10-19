import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler = async (event) => {

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, verificationLink } = JSON.parse(event.body);

    if (!email || !verificationLink) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and verification link are required' })
      };
    }

    const data = await resend.emails.send({
      from: 'Electrician Toolkit <onboarding@resend.dev>',
      to: email,
      subject: '⚡ Verify Your Email - Electrician Toolkit',
      html: `
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
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">⚡</h1>
                        <h2 style="margin: 10px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 600;">Verify Your Email</h2>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h3 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600;">
                          Welcome to Electrician Toolkit! 🚀
                        </h3>
                        
                        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                          Thanks for signing up! Please verify your email address to activate your account and start managing your electrical jobs.
                        </p>
                        
                        <!-- CTA Button -->
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
                            If you didn't create an account with Electrician Toolkit, you can safely ignore this email.
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                          © ${new Date().getFullYear()} Electrician Toolkit. All rights reserved.
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
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        messageId: data.id 
      })
    };

  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send verification email',
        details: error.message 
      })
    };
  }
};