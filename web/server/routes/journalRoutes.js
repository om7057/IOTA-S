import express from 'express';
import { Journal } from '../models/Journal.js';

const router = express.Router();

// Get all journal entries for a user
router.get('/user/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    const journals = await Journal.find({ clerkId }).sort({ createdAt: -1 });
    res.json(journals);
  } catch (error) {
    console.error('Error fetching journals:', error);
    res.status(500).json({ message: 'Error fetching journals' });
  }
});

// Get journal entries for specific date range
router.get('/user/:clerkId/range', async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { startDate, endDate } = req.query;
    
    const query = { clerkId };
    if (startDate && endDate) {
      query.entryDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const journals = await Journal.find(query).sort({ entryDate: -1 });
    res.json(journals);
  } catch (error) {
    console.error('Error fetching journals:', error);
    res.status(500).json({ message: 'Error fetching journals' });
  }
});

// Get a single journal entry
router.get('/:journalId', async (req, res) => {
  try {
    const { journalId } = req.params;
    const journal = await Journal.findById(journalId);
    
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    
    res.json(journal);
  } catch (error) {
    console.error('Error fetching journal:', error);
    res.status(500).json({ message: 'Error fetching journal' });
  }
});

// Create a new journal entry
router.post('/', async (req, res) => {
  try {
    const { userId, clerkId, title, content, mood, moodIntensity, tags, isAnonymous } = req.body;
    
    if (!clerkId || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const journal = new Journal({
      userId,
      clerkId,
      title: title || 'Untitled',
      content,
      mood: mood || null,
      moodIntensity: moodIntensity || null,
      tags: tags || [],
      isAnonymous: isAnonymous || false,
      entryDate: new Date()
    });
    
    await journal.save();
    res.status(201).json(journal);
  } catch (error) {
    console.error('Error creating journal:', error);
    res.status(500).json({ message: 'Error creating journal' });
  }
});

// Update a journal entry
router.put('/:journalId', async (req, res) => {
  try {
    const { journalId } = req.params;
    const { title, content, mood, moodIntensity, tags, isAnonymous } = req.body;
    
    const journal = await Journal.findByIdAndUpdate(
      journalId,
      { 
        title, 
        content, 
        mood, 
        moodIntensity, 
        tags, 
        isAnonymous,
        updatedAt: Date.now() 
      },
      { new: true }
    );
    
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    
    res.json(journal);
  } catch (error) {
    console.error('Error updating journal:', error);
    res.status(500).json({ message: 'Error updating journal' });
  }
});

// Delete a journal entry
router.delete('/:journalId', async (req, res) => {
  try {
    const { journalId } = req.params;
    const journal = await Journal.findByIdAndDelete(journalId);
    
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    
    res.json({ message: 'Journal deleted' });
  } catch (error) {
    console.error('Error deleting journal:', error);
    res.status(500).json({ message: 'Error deleting journal' });
  }
});

// Search journals by tags or content
router.get('/search/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query required' });
    }
    
    const journals = await Journal.find({
      clerkId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [query] } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(journals);
  } catch (error) {
    console.error('Error searching journals:', error);
    res.status(500).json({ message: 'Error searching journals' });
  }
});

export default router;
