import express from 'express';
import * as leaderboardController from '../controllers/leaderboard.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', leaderboardController.getLeaderboard);

// User routes
router.get('/user/rank', verifyToken, leaderboardController.getUserRank);

// Admin routes (update leaderboard)
router.post('/admin/update', verifyToken, leaderboardController.updateLeaderboard);

export default router;
