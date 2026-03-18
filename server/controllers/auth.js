import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateTokenPair } from '../utils/jwt.js';
import environment from '../config/environment.js';
import { logger } from '../utils/logger.js';
import { validators } from '../utils/validators.js';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { Op } from 'sequelize';

/**
 * Auth Controller
 * Handles signup, signin, OAuth, token refresh, logout
 */

/**
 * POST /auth/signup
 * Email/password registration
 * Body: { email, password, firstName, lastName, age, gender }
 */
export const signup = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, displayName, age, gender } = req.body;

    const resolvedFirstName = firstName || (displayName ? displayName.trim().split(/\s+/)[0] : undefined);
    const resolvedLastName =
      lastName ||
      (displayName && displayName.trim().split(/\s+/).length > 1
        ? displayName.trim().split(/\s+/).slice(1).join(' ')
        : '');

    // Validate inputs
    if (!email || !password || !resolvedFirstName || age === undefined || age === null) {
      return res.status(400).json({
        error: 'Missing required fields: email, password, and either firstName/lastName or displayName, plus age',
      });
    }

    if (!validators.isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (!validators.isValidPassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters with 1 uppercase letter and 1 number',
      });
    }

    if (!validators.isValidAge(age)) {
      return res.status(400).json({
        error: 'Age must be between 5 and 19',
      });
    }

    if (gender && !validators.isValidGender(gender)) {
      return res.status(400).json({
        error: 'Invalid gender. Must be: male, female, other, prefer-not',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      age: parseInt(age),
      gender: gender || 'prefer-not',
      oauthProvider: 'local',
    });

    // Generate tokens
    const tokenFamily = uuidv4();
    const { accessToken, refreshToken } = generateTokenPair(user.id, user.userType, user.email, tokenFamily);

    // Store refresh token in database
    await RefreshToken.create({
      userId: user.id,
      tokenFamily,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info('User signed up', { userId: user.id, email });

    return res.status(201).json({
      message: 'Signup successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        age: user.age,
        userType: user.userType,
      },
      token: accessToken,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Signup error', { error: error.message });
    next(error);
  }
};

/**
 * POST /auth/signin
 * Email/password login
 * Body: { email, password }
 */
export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required',
      });
    }

    if (!validators.isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Find user
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Check if user has password hash (not OAuth-only)
    if (!user.passwordHash) {
      return res.status(401).json({
        error: 'This account uses OAuth. Please sign in with Google.',
      });
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Generate tokens
    const tokenFamily = uuidv4();
    const { accessToken, refreshToken } = generateTokenPair(user.id, user.userType, user.email, tokenFamily);

    // Store refresh token
    await RefreshToken.create({
      userId: user.id,
      tokenFamily,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info('User signed in', { userId: user.id, email });

    return res.status(200).json({
      message: 'Signin successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        age: user.age,
        userType: user.userType,
      },
      token: accessToken,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Signin error', { error: error.message });
    next(error);
  }
};

/**
 * POST /auth/refresh
 * Refresh access token
 * Body: { refreshToken }
 */
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Refresh token required',
      });
    }

    // Verify token signature
    const decoded = jwt.verify(token, environment.JWT.refreshSecret);

    // Find refresh token in database
    const storedToken = await RefreshToken.findOne({
      where: {
        userId: decoded.id,
        tokenFamily: decoded.tokenFamily,
        revokedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!storedToken) {
      logger.warn('Invalid refresh token attempt', { userId: decoded.id });
      return res.status(401).json({
        error: 'Invalid or expired refresh token',
      });
    }

    // Get user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
      });
    }

    // Generate new token pair (same tokenFamily for continuity)
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(
      user.id,
      user.userType,
      user.email,
      decoded.tokenFamily
    );

    // Create new refresh token in database
    await RefreshToken.create({
      userId: user.id,
      tokenFamily: decoded.tokenFamily,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.debug('Token refreshed', { userId: user.id });

    return res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Refresh token expired',
      });
    }
    logger.error('Token refresh error', { error: error.message });
    next(error);
  }
};

/**
 * POST /auth/logout
 * Logout user (revoke refresh tokens)
 * Headers: Authorization: Bearer {accessToken}
 */
export const logout = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Not authenticated',
      });
    }

    // Revoke all refresh tokens for this user
    await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { userId: req.user.id, revokedAt: null } }
    );

    logger.info('User logged out', { userId: req.user.id });

    return res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    next(error);
  }
};

/**
 * GET /auth/google/web
 * Get Google OAuth authorization URL (for web client)
 */
export const getGoogleAuthUrlWeb = async (req, res, next) => {
  try {
    if (!environment.GOOGLE.clientId) {
      return res.status(500).json({
        error: 'Google OAuth not configured',
      });
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', environment.GOOGLE.clientId);
    authUrl.searchParams.append('redirect_uri', environment.GOOGLE.callbackUrlWeb);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'openid profile email');
    authUrl.searchParams.append('access_type', 'offline');

    logger.debug('Generated Google auth URL for web');

    return res.status(200).json({
      authUrl: authUrl.toString(),
    });
  } catch (error) {
    logger.error('Get Google URL error', { error: error.message });
    next(error);
  }
};

