import express from 'express';
import * as topicsController from '../controllers/topics.js';
import { verifyToken } from '../middleware/auth.js';

/**
 * Topics Routes
 * GET  /api/topics                    - Get all topics
 * GET  /api/topics/:topicId           - Get topic by ID with stories
 * GET  /api/topics/:topicId/stories   - Get stories in topic
 * GET  /api/topics/category/:category - Get topics by category
 * POST /api/topics                    - Create topic (admin)
 * PUT  /api/topics/:topicId           - Update topic (admin)
 * DELETE /api/topics/:topicId         - Delete topic (admin)
 */

const router = express.Router();

// Public routes
router.get('/', topicsController.getAllTopics);
router.get('/category/:category', topicsController.getTopicsByCategory);
router.get('/:topicId', topicsController.getTopicById);
router.get('/:topicId/stories', topicsController.getStoriesByTopic);

// Admin routes (protected with token verification)
router.post('/', verifyToken, topicsController.createTopic);
router.put('/:topicId', verifyToken, topicsController.updateTopic);
router.delete('/:topicId', verifyToken, topicsController.deleteTopic);

export default router;
