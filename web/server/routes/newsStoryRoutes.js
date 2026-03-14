import express from 'express';
import { NewsStory } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all news stories
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0, topic } = req.query;
    const whereClause = {};
    
    if (topic) {
      whereClause.topic = topic;
    }
    
    const newsStories = await NewsStory.findAll({
      where: whereClause,
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json(newsStories);
  } catch (error) {
    console.error('Error fetching news stories:', error);
    res.status(500).json({ message: 'Error fetching news stories' });
  }
});

// Get a single news story
router.get('/:newsStoryId', async (req, res) => {
  try {
    const { newsStoryId } = req.params;
    const newsStory = await NewsStory.findByPk(newsStoryId);
    
    if (!newsStory) {
      return res.status(404).json({ message: 'News story not found' });
    }
    
    res.json(newsStory);
  } catch (error) {
    console.error('Error fetching news story:', error);
    res.status(500).json({ message: 'Error fetching news story' });
  }
});

// Get news stories by topic
router.get('/topic/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const newsStories = await NewsStory.findAll({
      where: { topic },
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json(newsStories);
  } catch (error) {
    console.error('Error fetching news stories by topic:', error);
    res.status(500).json({ message: 'Error fetching news stories' });
  }
});

// Create a new news story (admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, newsUrl, imageUrl, source, topic, publishedAt } = req.body;
    
    if (!title || !description || !newsUrl) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newsStory = await NewsStory.create({
      title,
      description,
      newsUrl,
      imageUrl: imageUrl || null,
      source: source || 'Unknown',
      topic: topic || null,
      publishedAt: publishedAt || new Date()
    });
    
    res.status(201).json(newsStory);
  } catch (error) {
    console.error('Error creating news story:', error);
    res.status(500).json({ message: 'Error creating news story' });
  }
});

// Update a news story (admin only)
router.put('/:newsStoryId', verifyToken, async (req, res) => {
  try {
    const { newsStoryId } = req.params;
    const { title, description, newsUrl, imageUrl, source, topic, publishedAt } = req.body;
    
    const newsStory = await NewsStory.findByPk(newsStoryId);
    if (!newsStory) {
      return res.status(404).json({ message: 'News story not found' });
    }
    
    await newsStory.update({
      title: title || newsStory.title,
      description: description || newsStory.description,
      newsUrl: newsUrl || newsStory.newsUrl,
      imageUrl: imageUrl !== undefined ? imageUrl : newsStory.imageUrl,
      source: source || newsStory.source,
      topic: topic !== undefined ? topic : newsStory.topic,
      publishedAt: publishedAt || newsStory.publishedAt
    });
    
    res.json(newsStory);
  } catch (error) {
    console.error('Error updating news story:', error);
    res.status(500).json({ message: 'Error updating news story' });
  }
});

// Delete a news story (admin only)
router.delete('/:newsStoryId', verifyToken, async (req, res) => {
  try {
    const { newsStoryId } = req.params;
    const newsStory = await NewsStory.findByPk(newsStoryId);
    
    if (!newsStory) {
      return res.status(404).json({ message: 'News story not found' });
    }
    
    await newsStory.destroy();
    res.json({ message: 'News story deleted' });
  } catch (error) {
    console.error('Error deleting news story:', error);
    res.status(500).json({ message: 'Error deleting news story' });
  }
});

export default router;
