import express from 'express';
import * as storyController from '../controllers/stories.js';

const router = express.Router();

/**
 * Story Routes
 * Handles educational stories with hierarchy: Story > Unit > Lesson > Challenge
 */

/**
 * GET /api/stories
 * List all published stories (public, paginated)
 * Query: page, limit, category, difficulty
 */
router.get('/', storyController.listStories);

/**
 * GET /api/stories/by-category/:category
 * Get stories by category (public, paginated)
 * Query: page, limit
 */
router.get('/by-category/:category', storyController.getStoriesByCategory);

/**
 * GET /api/stories/:storyId
 * Get story with full hierarchy (public)
 * Includes: all units, lessons, challenges, and increments viewCount
 */
router.get('/:storyId', storyController.getStoryById);

/**
 * GET /api/stories/:storyId/units
 * Get all units in a story (public)
 */
router.get('/:storyId/units', storyController.getStoryUnits);

/**
 * GET /api/stories/:storyId/units/:unitId
 * Get specific unit with lessons (public)
 */
router.get('/:storyId/units/:unitId', storyController.getUnit);

/**
 * GET /api/stories/:storyId/units/:unitId/lessons/:lessonId
 * Get specific lesson with challenges (public)
 */
router.get('/:storyId/units/:unitId/lessons/:lessonId', storyController.getLesson);

/**
 * GET /api/stories/:storyId/units/:unitId/lessons/:lessonId/challenges/:challengeId
 * Get specific challenge (public)
 */
router.get('/:storyId/units/:unitId/lessons/:lessonId/challenges/:challengeId', storyController.getChallenge);

export default router;
