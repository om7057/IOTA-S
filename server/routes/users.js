import express from 'express';
import * as userController from '../controllers/users.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * User Routes - Consolidated from mobile and web servers
 * Handles user management: list, get, update, delete, progress
 */

/**
 * GET /api/users
 * List all users (paginated)
 * Query params: page=1, limit=10, sort=createdAt
 * Returns: paginated list of public user profiles
 */
router.get('/', userController.listUsers);

/**
 * GET /api/users/me
 * Get current user profile (protected)
 * Headers: Authorization: Bearer {accessToken}
 * Returns: full user profile
 */
router.get('/me', verifyToken, userController.getCurrentUser);

/**
 * GET /api/users/:userId
 * Get user profile by ID (public)
 * Params: userId - UUID of user
 * Returns: public profile fields (firstName, lastName, age, userType, avatarUrl, stars, joinedAt)
 */
router.get('/:userId', userController.getUserById);

/**
 * PATCH /api/users/:userId
 * Update user profile (protected - own profile only)
 * Params: userId - UUID of user
 * Headers: Authorization: Bearer {accessToken}
 * Body: { firstName?, lastName?, age?, gender?, avatarUrl? }
 * Returns: updated user profile
 */
router.patch('/:userId', verifyToken, userController.updateUser);

/**
 * DELETE /api/users/:userId
 * Delete user account (protected - soft delete)
 * Params: userId - UUID of user
 * Headers: Authorization: Bearer {accessToken}
 * Returns: success message
 */
router.delete('/:userId', verifyToken, userController.deleteUser);

/**
 * GET /api/users/:userId/progress
 * Get user progress statistics
 * Params: userId - UUID of user
 * Returns: { moodsLogged, journalsWritten, storiesCompleted, stars, badges }
 */
router.get('/:userId/progress', userController.getUserProgress);

/**
 * PUT /api/users/:userId/age
 * Update user age (protected)
 * Params: userId - UUID of user
 * Headers: Authorization: Bearer {accessToken}
 * Body: { age: number }
 * Returns: updated user profile with age and userType
 */
router.put('/:userId/age', verifyToken, userController.updateUserAge);

export default router;
