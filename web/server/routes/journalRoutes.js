import express from 'express';
import { Journal } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all journal entries for a user
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const journalEntries = await Journal.findAll({
      where: { userId },
      // Hide anonymous entries from non-authors
      order: [['createdAt', 'DESC']]
    });
    res.json(journalEntries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ message: 'Error fetching journal entries' });
  }
});

// Get a single journal entry
router.get('/:journalId', verifyToken, async (req, res) => {
  try {
    const { journalId } = req.params;
    const journal = await Journal.findByPk(journalId);
    
    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    
    res.json(journal);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ message: 'Error fetching journal entry' });
  }
});

// Create a new journal entry
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content, mood, moodIntensity, isAnonymous, tags } = req.body;
    const userId = req.user.id;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const journal = await Journal.create({
      userId,
      title,
      content,
      mood: mood || null,
      moodIntensity: moodIntensity || null,
      isAnonymous: isAnonymous || false,
      tags: tags || []
    });
    
    res.status(201).json(journal);
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ message: 'Error creating journal entry' });
  }
});

// Update a journal entry
router.put('/:journalId', verifyToken, async (req, res) => {
  try {
    const { journalId } = req.params;
    const { title, content, mood, moodIntensity, isAnonymous, tags } = req.body;
    
    const journal = await Journal.findByPk(journalId);
    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    
    // Verify ownership
    if (journal.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this entry' });
    }
    
    await journal.update({
      title: title || journal.title,
      content: content || journal.content,
      mood: mood !== undefined ? mood : journal.mood,
      moodIntensity: moodIntensity !== undefined ? moodIntensity : journal.moodIntensity,
      isAnonymous: isAnonymous !== undefined ? isAnonymous : journal.isAnonymous,
      tags: tags || journal.tags
    });
    
    res.json(journal);
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ message: 'Error updating journal entry' });
  }
});

// Delete a journal entry
router.delete('/:journalId', verifyToken, async (req, res) => {
  try {
    const { journalId } = req.params;
    const journal = await Journal.findByPk(journalId);
    
    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    
    // Verify ownership
    if (journal.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }
    
    await journal.destroy();
    res.json({ message: 'Journal entry deleted' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ message: 'Error deleting journal entry' });
  }
});

// Search journal entries by tag
router.get('/user/:userId/tag/:tag', verifyToken, async (req, res) => {
  try {
    const { userId, tag } = req.params;
    const journals = await Journal.findAll({
      where: {
        userId,
        tags: { [Op.contains]: [tag] }
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(journals);
  } catch (error) {
    console.error('Error fetching journal entries by tag:', error);
    res.status(500).json({ message: 'Error fetching journal entries' });
  }
});

export default router;
