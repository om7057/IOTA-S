import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { TeenDirectMessage, User, TeenVerification } from '../models/index.js';

const router = express.Router();

// Get all conversations for logged-in user
router.get('/messages/conversations', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all unique conversations where user is sender or recipient
    const conversations = await TeenDirectMessage.findAll({
      attributes: ['senderId', 'recipientId', 'createdAt', 'isRead'],
      where: {
        [require('sequelize').Op.or]: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      raw: false
    });

    // Group conversations by user
    const conversationMap = {};
    conversations.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.recipientId : msg.senderId;
      const otherUser = msg.senderId === userId ? msg.recipient : msg.sender;
      
      if (!conversationMap[otherUserId]) {
        conversationMap[otherUserId] = {
          otherUser,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: msg.isRead ? 0 : 1
        };
      } else {
        if (!msg.isRead && msg.recipientId === userId) {
          conversationMap[otherUserId].unreadCount += 1;
        }
      }
    });

    const conversationList = Object.entries(conversationMap).map(([userId, data]) => ({
      userId: parseInt(userId),
      ...data
    }));

    res.json(conversationList.sort((a, b) => 
      new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    ));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages between two users
router.get('/messages/:otherUserId', verifyToken, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await TeenDirectMessage.findAndCountAll({
      where: {
        [require('sequelize').Op.or]: [
          {
            [require('sequelize').Op.and]: [
              { senderId: userId },
              { recipientId: parseInt(otherUserId) }
            ]
          },
          {
            [require('sequelize').Op.and]: [
              { senderId: parseInt(otherUserId) },
              { recipientId: userId }
            ]
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      messages: rows.reverse() // Return in chronological order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send direct message
router.post('/messages/:recipientId', verifyToken, async (req, res) => {
  try {
    const { recipientId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (parseInt(recipientId) === userId) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    // Verify recipient exists
    const recipient = await User.findByPk(parseInt(recipientId));
    if (!recipient) {
      return res.status(404).json({ error: 'User not found' });
    }

    const message = await TeenDirectMessage.create({
      senderId: userId,
      recipientId: parseInt(recipientId),
      content,
      isRead: false
    });

    const messageWithUsers = await TeenDirectMessage.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'name', 'avatar']
        }
      ]
    });

    res.status(201).json(messageWithUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete direct message (only sender can delete)
router.delete('/messages/:messageId', verifyToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await TeenDirectMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await message.destroy();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read
router.patch('/messages/:messageId/read', verifyToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await TeenDirectMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.recipientId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await message.update({ isRead: true });
    const updated = await TeenDirectMessage.findByPk(messageId, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'name', 'avatar']
        }
      ]
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all messages from user as read
router.patch('/messages/:otherUserId/read-all', verifyToken, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.id;

    await TeenDirectMessage.update(
      { isRead: true },
      {
        where: {
          senderId: parseInt(otherUserId),
          recipientId: userId,
          isRead: false
        }
      }
    );

    res.json({ message: 'All messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread message count
router.get('/messages/count/unread', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await TeenDirectMessage.count({
      where: {
        recipientId: userId,
        isRead: false
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get list of verified counselors (for easier messaging)
router.get('/counselors/verified', verifyToken, async (req, res) => {
  try {
    const counselors = await TeenVerification.findAll({
      where: {
        verificationType: 'counselor',
        isVerified: true
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar', 'email']
        }
      ],
      attributes: ['id', 'verificationType', 'verificationBadge', 'verifiedAt']
    });

    res.json(counselors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
