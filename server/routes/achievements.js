import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import achievementsController from '../controllers/achievements.js';

const router = express.Router();

/**
 * Public routes
 */
// Get all available badges
router.get('/badges', achievementsController.getAllBadges);

// Get badge leaderboard
router.get('/leaderboard', achievementsController.getBadgeLeaderboard);

/**
 * Protected routes
 */
// Get user's achievements
router.get('/user/:userId', verifyToken, achievementsController.getUserAchievements);

// Get achievement progress for user
router.get('/progress/:userId', verifyToken, achievementsController.getAchievementProgress);

// Award badge to user (admin/system)
router.post('/award', verifyToken, achievementsController.awardBadge);

// Update achievement progress
router.put('/progress', verifyToken, achievementsController.updateAchievementProgress);

export default router;
