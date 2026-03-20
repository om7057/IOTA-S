import express from 'express';
import * as storyAttemptsController from '../controllers/story-attempts.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// ==================== Child Routes ====================
// Create a new story attempt (when child answers a quiz question)
router.post('/', verifyToken, storyAttemptsController.createStoryAttempt);

// Get user's own story attempts
router.get('/', verifyToken, storyAttemptsController.getUserStoryAttempts);

// Get a specific story attempt
router.get('/:attemptId', verifyToken, storyAttemptsController.getStoryAttempt);

// Update a story attempt (add notes or AI recommendation)
router.put('/:attemptId', verifyToken, storyAttemptsController.updateStoryAttempt);

// ==================== Parent Dashboard Routes ====================
// Get all attempts for a specific child (parent viewing child's progress)
router.get('/child/:childUserId/attempts', verifyToken, storyAttemptsController.getChildStoryAttempts);

// Get weakness topics for a child (parent dashboard - learning gaps)
router.get('/child/:childUserId/weaknesses', verifyToken, storyAttemptsController.getChildWeaknesses);

// Get learning analytics for a child (parent dashboard - comprehensive stats)
router.get('/child/:childUserId/analytics', verifyToken, storyAttemptsController.getChildLearningAnalytics);

export default router;
