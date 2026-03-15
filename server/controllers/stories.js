import { Story, Unit, Lesson, Challenge } from '../models/index.js';
import { logger } from '../utils/logger.js';
import { validators } from '../utils/validators.js';

/**
 * Stories Controller
 * Handles educational stories with hierarchical structure:
 * Story > Unit > Lesson > Challenge
 */

/**
 * GET /api/stories
 * List all published stories (public)
 * Query params: page, limit, category, difficulty
 */
export const listStories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, difficulty } = req.query;

    if (!validators.isValidPagination(page, limit)) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = { isPublished: true };

    if (category) {
      const validCategories = ['anxiety', 'depression', 'social', 'academic', 'family', 'health', 'identity', 'general'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      where.category = category;
    }

    if (difficulty) {
      const validDifficulty = ['beginner', 'intermediate', 'advanced'];
      if (!validDifficulty.includes(difficulty)) {
        return res.status(400).json({ error: 'Invalid difficulty level' });
      }
      where.difficultyLevel = difficulty;
    }

    const { count, rows } = await Story.findAndCountAll({
      where,
      include: [
        {
          model: Unit,
          as: 'units',
          attributes: ['id', 'sequence', 'title'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    logger.debug('Listed stories', {
      total: count,
      returned: rows.length,
      category,
      difficulty,
    });

    return res.status(200).json({
      stories: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages,
      },
    });
  } catch (error) {
    logger.error('List stories error', { error: error.message });
    next(error);
  }
};

/**
 * GET /api/stories/:storyId
 * Get story with full hierarchy (public)
 */
export const getStoryById = async (req, res, next) => {
  try {
    const { storyId } = req.params;

    if (!validators.isValidUUID(storyId)) {
      return res.status(400).json({ error: 'Invalid story ID format' });
    }

    const story = await Story.findOne({
      where: { id: storyId, isPublished: true },
      include: [
        {
          model: Unit,
          as: 'units',
          include: [
            {
              model: Lesson,
              as: 'lessons',
              attributes: ['id', 'sequence', 'title', 'estimatedDuration', 'challengeCount'],
              include: [
                {
                  model: Challenge,
                  as: 'challenges',
                  attributes: ['id', 'sequence', 'title', 'type', 'points', 'isOptional'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Increment view count
    story.viewCount += 1;
    await story.save();

    logger.debug('Retrieved story', { storyId, viewCount: story.viewCount });

    return res.status(200).json(story);
  } catch (error) {
    logger.error('Get story by ID error', { error: error.message });
    next(error);
  }
};

/**
 * GET /api/stories/:storyId/units
 * Get all units in a story (public)
 */
export const getStoryUnits = async (req, res, next) => {
  try {
    const { storyId } = req.params;

    if (!validators.isValidUUID(storyId)) {
      return res.status(400).json({ error: 'Invalid story ID format' });
    }

    const story = await Story.findOne({
      where: { id: storyId, isPublished: true },
      attributes: ['id', 'title'],
    });

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const units = await Unit.findAll({
      where: { storyId },
      order: [['sequence', 'ASC']],
      include: [
        {
          model: Lesson,
          as: 'lessons',
          attributes: ['id', 'sequence', 'title'],
        },
      ],
    });

    logger.debug('Retrieved story units', { storyId, unitCount: units.length });

    return res.status(200).json({
      storyId,
      storyTitle: story.title,
      units,
    });
  } catch (error) {
    logger.error('Get story units error', { error: error.message });
    next(error);
  }
};

/**
 * GET /api/stories/:storyId/units/:unitId
 * Get specific unit with lessons (public)
 */
export const getUnit = async (req, res, next) => {
  try {
    const { storyId, unitId } = req.params;

    if (!validators.isValidUUID(storyId) || !validators.isValidUUID(unitId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const unit = await Unit.findOne({
      where: { id: unitId, storyId },
      include: [
        {
          model: Lesson,
          as: 'lessons',
          order: [['sequence', 'ASC']],
          include: [
            {
              model: Challenge,
              as: 'challenges',
              attributes: ['id', 'sequence', 'title', 'type', 'points'],
            },
          ],
        },
      ],
    });

    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    logger.debug('Retrieved unit', { unitId });

    return res.status(200).json(unit);
  } catch (error) {
    logger.error('Get unit error', { error: error.message });
    next(error);
  }
};

/**
 * GET /api/stories/:storyId/units/:unitId/lessons/:lessonId
 * Get specific lesson with challenges (public)
 */
export const getLesson = async (req, res, next) => {
  try {
    const { storyId, unitId, lessonId } = req.params;

    if (!validators.isValidUUID(storyId) || !validators.isValidUUID(unitId) || !validators.isValidUUID(lessonId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const lesson = await Lesson.findOne({
      where: { id: lessonId, unitId },
      include: [
        {
          model: Challenge,
          as: 'challenges',
          order: [['sequence', 'ASC']],
        },
      ],
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    logger.debug('Retrieved lesson', { lessonId });

    return res.status(200).json(lesson);
  } catch (error) {
    logger.error('Get lesson error', { error: error.message });
    next(error);
  }
};

/**
 * GET /api/stories/:storyId/units/:unitId/lessons/:lessonId/challenges/:challengeId
 * Get specific challenge (public)
 */
export const getChallenge = async (req, res, next) => {
  try {
    const { storyId, unitId, lessonId, challengeId } = req.params;

    if (!validators.isValidUUID(storyId) || !validators.isValidUUID(unitId) || !validators.isValidUUID(lessonId) || !validators.isValidUUID(challengeId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const challenge = await Challenge.findOne({
      where: { id: challengeId, lessonId },
      include: [
        {
          model: Lesson,
          as: 'lesson',
          attributes: ['id', 'title', 'unitId'],
        },
      ],
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    logger.debug('Retrieved challenge', { challengeId });

    return res.status(200).json(challenge);
  } catch (error) {
    logger.error('Get challenge error', { error: error.message });
    next(error);
  }
};

/**
 * GET /api/stories/by-category/:category
 * Get stories by category (public)
 * Query: page, limit
 */
export const getStoriesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const validCategories = ['anxiety', 'depression', 'social', 'academic', 'family', 'health', 'identity', 'general'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    if (!validators.isValidPagination(page, limit)) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await Story.findAndCountAll({
      where: { category, isPublished: true },
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    logger.debug('Retrieved stories by category', {
      category,
      total: count,
    });

    return res.status(200).json({
      category,
      stories: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages,
      },
    });
  } catch (error) {
    logger.error('Get stories by category error', { error: error.message });
    next(error);
  }
};

export default {
  listStories,
  getStoryById,
  getStoryUnits,
  getUnit,
  getLesson,
  getChallenge,
  getStoriesByCategory,
};
