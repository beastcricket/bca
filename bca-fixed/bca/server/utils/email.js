// ════════════════════════════════════════════════════════════════════════════
// EMAIL UTILITY - COMPLETE FIX FOR GMAIL VERIFICATION
// ════════════════════════════════════════════════════════════════════════════
// FILE PATH: bca-fixed/bca/server/utils/email.js
// REPLACE THE ENTIRE FILE WITH THIS CODE
// ════════════════════════════════════════════════════════════════════════════

const nodemailer = require('nodemailer');

// ─── Gmail SMTP Configuration ───────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: 'beastcricketofficialauction@gmail.com',
    pass: 'gdgzafbzoyjmgrxx', // Gmail App Password (16 chars, no spaces)
  },
  debug: true, // Enable debug logs
  logger: true // Enable logger
});

// ─── Verify Transporter (callable, returns a Promise) ───────────────────────
function verifyTransporter() {
  return new Promise((resolve, reject) => {
    transporter.verify(function(error, success) {
      if (error) {
        console.log('═══════════════════════════════════════════════════════');
        console.log('❌ EMAIL SMTP VERIFICATION FAILED!');
        console.log('═══════════════════════════════════════════════════════');
        console.log('Error:', error.message);
        console.log('');
        console.log('TROUBLESHOOTING:');
        console.log('1. Check your Gmail App Password is correct');
        console.log('2. Ensure 2-Step Verification is enabled on Gmail');
        console.log('3. Try regenerating the App Password');
        console.log('4. Check if Less Secure Apps is OFF (we use App Password)');
        console.log('═══════════════════════════════════════════════════════');
        reject(error);
      } else {
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ EMAIL SMTP CONNECTION VERIFIED SUCCESSFULLY!');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📧 Email service is ready to send messages');
        console.log('📤 From: beastcricketofficialauction@gmail.com');
        console.log('🔐 Using Gmail App Password authentication (port 465 SSL)');
        console.log('═══════════════════════════════════════════════════════');
        resolve(true);
      }
    });
  });
}

// ─── Check if email is configured ───────────────────────────────────────────
function isEmailConfigured() {
  return true; // Gmail credentials are hardcoded and verified
}

// ─── Send Verification Email ────────────────────────────────────────────────
async function sendVerificationEmail(to, name, token) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

  console.log('📧 Preparing verification email...');
  console.log('   To:', to);
  console.log('   Link:', verificationLink);

  const mailOptions = {
    from: '"Beast Cricket Auction" <beastcricketofficialauction@gmail.com>',
    to: to,
    subject: '🏏 Verify Your Beast Cricket Auction Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4; 
            margin: 0; 
            padding: 0; 
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: #ffffff; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: bold; 
          }
          .header p { 
            margin: 10px 0 0 0; 
            font-size: 16px; 
            opacity: 0.95; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .content h2 { 
            color: #1f2937; 
            margin-top: 0; 
            font-size: 22px; 
          }
          .content p { 
            color: #4b5563; 
            font-size: 16px; 
            line-height: 1.6; 
          }
          .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
            color: white !important; 
            padding: 16px 40px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold; 
            font-size: 16px; 
            margin: 20px 0; 
            text-align: center; 
            box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(245, 158, 11, 0.4);
          }
          .footer { 
            background: #f9fafb; 
            padding: 20px 30px; 
            text-align: center; 
            font-size: 14px; 
            color: #6b7280; 
            border-top: 1px solid #e5e7eb; 
          }
          .footer a { 
            color: #f59e0b; 
            text-decoration: none; 
          }
          .divider { 
            height: 1px; 
            background: #e5e7eb; 
            margin: 30px 0; 
          }
          .note {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .note p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏏 Beast Cricket Auction</h1>
            <p>Complete Your Registration</p>
          </div>
          
          <div class="content">
            <h2>Welcome to Beast Cricket Auction!</h2>
            <p>Thank you for registering with us. We're excited to have you join our cricket auction platform!</p>
            
            <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" class="button">✅ Verify Email Address</a>
            </div>
            
            <div class="note">
              <p><strong>⏰ Note:</strong> This verification link will expire in 24 hours for security reasons.</p>
            </div>
            
            <div class="divider"></div>
            
            <p><strong>If the button doesn't work, copy and paste this link into your browser:</strong></p>
            <p style="word-break: break-all; color: #f59e0b; font-size: 14px;">${verificationLink}</p>
            
            <div class="divider"></div>
            
            <p style="font-size: 14px; color: #6b7280;">
              If you didn't create an account with Beast Cricket Auction, please ignore this email or contact our support team.
            </p>
          </div>
          
          <div class="footer">
            <p>
              <strong>Beast Cricket Auction</strong><br>
              Official Cricket Auction Platform<br>
              <a href="mailto:beastcricketofficialauction@gmail.com">beastcricketofficialauction@gmail.com</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px;">
              © ${new Date().getFullYear()} Beast Cricket Auction. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    console.log('📤 Sending verification email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send verification email:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    throw error;
  }
}

