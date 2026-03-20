import { Journal } from '../models/Journal.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';
import { validators } from '../utils/validators.js';
import { Op } from 'sequelize';
import { getMongoDb, isMongoPrimaryEnabled } from '../config/mongo.js';
import { v4 as uuidv4 } from 'uuid';

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

    const now = new Date();

    // Mongo-primary path
    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const journal = {
        _id: uuidv4(),
        userId: req.user.id,
        title: title || null,
        content,
        emotion: emotion || null,
        tags: tags || [],
        prompt: prompt || null,
        isPrivate: isPrivate !== undefined ? isPrivate : true,
        entryDate: now,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      await db.collection('journals').insertOne(journal);
      logger.info('Journal entry created (Mongo)', {
        userId: req.user.id,
        journalId: journal._id,
      });
      return res.status(201).json({
        message: 'Journal entry created successfully',
        journal,
      });
    }

    // Sequelize fallback
    const journal = await Journal.create({
      userId: req.user.id,
      title: title || null,
      content,
      emotion: emotion || null,
      tags: tags || [],
      prompt: prompt || null,
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      entryDate: now,
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

/**
 * POST /api/journals/seed-defaults
 * Seed default journal entries for the authenticated user (if they have none)
 */
export const seedDefaultJournals = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = req.user.id;

    // Check if user already has journals
    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const existing = await db.collection('journals').countDocuments({ userId });
      if (existing > 0) {
        return res.status(200).json({ message: 'Journals already exist', seeded: false });
      }
    } else {
      const existing = await Journal.count({ where: { userId } });
      if (existing > 0) {
        return res.status(200).json({ message: 'Journals already exist', seeded: false });
      }
    }

    const now = new Date();
    const defaultEntries = [
      {
        title: "My mind won't slow down",
        content: "Today felt exhausting, even though I didn't do much physically.\nMy thoughts just kept running non-stop — replaying conversations, worrying about things that haven't even happened.\n\nI wish I could just switch my brain off for a while.",
        emotion: 'anxious',
        tags: ['worried', 'school'],
      },
      {
        title: "I tried to study but couldn't focus",
        content: "I sat down with my books for hours, but nothing really went in.\nI kept getting distracted or just staring at the same page.\n\nIt makes me feel guilty, like I'm wasting time.",
        emotion: 'stressed',
        tags: ['homework', 'school'],
      },
      {
        title: 'Not sure about my friendships',
        content: "I don't know if I'm overthinking, but I feel like I'm not really important to my friends.\nSometimes I feel like I'm just there… not actually included.\n\nI wish I had someone I could talk to without feeling weird.",
        emotion: 'sad',
        tags: ['friends'],
      },
      {
        title: 'Alone even in a crowd',
        content: "I was around people all day, but still felt completely alone.\nIt's strange how you can be surrounded by others and still feel invisible.\n\nI don't know how to explain this feeling to anyone.",
        emotion: 'sad',
        tags: ['friends'],
      },
      {
        title: 'No energy today',
        content: "I didn't feel like doing anything today. Even small tasks felt too much.\nI just wanted to stay in bed and avoid everything.\n\nI hope tomorrow feels a little better.",
        emotion: 'anxious',
        tags: ['worried'],
      },
      {
        title: 'Something they said stayed with me',
        content: "Someone said something casually today, but it stuck with me more than it should have.\nI keep replaying it in my head and wondering if they meant it.\n\nMaybe I'm just sensitive… but it still hurts.",
        emotion: 'sad',
        tags: ['friends'],
      },
      {
        title: 'Scrolling made me feel worse',
        content: "I spent a lot of time on social media today, and honestly, it just made me feel worse about myself.\nEveryone seems so perfect and happy.\n\nI know it's not real, but it still affects me.",
        emotion: 'anxious',
        tags: ['worried'],
      },
      {
        title: 'I kept everything inside again',
        content: "I wanted to talk about how I felt today, but I didn't.\nI just smiled and acted normal like always.\n\nI don't know why it's so hard to open up.",
        emotion: 'confused',
        tags: ['family'],
      },
      {
        title: 'Maybe I need help',
        content: "I've been feeling off for a while now, and I think I shouldn't ignore it anymore.\nMaybe talking to someone could actually help.\n\nIt's scary, but I think I should try.",
        emotion: 'neutral',
        tags: ['worried'],
      },
      {
        title: 'A small win today',
        content: "I actually completed something I had been avoiding for days.\nIt wasn't a big task, but it felt good to finally do it.\n\nMaybe progress doesn't have to be huge.",
        emotion: 'calm',
        tags: ['learning'],
      },
      {
        title: 'Trying to understand myself',
        content: "I've been thinking a lot about who I am and what I want.\nSometimes I feel like I don't even know myself properly.\n\nMaybe that's okay… maybe I'm still figuring things out.",
        emotion: 'calm',
        tags: ['learning'],
      },
      {
        title: 'Felt really anxious today',
        content: "My heart was racing for no clear reason today.\nEven small things felt overwhelming.\n\nI tried to calm down, but it took a while.",
        emotion: 'anxious',
        tags: ['worried'],
      },
    ];

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const docs = defaultEntries.map((entry, i) => ({
        _id: uuidv4(),
        userId,
        ...entry,
        prompt: null,
        isPrivate: true,
        attachments: [],
        entryDate: new Date(now.getTime() - i * 86400000), // stagger by 1 day each
        createdAt: new Date(now.getTime() - i * 86400000),
        updatedAt: now,
        deletedAt: null,
      }));
      await db.collection('journals').insertMany(docs);
      logger.info('Seeded default journals (Mongo)', { userId, count: docs.length });
      return res.status(201).json({ message: 'Default journals seeded', seeded: true, count: docs.length });
    }

    const rows = defaultEntries.map((entry, i) => {
      const staggerDate = new Date(now.getTime() - i * 86400000); // staggered by 1 day
      return {
        userId,
        ...entry,
        isPrivate: true,
        entryDate: staggerDate,
        createdAt: staggerDate,
        updatedAt: staggerDate,
      };
    });
    const created = await Journal.bulkCreate(rows);
    logger.info('Seeded default journals', { userId, count: created.length });

    return res.status(201).json({ message: 'Default journals seeded', seeded: true, count: created.length });
  } catch (error) {
    logger.error('Seed default journals error', { error: error.message });
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
  seedDefaultJournals,
};
