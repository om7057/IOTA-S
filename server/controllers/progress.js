import { UserStoryProgress } from '../models/index.js';
import { getMongoDb, isMongoPrimaryEnabled } from '../config/mongo.js';

/**
 * Get user's story progress
 */
export const getUserStoryProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storyId } = req.query;

    const where = { userId };
    if (storyId) where.storyId = storyId;

    const progress = await UserStoryProgress.findAll({
      where,
      order: [['updatedAt', 'DESC']],
    });

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('GetUserStoryProgress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress',
    });
  }
};

/**
 * Get progress for specific unit/lesson/challenge
 */
export const getProgressByItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, id } = req.params; // type: 'unit' | 'lesson' | 'challenge'

    const where = { userId };
    
    if (type === 'unit') {
      where.unitId = id;
    } else if (type === 'lesson') {
      where.lessonId = id;
    } else if (type === 'challenge') {
      where.challengeId = id;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid type',
      });
    }

    const progress = await UserStoryProgress.findAll({
      where,
    });

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('GetProgressByItem error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress',
    });
  }
};

/**
 * Update story progress
 */
export const updateStoryProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storyId } = req.params;
    const { unitId, lessonId, challengeId, status, pointsEarned, metadata } = req.body;

    let progress = await UserStoryProgress.findOne({
      where: {
        userId,
        storyId,
        unitId,
        lessonId,
        challengeId,
      },
    });

    if (!progress) {
      progress = await UserStoryProgress.create({
        userId,
        storyId,
        unitId,
        lessonId,
        challengeId,
        status: status || 'in-progress',
        pointsEarned: pointsEarned || 0,
        attempts: 1,
        startedAt: new Date(),
        metadata: metadata || {},
      });
    } else {
      if (status) progress.status = status;
      if (typeof pointsEarned !== 'undefined') progress.pointsEarned = pointsEarned;
      if (metadata) progress.metadata = metadata;
      
      progress.attempts = (progress.attempts || 0) + 1;

      if (status === 'completed' && !progress.completedAt) {
        progress.completedAt = new Date();
      }

      await progress.save();
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('UpdateStoryProgress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update progress',
    });
  }
};

/**
 * Mark unit as completed
 */
export const completeUnit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storyId, unitId } = req.params;
    const { pointsEarned } = req.body;

    let progress = await UserStoryProgress.findOne({
      where: { userId, storyId, unitId },
    });

    if (!progress) {
      progress = await UserStoryProgress.create({
        userId,
        storyId,
        unitId,
        status: 'completed',
        pointsEarned: pointsEarned || 0,
        completedAt: new Date(),
      });
    } else {
      progress.status = 'completed';
      progress.pointsEarned = pointsEarned || progress.pointsEarned;
      progress.completedAt = new Date();
      await progress.save();
    }

    // Check if all units in story are completed
    // TODO: If all units done, mark story as completed

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('CompleteUnit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete unit',
    });
  }
};

/**
 * Mark lesson as completed
 */
export const completeLesson = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storyId, lessonId } = req.params;
    const { pointsEarned } = req.body;

    let progress = await UserStoryProgress.findOne({
      where: { userId, storyId, lessonId },
    });

    if (!progress) {
      progress = await UserStoryProgress.create({
        userId,
        storyId,
        lessonId,
        status: 'completed',
        pointsEarned: pointsEarned || 0,
        completedAt: new Date(),
      });
    } else {
      progress.status = 'completed';
      progress.pointsEarned = pointsEarned || progress.pointsEarned;
      progress.completedAt = new Date();
      await progress.save();
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('CompleteLesson error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete lesson',
      details: error.message,
    });
  }
};

/**
 * Get user's stats summary
 */
export const getProgressStats = async (req, res) => {
  try {
    const userId = req.user.id;
    let allProgress = [];

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      allProgress = await db.collection('user_story_progresses').find({ userId }).toArray();
    } else {
      allProgress = await UserStoryProgress.findAll({
        where: { userId },
      });
    }

    const stats = {
      totalAttempts: allProgress.length,
      storiesCompleted: new Set(
        allProgress
          .filter(p => p.status === 'completed')
          .map(p => p.storyId)
      ).size,
      unitsCompleted: new Set(
        allProgress
          .filter(p => p.status === 'completed' && p.unitId)
          .map(p => p.unitId)
      ).size,
      lessonsCompleted: new Set(
        allProgress
          .filter(p => p.status === 'completed' && p.lessonId)
          .map(p => p.lessonId)
      ).size,
      totalPointsEarned: allProgress.reduce((sum, p) => sum + (p.pointsEarned || 0), 0),
      inProgress: allProgress.filter(p => p.status === 'in-progress').length,
      notStarted: allProgress.filter(p => p.status === 'not-started').length,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('GetProgressStats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
    });
  }
};

export default {
  getUserStoryProgress,
  getProgressByItem,
  updateStoryProgress,
  completeUnit,
  completeLesson,
  getProgressStats,
};
