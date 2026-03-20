import { PsychiatristChat, User, Psychiatrist } from '../models/index.js';
import { Op } from 'sequelize';
import { logger } from '../utils/logger.js';

/**
 * Start a new conversation with psychiatrist
 */
export const startConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { psychiatristId, initialMessage } = req.body;

    if (!psychiatristId) {
      return res.status(400).json({
        success: false,
        error: 'Psychiatrist ID is required',
      });
    }

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Verify psychiatrist exists
    const psychiatrist = await Psychiatrist.findByPk(psychiatristId);
    if (!psychiatrist) {
      return res.status(404).json({
        success: false,
        error: 'Psychiatrist not found',
      });
    }

    // Create initial message
    let chat = await PsychiatristChat.create({
      userId,
      psychiatristId,
      message: initialMessage || 'starting conversation',
      sender: 'teen',
      sentiment: 'neutral',
    });

    chat = await PsychiatristChat.findByPk(chat.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl'],
        },
        {
          model: Psychiatrist,
          as: 'psychiatrist',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'specialization'],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    logger.error('Error starting conversation:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Send message in conversation
 */
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { conversationId, psychiatristId, message, sender } = req.body;

    if (!message || !conversationId || !psychiatristId) {
      return res.status(400).json({
        success: false,
        error: 'Message, conversation ID, and psychiatrist ID are required',
      });
    }

    if (!['teen', 'psychiatrist'].includes(sender)) {
      return res.status(400).json({
        success: false,
        error: 'Sender must be either "teen" or "psychiatrist"',
      });
    }

    // Verify user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Create message
    let chat = await PsychiatristChat.create({
      conversationId,
      userId,
      psychiatristId,
      message,
      sender,
      sentiment: 'neutral',
    });

    chat = await PsychiatristChat.findByPk(chat.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl'],
        },
        {
          model: Psychiatrist,
          as: 'psychiatrist',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl'],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // Get unique conversations
    const conversations = await PsychiatristChat.findAll({
      where: { userId },
      attributes: { exclude: ['message'] },
      include: [
        {
          model: Psychiatrist,
          as: 'psychiatrist',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'specialization'],
        },
      ],
      group: ['PsychiatristChat.conversationId'],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      subQuery: false,
    });

    return res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get messages in a conversation
 */
export const getConversationMessages = async (req, res) => {
  try {
    const { userId, conversationId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const messages = await PsychiatristChat.findAndCountAll({
      where: {
        userId,
        conversationId,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl'],
        },
        {
          model: Psychiatrist,
          as: 'psychiatrist',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'ASC']],
    });

    return res.json({
      success: true,
      data: messages.rows,
      total: messages.count,
    });
  } catch (error) {
    logger.error('Error fetching messages:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export default {
  startConversation,
  sendMessage,
  getUserConversations,
  getConversationMessages,
};
