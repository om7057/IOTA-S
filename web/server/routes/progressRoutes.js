import express from 'express';
import { QuizProgress, Quiz } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all quiz progress for a user
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await QuizProgress.findAll({
      where: { userId },
      include: [
        {
          model: Quiz,
          attributes: ['id', 'storyId', 'question', 'points']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching quiz progress:', error);
    res.status(500).json({ message: 'Error fetching quiz progress' });
  }
});

// Get progress for a specific quiz
router.get('/user/:userId/quiz/:quizId', verifyToken, async (req, res) => {
  try {
    const { userId, quizId } = req.params;
    const progress = await QuizProgress.findOne({
      where: { userId, quizId },
      include: [
        {
          model: Quiz,
          attributes: ['id', 'storyId', 'question', 'options', 'correctAnswer', 'points']
        }
      ]
    });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching quiz progress:', error);
    res.status(500).json({ message: 'Error fetching quiz progress' });
  }
});

// Submit a quiz answer
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { quizId, questionId, selectedAnswer } = req.body;
    const userId = req.user.id;
    
    if (quizId === undefined || selectedAnswer === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get the quiz to check correct answer
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if answer is correct
    const isCorrect = selectedAnswer === quiz.correctAnswer;
    const points = isCorrect ? quiz.points : 0;
    
    // Create or update progress record
    let progress = await QuizProgress.findOne({
      where: { userId, quizId }
    });
    
    if (progress) {
      // Update existing record
      await progress.update({
        questionId: questionId || null,
        answered: true,
        selectedAnswer,
        isCorrect,
        points
      });
    } else {
      // Create new record
      progress = await QuizProgress.create({
        userId,
        quizId,
        questionId: questionId || null,
        answered: true,
        selectedAnswer,
        isCorrect,
        points
      });
    }
    
    res.status(201).json({
      progress,
      isCorrect,
      correctAnswer: quiz.correctAnswer,
      earnedPoints: points
    });
  } catch (error) {
    console.error('Error submitting quiz answer:', error);
    res.status(500).json({ message: 'Error submitting answer' });
  }
});

// Get quiz statistics for a user
router.get('/user/:userId/stats', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await QuizProgress.findAll({
      where: { userId }
    });
    
    const totalAnswered = progress.length;
    const totalCorrect = progress.filter(p => p.isCorrect).length;
    const totalPoints = progress.reduce((sum, p) => sum + p.points, 0);
    
    res.json({
      totalAnswered,
      totalCorrect,
      accuracy: totalAnswered > 0 ? ((totalCorrect / totalAnswered) * 100).toFixed(2) : 0,
      totalPoints
    });
  } catch (error) {
    console.error('Error fetching quiz statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Delete quiz progress (for reset)
router.delete('/user/:userId/quiz/:quizId', verifyToken, async (req, res) => {
  try {
    const { userId, quizId } = req.params;
    
    const progress = await QuizProgress.findOne({
      where: { userId, quizId }
    });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    await progress.destroy();
    res.json({ message: 'Progress deleted' });
  } catch (error) {
    console.error('Error deleting quiz progress:', error);
    res.status(500).json({ message: 'Error deleting progress' });
  }
});

export default router;
