const nodemailer = require('nodemailer');

const isEmailConfigured = () => {
  const u = process.env.EMAIL_USER || '';
  const p = process.env.EMAIL_PASS || '';
  const configured = u.length > 0 && p.length > 0 && u !== 'your_email@gmail.com' && p !== 'your_app_password_here';
  console.log('✅ Email configured:', configured ? 'YES' : 'NO');
  return configured;
};

const createTransport = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    socketTimeout: 10000,
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter error:', error.message);
    } else {
      console.log('✅ Email transporter ready');
    }
  });

  return transporter;
};

const wrap = (title, body) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin: 0; padding: 0; background: #04040a; font-family: Arial, sans-serif; }
  .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px; text-align: center; }
  .header h1 { margin: 0; color: #000; font-size: 24px; font-weight: 900; }
  .body { padding: 36px 32px; background: #0f172a; }
  .footer { padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center; background: #0f172a; }
  .button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px; }
  .text-muted { color: #94a3b8; font-size: 15px; line-height: 1.7; }
  .text-small { color: #475569; font-size: 12px; }
</style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding: 40px 20px;">
<table width="580" cellpadding="0" cellspacing="0" style="background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(245,158,11,0.25);">
  <tr><td class="header">
    <h1>🏏 BEAST CRICKET AUCTION</h1>
    <p style="margin: 6px 0 0; color: rgba(0,0,0,0.6); font-size: 13px;">Premium IPL-Style Auction Platform</p>
  </td></tr>
  <tr><td class="body">
    <h2 style="color: #f59e0b; font-size: 20px; margin: 0 0 16px;">${title}</h2>
    ${body}
  </td></tr>
  <tr><td class="footer">
    <p class="text-small">© 2026 Beast Cricket Auction. This is an automated email — please do not reply.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

const sendVerificationEmail = async (email, name, token) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://bca-frontend-production.up.railway.app';
    const url = `${baseUrl}/verify-email?token=${token}`;

    const body = `
      <p class="text-muted">Hello <strong style="color: #f59e0b;">${name}</strong>,</p>
      <p class="text-muted">Welcome to Beast Cricket Auction! Click the button below to verify your email and activate your account.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${url}" class="button">✅ Verify My Email</a>
      </p>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px;">If the button doesn't work, copy and paste this link:</p>
      <p style="color: #f59e0b; font-size: 12px; word-break: break-all; margin: 0 0 16px;">${url}</p>
      <p class="text-small">⏱ This link expires in <strong>24 hours</strong>.</p>
    `;

    const transporter = createTransport();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `Beast Cricket Auction <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🏏 Verify Your Email — Beast Cricket Auction',
      html: wrap('Verify Your Email', body),
    });

    console.log('✅ Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, name, token) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://bca-frontend-production.up.railway.app';
    const url = `${baseUrl}/reset-password?token=${token}`;

    const body = `
      <p class="text-muted">Hello <strong style="color: #f59e0b;">${name}</strong>,</p>
      <p class="text-muted">We received a request to reset your password. Click below to create a new one. If you didn't request this, you can safely ignore this email.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${url}" class="button">🔐 Reset My Password</a>
      </p>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px;">Link not working? Copy and paste:</p>
      <p style="color: #f59e0b; font-size: 12px; word-break: break-all; margin: 0 0 16px;">${url}</p>
      <p class="text-small">⏱ This link expires in <strong>1 hour</strong>.</p>
    `;

    const transporter = createTransport();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `Beast Cricket Auction <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Reset Your Password — Beast Cricket Auction',
      html: wrap('Reset Your Password', body),
    });

    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error.message);
    throw error;
  }
};

module.exports = { isEmailConfigured, sendVerificationEmail, sendPasswordResetEmail };
