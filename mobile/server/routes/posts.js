const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Check like status
router.get('/:postId/like', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM likes WHERE story_id = $1 AND user_id = $2',
      [postId, userId]
    );

    res.json({ liked: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle like
router.post('/:postId/like', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if already liked
    const existingLike = await db.query(
      'SELECT * FROM likes WHERE story_id = $1 AND user_id = $2',
      [postId, userId]
    );

    let liked = false;
    if (existingLike.rows.length > 0) {
      // Unlike
      await db.query(
        'DELETE FROM likes WHERE story_id = $1 AND user_id = $2',
        [postId, userId]
      );
    } else {
      // Like
      await db.query(
        'INSERT INTO likes (user_id, story_id) VALUES ($1, $2)',
        [userId, postId]
      );
      liked = true;
    }

    // Get updated like count
    const likesResult = await db.query(
      'SELECT COUNT(*) as likes_count FROM likes WHERE story_id = $1',
      [postId]
    );

    res.json({ 
      liked, 
      likes_count: parseInt(likesResult.rows[0].likes_count) 
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get comments for a post
router.get('/:postId/comments', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await db.query(
      `SELECT c.id as comment_id, c.content, c.created_at,
              u.id as user_id, u.display_name, u.email
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.story_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    if (error.code === '42P01') {
      res.json([]);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Add comment to a post
router.post('/:postId/comments', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const commentResult = await db.query(
      'INSERT INTO comments (user_id, story_id, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, postId, content]
    );

    const userResult = await db.query(
      'SELECT id, display_name, email FROM users WHERE id = $1',
      [userId]
    );

    const comment = commentResult.rows[0];
    const commentWithDetails = {
      comment_id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      users: {
        id: userResult.rows[0]?.id,
        display_name: userResult.rows[0]?.display_name,
        email: userResult.rows[0]?.email
      }
    };

    res.status(201).json(commentWithDetails);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
