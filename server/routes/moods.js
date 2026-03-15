import express from 'express';
import * as moodController from '../controllers/moods.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Mood Routes
 * Handles mood tracking and emotional analytics
 */

/**
 * POST /api/moods
 * Create a new mood log (protected)
 * Body: { emotion, intensity, context?, tags?, physicalState? }
 */
router.post('/', verifyToken, moodController.createMood);

/**
 * GET /api/moods
 * Get user's mood logs (protected, paginated)
 * Query: page, limit, emotion, startDate, endDate
 */
router.get('/', verifyToken, moodController.getMoods);

/**
 * GET /api/moods/analytics/summary
 * Get mood analytics for period (protected)
 * Query: days (default 7)
 */
router.get('/analytics/summary', verifyToken, moodController.getMoodAnalytics);

/**
 * GET /api/moods/:moodId
 * Get specific mood by ID (protected)
 */
router.get('/:moodId', verifyToken, moodController.getMoodById);

/**
 * PATCH /api/moods/:moodId
 * Update mood entry (protected)
 */
router.patch('/:moodId', verifyToken, moodController.updateMood);

/**
 * DELETE /api/moods/:moodId
 * Delete mood entry (protected)
 */
router.delete('/:moodId', verifyToken, moodController.deleteMood);

export default router;
