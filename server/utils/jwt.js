import jwt from 'jsonwebtoken';
import environment from '../config/environment.js';

/**
 * JWT Token Generation Utilities
 */

/**
 * Generate access token
 * Expires in 7 days (or custom time from env)
 */
export const generateAccessToken = (userId, userType, email) => {
  const payload = {
    id: userId,
    userType,
    email,
  };

  return jwt.sign(payload, environment.JWT.secret, {
    expiresIn: environment.JWT.accessExpiry,
    algorithm: 'HS256',
  });
};

/**
 * Generate refresh token
 * Expires in 30 days (or custom time from env)
 * Should be stored in database for token family rotation
 */
export const generateRefreshToken = (userId, tokenFamily) => {
  const payload = {
    id: userId,
    tokenFamily, // For token rotation security
  };

  return jwt.sign(payload, environment.JWT.refreshSecret, {
    expiresIn: environment.JWT.refreshExpiry,
    algorithm: 'HS256',
  });
};

/**
 * Verify and decode token
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, environment.JWT.secret);
  } catch (error) {
    return null;
  }
};

/**
 * Verify and decode refresh token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, environment.JWT.refreshSecret);
  } catch (error) {
    return null;
  }
};

/**
 * Generate both tokens (access + refresh)
 * Returns object with both tokens and expiry times
 */
export const generateTokenPair = (userId, userType, email, tokenFamily) => {
  const accessToken = generateAccessToken(userId, userType, email);
  const refreshToken = generateRefreshToken(userId, tokenFamily);

  // Decode tokens to get expiry times
  const decodedAccess = jwt.decode(accessToken);
  const decodedRefresh = jwt.decode(refreshToken);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiry: new Date(decodedAccess.exp * 1000),
    refreshTokenExpiry: new Date(decodedRefresh.exp * 1000),
  };
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
};
