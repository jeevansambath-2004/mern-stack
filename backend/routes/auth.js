const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { 
    expiresIn: '7d' 
  });
};

// Google OAuth client
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

// Helper to generate a username from name/email and ensure uniqueness
const generateUsername = async (base) => {
  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20) || 'user';
  let username = sanitized;
  let suffix = 0;
  while (await User.findOne({ username })) {
    suffix += 1;
    const next = `${sanitized}_${suffix}`;
    username = next.slice(0, 20);
  }
  return username;
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email or username'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    // Handle duplicate key error (e.g., existing email or username)
    if (error && error.code === 11000) {
      const fields = Object.keys(error.keyPattern || error.keyValue || {});
      const which = fields.length ? `: ${fields.join(', ')}` : '';
      return res.status(400).json({
        error: `User already exists with this value${which}`,
        details: error.keyValue || undefined,
      });
    }

    // Handle Mongoose validation errors
    if (error && error.name === 'ValidationError') {
      const details = Object.values(error.errors || {}).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details,
      });
    }

    res.status(500).json({
      error: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/google
// @desc    Login/Register with Google ID token
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }

    if (!googleClient) {
      return res.status(500).json({ error: 'Google client not configured on server' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const { sub: googleId, email, name, picture } = payload;
    if (!email) {
      return res.status(400).json({ error: 'Google account does not have a public email' });
    }

    // Try to find user by googleId first, then by email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      const baseUsername = name || email.split('@')[0];
      const username = await generateUsername(baseUsername);
      user = new User({
        username,
        email,
        googleId,
        provider: 'google',
        avatar: picture || '',
      });
      await user.save();
    } else {
      // Ensure google fields are set
      const updates = {};
      if (!user.googleId) updates.googleId = googleId;
      if (user.provider !== 'google') updates.provider = 'google';
      if (picture && user.avatar !== picture) updates.avatar = picture;
      if (Object.keys(updates).length) {
        user = await User.findByIdAndUpdate(user._id, updates, { new: true });
      }
    }

    const token = generateToken(user._id);
    res.json({
      message: 'Google login successful',
      user,
      token,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Server error during Google authentication' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/demo-admin
// @desc    Create or ensure a demo admin user exists and return a token
// @access  Public (for demo only)
router.post('/demo-admin', async (req, res) => {
  try {
    const email = 'demo.admin@example.com';
    const username = 'demo_admin';
    const defaultPassword = 'demo1234';

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username,
        email,
        password: defaultPassword,
        role: 'admin',
        provider: 'local',
      });
      await user.save();
    } else if (user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    const token = generateToken(user._id);
    res.json({
      message: 'Demo admin login successful',
      user,
      token,
    });
  } catch (error) {
    console.error('Demo admin error:', error);
    res.status(500).json({ error: 'Server error during demo admin login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be either light or dark'),
  body('preferences.notifications')
    .optional()
    .isBoolean()
    .withMessage('Notifications must be a boolean value')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { username, email, preferences } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    // Check if username or email already exists (if being updated)
    if (username || email) {
      const existingUser = await User.findOne({
        $or: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : [])
        ],
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'Username or email already exists'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Server error while updating profile'
    });
  }
});

module.exports = router;