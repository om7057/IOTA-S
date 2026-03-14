const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const result = await db.query(
      'INSERT INTO journal_entries (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating journal input:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    // If table doesn't exist, return empty array
    if (error.code === '42P01') {
      res.json([]);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

router.get('/:entryId', verifyToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2',
      [entryId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching journal input:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:entryId', verifyToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    const checkResult = await db.query(
      'SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2',
      [entryId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found or unauthorized' });
    }

    const result = await db.query(
      'UPDATE journal_entries SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [title, content, entryId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating journal input:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:entryId', verifyToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;

    const checkResult = await db.query(
      'SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2',
      [entryId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found or unauthorized' });
    }

    await db.query(
      'DELETE FROM journal_entries WHERE id = $1 AND user_id = $2',
      [entryId, userId]
    );

    res.json({ success: true, message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal input:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;