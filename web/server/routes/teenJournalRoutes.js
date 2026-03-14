import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { TeenJournal, User } from '../models/index.js';

const router = express.Router();

// Get all journal entries for logged-in user
router.get('/journal', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await TeenJournal.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      entries: rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single journal entry
router.get('/journal/:entryId', verifyToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;

    const entry = await TeenJournal.findByPk(entryId);
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (entry.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new journal entry
router.post('/journal', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, mood, emotion, tags } = req.body;

    // Simple mood analysis (can be enhanced with AI later)
    const sentimentScores = {
      happy: 1,
      sad: -1,
      angry: -0.8,
      anxious: -0.5,
      calm: 0.5,
      excited: 0.8,
      confused: 0,
      neutral: 0
    };

    const moodScore = sentimentScores[mood?.toLowerCase()] || 0;

    const entry = await TeenJournal.create({
      userId,
      title,
      content,
      mood,
      emotion,
      moodScore,
      tags: tags ? JSON.stringify(tags) : null,
      aiSuggestions: JSON.stringify([
        'Consider sharing this with a trusted friend',
        'Remember to take care of yourself',
        'Practicing gratitude can help improve mood'
      ])
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update journal entry (only owner can update)
router.put('/journal/:entryId', verifyToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;
    const { title, content, mood, emotion, tags } = req.body;

    const entry = await TeenJournal.findByPk(entryId);
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (entry.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const sentimentScores = {
      happy: 1,
      sad: -1,
      angry: -0.8,
      anxious: -0.5,
      calm: 0.5,
      excited: 0.8,
      confused: 0,
      neutral: 0
    };

    const moodScore = sentimentScores[mood?.toLowerCase()] || 0;

    await entry.update({
      title,
      content,
      mood,
      emotion,
      moodScore,
      tags: tags ? JSON.stringify(tags) : null
    });

    const updated = await TeenJournal.findByPk(entryId);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete journal entry
router.delete('/journal/:entryId', verifyToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;

    const entry = await TeenJournal.findByPk(entryId);
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (entry.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await entry.destroy();
    res.json({ message: 'Journal entry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get mood statistics for user
router.get('/journal/stats/mood', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const entries = await TeenJournal.findAll({
      where: {
        userId,
        createdAt: {
          [require('sequelize').Op.gte]: startDate
        }
      },
      attributes: ['mood', 'moodScore', 'createdAt']
    });

    const moodCounts = {};
    let totalMoodScore = 0;

    entries.forEach(entry => {
      const mood = entry.mood || 'unknown';
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      totalMoodScore += entry.moodScore || 0;
    });

    const averageMoodScore = entries.length > 0 ? totalMoodScore / entries.length : 0;

    res.json({
      period: `Last ${days} days`,
      totalEntries: entries.length,
      moodDistribution: moodCounts,
      averageMoodScore: parseFloat(averageMoodScore.toFixed(2)),
      entries
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get entries by mood/emotion
router.get('/journal/filter/:mood', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { mood } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await TeenJournal.findAndCountAll({
      where: {
        userId,
        mood: {
          [require('sequelize').Op.iLike]: `%${mood}%`
        }
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      mood: mood,
      entries: rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
