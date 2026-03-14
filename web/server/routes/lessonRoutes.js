import express from 'express';
import { Lesson, Challenge, ChallengeOption, ChallengeProgress } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all lessons for a unit
router.get('/unit/:unitId', async (req, res) => {
  try {
    const { unitId } = req.params;
    const lessons = await Lesson.findAll({
      where: { unitId },
      order: [['order', 'ASC']]
    });
    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ message: 'Error fetching lessons' });
  }
});

// Get a specific lesson with its challenges and user progress
router.get('/:lessonId', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.query.userId;
    
    const lesson = await Lesson.findByPk(lessonId, {
      include: [{
        model: Challenge,
        order: [['order', 'ASC']],
        include: [{
          model: ChallengeOption,
          order: [['order', 'ASC']]
        }]
      }]
    });
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // If userId provided, include progress
    if (userId) {
      const challenges = lesson.Challenges.map(challenge => {
        challenge.dataValues.userProgress = challenge.ChallengeProgresses?.find(p => p.userId === userId);
        return challenge;
      });
      lesson.dataValues.Challenges = challenges;
    }
    
    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ message: 'Error fetching lesson' });
  }
});

// Create a lesson (admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, unitId, order } = req.body;
    
    const lesson = await Lesson.create({
      title,
      description,
      unitId,
      order: order || 0
    });
    
    res.status(201).json(lesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ message: 'Error creating lesson' });
  }
});

// Update a lesson (admin only)
router.patch('/:lessonId', verifyToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, description, order } = req.body;
    
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    await lesson.update({ title, description, order });
    res.json(lesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ message: 'Error updating lesson' });
  }
});

export default router;
