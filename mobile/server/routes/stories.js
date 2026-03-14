const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Get all stories
router.get('/', verifyToken, async (req, res) => {
  try {
    const topicId = req.query.topic_id;
    let query = `SELECT s.*, u.display_name as created_by
                 FROM stories s
                 LEFT JOIN users u ON s.user_id = u.id`;
    let params = [];

    if (topicId) {
      query += ` WHERE s.topic_id = $1`;
      params.push(topicId);
    }

    query += ` ORDER BY s.created_at DESC`;

    const result = await db.query(query, params);
    res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching stories:', error);
    if (error.code === '42P01') {
      res.json([]);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get a specific story
router.get('/:storyId', verifyToken, async (req, res) => {
  try {
    const { storyId } = req.params;

    const storyResult = await db.query(
      `SELECT s.*, u.display_name as created_by, t.name as topic_name
       FROM stories s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN topics t ON s.topic_id = t.id
       WHERE s.id = $1`,
      [storyId]
    );

    if (storyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Story not found' });
    }

    let story = storyResult.rows[0];

    // Parse content as scenes if it's a JSON array, otherwise break into paragraphs
    if (story.content) {
      try {
        // Try to parse as JSON array of scenes
        const parsed = JSON.parse(story.content);
        if (Array.isArray(parsed)) {
          story.content = parsed;
        } else {
          // If it's a string, split by double newlines into scenes
          story.content = story.content
            .split('\n\n')
            .filter((s) => s.trim().length > 0)
            .map((content, index) => ({
              title: `Scene ${index + 1}`,
              content: content.trim(),
            }));
        }
      } catch (e) {
        // If not JSON, split by double newlines into scenes
        story.content = story.content
          .split('\n\n')
          .filter((s) => s.trim().length > 0)
          .map((content, index) => ({
            title: `Scene ${index + 1}`,
            content: content.trim(),
          }));
      }
    }

    // Fetch related story levels if they exist
    try {
      const levelsResult = await db.query(
        `SELECT * FROM story_levels WHERE story_id = $1 ORDER BY level ASC`,
        [storyId]
      );
      story.levels = levelsResult.rows;
    } catch (err) {
      // Levels table might not exist
      story.levels = [];
    }

    res.json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get stories by topic
router.get('/topic/:topicId', verifyToken, async (req, res) => {
  try {
    const { topicId } = req.params;

    const result = await db.query(
      `SELECT s.*, u.display_name as created_by
       FROM stories s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.topic_id = $1
       ORDER BY s.created_at DESC`,
      [topicId]
    );

    res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching stories by topic:', error);
    if (error.code === '42P01') {
      res.json([]);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Create a story (admin only typically, but allowing for now)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, content, topic_id } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await db.query(
      `INSERT INTO stories (user_id, title, description, content, topic_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, title, description || '', content || '', topic_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
