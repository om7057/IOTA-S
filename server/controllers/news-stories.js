import { NewsStory, Topic } from '../models/index.js';
import { logger } from '../utils/logger.js';
import { generateQuizFromStory } from '../services/quizGenerator.js';
import { saveGeneratedQuiz } from './quiz.js';
import { getMongoDb, isMongoPrimaryEnabled } from '../config/mongo.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * News Stories Controller
 * Handles news stories generated from news articles
 * Integrates with news fetcher service
 * Auto-generates quizzes for every story created
 */

// Get all news stories

/**
 * Helper: Create news article object
 */
function createNewsArticle(title, content, source, author, imageUrl = null) {
  const now = new Date();
  return {
    _id: require('uuid').v4(),
    title,
    content,
    source,
    author,
    imageUrl,
    viewsCount: 0,
    likesCount: 0,
    commentsCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export const getAllNewsStories = async (req, res) => {
  try {
    const newsStories = await NewsStory.findAll({
      where: { isPublished: true },
      include: [
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'title', 'icon'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    res.json({
      success: true,
      data: newsStories,
      count: newsStories.length,
    });
  } catch (error) {
    logger.error('Error fetching news stories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching news stories',
      error: error.message,
    });
  }
};

// Get news stories by topic
export const getNewsStoriesByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const newsStories = await NewsStory.findAll({
      where: { topicId, isPublished: true },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    res.json({
      success: true,
      data: newsStories,
      count: newsStories.length,
    });
  } catch (error) {
    logger.error('Error fetching news stories by topic:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching news stories',
      error: error.message,
    });
  }
};

// Get news story by ID
export const getNewsStoryById = async (req, res) => {
  try {
    const { newsStoryId } = req.params;

    const newsStory = await NewsStory.findByPk(newsStoryId, {
      include: [
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'title', 'icon'],
        },
      ],
    });

    if (!newsStory) {
      return res.status(404).json({
        success: false,
        message: 'News story not found',
      });
    }

    // Increment view count
    await newsStory.increment('viewCount');

    res.json({
      success: true,
      data: newsStory,
    });
  } catch (error) {
    logger.error('Error fetching news story:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching news story',
      error: error.message,
    });
  }
};

// Create news story (from news fetcher service)
export const createNewsStory = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      category,
      topicId,
      sourceArticleUrl,
      sourceArticleTitle,
      imageUrl,
      storyJson,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    // Create the news story
    const newsStory = await NewsStory.create({
      title,
      description,
      content,
      category: category || 'general',
      topicId,
      sourceArticleUrl,
      sourceArticleTitle,
      imageUrl,
      storyJson,
      isPublished: true,
    });

    // Auto-generate and save quiz for this story (non-blocking, async)
    // This ensures every story has an associated quiz for learning reinforcement
    generateQuizForStoryAsync(newsStory);

    res.status(201).json({
      success: true,
      message: 'News story created successfully',
      data: newsStory,
    });
  } catch (error) {
    logger.error('Error creating news story:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating news story',
      error: error.message,
    });
  }
};

/**
 * Async helper to generate quiz for story without blocking response
 * @param {Object} newsStory - NewsStory instance
 */
async function generateQuizForStoryAsync(newsStory) {
  try {
    logger.info(`Generating quiz for story: ${newsStory.title}`);
    
    // Generate quiz using LLM
    const generatedQuiz = await generateQuizFromStory(
      {
        title: newsStory.title,
        description: newsStory.description,
        content: newsStory.content,
        category: newsStory.category,
      },
      newsStory.id
    );

    // Save quiz to database with questions
    await saveGeneratedQuiz(generatedQuiz, newsStory.id);
    
    logger.info(`Quiz auto-generated and saved for story: ${newsStory.id}`);
  } catch (error) {
    logger.error(`Failed to auto-generate quiz for story ${newsStory.id}:`, error);
    // Don't throw - graceful failure since story is already saved
  }
}

// Update news story
export const updateNewsStory = async (req, res) => {
  try {
    const { newsStoryId } = req.params;
    const updates = req.body;

    const newsStory = await NewsStory.findByPk(newsStoryId);
    if (!newsStory) {
      return res.status(404).json({
        success: false,
        message: 'News story not found',
      });
    }

    await newsStory.update(updates);

    res.json({
      success: true,
      message: 'News story updated successfully',
      data: newsStory,
    });
  } catch (error) {
    logger.error('Error updating news story:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating news story',
      error: error.message,
    });
  }
};

// Delete news story
export const deleteNewsStory = async (req, res) => {
  try {
    const { newsStoryId } = req.params;

    const newsStory = await NewsStory.findByPk(newsStoryId);
    if (!newsStory) {
      return res.status(404).json({
        success: false,
        message: 'News story not found',
      });
    }

    await newsStory.destroy();

    res.json({
      success: true,
      message: 'News story deleted successfully',
      data: newsStory,
    });
  } catch (error) {
    logger.error('Error deleting news story:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting news story',
      error: error.message,
    });
  }
};
