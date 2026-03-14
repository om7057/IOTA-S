import express from 'express';
import * as authController from '../controllers/auth.js';
import { verifyToken, verifyRefreshToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Auth Routes - Consolidated from mobile and web servers
 */

// Public endpoints (no authentication required)

/**
 * POST /api/auth/signup
 * Email/password registration
 * Body: { email, password, firstName, lastName, age, gender? }
 */
router.post('/signup', authController.signup);

/**
 * POST /api/auth/signin
 * Email/password login
 * Body: { email, password }
 */
router.post('/signin', authController.signin);

/**
 * POST /api/auth/refresh
 * Refresh access token
 * Body: { refreshToken }
 */
router.post('/refresh', authController.refresh);

/**
 * GET /api/auth/google/web
 * Get Google OAuth authorization URL (web client)
 * Returns: { authUrl: "https://accounts.google.com/..." }
 */
router.get('/google/web', authController.getGoogleAuthUrlWeb);

/**
 * GET /api/auth/google/mobile
 * Get Google OAuth authorization URL (mobile client)
 * Returns: { authUrl: "https://accounts.google.com/..." }
 */
router.get('/google/mobile', authController.getGoogleAuthUrlMobile);

/**
 * POST /api/auth/google/callback
 * Handle unified Google OAuth callback (both web and mobile)
 * Body: { code, platform: 'web'|'mobile' }
 * Returns: { user: {...}, tokens: { accessToken, refreshToken } }
 */
router.post('/google/callback', authController.handleGoogleCallback);

// Protected endpoints (authentication required)

/**
 * POST /api/auth/logout
 * Logout user (revoke refresh tokens)
 * Headers: Authorization: Bearer {accessToken}
 */
router.post('/logout', verifyToken, authController.logout);

export default router;
