// ════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES - COMPLETE FIX WITH EMAIL VERIFICATION
// ════════════════════════════════════════════════════════════════════════════
// FILE PATH: bca-fixed/bca/server/routes/auth.js
// REPLACE THE ENTIRE FILE WITH THIS CODE
// ════════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');
const { authenticate } = require('../middleware/auth');

// ─── REGISTER USER ──────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log('═══════════════════════════════════════════════════════');
    console.log('📝 NEW USER REGISTRATION ATTEMPT');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Role:', role);

    // Validation
    if (!name || !email || !password || !role) {
      console.log('❌ Registration failed: Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ Registration failed: Email already registered');
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('🔐 Password hashed successfully');
    console.log('🎫 Verification token generated');
    console.log('⏰ Token expires:', verificationExpires.toLocaleString());

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
      verificationExpires
    });

    await user.save();
    console.log('✅ User saved to database with ID:', user._id);

    // Send verification email
    try {
      console.log('');
      console.log('📧 SENDING VERIFICATION EMAIL...');
      console.log('───────────────────────────────────────────────────────');
      
      await sendVerificationEmail(user.email, verificationToken);
      
      console.log('───────────────────────────────────────────────────────');
      console.log('✅ VERIFICATION EMAIL SENT SUCCESSFULLY!');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        userId: user._id,
        email: user.email
      });

    } catch (emailError) {
      console.log('');
      console.log('❌❌❌ VERIFICATION EMAIL FAILED! ❌❌❌');
      console.log('───────────────────────────────────────────────────────');
      console.error('Error details:', emailError.message);
      console.log('───────────────────────────────────────────────────────');
      console.log('User was created but email was not sent');
      console.log('User can still verify later if token is valid');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');

      // User is created but email failed - still return success
      res.status(201).json({
        success: true,
        message: 'Account created! We had trouble sending the verification email. Please contact support.',
        userId: user._id,
        email: user.email,
        emailError: true
      });
    }

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════');
    console.error('❌ REGISTRATION ERROR');
    console.error('═══════════════════════════════════════════════════════');
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('═══════════════════════════════════════════════════════');
    console.error('');
    res.status(500).json({ error: error.message });
  }
});

// ─── VERIFY EMAIL ───────────────────────────────────────────────────────────
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    console.log('═══════════════════════════════════════════════════════');
    console.log('✉️  EMAIL VERIFICATION ATTEMPT');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Token received:', token.substring(0, 10) + '...');

    // Find user with this token
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ Verification failed: Invalid or expired token');
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    console.log('✅ User found:', user.email);
    console.log('📝 Current verification status:', user.isVerified);

    // Update user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    console.log('✅ User verified successfully!');
    console.log('📧 Sending welcome email...');

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
      console.log('✅ Welcome email sent!');
    } catch (emailError) {
      console.log('⚠️  Welcome email failed (non-critical):', emailError.message);
    }

    console.log('═══════════════════════════════════════════════════════');

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Verification error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── RESEND VERIFICATION EMAIL ──────────────────────────────────────────────
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('═══════════════════════════════════════════════════════');
    console.log('🔄 RESEND VERIFICATION EMAIL REQUEST');
    console.log('Email:', email);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      console.log('ℹ️  User already verified');
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationExpires = verificationExpires;
    await user.save();

    console.log('🎫 New verification token generated');
    console.log('📧 Sending verification email...');

    await sendVerificationEmail(user.email, verificationToken);

    console.log('✅ Verification email resent successfully!');
    console.log('═══════════════════════════════════════════════════════');

    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });

  } catch (error) {
    console.error('❌ Resend verification error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── LOGIN ──────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log('═══════════════════════════════════════════════════════');
    console.log('🔐 LOGIN ATTEMPT');
    console.log('Email:', email);
    console.log('Role:', role);

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ Login failed: User not found');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Login failed: Incorrect password');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      console.log('⚠️  Login blocked: Email not verified');
      return res.status(403).json({
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        needsVerification: true
      });
    }

    // Check role
    if (user.role !== role && user.role !== 'admin') {
      console.log('❌ Login failed: Role mismatch');
      return res.status(403).json({ error: `You are registered as ${user.role}, not ${role}` });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
      { expiresIn: '30d' }
    );

    console.log('✅ Login successful!');
    console.log('User ID:', user._id);
    console.log('Role:', user.role);
    console.log('═══════════════════════════════════════════════════════');

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── FORGOT PASSWORD ────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('═══════════════════════════════════════════════════════');
    console.log('🔑 FORGOT PASSWORD REQUEST');
    console.log('Email:', email);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ User not found');
      // Don't reveal if user exists for security
      return res.json({
        success: true,
        message: 'If that email is registered, you will receive a password reset link.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    console.log('🎫 Reset token generated');
    console.log('⏰ Token expires:', resetExpires.toLocaleString());
    console.log('📧 Sending password reset email...');

    await sendPasswordResetEmail(user.email, resetToken);

    console.log('✅ Password reset email sent successfully!');
    console.log('═══════════════════════════════════════════════════════');

    res.json({
      success: true,
      message: 'Password reset link sent to your email!'
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── RESET PASSWORD ─────────────────────────────────────────────────────────
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log('═══════════════════════════════════════════════════════');
    console.log('🔐 PASSWORD RESET ATTEMPT');
    console.log('Token:', token.substring(0, 10) + '...');

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ Reset failed: Invalid or expired token');
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    console.log('✅ User found:', user.email);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('✅ Password reset successful!');
    console.log('═══════════════════════════════════════════════════════');

    res.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── REFRESH TOKEN ──────────────────────────────────────────────────────────
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'
    );

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({ success: true, accessToken });

  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// ─── GET CURRENT USER ───────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── LOGOUT ─────────────────────────────────────────────────────────────────
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token here
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
