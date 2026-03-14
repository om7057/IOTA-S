import jwt from 'jsonwebtoken';
import environment from '../config/environment.js';
import { logger } from '../utils/logger.js';

/**
 * Verify JWT access token from Authorization header
 * Sets req.user with decoded token payload
 * Returns 401 if no token or invalid token
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized: Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    jwt.verify(token, environment.JWT.secret, (err, decoded) => {
      if (err) {
        logger.warn('Token verification failed', { error: err.message });
        return res.status(401).json({
          error: 'Unauthorized: Invalid or expired token',
        });
      }

      req.user = decoded;
      req.token = token;
      next();
    });
  } catch (error) {
    logger.error('Auth middleware error', { error: error.message });
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};

/**
 * Optional token verification
 * Sets req.user if valid token present, otherwise continues with req.user = null
 */
export const tokenOptional = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    jwt.verify(token, environment.JWT.secret, (err, decoded) => {
      if (err) {
        req.user = null;
      } else {
        req.user = decoded;
        req.token = token;
      }
      next();
    });
  } catch (error) {
    logger.warn('Optional token verification error', { error: error.message });
    req.user = null;
    next();
  }
};

/**
 * Verify refresh token from request body
 * Used for token refresh endpoint
 */
export const verifyRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Unauthorized: Refresh token required',
      });
    }

    jwt.verify(refreshToken, environment.JWT.refreshSecret, (err, decoded) => {
      if (err) {
        logger.warn('Refresh token verification failed', { error: err.message });
        return res.status(401).json({
          error: 'Unauthorized: Invalid or expired refresh token',
        });
      }

      req.refreshUser = decoded;
      next();
    });
  } catch (error) {
    logger.error('Refresh token middleware error', { error: error.message });
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};

/**
 * Require specific user type
 * Usage: router.get('/admin-endpoint', requireUserType('counselor'), handler)
 */
export const requireUserType = (requiredType) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized: Token required',
      });
    }

    if (req.user.userType !== requiredType) {
      logger.warn('Access denied: insufficient permissions', {
        userType: req.user.userType,
        required: requiredType,
      });
      return res.status(403).json({
        error: 'Forbidden: Insufficient permissions',
      });
    }

    next();
  };
};

/**
 * Require user verification (verified teen)
 * Checks if user is verified in database
 */
export const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized: Token required',
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      error: 'Forbidden: User verification required',
    });
  }

  next();
};

export default {
  verifyToken,
  tokenOptional,
  verifyRefreshToken,
  requireUserType,
  requireVerification,
};
