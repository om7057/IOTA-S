import express from 'express';
import { MoodLog } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all mood logs for a user
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const moodLogs = await MoodLog.findAll({
      where: { userId },
      order: [['date', 'DESC']]
    });
    res.json(moodLogs);
  } catch (error) {
    console.error('Error fetching mood logs:', error);
    res.status(500).json({ message: 'Error fetching mood logs' });
  }
});

// Get mood logs for specific date range
router.get('/user/:userId/range', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    const whereClause = { userId };
    if (startDate && endDate) {
      whereClause.date = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }
    
    const moodLogs = await MoodLog.findAll({
      where: whereClause,
      order: [['date', 'DESC']]
    });
    res.json(moodLogs);
  } catch (error) {
    console.error('Error fetching mood logs:', error);
    res.status(500).json({ message: 'Error fetching mood logs' });
  }
});

// Get today's mood log
router.get('/user/:userId/today', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
   const moodLog = await MoodLog.findOne({
      where: {
        userId,
        date: { [Op.gte]: today }
      }
    });
    
    res.json(moodLog || null);
  } catch (error) {
    console.error('Error fetching today mood log:', error);
    res.status(500).json({ message: 'Error fetching mood log' });
  }
});

// Create a new mood log
router.post('/', verifyToken, async (req, res) => {
  try {
    const { mood, moodIntensity, tags, notes } = req.body;
    const userId = req.user.id;
    
    if (!mood || !moodIntensity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const moodLog = await MoodLog.create({
      userId,
      mood,
      moodIntensity,
      tags: tags || [],
      notes: notes || '',
      date: new Date()
    });
    
    res.status(201).json(moodLog);
  } catch (error) {
    console.error('Error creating mood log:', error);
    res.status(500).json({ message: 'Error creating mood log' });
  }
});

// Update a mood log
router.put('/:moodLogId', verifyToken, async (req, res) => {
  try {
    const { moodLogId } = req.params;
    const { mood, moodIntensity, tags, notes } = req.body;
    
    const moodLog = await MoodLog.findByPk(moodLogId);
    if (!moodLog) {
      return res.status(404).json({ message: 'Mood log not found' });
    }
    
    await moodLog.update({ mood, moodIntensity, tags, notes });
    res.json(moodLog);
  } catch (error) {
    console.error('Error updating mood log:', error);
    res.status(500).json({ message: 'Error updating mood log' });
  }
});

// Delete a mood log
router.delete('/:moodLogId', verifyToken, async (req, res) => {
  try {
    const { moodLogId } = req.params;
    const moodLog = await MoodLog.findByPk(moodLogId);
    
    if (!moodLog) {
      return res.status(404).json({ message: 'Mood log not found' });
    }
    
    await moodLog.destroy();
    res.json({ message: 'Mood log deleted' });
  } catch (error) {
    console.error('Error deleting mood log:', error);
    res.status(500).json({ message: 'Error deleting mood log' });
  }
});

export default router;
