import bcrypt from 'bcryptjs';

/**
 * Password Hashing & Verification Utilities
 */

const SALT_ROUNDS = 10;

/**
 * Hash password using bcryptjs
 * Returns hashed password string
 */
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error('Password hashing failed: ' + error.message);
  }
};

/**
 * Verify password against hash
 * Returns boolean
 */
export const verifyPassword = async (password, hash) => {
  try {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    throw new Error('Password verification failed: ' + error.message);
  }
};

export default {
  hashPassword,
  verifyPassword,
};