// ─── Send Password Reset Email ──────────────────────────────────────────────
async function sendPasswordResetEmail(to, token) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  console.log('📧 Preparing password reset email...');
  console.log('   To:', to);
  console.log('   Link:', resetLink);

  const mailOptions = {
    from: '"Beast Cricket Auction" <beastcricketofficialauction@gmail.com>',
    to: to,
    subject: '🔐 Reset Your Beast Cricket Auction Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4; 
            margin: 0; 
            padding: 0; 
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: #ffffff; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: bold; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); 
            color: white !important; 
            padding: 16px 40px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold; 
            font-size: 16px; 
            margin: 20px 0; 
            text-align: center; 
            box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
          }
          .warning {
            background: #fee2e2;
            border-left: 4px solid #dc2626;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer { 
            background: #f9fafb; 
            padding: 20px 30px; 
            text-align: center; 
            font-size: 14px; 
            color: #6b7280; 
            border-top: 1px solid #e5e7eb; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password for your Beast Cricket Auction account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" class="button">🔑 Reset Password</a>
            </div>
            
            <div class="warning">
              <p style="margin: 0; color: #991b1b;"><strong>⏰ Important:</strong> This link expires in 1 hour.</p>
            </div>
            
            <p><strong>If you didn't request this, please ignore this email.</strong> Your password will remain unchanged.</p>
            
            <p style="word-break: break-all; color: #dc2626; font-size: 14px; margin-top: 20px;">
              <strong>Link:</strong> ${resetLink}
            </p>
          </div>
          
          <div class="footer">
            <p>
              <strong>Beast Cricket Auction</strong><br>
              <a href="mailto:beastcricketofficialauction@gmail.com">beastcricketofficialauction@gmail.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    console.log('📤 Sending password reset email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully!');
    console.log('   Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send password reset email:');
    console.error('   Error:', error.message);
    throw error;
  }
}

// ─── Send Welcome Email ─────────────────────────────────────────────────────
async function sendWelcomeEmail(to, userName) {
  console.log('📧 Preparing welcome email for:', userName);

  const mailOptions = {
    from: '"Beast Cricket Auction" <beastcricketofficialauction@gmail.com>',
    to: to,
    subject: '🎉 Welcome to Beast Cricket Auction!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .button { display: inline-block; background: #f59e0b; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏏 Welcome to Beast Cricket Auction!</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}! 🎉</h2>
            <p>Your account has been successfully verified and activated!</p>
            <p>You can now:</p>
            <ul>
              <li>✅ Browse and join cricket auctions</li>
              <li>✅ Create your own team</li>
              <li>✅ Participate in live bidding</li>
              <li>✅ Manage your players</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">🚀 Get Started</a>
            </div>
            <p>If you have any questions, feel free to contact us at <a href="mailto:beastcricketofficialauction@gmail.com">beastcricketofficialauction@gmail.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    console.log('📤 Sending welcome email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully!');
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error.message);
    throw error;
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  verifyTransporter,
  isEmailConfigured,
  transporter
};
