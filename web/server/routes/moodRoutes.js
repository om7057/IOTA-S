import express from 'express';
import { MoodLog } from '../models/MoodLog.js';

const router = express.Router();

// Get all mood logs for a user
router.get('/user/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    const moodLogs = await MoodLog.find({ clerkId }).sort({ date: -1 });
    res.json(moodLogs);
  } catch (error) {
    console.error('Error fetching mood logs:', error);
    res.status(500).json({ message: 'Error fetching mood logs' });
  }
});

// Get mood logs for specific date range
router.get('/user/:clerkId/range', async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { startDate, endDate } = req.query;
    
    const query = { clerkId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const moodLogs = await MoodLog.find(query).sort({ date: -1 });
    res.json(moodLogs);
  } catch (error) {
    console.error('Error fetching mood logs:', error);
    res.status(500).json({ message: 'Error fetching mood logs' });
  }
});

// Get today's mood log
router.get('/user/:clerkId/today', async (req, res) => {
  try {
    const { clerkId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const moodLog = await MoodLog.findOne({
      clerkId,
      date: { $gte: today }
    });
    
    res.json(moodLog || null);
  } catch (error) {
    console.error('Error fetching today mood log:', error);
    res.status(500).json({ message: 'Error fetching mood log' });
  }
});

// Create a new mood log
router.post('/', async (req, res) => {
  try {
    const { userId, clerkId, mood, moodIntensity, tags, notes } = req.body;
    
    if (!clerkId || !mood || !moodIntensity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const moodLog = new MoodLog({
      userId,
      clerkId,
      mood,
      moodIntensity,
      tags: tags || [],
      notes: notes || '',
      date: new Date()
    });
    
    await moodLog.save();
    res.status(201).json(moodLog);
  } catch (error) {
    console.error('Error creating mood log:', error);
    res.status(500).json({ message: 'Error creating mood log' });
  }
});

// Update a mood log
router.put('/:moodLogId', async (req, res) => {
  try {
    const { moodLogId } = req.params;
    const { mood, moodIntensity, tags, notes } = req.body;
    
    const moodLog = await MoodLog.findByIdAndUpdate(
      moodLogId,
      { mood, moodIntensity, tags, notes, updatedAt: Date.now() },
      { new: true }
    );
    
    res.json(moodLog);
  } catch (error) {
    console.error('Error updating mood log:', error);
    res.status(500).json({ message: 'Error updating mood log' });
  }
});

// Delete a mood log
router.delete('/:moodLogId', async (req, res) => {
  try {
    const { moodLogId } = req.params;
    await MoodLog.findByIdAndDelete(moodLogId);
    res.json({ message: 'Mood log deleted' });
  } catch (error) {
    console.error('Error deleting mood log:', error);
    res.status(500).json({ message: 'Error deleting mood log' });
  }
});

// Get mood statistics for a user (for mood trends)
router.get('/user/:clerkId/stats', async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const moodLogs = await MoodLog.find({
      clerkId,
      date: { $gte: startDate }
    });
    
    // Calculate mood distribution
    const moodStats = {};
    moodLogs.forEach(log => {
      moodStats[log.mood] = (moodStats[log.mood] || 0) + 1;
    });
    
    // Calculate average intensity
    const avgIntensity = moodLogs.length > 0 
      ? moodLogs.reduce((sum, log) => sum + log.moodIntensity, 0) / moodLogs.length
      : 0;
    
    res.json({
      totalEntries: moodLogs.length,
      moodDistribution: moodStats,
      averageIntensity: avgIntensity.toFixed(2),
      days
    });
  } catch (error) {
    console.error('Error fetching mood stats:', error);
    res.status(500).json({ message: 'Error fetching mood stats' });
  }
});

export default router;
