const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const db = require('../config/database');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const WEB_CALLBACK_URL = process.env.WEB_CALLBACK_URL || 'http://localhost:5173/auth/callback';
const MOBILE_CALLBACK_URL = process.env.MOBILE_CALLBACK_URL || 'myapp://auth/callback';

// Helper function to create JWT token
const createJWTToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
    },
    SECRET_KEY,
    { expiresIn: '7d' }
  );
};

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, displayName, age, gender } = req.body;

    // Validate inputs
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and displayName are required' });
    }

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const result = await db.createUser(email, displayName, hashedPassword, age || null, gender || null);
    const user = result.rows[0];

    // Create JWT token
    const token = createJWTToken(user);

    // Return user and token
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        age: user.age,
        gender: user.gender,
        createdAt: user.created_at,
      },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from database
    const userResult = await db.getUserByEmail(email);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = createJWTToken(user);

    // Return user and token
    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        age: user.age,
        gender: user.gender,
        createdAt: user.created_at,
      },
      token
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sign out
router.post('/signout', (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Google OAuth URL for web
router.get('/google/web', (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(400).json({ error: 'Google OAuth not configured' });
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: WEB_CALLBACK_URL,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline'
  });

  res.json({
    authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  });
});

// Google OAuth URL for mobile
router.get('/google/mobile', (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(400).json({ error: 'Google OAuth not configured' });
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: MOBILE_CALLBACK_URL,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline'
  });

  res.json({
    authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  });
});

// Google OAuth callback
router.post('/google/callback', async (req, res) => {
  try {
    const { code, platform } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(400).json({ error: 'Google OAuth not configured' });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: platform === 'mobile' ? MOBILE_CALLBACK_URL : WEB_CALLBACK_URL,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Google token error:', error);
      return res.status(400).json({ error: 'Failed to exchange code' });
    }

    const tokenData = await tokenResponse.json();

    // Get Google user info
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`
    );

    if (!userInfoResponse.ok) {
      return res.status(400).json({ error: 'Failed to fetch user info' });
    }

    const googleUser = await userInfoResponse.json();
    const { email, name, picture } = googleUser;

    // Check if user exists
    const userResult = await db.getUserByEmail(email);

    let user;
    if (userResult.rows.length === 0) {
      // Create new user
      const createResult = await db.createGoogleUser(email, name, googleUser.id, picture);
      user = createResult.rows[0];
    } else {
      user = userResult.rows[0];
    }

    // Create JWT token
    const appToken = createJWTToken(user);

    // Return user and token
    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        age: user.age,
        gender: user.gender,
        avatarUrl: user.avatar_url,
        authMethod: 'google',
      },
      token: appToken,
      googleRefreshToken: tokenData.refresh_token
    });
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

module.exports = router;