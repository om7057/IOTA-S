import { Story, Unit, Lesson, Challenge } from '../models/index.js';
import { logger } from '../utils/logger.js';
import { validators } from '../utils/validators.js';
import { getMongoDb, isMongoPrimaryEnabled } from '../config/mongo.js';

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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const mongoWhere = { isPublished: true, deletedAt: null };
      if (where.category) mongoWhere.category = where.category;
      if (where.difficultyLevel) mongoWhere.difficultyLevel = where.difficultyLevel;

      const count = await db.collection('stories').countDocuments(mongoWhere);
      const rows = await db
        .collection('stories')
        .find(mongoWhere)
        .project({ _id: 0 })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limitNum)
        .toArray();

      const storyIds = rows.map((story) => story.id);
      const units = storyIds.length
        ? await db
            .collection('units')
            .find({ storyId: { $in: storyIds }, deletedAt: null })
            .project({ _id: 0, id: 1, sequence: 1, title: 1, storyId: 1 })
            .toArray()
        : [];

      const unitsByStoryId = new Map();
      for (const unit of units) {
        const bucket = unitsByStoryId.get(unit.storyId) || [];
        bucket.push(unit);
        unitsByStoryId.set(unit.storyId, bucket);
      }

      for (const row of rows) {
        row.units = (unitsByStoryId.get(row.id) || []).sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
      }

      const totalPages = Math.ceil(count / limitNum);
      return res.status(200).json({
        stories: rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count,
          totalPages,
        },
      });
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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const story = await db.collection('stories').findOne({ id: storyId, isPublished: true, deletedAt: null }, { projection: { _id: 0 } });
      if (!story) {
        return res.status(404).json({ error: 'Story not found' });
      }

      const units = await db.collection('units').find({ storyId, deletedAt: null }).project({ _id: 0 }).sort({ sequence: 1 }).toArray();
      const unitIds = units.map((unit) => unit.id);
      const lessons = unitIds.length
        ? await db.collection('lessons').find({ unitId: { $in: unitIds }, deletedAt: null }).project({ _id: 0 }).sort({ sequence: 1 }).toArray()
        : [];
      const lessonIds = lessons.map((lesson) => lesson.id);
      const challenges = lessonIds.length
        ? await db.collection('challenges').find({ lessonId: { $in: lessonIds }, deletedAt: null }).project({ _id: 0 }).sort({ sequence: 1 }).toArray()
        : [];

      const challengesByLessonId = new Map();
      for (const challenge of challenges) {
        const bucket = challengesByLessonId.get(challenge.lessonId) || [];
        bucket.push(challenge);
        challengesByLessonId.set(challenge.lessonId, bucket);
      }

      const lessonsByUnitId = new Map();
      for (const lesson of lessons) {
        lesson.challenges = challengesByLessonId.get(lesson.id) || [];
        const bucket = lessonsByUnitId.get(lesson.unitId) || [];
        bucket.push(lesson);
        lessonsByUnitId.set(lesson.unitId, bucket);
      }

      for (const unit of units) {
        unit.lessons = lessonsByUnitId.get(unit.id) || [];
      }

      story.units = units;

      const nextViewCount = (story.viewCount || 0) + 1;
      await db.collection('stories').updateOne({ id: story.id }, { $set: { viewCount: nextViewCount, updatedAt: new Date() } });
      story.viewCount = nextViewCount;

      return res.status(200).json(story);
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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const story = await db
        .collection('stories')
        .findOne({ id: storyId, isPublished: true, deletedAt: null }, { projection: { _id: 0, id: 1, title: 1 } });

      if (!story) {
        return res.status(404).json({ error: 'Story not found' });
      }

      const units = await db.collection('units').find({ storyId, deletedAt: null }).project({ _id: 0 }).sort({ sequence: 1 }).toArray();
      const unitIds = units.map((unit) => unit.id);
      const lessons = unitIds.length
        ? await db
            .collection('lessons')
            .find({ unitId: { $in: unitIds }, deletedAt: null })
            .project({ _id: 0, id: 1, sequence: 1, title: 1, unitId: 1 })
            .sort({ sequence: 1 })
            .toArray()
        : [];

      const lessonsByUnitId = new Map();
      for (const lesson of lessons) {
        const bucket = lessonsByUnitId.get(lesson.unitId) || [];
        bucket.push(lesson);
        lessonsByUnitId.set(lesson.unitId, bucket);
      }

      for (const unit of units) {
        unit.lessons = lessonsByUnitId.get(unit.id) || [];
      }

      return res.status(200).json({ storyId, storyTitle: story.title, units });
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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const unit = await db.collection('units').findOne({ id: unitId, storyId, deletedAt: null }, { projection: { _id: 0 } });

      if (!unit) {
        return res.status(404).json({ error: 'Unit not found' });
      }

      const lessons = await db.collection('lessons').find({ unitId: unit.id, deletedAt: null }).project({ _id: 0 }).sort({ sequence: 1 }).toArray();
      const lessonIds = lessons.map((lesson) => lesson.id);
      const challenges = lessonIds.length
        ? await db
            .collection('challenges')
            .find({ lessonId: { $in: lessonIds }, deletedAt: null })
            .project({ _id: 0, id: 1, sequence: 1, title: 1, type: 1, points: 1, lessonId: 1 })
            .sort({ sequence: 1 })
            .toArray()
        : [];

      const challengesByLessonId = new Map();
      for (const challenge of challenges) {
        const bucket = challengesByLessonId.get(challenge.lessonId) || [];
        bucket.push(challenge);
        challengesByLessonId.set(challenge.lessonId, bucket);
      }

      for (const lesson of lessons) {
        lesson.challenges = challengesByLessonId.get(lesson.id) || [];
      }

      unit.lessons = lessons;
      return res.status(200).json(unit);
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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const lesson = await db.collection('lessons').findOne({ id: lessonId, unitId, deletedAt: null }, { projection: { _id: 0 } });

      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      const challenges = await db.collection('challenges').find({ lessonId: lesson.id, deletedAt: null }).project({ _id: 0 }).sort({ sequence: 1 }).toArray();
      lesson.challenges = challenges;
      return res.status(200).json(lesson);
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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const challenge = await db.collection('challenges').findOne({ id: challengeId, lessonId, deletedAt: null }, { projection: { _id: 0 } });

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      const lesson = await db
        .collection('lessons')
        .findOne({ id: lessonId, deletedAt: null }, { projection: { _id: 0, id: 1, title: 1, unitId: 1 } });
      challenge.lesson = lesson || null;
      return res.status(200).json(challenge);
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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const where = { category, isPublished: true, deletedAt: null };
      const count = await db.collection('stories').countDocuments(where);
      const rows = await db
        .collection('stories')
        .find(where)
        .project({ _id: 0 })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limitNum)
        .toArray();

      const totalPages = Math.ceil(count / limitNum);
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
    }

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
