const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user.id;

    const result = await db.query(
      'INSERT INTO queries (user_id, question, answer) VALUES ($1, $2, NULL) RETURNING *',
      [userId, question]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating query:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      `SELECT q.*, u.display_name, u.email 
       FROM queries q 
       JOIN users u ON q.user_id = u.id 
       WHERE q.user_id = $1 
       ORDER BY q.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;

    const result = await db.query(
      `SELECT q.*, u.display_name, u.email 
       FROM queries q 
       JOIN users u ON q.user_id = u.id 
       WHERE q.question_id = $1`,
      [questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Query not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching query:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:questionId', verifyToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;
    const userId = req.user.id;

    const checkResult = await db.query(
      'SELECT * FROM queries WHERE question_id = $1 AND user_id = $2',
      [questionId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Query not found or unauthorized' });
    }

    const result = await db.query(
      'UPDATE queries SET answer = $1, updated_at = CURRENT_TIMESTAMP WHERE question_id = $2 RETURNING *',
      [answer, questionId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating query:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;