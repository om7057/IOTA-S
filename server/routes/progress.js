import express from 'express';
import * as progressController from '../controllers/progress.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.get('/', verifyToken, progressController.getUserStoryProgress);
router.get('/stats', verifyToken, progressController.getProgressStats);
router.get('/:type/:id', verifyToken, progressController.getProgressByItem);

router.post('/:storyId/update', verifyToken, progressController.updateStoryProgress);
router.post('/:storyId/units/:unitId/complete', verifyToken, progressController.completeUnit);
router.post('/:storyId/lessons/:lessonId/complete', verifyToken, progressController.completeLesson);

export default router;
