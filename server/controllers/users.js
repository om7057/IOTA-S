import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';
import { validators } from '../utils/validators.js';
import { Op, Sequelize } from 'sequelize';

/**
 * User Controller
 * Handles user management: list, get, update, delete, progress tracking
 */

/**
 * GET /api/users
 * List all users (paginated)
 * Query params: page=1, limit=10, sort=createdAt
 */
export const listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt' } = req.query;

    // Validate pagination
    if (!validators.isValidPagination(page, limit)) {
      return res.status(400).json({
        error: 'Invalid pagination parameters',
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Allowed sort fields (prevent injection)
    const sortFields = ['createdAt', 'firstName', 'lastName', 'currentStars', 'age'];
    const sortField = sortFields.includes(sort) ? sort : 'createdAt';

    // Get total count and paginated results
    const { count, rows } = await User.findAndCountAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'displayName', 'age', 'userType', 'avatarUrl', 'currentStars'],
      where: { deletedAt: null }, // Exclude soft-deleted users
      order: [[sortField, 'DESC']],
      limit: limitNum,
      offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    logger.debug('Listed users', {
      page: pageNum,
      limit: limitNum,
      total: count,
      returned: rows.length,
    });

    return res.status(200).json({
      users: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages,
      },
    });
  } catch (error) {
    logger.error('List users error', { error: error.message });
    next(error);
  }
};

/**
 * GET /api/users/me
 * Get current user profile (protected)
 * Headers: Authorization: Bearer {accessToken}
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Not authenticated',
      });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['passwordHash', 'deletedAt'],
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    logger.debug('Got current user', { userId: user.id });

    return res.status(200).json(user);
  } catch (error) {
    logger.error('Get current user error', { error: error.message });
    next(error);
  }
};

/**
 * GET /api/users/:userId
 * Get user profile by ID (public)
 * Returns: public profile fields only
 */
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate UUID
    if (!validators.isValidUUID(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID format',
      });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'displayName', 'age', 'userType', 'avatarUrl', 'currentStars', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    logger.debug('Got user by ID', { userId });

    return res.status(200).json(user);
  } catch (error) {
    logger.error('Get user by ID error', { error: error.message });
    next(error);
  }
};

/**
 * PATCH /api/users/:userId
 * Update user profile (protected - can only update own profile)
 * Body: { firstName?, lastName?, age?, gender?, avatarUrl? }
 */
export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, age, gender, avatarUrl } = req.body;

    // Validate UUID
    if (!validators.isValidUUID(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID format',
      });
    }

    // Verify ownership (user can only update their own profile)
    if (req.user.id !== userId) {
      logger.warn('Unauthorized update attempt', {
        requesterId: req.user.id,
        targetUserId: userId,
      });
      return res.status(403).json({
        error: 'You can only update your own profile',
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Validate fields before update
    if (firstName !== undefined) {
      if (!validators.isValidName(firstName)) {
        return res.status(400).json({
          error: 'Invalid first name',
        });
      }
      user.firstName = firstName;
    }

    if (lastName !== undefined) {
      if (!validators.isValidName(lastName)) {
        return res.status(400).json({
          error: 'Invalid last name',
        });
      }
      user.lastName = lastName;
    }

    if (age !== undefined) {
      if (!validators.isValidAge(age)) {
        return res.status(400).json({
          error: 'Age must be between 5 and 19',
        });
      }
      user.age = parseInt(age);
    }

    if (gender !== undefined) {
      if (!validators.isValidGender(gender)) {
        return res.status(400).json({
          error: 'Invalid gender. Must be: male, female, other, prefer-not',
        });
      }
      user.gender = gender;
    }

    if (avatarUrl !== undefined) {
      if (avatarUrl && !validators.isValidUrl(avatarUrl)) {
        return res.status(400).json({
          error: 'Invalid avatar URL',
        });
      }
      user.avatarUrl = avatarUrl;
    }

    // Save changes
    await user.save();

    logger.info('User profile updated', { userId });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        age: user.age,
        gender: user.gender,
        userType: user.userType,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    logger.error('Update user error', { error: error.message });
    next(error);
  }
};

/**
 * DELETE /api/users/:userId
 * Delete user account (protected - soft delete)
 * User can only delete their own account
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate UUID
    if (!validators.isValidUUID(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID format',
      });
    }

    // Verify ownership
    if (req.user.id !== userId) {
      logger.warn('Unauthorized delete attempt', {
        requesterId: req.user.id,
        targetUserId: userId,
      });
      return res.status(403).json({
        error: 'You can only delete your own account',
      });
    }

    // Find and soft delete user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Soft delete (sets deletedAt)
    await user.destroy();

    logger.info('User account deleted', { userId });

    return res.status(200).json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    logger.error('Delete user error', { error: error.message });
    next(error);
  }
};

/**
 * GET /api/users/:userId/progress
 * Get user progress statistics
 * Returns: moods logged, journals written, stories completed, etc.
 */
export const getUserProgress = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate UUID
    if (!validators.isValidUUID(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID format',
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // TODO: In Phase 4, add actual progress tracking from Mood, Journal, Story models
    // For now, return placeholder data

    logger.debug('Got user progress', { userId });

    return res.status(200).json({
      userId,
      currentStars: user.currentStars,
      stats: {
        moodsLogged: 0, // Will populate from Mood model
        journalsWritten: 0, // Will populate from Journal model
        storiesCompleted: 0, // Will populate from Story model
        lessonsCompleted: 0, // Will populate from Lesson model
        quizzesCompleted: 0, // Will populate from Quiz model
      },
      badges: {
        verified: user.isVerified,
        counselorVerified: user.isVerified,
      },
      joinedAt: user.createdAt,
    });
  } catch (error) {
    logger.error('Get user progress error', { error: error.message });
    next(error);
  }
};

export default {
  listUsers,
  getCurrentUser,
  getUserById,
  updateUser,
  deleteUser,
  getUserProgress,
};
