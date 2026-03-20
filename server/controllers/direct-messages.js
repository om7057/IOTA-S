import { Conversation, DirectMessage, User } from '../models/index.js';
import { sequelize } from '../models/index.js';

/**
 * Get or create conversation between two users
 */
export const getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot message yourself',
      });
    }

    // Check if user exists
    const otherUser = await User.findByPk(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Find or create conversation
    const [user1, user2] = [currentUserId, userId].sort();

    let conversation = await Conversation.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { user1Id: user1, user2Id: user2 },
          { user1Id: user2, user2Id: user1 },
        ],
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        user1Id: user1,
        user2Id: user2,
      });
    }

    // Get messages
    const messages = await DirectMessage.findAll({
      where: { conversationId: conversation.id },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'email'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    const normalizedMessages = messages.map((message) => {
      const raw = message.toJSON();
      if (raw.sender) {
        raw.sender.username = `${raw.sender.firstName || ''} ${raw.sender.lastName || ''}`.trim() || raw.sender.email || 'Learner';
        raw.sender.avatar = raw.sender.avatarUrl || null;
      }
      return raw;
    });

    res.json({
      success: true,
      data: {
        conversation,
        messages: normalizedMessages,
      },
    });
  } catch (error) {
    console.error('GetOrCreateConversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation',
    });
  }
};

/**
 * Get user's conversations
 */
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'email'],
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'email'],
        },
      ],
      order: [['lastMessageAt', 'DESC']],
    });

    const normalizedConversations = conversations.map((conversation) => {
      const raw = conversation.toJSON();
      if (raw.user1) {
        raw.user1.username = `${raw.user1.firstName || ''} ${raw.user1.lastName || ''}`.trim() || raw.user1.email || 'Learner';
        raw.user1.avatar = raw.user1.avatarUrl || null;
      }
      if (raw.user2) {
        raw.user2.username = `${raw.user2.firstName || ''} ${raw.user2.lastName || ''}`.trim() || raw.user2.email || 'Learner';
        raw.user2.avatar = raw.user2.avatarUrl || null;
      }
      return raw;
    });

    res.json({
      success: true,
      data: normalizedConversations,
      total: normalizedConversations.length,
    });
  } catch (error) {
    console.error('GetUserConversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
    });
  }
};

/**
 * Send direct message
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required',
      });
    }

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    // Verify user is part of conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to send message',
      });
    }

    const message = await DirectMessage.create({
      conversationId,
      senderId: userId,
      content,
    });

    // Update conversation
    conversation.messageCount = (conversation.messageCount || 0) + 1;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('SendMessage error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
    });
  }
};

/**
 * Get conversation messages
 */
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50 } = req.query;
    const userId = req.user.id;

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    const messages = await DirectMessage.findAll({
      where: { conversationId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: Math.min(parseInt(limit) || 50, 200),
    });

    const normalizedMessages = messages.reverse().map((message) => {
      const raw = message.toJSON();
      if (raw.sender) {
        raw.sender.username = `${raw.sender.firstName || ''} ${raw.sender.lastName || ''}`.trim() || raw.sender.email || 'Learner';
        raw.sender.avatar = raw.sender.avatarUrl || null;
      }
      return raw;
    });

    res.json({
      success: true,
      data: normalizedMessages,
      total: normalizedMessages.length,
    });
  } catch (error) {
    console.error('GetConversationMessages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
    });
  }
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await DirectMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    // Get conversation to verify authorization
    const conversation = await Conversation.findByPk(message.conversationId);
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('MarkMessageAsRead error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark message as read',
    });
  }
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadMessages = await DirectMessage.findAll({
      where: { isRead: false },
      include: [
        {
          model: Conversation,
          as: 'conversation',
          where: {
            [sequelize.Sequelize.Op.or]: [
              { user1Id: userId },
              { user2Id: userId },
            ],
          },
        },
      ],
    });

    const count = unreadMessages.length;

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error('GetUnreadCount error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count',
    });
  }
};

export default {
  getOrCreateConversation,
  getUserConversations,
  sendMessage,
  getConversationMessages,
  markMessageAsRead,
  getUnreadCount,
};
