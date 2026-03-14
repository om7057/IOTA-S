const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Get all leaderboard entries (top scores)
router.get('/', verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '100');

    const result = await db.query(
      `SELECT l.*, u.display_name
       FROM leaderboards l
       JOIN users u ON l.user_id = u.id
       ORDER BY l.rank ASC, l.score DESC
       LIMIT $1`,
      [limit]
    );

    res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    if (error.code === '42P01') {
      // Tables don't exist yet, return empty
      res.json([]);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get user-specific leaderboard rank
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      `SELECT l.*, u.display_name
       FROM leaderboards l
       JOIN users u ON l.user_id = u.id
       WHERE l.user_id = $1`,
      [userId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      // User not on leaderboard yet
      const userResult = await db.query(
        'SELECT id, display_name FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        // Create leaderboard entry
        const insertResult = await db.query(
          `INSERT INTO leaderboards (user_id, score)
           VALUES ($1, 0)
           ON CONFLICT (user_id) DO UPDATE SET score = leaderboards.score
           RETURNING *`,
          [userId]
        );
        res.json({
          ...insertResult.rows[0],
          display_name: user.display_name,
        });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  } catch (error) {
    console.error('Error fetching user leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user's leaderboard score
router.put('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { scoreIncrease } = req.body;

    if (!scoreIncrease) {
      return res.status(400).json({ error: 'scoreIncrease is required' });
    }

    const result = await db.query(
      `UPDATE leaderboards 
       SET score = score + $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [scoreIncrease, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leaderboard entry not found' });
    }

    // Re-calculate ranks
    await db.query(
      `UPDATE leaderboards 
       SET rank = (SELECT COUNT(*) FROM leaderboards l2 WHERE l2.score > leaderboards.score) + 1
       WHERE score > 0`
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard statistics
router.get('/stats/global', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        COUNT(DISTINCT user_id) as total_players,
        MAX(score) as highest_score,
        AVG(score) as average_score,
        SUM(score) as total_score
       FROM leaderboards`
    );

    res.json(result.rows[0] || {});
  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
