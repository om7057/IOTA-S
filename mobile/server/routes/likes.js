const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

router.post('/posts/:postId/like', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const existingLike = await db.query(
      'SELECT * FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    let result;
    
    if (existingLike.rows.length > 0) {
      await db.query(
        'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );
      result = { liked: false };
    } else {
      await db.query(
        'INSERT INTO likes (post_id, user_id) VALUES ($1, $2)',
        [postId, userId]
      );
      result = { liked: true };
    }

    const countResult = await db.query(
      'SELECT COUNT(*) FROM likes WHERE post_id = $1',
      [postId]
    );

    res.json({
      ...result,
      likes_count: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/posts/:postId/like', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const likeResult = await db.query(
      'SELECT * FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) FROM likes WHERE post_id = $1',
      [postId]
    );

    res.json({
      liked: likeResult.rows.length > 0,
      likes_count: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;