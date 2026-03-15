import { Mood } from '../models/Mood.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';
import { validators } from '../utils/validators.js';
import { Op } from 'sequelize';

/**
 * Mood Controller
 * Handles mood tracking: create, read, update, delete, analytics
 */

/**
 * POST /api/moods
 * Create a new mood log (protected)
 * Body: { emotion, intensity, context?, tags?, physicalState? }
 */
export const createMood = async (req, res, next) => {
  try {
    const { emotion, intensity, context, tags, physicalState } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate emotion
    const validEmotions = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'neutral', 'confused', 'motivated', 'stressed'];
    if (!emotion || !validEmotions.includes(emotion)) {
      return res.status(400).json({
        error: `Emotion must be one of: ${validEmotions.join(', ')}`,
      });
    }

    // Validate intensity
    if (intensity === undefined || intensity === null) {
      return res.status(400).json({ error: 'Intensity is required' });
    }
    const intensityNum = parseInt(intensity);
    if (isNaN(intensityNum) || intensityNum < 1 || intensityNum > 10) {
      return res.status(400).json({ error: 'Intensity must be between 1 and 10' });
    }

    // Optional: Validate context length
    if (context && typeof context === 'string' && context.length > 1000) {
      return res.status(400).json({ error: 'Context must be less than 1000 characters' });
    }

    // Validate tags if provided
    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array' });
    }

    // Validate physicalState if provided
    if (physicalState && typeof physicalState !== 'object') {
      return res.status(400).json({ error: 'Physical state must be an object' });
    }

    // Create mood log
    const mood = await Mood.create({
      userId: req.user.id,
      emotion,
      intensity: intensityNum,
      context: context || null,
      tags: tags || [],
      physicalState: physicalState || null,
      loggedAt: new Date(),
    });

    logger.info('Mood logged', {
      userId: req.user.id,
      emotion,
      intensity: intensityNum,
    });

    return res.status(201).json({
      message: 'Mood logged successfully',
      mood,
    });
  } catch (error) {
    logger.error('Create mood error', { error: error.message });
    next(error);
  }
};

/**
 * GET /api/moods
 * Get user's moods (protected)
 * Query params: page, limit, emotion, startDate, endDate
 */
export const getMoods = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { page = 1, limit = 10, emotion, startDate, endDate } = req.query;

    // Validate pagination
    if (!validators.isValidPagination(page, limit)) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const where = { userId: req.user.id };

    if (emotion) {
      const validEmotions = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'neutral', 'confused', 'motivated', 'stressed'];
      if (!validEmotions.includes(emotion)) {
        return res.status(400).json({ error: 'Invalid emotion filter' });
      }
      where.emotion = emotion;
    }

    if (startDate || endDate) {
      where.loggedAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start)) {
          return res.status(400).json({ error: 'Invalid startDate format' });
        }
        where.loggedAt[Op.gte] = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end)) {
          return res.status(400).json({ error: 'Invalid endDate format' });
        }
        where.loggedAt[Op.lte] = end;
      }
    }

    // Get moods
    const { count, rows } = await Mood.findAndCountAll({
      where,
      order: [['loggedAt', 'DESC']],
      limit: limitNum,
      offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    logger.debug('Retrieved moods', {
      userId: req.user.id,
      count: rows.length,
      total: count,
    });

    return res.status(200).json({
      moods: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages,
      },
    });
  } catch (error) {
    logger.error('Get moods error', { error: error.message });
    next(error);
  }
};

/**
 * GET /api/moods/:moodId
 * Get specific mood (protected)
 */
export const getMoodById = async (req, res, next) => {
  try {
    const { moodId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!validators.isValidUUID(moodId)) {
      return res.status(400).json({ error: 'Invalid mood ID format' });
    }

    const mood = await Mood.findOne({
      where: { id: moodId, userId: req.user.id },
    });

    if (!mood) {
      return res.status(404).json({ error: 'Mood not found' });
    }

    logger.debug('Retrieved mood', { moodId });

    return res.status(200).json(mood);
  } catch (error) {
    logger.error('Get mood by ID error', { error: error.message });
    next(error);
  }
};

/**
 * PATCH /api/moods/:moodId
 * Update mood (protected)
 */
