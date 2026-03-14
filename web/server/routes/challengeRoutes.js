import express from 'express';
import { Challenge, ChallengeOption, ChallengeProgress } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all challenges for a lesson
router.get('/lesson/:lessonId', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const challenges = await Challenge.findAll({
      where: { lessonId },
      order: [['order', 'ASC']],
      include: [{
        model: ChallengeOption,
        order: [['order', 'ASC']]
      }]
    });
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: 'Error fetching challenges' });
  }
});

// Get a specific challenge with options
router.get('/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const challenge = await Challenge.findByPk(challengeId, {
      include: [{
        model: ChallengeOption,
        order: [['order', 'ASC']]
      }]
    });
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    res.json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ message: 'Error fetching challenge' });
  }
});

// Create a challenge (admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { lessonId, question, type, order } = req.body;
    
    const challenge = await Challenge.create({
      lessonId,
      question,
      type: type || 'SELECT',
      order: order || 0
    });
    
    res.status(201).json(challenge);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ message: 'Error creating challenge' });
  }
});

// Update a challenge (admin only)
router.patch('/:challengeId', verifyToken, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { question, type, order } = req.body;
    
    const challenge = await Challenge.findByPk(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    await challenge.update({ question, type, order });
    res.json(challenge);
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({ message: 'Error updating challenge' });
  }
});

// Submit a challenge answer
router.post('/:challengeId/submit', verifyToken, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId, selectedOptionId } = req.body;
    
    const challenge = await Challenge.findByPk(challengeId, {
      include: [{
        model: ChallengeOption
      }]
    });
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    const selectedOption = challenge.ChallengeOptions.find(opt => opt.id === selectedOptionId);
    if (!selectedOption) {
      return res.status(400).json({ message: 'Invalid option selected' });
    }
    
    const isCorrect = selectedOption.correct;
    
    // Create or update progress
    let progress = await ChallengeProgress.findOne({
      where: { userId, challengeId }
    });
    
    if (progress) {
      await progress.update({
        selectedOptionId,
        isCorrect,
        completed: isCorrect,
        attempts: progress.attempts + 1
      });
    } else {
      progress = await ChallengeProgress.create({
        userId,
        challengeId,
        selectedOptionId,
        isCorrect,
        completed: isCorrect,
        attempts: 1
      });
    }
    
    res.json({
      progress,
      isCorrect,
      correct: isCorrect,
      message: isCorrect ? 'Correct! Great job!' : 'Not quite right. Try again!'
    });
  } catch (error) {
    console.error('Error submitting challenge:', error);
    res.status(500).json({ message: 'Error submitting challenge' });
  }
});

// Get challenge progress for a user
router.get('/user/:userId/progress', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await ChallengeProgress.findAll({
      where: { userId }
    });
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching challenge progress:', error);
    res.status(500).json({ message: 'Error fetching progress' });
  }
});

export default router;