/**
 * GET /auth/google/mobile
 * Get Google OAuth authorization URL (for mobile client)
 */
export const getGoogleAuthUrlMobile = async (req, res, next) => {
  try {
    if (!environment.GOOGLE.clientId) {
      return res.status(500).json({
        error: 'Google OAuth not configured',
      });
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', environment.GOOGLE.clientId);
    authUrl.searchParams.append('redirect_uri', environment.GOOGLE.callbackUrlMobile);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'openid profile email');
    authUrl.searchParams.append('access_type', 'offline');

    logger.debug('Generated Google auth URL for mobile');

    return res.status(200).json({
      authUrl: authUrl.toString(),
    });
  } catch (error) {
    logger.error('Get Google URL mobile error', { error: error.message });
    next(error);
  }
};

/**
 * POST /auth/google/callback
 * Handle unified Google OAuth callback
 * Body: { code, platform: 'web'|'mobile' }
 */
export const handleGoogleCallback = async (req, res, next) => {
  try {
    const { code, platform, googleId, email, firstName, lastName, imageUrl } = req.body;

    // Support two flows:
    // 1. Authorization code flow (mobile/web with code)
    // 2. JWT credential flow (web with pre-decoded JWT from One-Tap)
    
    let userGoogleId, userEmail, userFirstName, userLastName, userPicture;

    if (googleId && email) {
      // JWT credential flow - data already decoded by frontend
      userGoogleId = googleId;
      userEmail = email;
      userFirstName = firstName || '';
      userLastName = lastName || '';
      userPicture = imageUrl || null;
      
      logger.debug('Processing Google OAuth via JWT credential flow', { userGoogleId, userEmail });
    } else if (code && platform) {
      // Authorization code flow - exchange code for tokens
      if (!['web', 'mobile'].includes(platform)) {
        return res.status(400).json({
          error: 'Platform must be "web" or "mobile"',
        });
      }

      if (!environment.GOOGLE.clientId || !environment.GOOGLE.clientSecret) {
        return res.status(500).json({
          error: 'Google OAuth not configured',
        });
      }

      const redirectUri =
        platform === 'web' ? environment.GOOGLE.callbackUrlWeb : environment.GOOGLE.callbackUrlMobile;

      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: environment.GOOGLE.clientId,
        client_secret: environment.GOOGLE.clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      // Decode ID token to get user info
      const idToken = tokenResponse.data.id_token;
      const decoded = jwt.decode(idToken);

      if (!decoded) {
        return res.status(400).json({
          error: 'Invalid ID token',
        });
      }

      const { sub: decodedGoogleId, email: decodedEmail, name, picture } = decoded;
      userGoogleId = decodedGoogleId;
      userEmail = decodedEmail;
      userFirstName = name ? name.split(' ')[0] : '';
      userLastName = name ? name.split(' ').slice(1).join(' ') : '';
      userPicture = picture || null;
      
      logger.debug('Processing Google OAuth via authorization code flow', { userGoogleId, userEmail });
    } else {
      return res.status(400).json({
        error: 'Either authorization code or Google credentials required',
      });
    }

    // Find or create user
    let user = await User.findOne({
      where: { googleId: userGoogleId },
    });

    if (!user) {
      // New user - create account
      user = await User.create({
        email: userEmail,
        firstName: userFirstName,
        lastName: userLastName,
        googleId: userGoogleId,
        avatarUrl: userPicture,
        oauthProvider: 'google',
      });

      logger.info('New user created via Google OAuth', { userId: user.id, email: userEmail, googleId: userGoogleId });
    } else if (user.email !== userEmail) {
      // Update email if changed
      user.email = userEmail;
      await user.save();
    }

    // Generate tokens
    const tokenFamily = uuidv4();
    const { accessToken, refreshToken } = generateTokenPair(user.id, user.userType, user.email, tokenFamily);

    // Store refresh token
    await RefreshToken.create({
      userId: user.id,
      tokenFamily,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info('User authenticated via Google OAuth', { userId: user.id, email: userEmail });

    return res.status(200).json({
      message: 'Google OAuth successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        age: user.age,
        userType: user.userType,
        avatarUrl: user.avatarUrl,
      },
      token: accessToken,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Google OAuth callback error', { error: error.message });
    
    if (error.response?.status === 400) {
      return res.status(400).json({
        error: 'Invalid authorization code',
      });
    }

    next(error);
  }
};

export default {
  signup,
  signin,
  refresh,
  logout,
  getGoogleAuthUrlWeb,
  getGoogleAuthUrlMobile,
  handleGoogleCallback,
};
