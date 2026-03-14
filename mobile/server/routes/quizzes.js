const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Get all quizzes
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM quizzes
       ORDER BY created_at DESC`
    );

    res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    if (error.code === '42P01') {
      res.json([]);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get a specific quiz with its questions
router.get('/:quizId', verifyToken, async (req, res) => {
  try {
    const { quizId } = req.params;

    const quizResult = await db.query(
      `SELECT * FROM quizzes WHERE id = $1`,
      [quizId]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questionsResult = await db.query(
      `SELECT * FROM quiz_questions WHERE quiz_id = $1
       ORDER BY id ASC`,
      [quizId]
    );

    const quiz = quizResult.rows[0];
    quiz.questions = questionsResult.rows.map((q) => ({
      ...q,
      // Parse options if they're stored as JSON string
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    }));

    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit quiz answers and calculate score
router.post('/:quizId/submit', verifyToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // answers is an object { question_id: answer }
    const userId = req.user.id;

    // Fetch all questions for this quiz
    const questionsResult = await db.query(
      `SELECT id, correct_answer FROM quiz_questions WHERE quiz_id = $1`,
      [quizId]
    );

    const questions = questionsResult.rows;
    let correctCount = 0;

    // Calculate score
    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correct_answer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);

    // Save progress
    const progressResult = await db.query(
      `INSERT INTO quiz_progress (user_id, quiz_id, score, completed_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING *`,
      [userId, quizId, score]
    );

    // Update leaderboard
    const leaderboardResult = await db.query(
      `SELECT * FROM leaderboards WHERE user_id = $1`,
      [userId]
    );

    if (leaderboardResult.rows.length > 0) {
      // Update existing score
      await db.query(
        `UPDATE leaderboards 
         SET score = score + $1, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [score, userId]
      );
    } else {
      // Create new leaderboard entry
      await db.query(
        `INSERT INTO leaderboards (user_id, score)
         VALUES ($1, $2)`,
        [userId, score]
      );
    }

    // Update ranks
    await db.query(
      `UPDATE leaderboards 
       SET rank = (SELECT COUNT(*) FROM leaderboards l2 WHERE l2.score > leaderboards.score) + 1
       WHERE score > 0`
    );

    res.status(201).json({
      progress: progressResult.rows[0],
      score,
      correctCount,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's quiz progress
router.get('/:quizId/progress', verifyToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `SELECT * FROM quiz_progress 
       WHERE user_id = $1 AND quiz_id = $2
       ORDER BY completed_at DESC
       LIMIT 1`,
      [userId, quizId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Error fetching quiz progress:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
