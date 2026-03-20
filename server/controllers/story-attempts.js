import { StoryAttempt, User, Story, Topic } from '../models/index.js';
import { sequelize } from '../config/sequelize.js';
import { getMongoDb, isMongoPrimaryEnabled } from '../config/mongo.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a story attempt (save quiz/story answer)
 */
export const createStoryAttempt = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      storyId,
      topicId,
      questionIndex,
      userAnswer,
      correctAnswer,
      isCorrect,
      scenarioContext,
      emotionDetected,
      emotionConfidence,
      emotionIntensity,
      timeSpent,
      aiRecommendation,
      weaknessTopics,
    } = req.body;

    // Validate required fields
    if (!storyId || questionIndex === undefined || !userAnswer || !correctAnswer) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: storyId, questionIndex, userAnswer, correctAnswer',
      });
    }

    const now = new Date();

    // Mongo-primary path
    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const attempt = {
        _id: uuidv4(),
        userId,
        storyId,
        topicId,
        questionIndex,
        userAnswer,
        correctAnswer,
        isCorrect,
        scenarioContext: scenarioContext || null,
        emotionDetected: emotionDetected || null,
        emotionConfidence: emotionConfidence || 0,
        emotionIntensity: emotionIntensity || 0,
        timeSpent: timeSpent || 0,
        aiRecommendation: aiRecommendation || {},
        weaknessTopics: weaknessTopics || (isCorrect ? [] : [topicId]),
        attemptsCount: 1,
        createdAt: now,
        updatedAt: now,
      };
      await db.collection('story_attempts').insertOne(attempt);

      const user = await db.collection('users').findOne({ _id: userId });
      const story = await db.collection('stories').findOne({ _id: storyId });
      const topic = topicId ? await db.collection('topics').findOne({ _id: topicId }) : null;

      const populatedAttempt = {
        ...attempt,
        user: user ? { id: user._id, email: user.email, name: user.displayName } : null,
        story: story ? { id: story._id, title: story.title, description: story.description } : null,
        topic: topic ? { id: topic._id, name: topic.name } : null,
      };

      return res.status(201).json({ success: true, data: populatedAttempt });
    }

    // Sequelize fallback
    const attempt = await StoryAttempt.create({
      userId,
      storyId,
      topicId,
      questionIndex,
      userAnswer,
      correctAnswer,
      isCorrect,
      scenarioContext,
      emotionDetected,
      emotionConfidence,
      emotionIntensity,
      timeSpent,
      aiRecommendation: aiRecommendation || {},
      weaknessTopics: weaknessTopics || (isCorrect ? [] : [topicId]),
      attemptsCount: 1,
    });

    // Include related data
    const populatedAttempt = await StoryAttempt.findByPk(attempt.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'name'] },
        { model: Story, as: 'story', attributes: ['id', 'title', 'description'] },
        { model: Topic, as: 'topic', attributes: ['id', 'name'] },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Story attempt recorded successfully',
      data: populatedAttempt,
    });
  } catch (error) {
    console.error('CreateStoryAttempt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create story attempt',
    });
  }
};

/**
 * Get user's story attempts
 */
export const getUserStoryAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storyId, topicId, isCorrect, limit = 50, offset = 0 } = req.query;

    const where = { userId };
    if (storyId) where.storyId = storyId;
    if (topicId) where.topicId = topicId;
    if (isCorrect !== undefined) where.isCorrect = isCorrect === 'true';

    const { count, rows } = await StoryAttempt.findAndCountAll({
      where,
      include: [
        { model: Story, as: 'story', attributes: ['id', 'title', 'description'] },
        { model: Topic, as: 'topic', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('GetUserStoryAttempts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch story attempts',
    });
  }
};

/**
 * Get parent's child's story attempts (for parent dashboard)
 */
export const getChildStoryAttempts = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { childUserId } = req.params;
    const { storyId, topicId, startDate, endDate, limit = 50, offset = 0 } = req.query;

    // Verify parent-child relationship
    const ParentalAccount = sequelize.models.ParentalAccount;
    const parentalLink = await ParentalAccount.findOne({
      where: {
        parentUserId: parentId,
        childUserId: childUserId,
      },
    });

    if (!parentalLink) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this child account',
      });
    }

    const where = { userId: childUserId };
    if (storyId) where.storyId = storyId;
    if (topicId) where.topicId = topicId;

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[sequelize.Sequelize.Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[sequelize.Sequelize.Op.lte] = new Date(endDate);
    }

    const { count, rows } = await StoryAttempt.findAndCountAll({
      where,
      include: [
        { model: Story, as: 'story', attributes: ['id', 'title', 'description'] },
        { model: Topic, as: 'topic', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('GetChildStoryAttempts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch child story attempts',
    });
  }
};

/**
 * Get weakness topics for a child (parent dashboard analytics)
 */
export const getChildWeaknesses = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { childUserId } = req.params;

    // Verify parent-child relationship
    const ParentalAccount = sequelize.models.ParentalAccount;
    const parentalLink = await ParentalAccount.findOne({
      where: {
        parentUserId: parentId,
        childUserId: childUserId,
      },
    });

    if (!parentalLink) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this child account',
      });
    }

    // Get all incorrect attempts grouped by topic
    const weaknesses = await sequelize.query(
      `
      SELECT 
        t.id,
        t.name,
        COUNT(sa.id) as incorrect_attempts,
        ROUND(100.0 * COUNT(sa.id) / SUM(CASE WHEN sa."isCorrect" = true THEN 1 ELSE 0 END) OVER (), 2) as error_rate,
        ARRAY_AGG(DISTINCT s.id) as related_stories,
        MAX(sa."createdAt") as last_attempt
      FROM story_attempts sa
      LEFT JOIN topics t ON sa."topicId" = t.id
      LEFT JOIN stories s ON sa."storyId" = s.id
      WHERE sa."userId" = $1 AND sa."isCorrect" = false AND t.id IS NOT NULL
      GROUP BY t.id, t.name
      ORDER BY incorrect_attempts DESC
    `,
      {
        bind: [childUserId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      success: true,
      data: weaknesses,
    });
  } catch (error) {
    console.error('GetChildWeaknesses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch child weakness analytics',
    });
  }
};

