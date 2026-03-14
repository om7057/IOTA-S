import express from 'express';
import { Query, User } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all queries
router.get('/', async (req, res) => {
  try {
    const queries = await Query.findAll({
      attributes: ['id', 'question', 'category', 'views', 'helpful', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(queries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ message: 'Error fetching queries' });
  }
});

// Get single query by ID
router.get('/:id', async (req, res) => {
  try {
    const query = await Query.findByPk(req.params.id);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }
    // Increment views
    await query.increment('views');
    res.json(query);
  } catch (error) {
    console.error('Error fetching query:', error);
    res.status(500).json({ message: 'Error fetching query' });
  }
});

// Create new query
router.post('/', verifyToken, async (req, res) => {
  try {
    const { question, category } = req.body;
    
    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const newQuery = await Query.create({
      question: question.trim(),
      category: category || 'general',
      userId: req.user.id
    });

    res.status(201).json(newQuery);
  } catch (error) {
    console.error('Error creating query:', error);
    res.status(500).json({ message: 'Error creating query' });
  }
});

// Mark query as helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    const query = await Query.findByPk(req.params.id);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }
    await query.increment('helpful');
    res.json({ message: 'Marked as helpful', helpful: query.helpful + 1 });
  } catch (error) {
    console.error('Error updating helpful count:', error);
    res.status(500).json({ message: 'Error updating query' });
  }
});

// Delete query (only by creator)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const query = await Query.findByPk(req.params.id);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }
    if (query.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this query' });
    }
    await query.destroy();
    res.json({ message: 'Query deleted successfully' });
  } catch (error) {
    console.error('Error deleting query:', error);
    res.status(500).json({ message: 'Error deleting query' });
  }
});

export default router;
