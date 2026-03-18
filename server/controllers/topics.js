import { Topic, Story } from '../models/index.js';
import { logger } from '../utils/logger.js';

/**
 * Topics Controller
 * Handles topic CRUD operations and content organization
 * Similar to SPD_Emergency_26 implementation
 */

// Get all topics with story count
export const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.findAll({
      where: { isPublished: true },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: topics,
      count: topics.length,
    });
  } catch (error) {
    logger.error('Error fetching topics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching topics',
      error: error.message,
    });
  }
};

// Get topic by ID with stories
export const getTopicById = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findByPk(topicId, {
      include: [
        {
          model: Story,
          as: 'stories',
          attributes: ['id', 'title', 'description', 'coverImage', 'category', 'difficultyLevel'],
        },
      ],
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    res.json({
      success: true,
      data: topic,
    });
  } catch (error) {
    logger.error('Error fetching topic:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching topic',
      error: error.message,
    });
  }
};

// Get stories by topic
export const getStoriesByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findByPk(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    const stories = await Story.findAll({
      where: { topicId, isPublished: true },
      attributes: ['id', 'title', 'description', 'coverImage', 'category', 'difficultyLevel', 'duration'],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: stories,
      topicTitle: topic.title,
      count: stories.length,
    });
  } catch (error) {
    logger.error('Error fetching stories by topic:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stories',
      error: error.message,
    });
  }
};

// Get topics by category
export const getTopicsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const topics = await Topic.findAll({
      where: { category, isPublished: true },
      order: [['createdAt', 'DESC']],
    });

    if (topics.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: `No topics found for category: ${category}`,
      });
    }

    res.json({
      success: true,
      data: topics,
      category,
      count: topics.length,
    });
  } catch (error) {
    logger.error('Error fetching topics by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching topics',
      error: error.message,
    });
  }
};

// Create topic (admin)
export const createTopic = async (req, res) => {
  try {
    const { title, description, category, imageUrl, icon, isPublished } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    const topic = await Topic.create({
      title,
      description,
      category: category || 'general',
      imageUrl,
      icon,
      isPublished: isPublished !== false,
    });

    res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      data: topic,
    });
  } catch (error) {
    logger.error('Error creating topic:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating topic',
      error: error.message,
    });
  }
};

// Update topic (admin)
export const updateTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { title, description, category, imageUrl, icon, isPublished } = req.body;

    const topic = await Topic.findByPk(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    await topic.update({
      title: title || topic.title,
      description: description !== undefined ? description : topic.description,
      category: category || topic.category,
      imageUrl: imageUrl || topic.imageUrl,
      icon: icon || topic.icon,
      isPublished: isPublished !== undefined ? isPublished : topic.isPublished,
    });

    res.json({
      success: true,
      message: 'Topic updated successfully',
      data: topic,
    });
  } catch (error) {
    logger.error('Error updating topic:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating topic',
      error: error.message,
    });
  }
};

// Delete topic (admin)
export const deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findByPk(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    await topic.destroy({ force: false }); // Soft delete

    res.json({
      success: true,
      message: 'Topic deleted successfully',
      data: topic,
    });
  } catch (error) {
    logger.error('Error deleting topic:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting topic',
      error: error.message,
    });
  }
};
