import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const generateTokens = (userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-key',
    { expiresIn: '30d' }
  );
  
  return { token, refreshToken };
};

// OAuth callback - Google
router.post('/oauth/google', async (req, res) => {
  try {
    const { email, firstName, lastName, imageUrl, googleId } = req.body;
    
    if (!email || !googleId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Create new user
      const userId = uuidv4();
      user = await User.create({
        userId,
        email,
        firstName,
        lastName,
        imageUrl,
        oauthProvider: 'google',
        username: email.split('@')[0]
      });
    } else if (user.oauthProvider !== 'google') {
      await user.update({ oauthProvider: 'google' });
    }

    const { token, refreshToken } = generateTokens(user.userId);
    
    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        oauthProvider: user.oauthProvider
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

// OAuth callback - GitHub
router.post('/oauth/github', async (req, res) => {
  try {
    const { login, name, avatar_url, id } = req.body;
    
    if (!login || !id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let user = await User.findOne({ where: { username: login } });
    
    if (!user) {
      const userId = uuidv4();
      user = await User.create({
        userId,
        username: login,
        email: `${login}@github.com`,
        firstName: name?.split(' ')[0] || login,
        lastName: name?.split(' ')[1] || '',
        imageUrl: avatar_url,
        oauthProvider: 'github'
      });
    } else if (user.oauthProvider !== 'github') {
      await user.update({ 
        oauthProvider: 'github',
        imageUrl: avatar_url 
      });
    }

    const { token, refreshToken } = generateTokens(user.userId);
    
    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        oauthProvider: user.oauthProvider
      }
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'No refresh token provided' });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-key'
    );

    const user = await User.findOne({ where: { userId: decoded.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { token: newToken, refreshToken: newRefreshToken } = generateTokens(user.userId);
    
    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Sign out
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

export default router;
