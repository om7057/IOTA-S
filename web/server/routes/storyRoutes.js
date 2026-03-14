import express from 'express';
import { Story, Topic, StoryLevel } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all stories
router.get('/', async (req, res) => {
  try {
    const stories = await Story.findAll({
      include: [
        {
          model: Topic,
          attributes: ['id', 'name', 'description']
        },
        {
          model: StoryLevel,
          attributes: ['id', 'chapter', 'title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ message: 'Error fetching stories' });
  }
});

// Get a single story with details
router.get('/:storyId', async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findByPk(storyId, {
      include: [
        {
          model: Topic,
          attributes: ['id', 'name', 'description', 'imageUrl']
        },
        {
          model: StoryLevel,
          attributes: ['id', 'chapter', 'title', 'description']
        }
      ]
    });
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    res.json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ message: 'Error fetching story' });
  }
});

// Get stories by topic
router.get('/topic/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const stories = await Story.findAll({
      where: { topicId },
      include: [
        {
          model: StoryLevel,
          attributes: ['id', 'chapter', 'title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(stories);
  } catch (error) {
    console.error('Error fetching stories by topic:', error);
    res.status(500).json({ message: 'Error fetching stories' });
  }
});

// Create a new story
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, topicId, levelId, scenes } = req.body;
    
    if (!title || !description || !topicId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const story = await Story.create({
      title,
      description,
      topicId,
      levelId: levelId || null,
      scenes: scenes || []
    });
    
    res.status(201).json(story);
  } catch (error) {
    console.error('Error creating story:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Story title already exists' });
    }
    res.status(500).json({ message: 'Error creating story' });
  }
});

// Update a story
router.put('/:storyId', verifyToken, async (req, res) => {
  try {
    const { storyId } = req.params;
    const { title, description, topicId, levelId, scenes } = req.body;
    
    const story = await Story.findByPk(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    await story.update({
      title: title || story.title,
      description: description || story.description,
      topicId: topicId || story.topicId,
      levelId: levelId !== undefined ? levelId : story.levelId,
      scenes: scenes || story.scenes
    });
    
    res.json(story);
  } catch (error) {
    console.error('Error updating story:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Story title already exists' });
    }
    res.status(500).json({ message: 'Error updating story' });
  }
});

// Delete a story
router.delete('/:storyId', verifyToken, async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findByPk(storyId);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    await story.destroy();
    res.json({ message: 'Story deleted' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ message: 'Error deleting story' });
  }
});

export default router;
