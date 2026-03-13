import express from 'express';
import {
  submitScore,
  getLeaderboardByStory,
  getFilteredLeaderboard,
  getOverallLeaderboard
} from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/', getOverallLeaderboard);
router.get('/story/:storyId', async (req, res, next) => {
  console.log("Story ID Param:", req.params.storyId); 
  next();
}, getLeaderboardByStory);

router.get('/leaderboardfiltered', getFilteredLeaderboard);
router.post('/', submitScore);

export default router;
