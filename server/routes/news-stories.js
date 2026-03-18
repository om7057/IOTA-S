import express from 'express';
import * as newsStoriesController from '../controllers/news-stories.js';
import { verifyToken } from '../middleware/auth.js';

/**
 * News Stories Routes
 * GET  /api/news-stories              - Get all news stories
 * GET  /api/news-stories/:newsStoryId - Get news story by ID
 * GET  /api/news-stories/topic/:topicId - Get news stories by topic
 * POST /api/news-stories              - Create news story (from news fetcher)
 * PUT  /api/news-stories/:newsStoryId - Update news story
 * DELETE /api/news-stories/:newsStoryId - Delete news story
 */

const router = express.Router();

// Public routes
router.get('/', newsStoriesController.getAllNewsStories);
router.get('/topic/:topicId', newsStoriesController.getNewsStoriesByTopic);
router.get('/:newsStoryId', newsStoriesController.getNewsStoryById);

// Protected routes
router.post('/', newsStoriesController.createNewsStory);
router.put('/:newsStoryId', verifyToken, newsStoriesController.updateNewsStory);
router.delete('/:newsStoryId', verifyToken, newsStoriesController.deleteNewsStory);

export default router;
