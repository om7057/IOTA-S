import express from 'express';
import * as adminController from '../controllers/admin.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to verify admin access (can be enhanced with role-based access control)
const verifyAdmin = (req, res, next) => {
  // TODO: Implement role check when User model has role field
  // For now, just verify token
  next();
};

// Story management
router.post('/stories', verifyToken, verifyAdmin, adminController.createStory);
router.put('/stories/:id', verifyToken, verifyAdmin, adminController.updateStory);
router.delete('/stories/:id', verifyToken, verifyAdmin, adminController.deleteStory);

// Unit management
router.post('/stories/:storyId/units', verifyToken, verifyAdmin, adminController.addUnitToStory);
router.put('/stories/:storyId/units/:unitId', verifyToken, verifyAdmin, adminController.updateUnit);
router.delete('/stories/:storyId/units/:unitId', verifyToken, verifyAdmin, adminController.deleteUnit);

// Lesson management
router.post('/stories/:storyId/units/:unitId/lessons', verifyToken, verifyAdmin, adminController.addLessonToUnit);
router.put('/stories/:storyId/units/:unitId/lessons/:lessonId', verifyToken, verifyAdmin, adminController.updateLesson);
router.delete('/stories/:storyId/units/:unitId/lessons/:lessonId', verifyToken, verifyAdmin, adminController.deleteLesson);

// Challenge management
router.post('/stories/:storyId/units/:unitId/lessons/:lessonId/challenges', verifyToken, verifyAdmin, adminController.addChallengeToLesson);
router.put('/stories/:storyId/units/:unitId/lessons/:lessonId/challenges/:challengeId', verifyToken, verifyAdmin, adminController.updateChallenge);
router.delete('/stories/:storyId/units/:unitId/lessons/:lessonId/challenges/:challengeId', verifyToken, verifyAdmin, adminController.deleteChallenge);

export default router;
