const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id as topic_id, name as topic_name, description, created_at FROM topics ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching topics:', error);
    // If table doesn't exist, return empty array
    if (error.code === '42P01') {
      res.json([]);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

router.get('/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const result = await db.query('SELECT * FROM topics WHERE topic_id = $1', [topicId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:topicId/posts', async (req, res) => {
  try {
    const { topicId } = req.params;

    const result = await db.query(
      `SELECT s.id as post_id, s.content, s.created_at, 
              u.id as user_id, u.display_name, u.email,
              t.id as topic_id, t.name as topic_name,
              COUNT(l.id) as likes_count
       FROM stories s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN topics t ON s.topic_id = t.id
       LEFT JOIN likes l ON s.id = l.story_id
       WHERE s.topic_id = $1
       GROUP BY s.id, u.id, t.id
       ORDER BY s.created_at DESC`,
      [topicId]
    );

    // Transform flat data into nested structure
    const formattedPosts = result.rows.map(row => ({
      post_id: row.post_id,
      content: row.content,
      created_at: row.created_at,
      likes_count: row.likes_count,
      users: {
        id: row.user_id,
        display_name: row.display_name || 'Anonymous',
        email: row.email
      },
      topics: {
        topic_id: row.topic_id,
        topic_name: row.topic_name
      }
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    if (error.code === '42P01') {
      res.json([]);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get stories for a topic (for children mode)
router.get('/:topicId/stories', async (req, res) => {
  try {
    const { topicId } = req.params;

    const result = await db.query(
      `SELECT s.id, s.title, s.description, s.content, s.created_at,
              t.id as topic_id, t.name as topic_name
       FROM stories s
       LEFT JOIN topics t ON s.topic_id = t.id
       WHERE s.topic_id = $1
       ORDER BY s.created_at DESC`,
      [topicId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stories:', error);
    if (error.code === '42P01') {
      res.json([]);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

router.post('/:topicId/posts', verifyToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const storyResult = await db.query(
      'INSERT INTO stories (user_id, topic_id, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, topicId, content]
    );

    const userResult = await db.query(
      'SELECT id, display_name, email FROM users WHERE id = $1',
      [userId]
    );

    const topicResult = await db.query(
      'SELECT id, name FROM topics WHERE id = $1',
      [topicId]
    );

    const story = storyResult.rows[0];
    const postWithDetails = {
      post_id: story.id,
      content: story.content,
      created_at: story.created_at,
      users: {
        id: userResult.rows[0]?.id,
        display_name: userResult.rows[0]?.display_name,
        email: userResult.rows[0]?.email
      },
      topics: {
        topic_id: topicResult.rows[0]?.id,
        topic_name: topicResult.rows[0]?.name
      },
      likes_count: 0
    };

    res.status(201).json(postWithDetails);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;