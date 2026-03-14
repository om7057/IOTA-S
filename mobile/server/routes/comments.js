const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await db.query(
      `SELECT c.*, u.id as user_id, u.display_name, u.email
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/posts/:postId/comments', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const commentResult = await db.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [postId, userId, content]
    );

    const userResult = await db.query(
      'SELECT id, display_name, email FROM users WHERE id = $1',
      [userId]
    );

    const comment = commentResult.rows[0];
    const commentWithUser = {
      ...comment,
      user_id: userResult.rows[0]?.id,
      display_name: userResult.rows[0]?.display_name,
      email: userResult.rows[0]?.email
    };

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;