import { Resend } from 'resend';

export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email } = JSON.parse(event.body);
    
    const resend = new Resend(process.env.RESEND_API_KEY);

    const data = await resend.emails.send({
      from: 'Electrician\'s Toolkit <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to Electrician\'s Toolkit! 🔌',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to Electrician's Toolkit!</h1>
          
          <p>Hi there!</p>
          
          <p>Thanks for signing up! You now have access to essential tools for electricians:</p>
          
          <ul>
            <li>📅 Job Calendar & Management</li>
            <li>⚡ Basic Electrical Calculators</li>
            <li>📊 Project Tracking</li>
          </ul>
          
          <h2 style="color: #2563eb;">Upgrade to Premium</h2>
          
          <p>Take your business to the next level with our <strong>Premium subscription</strong>:</p>
          
          <ul>
            <li>💰 <strong>Professional Estimates</strong> - Create detailed quotes instantly</li>
            <li>📄 <strong>Automated Invoicing</strong> - Generate invoices with one click</li>
            <li>📈 <strong>Advanced Job Logging</strong> - Track every detail</li>
            <li>💾 <strong>Save Calculations</strong> - Access your work history anytime</li>
            <li>📊 <strong>Business Analytics</strong> - Understand your performance</li>
            <li>☁️ <strong>Cloud Sync</strong> - Access from any device</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://yourapp.com/upgrade" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Upgrade to Premium
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Questions? Reply to this email anytime!
          </p>
          
          <p>Thanks,<br>The Electrician's Toolkit Team</p>
        </div>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};