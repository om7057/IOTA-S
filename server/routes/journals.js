import express from 'express';
import * as journalController from '../controllers/journals.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Journal Routes
 * Handles journal entries with search and emotional tracking
 */

/**
 * POST /api/journals
 * Create a new journal entry (protected)
 * Body: { title?, content, emotion?, tags?, prompt?, isPrivate? }
 */
router.post('/', verifyToken, journalController.createJournal);

/**
 * GET /api/journals
 * Get user's journal entries (protected, paginated)
 * Query: page, limit, emotion, startDate, endDate, isPrivate
 */
router.get('/', verifyToken, journalController.getJournals);

/**
 * POST /api/journals/seed-defaults
 * Seed default journal entries for the authenticated user (if none exist)
 */
router.post('/seed-defaults', verifyToken, journalController.seedDefaultJournals);

/**
 * GET /api/journals/search
 * Search journal entries by keyword (protected)
 * Query: q (search query), page, limit
 */
router.get('/search', verifyToken, journalController.searchJournals);

/**
 * GET /api/journals/:journalId
 * Get specific journal entry (protected)
 */
router.get('/:journalId', verifyToken, journalController.getJournalById);

/**
 * PATCH /api/journals/:journalId
 * Update journal entry (protected)
 */
router.patch('/:journalId', verifyToken, journalController.updateJournal);

/**
 * DELETE /api/journals/:journalId
 * Delete journal entry (protected)
 */
router.delete('/:journalId', verifyToken, journalController.deleteJournal);

export default router;
