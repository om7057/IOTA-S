import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';
import { validators } from '../utils/validators.js';
import { Op, Sequelize } from 'sequelize';
import { getMongoDb, isMongoPrimaryEnabled } from '../config/mongo.js';

const buildDisplayName = (firstName, lastName) => `${firstName || ''} ${lastName || ''}`.trim();
const resolveUserType = (age, explicitType) => explicitType || (age >= 13 ? 'teenager' : 'child');

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

    let count = 0;
    let rows = [];

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const usersCollection = db.collection('users');
      const query = { deletedAt: null };

      count = await usersCollection.countDocuments(query);
      rows = await usersCollection
        .find(query)
        .sort({ [sortField]: -1 })
        .skip(offset)
        .limit(limitNum)
        .project({
          _id: 0,
          id: 1,
          firstName: 1,
          lastName: 1,
          userType: 1,
          avatarUrl: 1,
          currentStars: 1,
        })
        .toArray();

      rows = rows.map((user) => ({
        ...user,
        displayName: buildDisplayName(user.firstName, user.lastName),
      }));
    } else {
      const result = await User.findAndCountAll({
        attributes: ['id', 'firstName', 'lastName', 'displayName', 'userType', 'avatarUrl', 'currentStars'],
        where: { deletedAt: null },
        order: [[sortField, 'DESC']],
        limit: limitNum,
        offset,
      });

      count = result.count;
      rows = result.rows;
    }

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

    let user;
    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      user = await db.collection('users').findOne(
        { id: req.user.id, deletedAt: null },
        {
          projection: {
            _id: 0,
            passwordHash: 0,
            deletedAt: 0,
          },
        }
      );

      if (user) {
        user.displayName = buildDisplayName(user.firstName, user.lastName);
        user.userType = resolveUserType(user.age, user.userType);
      }
    } else {
      user = await User.findByPk(req.user.id, {
        attributes: {
          exclude: ['passwordHash', 'deletedAt'],
        },
      });
    }

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

    let user;
    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      user = await db.collection('users').findOne(
        { id: userId, deletedAt: null },
        {
          projection: {
            _id: 0,
            id: 1,
            firstName: 1,
            lastName: 1,
            userType: 1,
            avatarUrl: 1,
            currentStars: 1,
            createdAt: 1,
            age: 1,
          },
        }
      );

      if (user) {
        user.displayName = buildDisplayName(user.firstName, user.lastName);
        user.userType = resolveUserType(user.age, user.userType);
        delete user.age;
      }
    } else {
      user = await User.findByPk(userId, {
        attributes: ['id', 'firstName', 'lastName', 'displayName', 'userType', 'avatarUrl', 'currentStars', 'createdAt'],
      });
    }

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
    let user;
    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      user = await db.collection('users').findOne({ id: userId, deletedAt: null });
    } else {
      user = await User.findByPk(userId);
    }
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Validate fields before update
    const updates = {};

    if (firstName !== undefined) {
      if (!validators.isValidName(firstName)) {
        return res.status(400).json({
          error: 'Invalid first name',
        });
      }
      updates.firstName = firstName;
    }

    if (lastName !== undefined) {
      if (!validators.isValidName(lastName)) {
        return res.status(400).json({
          error: 'Invalid last name',
        });
      }
      updates.lastName = lastName;
    }

    if (age !== undefined) {
      if (!validators.isValidAge(age)) {
        return res.status(400).json({
          error: 'Age must be between 5 and 19',
        });
      }
      updates.age = parseInt(age);
      updates.userType = resolveUserType(parseInt(age));
    }

    if (gender !== undefined) {
      if (!validators.isValidGender(gender)) {
        return res.status(400).json({
          error: 'Invalid gender. Must be: male, female, other, prefer-not',
        });
      }
      updates.gender = gender;
    }

    if (avatarUrl !== undefined) {
      if (avatarUrl && !validators.isValidUrl(avatarUrl)) {
        return res.status(400).json({
          error: 'Invalid avatar URL',
        });
      }
      updates.avatarUrl = avatarUrl;
    }

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      updates.updatedAt = new Date();
      await db.collection('users').updateOne({ id: userId }, { $set: updates });
      user = { ...user, ...updates };
    } else {
      Object.assign(user, updates);
      await user.save();
    }

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
    let user;
    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      user = await db.collection('users').findOne({ id: userId, deletedAt: null });
    } else {
      user = await User.findByPk(userId);
    }
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      await db.collection('users').updateOne(
        { id: userId },
        { $set: { deletedAt: new Date(), updatedAt: new Date() } }
      );
    } else {
      await user.destroy();
    }

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
    let user;
    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      user = await db.collection('users').findOne({ id: userId, deletedAt: null });
    } else {
      user = await User.findByPk(userId);
    }
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // TODO: In Phase 4+, add actual progress tracking from Journal, Story, StoryAttempt models
    // For now, return placeholder data

    logger.debug('Got user progress', { userId });

    return res.status(200).json({
      userId,
      currentStars: user.currentStars,
      stats: {
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

/**
 * PUT /api/users/:userId/age
 * Update user age and set userType based on age
 * User can only update their own age
 */
export const updateUserAge = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { age } = req.body;

    // Validate UUID
    if (!validators.isValidUUID(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID format',
      });
    }

    // Verify ownership
    if (req.user.id !== userId) {
      logger.warn('Unauthorized age update attempt', {
        requesterId: req.user.id,
        targetUserId: userId,
      });
      return res.status(403).json({
        error: 'You can only update your own age',
      });
    }

    // Validate age
    if (age === undefined || age === null) {
      return res.status(400).json({
        error: 'Age is required',
      });
    }

    if (!validators.isValidAge(age)) {
      return res.status(400).json({
        error: 'Age must be between 5 and 19',
      });
    }

    // Find user
    let user;
    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      user = await db.collection('users').findOne({ id: userId, deletedAt: null });
    } else {
      user = await User.findByPk(userId);
    }
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Update age and userType
    const nextAge = parseInt(age);
    const nextUserType = nextAge >= 13 ? 'teenager' : 'child';

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      await db.collection('users').updateOne(
        { id: userId },
        { $set: { age: nextAge, userType: nextUserType, updatedAt: new Date() } }
      );
      user.age = nextAge;
      user.userType = nextUserType;
    } else {
      user.age = nextAge;
      user.userType = nextUserType;
      await user.save();
    }

    logger.info('User age updated', { userId, age, userType: user.userType });

    return res.status(200).json({
      message: 'Age updated successfully',
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
    logger.error('Update user age error', { error: error.message });
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
  updateUserAge,
};
