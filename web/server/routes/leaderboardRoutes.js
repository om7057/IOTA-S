import express from 'express';
import { Leaderboard, User } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get top users (leaderboard)
router.get('/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const leaderboard = await Leaderboard.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'userId', 'firstName', 'lastName', 'imageUrl']
        }
      ],
      order: [['rank', 'ASC']],
      limit: parseInt(limit)
    });
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// Get user's leaderboard position
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const position = await Leaderboard.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ['id', 'userId', 'firstName', 'lastName', 'imageUrl', 'currentStars']
        }
      ]
    });
    
    if (!position) {
      return res.status(404).json({ message: 'User not found on leaderboard' });
    }
    
    res.json(position);
  } catch (error) {
    console.error('Error fetching user leaderboard position:', error);
    res.status(500).json({ message: 'Error fetching leaderboard position' });
  }
});

// Update user's score (called after quiz completion)
router.put('/user/:userId/score', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { points } = req.body;
    
    if (points === undefined || points < 0) {
      return res.status(400).json({ message: 'Invalid points' });
    }
    
    let leaderboard = await Leaderboard.findOne({ where: { userId } });
    
    if (!leaderboard) {
      // Create new leaderboard entry if doesn't exist
      leaderboard = await Leaderboard.create({
        userId,
        score: points,
        rank: null,
        badges: []
      });
    } else {
      // Update existing score
      leaderboard.score += points;
      await leaderboard.save();
    }
    
    // Recalculate ranks
    await recalculateRanks();
    
    // Fetch updated entry
    leaderboard = await Leaderboard.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ['id', 'userId', 'firstName', 'lastName', 'imageUrl']
        }
      ]
    });
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error updating user score:', error);
    res.status(500).json({ message: 'Error updating score' });
  }
});

// Add badge to user
router.put('/user/:userId/badge', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { badge } = req.body;
    
    if (!badge) {
      return res.status(400).json({ message: 'Badge is required' });
    }
    
    let leaderboard = await Leaderboard.findOne({ where: { userId } });
    
    if (!leaderboard) {
      leaderboard = await Leaderboard.create({
        userId,
        score: 0,
        rank: null,
        badges: [badge]
      });
    } else {
      if (!leaderboard.badges) {
        leaderboard.badges = [];
      }
      if (!leaderboard.badges.includes(badge)) {
        leaderboard.badges.push(badge);
        await leaderboard.save();
      }
    }
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error adding badge:', error);
    res.status(500).json({ message: 'Error adding badge' });
  }
});

// Helper function to recalculate ranks
async function recalculateRanks() {
  try {
    const allLeaderboards = await Leaderboard.findAll({
      order: [['score', 'DESC']]
    });
    
    for (let i = 0; i < allLeaderboards.length; i++) {
      allLeaderboards[i].rank = i + 1;
      await allLeaderboards[i].save();
    }
  } catch (error) {
    console.error('Error recalculating ranks:', error);
  }
}

export default router;