/**
 * Get learning analytics for a child
 */
export const getChildLearningAnalytics = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { childUserId } = req.params;

    // Verify parent-child relationship
    const ParentalAccount = sequelize.models.ParentalAccount;
    const parentalLink = await ParentalAccount.findOne({
      where: {
        parentUserId: parentId,
        childUserId: childUserId,
      },
    });

    if (!parentalLink) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this child account',
      });
    }

    // Get overall analytics
    const totalAttempts = await StoryAttempt.count({
      where: { userId: childUserId },
    });

    const correctAttempts = await StoryAttempt.count({
      where: { userId: childUserId, isCorrect: true },
    });

    const avgTimeSpent = await sequelize.query(
      `
      SELECT AVG("timeSpent") as avg_time_seconds
      FROM story_attempts
      WHERE "userId" = $1 AND "timeSpent" IS NOT NULL
    `,
      {
        bind: [childUserId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const emotionBreakdown = await sequelize.query(
      `
      SELECT 
        "emotionDetected",
        COUNT(*) as count,
        AVG("emotionIntensity") as avg_intensity
      FROM story_attempts
      WHERE "userId" = $1 AND "emotionDetected" IS NOT NULL
      GROUP BY "emotionDetected"
      ORDER BY count DESC
    `,
      {
        bind: [childUserId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const topicsProgress = await sequelize.query(
      `
      SELECT 
        t.id,
        t.name,
        COUNT(CASE WHEN sa."isCorrect" = true THEN 1 END) as correct,
        COUNT(CASE WHEN sa."isCorrect" = false THEN 1 END) as incorrect,
        COUNT(sa.id) as total,
        ROUND(100.0 * COUNT(CASE WHEN sa."isCorrect" = true THEN 1 END) / COUNT(sa.id), 2) as success_rate
      FROM story_attempts sa
      LEFT JOIN topics t ON sa."topicId" = t.id
      WHERE sa."userId" = $1 AND t.id IS NOT NULL
      GROUP BY t.id, t.name
      ORDER BY success_rate ASC
    `,
      {
        bind: [childUserId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      success: true,
      data: {
        overview: {
          totalAttempts,
          correctAttempts,
          accuracy: totalAttempts > 0 ? ((correctAttempts / totalAttempts) * 100).toFixed(2) : 0,
          avgTimeSpentSeconds: avgTimeSpent[0]?.avg_time_seconds || 0,
        },
        emotionBreakdown,
        topicsProgress,
      },
    });
  } catch (error) {
    console.error('GetChildLearningAnalytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch learning analytics',
    });
  }
};

/**
 * Get a specific story attempt
 */
export const getStoryAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await StoryAttempt.findOne({
      where: { id: attemptId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Story, as: 'story', attributes: ['id', 'title', 'description', 'category'] },
        { model: Topic, as: 'topic', attributes: ['id', 'name'] },
      ],
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: 'Story attempt not found',
      });
    }

    // Check access: user can view their own or if they're parent
    if (attempt.userId !== userId) {
      const ParentalAccount = sequelize.models.ParentalAccount;
      const isParent = await ParentalAccount.findOne({
        where: {
          parentUserId: userId,
          childUserId: attempt.userId,
        },
      });

      if (!isParent) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to view this attempt',
        });
      }
    }

    res.json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    console.error('GetStoryAttempt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch story attempt',
    });
  }
};

/**
 * Update story attempt (e.g., add notes or AI recommendation)
 */
export const updateStoryAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { aiRecommendation, notes, weaknessTopics } = req.body;

    const attempt = await StoryAttempt.findByPk(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: 'Story attempt not found',
      });
    }

    // Update only specific fields
    if (aiRecommendation !== undefined) attempt.aiRecommendation = aiRecommendation;
    if (notes !== undefined) attempt.notes = notes;
    if (weaknessTopics !== undefined) attempt.weaknessTopics = weaknessTopics;

    await attempt.save();

    const updated = await StoryAttempt.findByPk(attemptId, {
      include: [
        { model: Story, as: 'story', attributes: ['id', 'title'] },
        { model: Topic, as: 'topic', attributes: ['id', 'name'] },
      ],
    });

    res.json({
      success: true,
      message: 'Story attempt updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('UpdateStoryAttempt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update story attempt',
    });
  }
};