export const updateMood = async (req, res, next) => {
  try {
    const { moodId } = req.params;
    const { emotion, intensity, context, tags, physicalState } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!validators.isValidUUID(moodId)) {
      return res.status(400).json({ error: 'Invalid mood ID format' });
    }

    const mood = await Mood.findOne({
      where: { id: moodId, userId: req.user.id },
    });

    if (!mood) {
      return res.status(404).json({ error: 'Mood not found' });
    }

    // Validate and update fields
    if (emotion !== undefined) {
      const validEmotions = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'neutral', 'confused', 'motivated', 'stressed'];
      if (!validEmotions.includes(emotion)) {
        return res.status(400).json({ error: `Emotion must be one of: ${validEmotions.join(', ')}` });
      }
      mood.emotion = emotion;
    }

    if (intensity !== undefined) {
      const intensityNum = parseInt(intensity);
      if (isNaN(intensityNum) || intensityNum < 1 || intensityNum > 10) {
        return res.status(400).json({ error: 'Intensity must be between 1 and 10' });
      }
      mood.intensity = intensityNum;
    }

    if (context !== undefined) {
      if (context && context.length > 1000) {
        return res.status(400).json({ error: 'Context must be less than 1000 characters' });
      }
      mood.context = context;
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({ error: 'Tags must be an array' });
      }
      mood.tags = tags;
    }

    if (physicalState !== undefined) {
      if (physicalState && typeof physicalState !== 'object') {
        return res.status(400).json({ error: 'Physical state must be an object' });
      }
      mood.physicalState = physicalState;
    }

    await mood.save();

    logger.info('Mood updated', { moodId });

    return res.status(200).json({
      message: 'Mood updated successfully',
      mood,
    });
  } catch (error) {
    logger.error('Update mood error', { error: error.message });
    next(error);
  }
};

/**
 * DELETE /api/moods/:moodId
 * Delete mood (protected)
 */
export const deleteMood = async (req, res, next) => {
  try {
    const { moodId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!validators.isValidUUID(moodId)) {
      return res.status(400).json({ error: 'Invalid mood ID format' });
    }

    const mood = await Mood.findOne({
      where: { id: moodId, userId: req.user.id },
    });

    if (!mood) {
      return res.status(404).json({ error: 'Mood not found' });
    }

    await mood.destroy();

    logger.info('Mood deleted', { moodId });

    return res.status(200).json({ message: 'Mood deleted successfully' });
  } catch (error) {
    logger.error('Delete mood error', { error: error.message });
    next(error);
  }
};

/**
 * GET /api/moods/analytics/summary
 * Get mood analytics and trends (protected)
 */
export const getMoodAnalytics = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { days = 7 } = req.query;
    const daysNum = parseInt(days);

    if (isNaN(daysNum) || daysNum < 1) {
      return res.status(400).json({ error: 'Days must be a positive number' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    // Get moods in date range
    const moods = await Mood.findAll({
      where: {
        userId: req.user.id,
        loggedAt: {
          [Op.gte]: startDate,
        },
      },
    });

    // Calculate analytics
    const totalMoods = moods.length;
    const emotionCounts = {};
    let totalIntensity = 0;
    const averageIntensity = totalMoods > 0 ? moods.reduce((sum, m) => sum + m.intensity, 0) / totalMoods : 0;

    // Count emotions and calculate intensity
    moods.forEach((mood) => {
      emotionCounts[mood.emotion] = (emotionCounts[mood.emotion] || 0) + 1;
      totalIntensity += mood.intensity;
    });

    // Find most common emotion
    const mostCommonEmotion = Object.keys(emotionCounts).length > 0
      ? Object.entries(emotionCounts).reduce((max, [emotion, count]) => (count > max[1] ? [emotion, count] : max))[0]
      : null;

    logger.debug('Retrieved mood analytics', {
      userId: req.user.id,
      days: daysNum,
      totalMoods,
    });

    return res.status(200).json({
      period: {
        days: daysNum,
        startDate,
        endDate: new Date(),
      },
      summary: {
        totalMoods,
        averageIntensity: Math.round(averageIntensity * 10) / 10,
        mostCommonEmotion,
        emotionDistribution: emotionCounts,
      },
    });
  } catch (error) {
    logger.error('Get mood analytics error', { error: error.message });
    next(error);
  }
};

export default {
  createMood,
  getMoods,
  getMoodById,
  updateMood,
  deleteMood,
  getMoodAnalytics,
};
