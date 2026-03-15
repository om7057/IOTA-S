import { Journal } from '../models/Journal.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';
import { validators } from '../utils/validators.js';
import { Op } from 'sequelize';

/**
 * Journal Controller
 * Handles journal entries: create, read, update, delete, search
 */

/**
 * POST /api/journals
 * Create a new journal entry (protected)
 * Body: { title?, content, emotion?, tags?, prompt?, isPrivate? }
 */
export const createJournal = async (req, res, next) => {
  try {
    const { title, content, emotion, tags, prompt, isPrivate } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate content
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required and must be a string' });
    }

    if (content.length < 1 || content.length > 5000) {
      return res.status(400).json({ error: 'Content must be between 1 and 5000 characters' });
    }

    // Validate title if provided
    if (title && (typeof title !== 'string' || title.length > 200)) {
      return res.status(400).json({ error: 'Title must be less than 200 characters' });
    }

    // Validate emotion if provided
    if (emotion) {
      const validEmotions = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'neutral', 'confused', 'motivated', 'stressed'];
      if (!validEmotions.includes(emotion)) {
        return res.status(400).json({ error: `Emotion must be one of: ${validEmotions.join(', ')}` });
      }
    }

    // Validate tags if provided
    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array' });
    }

    // Create journal
    const journal = await Journal.create({
      userId: req.user.id,
      title: title || null,
      content,
      emotion: emotion || null,
      tags: tags || [],
      prompt: prompt || null,
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      entryDate: new Date(),
    });

    logger.info('Journal entry created', {
      userId: req.user.id,
      journalId: journal.id,
    });

    return res.status(201).json({
      message: 'Journal entry created successfully',
      journal,
    });
  } catch (error) {
    logger.error('Create journal error', { error: error.message });
    next(error);
  }
};

/**
 * GET /api/journals
 * Get user's journal entries (protected)
 * Query params: page, limit, emotion, startDate, endDate, isPrivate
 */
export const getJournals = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { page = 1, limit = 10, emotion, startDate, endDate, isPrivate } = req.query;

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

    if (isPrivate !== undefined) {
      where.isPrivate = isPrivate === 'true' || isPrivate === true;
    }

    if (startDate || endDate) {
      where.entryDate = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start)) {
          return res.status(400).json({ error: 'Invalid startDate format' });
        }
        where.entryDate[Op.gte] = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end)) {
          return res.status(400).json({ error: 'Invalid endDate format' });
        }
        where.entryDate[Op.lte] = end;
      }
    }

    // Get journals
    const { count, rows } = await Journal.findAndCountAll({
      where,
      order: [['entryDate', 'DESC']],
      limit: limitNum,
      offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    logger.debug('Retrieved journals', {
      userId: req.user.id,
      count: rows.length,
      total: count,
    });

    return res.status(200).json({
      journals: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages,
      },
    });
  } catch (error) {
    logger.error('Get journals error', { error: error.message });
    next(error);
  }
};

/**
 * GET /api/journals/:journalId
 * Get specific journal entry (protected)
 */
export const getJournalById = async (req, res, next) => {
  try {
    const { journalId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!validators.isValidUUID(journalId)) {
      return res.status(400).json({ error: 'Invalid journal ID format' });
    }

    const journal = await Journal.findOne({
      where: { id: journalId, userId: req.user.id },
    });

    if (!journal) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    logger.debug('Retrieved journal', { journalId });

    return res.status(200).json(journal);
  } catch (error) {
    logger.error('Get journal by ID error', { error: error.message });
    next(error);
  }
};

/**
 * PATCH /api/journals/:journalId
 * Update journal entry (protected)
 */
export const updateJournal = async (req, res, next) => {
  try {
    const { journalId } = req.params;
    const { title, content, emotion, tags, isPrivate } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!validators.isValidUUID(journalId)) {
      return res.status(400).json({ error: 'Invalid journal ID format' });
    }

    const journal = await Journal.findOne({
      where: { id: journalId, userId: req.user.id },
    });

    if (!journal) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    // Validate and update fields
    if (content !== undefined) {
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Content must be a non-empty string' });
      }
      if (content.length < 1 || content.length > 5000) {
        return res.status(400).json({ error: 'Content must be between 1 and 5000 characters' });
      }
      journal.content = content;
    }

    if (title !== undefined) {
      if (title && title.length > 200) {
        return res.status(400).json({ error: 'Title must be less than 200 characters' });
      }
      journal.title = title;
    }

    if (emotion !== undefined) {
      if (emotion) {
        const validEmotions = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'neutral', 'confused', 'motivated', 'stressed'];
        if (!validEmotions.includes(emotion)) {
          return res.status(400).json({ error: `Emotion must be one of: ${validEmotions.join(', ')}` });
        }
      }
      journal.emotion = emotion;
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({ error: 'Tags must be an array' });
      }
      journal.tags = tags;
    }

    if (isPrivate !== undefined) {
      journal.isPrivate = isPrivate;
    }

    await journal.save();

    logger.info('Journal entry updated', { journalId });

    return res.status(200).json({
      message: 'Journal entry updated successfully',
      journal,
    });
  } catch (error) {
    logger.error('Update journal error', { error: error.message });
    next(error);
  }
};

/**
 * DELETE /api/journals/:journalId
 * Delete journal entry (protected)
 */
export const deleteJournal = async (req, res, next) => {
  try {
    const { journalId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!validators.isValidUUID(journalId)) {
      return res.status(400).json({ error: 'Invalid journal ID format' });
    }

    const journal = await Journal.findOne({
      where: { id: journalId, userId: req.user.id },
    });

    if (!journal) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    await journal.destroy();

    logger.info('Journal entry deleted', { journalId });

    return res.status(200).json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    logger.error('Delete journal error', { error: error.message });
    next(error);
  }
};

/**
 * GET /api/journals/search
 * Search journal entries by keyword (protected)
 */
export const searchJournals = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { q, page = 1, limit = 10 } = req.query;

    if (!q || typeof q !== 'string' || q.length < 1) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    if (!validators.isValidPagination(page, limit)) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Search in title and content
    const { count, rows } = await Journal.findAndCountAll({
      where: {
        userId: req.user.id,
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { content: { [Op.iLike]: `%${q}%` } },
        ],
      },
      order: [['entryDate', 'DESC']],
      limit: limitNum,
      offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    logger.debug('Searched journals', {
      userId: req.user.id,
      query: q,
      count: rows.length,
    });

    return res.status(200).json({
      journals: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages,
      },
      query: q,
    });
  } catch (error) {
    logger.error('Search journals error', { error: error.message });
    next(error);
  }
};

export default {
  createJournal,
  getJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
  searchJournals,
};
