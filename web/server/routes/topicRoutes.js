import express from 'express';
import { Topic, Story } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all topics
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.findAll({
      include: [
        {
          model: Story,
          as: 'Stories',
          attributes: ['id', 'title', 'description']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ message: 'Error fetching topics' });
  }
});

// Get all posts/stories
router.get('/posts', async (req, res) => {
  try {
    const stories = await Story.findAll({
      attributes: ['id', 'title', 'description', 'topicId'],
      order: [['createdAt', 'DESC']]
    });
    res.json(stories);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Get a single topic with stories
router.get('/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = await Topic.findByPk(topicId, {
      include: [
        {
          model: Story,
          as: 'Stories',
          attributes: ['id', 'title', 'description', 'levelId']
        }
      ]
    });
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    res.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ message: 'Error fetching topic' });
  }
});

// Create a new topic (admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const topic = await Topic.create({
      name,
      description,
      imageUrl: imageUrl || null
    });
    
    res.status(201).json(topic);
  } catch (error) {
    console.error('Error creating topic:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Topic name already exists' });
    }
    res.status(500).json({ message: 'Error creating topic' });
  }
});

// Update a topic (admin only)
router.put('/:topicId', verifyToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { name, description, imageUrl } = req.body;
    
    const topic = await Topic.findByPk(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    await topic.update({
      name: name || topic.name,
      description: description || topic.description,
      imageUrl: imageUrl !== undefined ? imageUrl : topic.imageUrl
    });
    
    res.json(topic);
  } catch (error) {
    console.error('Error updating topic:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Topic name already exists' });
    }
    res.status(500).json({ message: 'Error updating topic' });
  }
});

// Delete a topic (admin only)
router.delete('/:topicId', verifyToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = await Topic.findByPk(topicId);
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    await topic.destroy();
    res.json({ message: 'Topic deleted' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ message: 'Error deleting topic' });
  }
});

// Get posts/stories for a specific topic
router.get('/:topicId/posts', async (req, res) => {
  try {
    const { topicId } = req.params;
    const stories = await Story.findAll({
      where: { topicId },
      attributes: ['id', 'title', 'description', 'topicId'],
      order: [['createdAt', 'DESC']]
    });
    res.json(stories);
  } catch (error) {
    console.error('Error fetching posts for topic:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Create a post/story for a specific topic
router.post('/:topicId/posts', verifyToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { title, content, userId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify topic exists
    const topic = await Topic.findByPk(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const story = await Story.create({
      title,
      description: content,
      topicId,
      userId
    });

    res.status(201).json(story);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

export default router;
