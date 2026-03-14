import express from 'express';
import { Quiz, Story } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({
      include: [
        {
          model: Story,
          attributes: ['id', 'title', 'description']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Error fetching quizzes' });
  }
});

// Get a single quiz
router.get('/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Story,
          attributes: ['id', 'title', 'description']
        }
      ]
    });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Error fetching quiz' });
  }
});

// Get quizzes by story
router.get('/story/:storyId', async (req, res) => {
  try {
    const { storyId } = req.params;
    const quizzes = await Quiz.findAll({
      where: { storyId },
      order: [['createdAt', 'ASC']]
    });
    
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes by story:', error);
    res.status(500).json({ message: 'Error fetching quizzes' });
  }
});

// Create a new quiz question
router.post('/', verifyToken, async (req, res) => {
  try {
    const { storyId, question, options, correctAnswer, points } = req.body;
    
    if (!storyId || !question || !options || correctAnswer === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'Options must be an array with at least 2 items' });
    }
    
    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({ message: 'Invalid correct answer index' });
    }
    
    const quiz = await Quiz.create({
      storyId,
      question,
      options,
      correctAnswer,
      points: points || 10
    });
    
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Error creating quiz' });
  }
});

// Update a quiz question
router.put('/:quizId', verifyToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { question, options, correctAnswer, points } = req.body;
    
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    await quiz.update({
      question: question || quiz.question,
      options: options || quiz.options,
      correctAnswer: correctAnswer !== undefined ? correctAnswer : quiz.correctAnswer,
      points: points || quiz.points
    });
    
    res.json(quiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ message: 'Error updating quiz' });
  }
});

// Delete a quiz question
router.delete('/:quizId', verifyToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findByPk(quizId);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    await quiz.destroy();
    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Error deleting quiz' });
  }
});

export default router;
