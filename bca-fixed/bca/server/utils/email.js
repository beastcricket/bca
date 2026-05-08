const nodemailer = require('nodemailer');

// ── Configuration ────────────────────────────────────────────────────────────
const EMAIL_USER = process.env.EMAIL_USER || 'beastcricketofficialauction@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const CLIENT_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');

/**
 * Returns true only when the required env vars are present.
 */
function isEmailConfigured() {
  const configured = !!(EMAIL_USER && EMAIL_PASS);
  if (!configured) {
    console.warn('⚠️  Email not configured: EMAIL_USER or EMAIL_PASS env var is missing.');
  }
  return configured;
}

// ── Transporter (created lazily so startup never crashes) ────────────────────
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  console.log('📧 Creating nodemailer transporter for:', EMAIL_USER);

  _transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,           // SSL on port 465
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,     // Gmail App Password (16 chars, no spaces)
    },
    pool: true,             // reuse connections
    maxConnections: 3,
    maxMessages: 100,
    socketTimeout: 10000,   // 10 s
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    logger: false,
    debug: false,
  });

  return _transporter;
}

/**
 * Verify SMTP connection — call once on startup to surface config errors early.
 */
async function verifyTransporter() {
  if (!isEmailConfigured()) return false;
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('✅ SMTP connection verified — emails are ready to send');
    return true;
  } catch (err) {
    console.error('❌ SMTP verification failed:', err.message);
    console.error('   Check EMAIL_USER / EMAIL_PASS env vars and Gmail App Password settings.');
    return false;
  }
}

// ── Shared send helper with retry ────────────────────────────────────────────
async function sendMail(options, retries = 2) {
  const transporter = getTransporter();

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      console.log(`📤 Sending email to ${options.to} (attempt ${attempt})…`);
      const info = await transporter.sendMail({
        from: `"Beast Cricket Auction" <${EMAIL_USER}>`,
        ...options,
      });
      console.log(`✅ Email sent to ${options.to} — messageId: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error(`❌ Email attempt ${attempt} failed for ${options.to}:`, err.message);
      if (attempt > retries) throw err;
      // Brief back-off before retry
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
}

// ── Email templates ──────────────────────────────────────────────────────────

/**
 * Send an email-verification link to a newly registered user.
 * @param {string} to      Recipient email address
 * @param {string} name    Recipient display name
 * @param {string} token   Raw (un-hashed) verification token
 */
async function sendVerificationEmail(to, name, token) {
  const link = `${CLIENT_URL}/verify-email?token=${token}`;

  console.log('🔗 Verification link:', link);

  return sendMail({
    to,
    subject: '✅ Verify your Beast Cricket Auction account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Verify your email</title>
      </head>
      <body style="margin:0;padding:0;background:#0f1623;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1623;padding:40px 20px;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="background:#1a2235;border-radius:12px;border:1px solid #c9a227;max-width:600px;width:100%;">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#c9a227,#f0c040);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
                  <h1 style="margin:0;color:#0f1623;font-size:28px;font-weight:900;letter-spacing:2px;">
                    🏏 BEAST CRICKET AUCTION
                  </h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px 30px;color:#e2e8f0;">
                  <h2 style="color:#c9a227;margin:0 0 16px;font-size:22px;">
                    Welcome, ${name}! 🎉
                  </h2>
                  <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#94a3b8;">
                    Thanks for registering. Please verify your email address to activate your account
                    and start bidding in live cricket auctions.
                  </p>
                  <div style="text-align:center;margin:30px 0;">
                    <a href="${link}"
                      style="display:inline-block;background:linear-gradient(135deg,#c9a227,#f0c040);
                             color:#0f1623;text-decoration:none;padding:14px 36px;border-radius:8px;
                             font-weight:700;font-size:16px;letter-spacing:1px;">
                      ✅ Verify Email Address
                    </a>
                  </div>
                  <p style="margin:20px 0 0;font-size:13px;color:#64748b;text-align:center;">
                    This link expires in <strong style="color:#c9a227;">24 hours</strong>.
                    If you didn't create this account, you can safely ignore this email.
                  </p>
                  <hr style="border:none;border-top:1px solid #2d3748;margin:30px 0;"/>
                  <p style="margin:0;font-size:12px;color:#475569;text-align:center;">
                    Or copy this link into your browser:<br/>
                    <span style="color:#c9a227;word-break:break-all;">${link}</span>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:20px 30px;text-align:center;border-top:1px solid #2d3748;">
                  <p style="margin:0;font-size:12px;color:#475569;">
                    © ${new Date().getFullYear()} Beast Cricket Auction · Sent from ${EMAIL_USER}
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
    text: `Hi ${name},\n\nVerify your Beast Cricket Auction account by visiting:\n${link}\n\nThis link expires in 24 hours.\n\nIf you didn't register, ignore this email.`,
  });
}

/**
 * Send a password-reset link.
 * @param {string} to      Recipient email address
 * @param {string} name    Recipient display name
 * @param {string} token   Raw (un-hashed) reset token
 */
async function sendPasswordResetEmail(to, name, token) {
  const link = `${CLIENT_URL}/reset-password?token=${token}`;

  console.log('🔗 Password reset link:', link);

  return sendMail({
    to,
    subject: '🔐 Reset your Beast Cricket Auction password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Reset your password</title>
      </head>
      <body style="margin:0;padding:0;background:#0f1623;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1623;padding:40px 20px;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="background:#1a2235;border-radius:12px;border:1px solid #c9a227;max-width:600px;width:100%;">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#c9a227,#f0c040);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
                  <h1 style="margin:0;color:#0f1623;font-size:28px;font-weight:900;letter-spacing:2px;">
                    🏏 BEAST CRICKET AUCTION
                  </h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px 30px;color:#e2e8f0;">
                  <h2 style="color:#c9a227;margin:0 0 16px;font-size:22px;">
                    Password Reset Request 🔐
                  </h2>
                  <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#94a3b8;">
                    Hi ${name}, we received a request to reset your password.
                    Click the button below to create a new password.
                  </p>
                  <div style="text-align:center;margin:30px 0;">
                    <a href="${link}"
                      style="display:inline-block;background:linear-gradient(135deg,#c9a227,#f0c040);
                             color:#0f1623;text-decoration:none;padding:14px 36px;border-radius:8px;
                             font-weight:700;font-size:16px;letter-spacing:1px;">
                      🔐 Reset Password
                    </a>
                  </div>
                  <p style="margin:20px 0 0;font-size:13px;color:#64748b;text-align:center;">
                    This link expires in <strong style="color:#c9a227;">1 hour</strong>.
                    If you didn't request a password reset, you can safely ignore this email —
                    your password will not change.
                  </p>
                  <hr style="border:none;border-top:1px solid #2d3748;margin:30px 0;"/>
                  <p style="margin:0;font-size:12px;color:#475569;text-align:center;">
                    Or copy this link into your browser:<br/>
                    <span style="color:#c9a227;word-break:break-all;">${link}</span>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:20px 30px;text-align:center;border-top:1px solid #2d3748;">
                  <p style="margin:0;font-size:12px;color:#475569;">
                    © ${new Date().getFullYear()} Beast Cricket Auction · Sent from ${EMAIL_USER}
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
    text: `Hi ${name},\n\nReset your Beast Cricket Auction password by visiting:\n${link}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`,
  });
}

module.exports = {
  isEmailConfigured,
  verifyTransporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
