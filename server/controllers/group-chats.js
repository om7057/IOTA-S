import { GroupChat, Group, User, GroupMember } from '../models/index.js';
import { getMongoDb, isMongoPrimaryEnabled } from '../config/mongo.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Send message in group chat
 */
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, type = 'text' } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required',
      });
    }

    // Verify user is member of group
    const member = await GroupMember.findOne({
      where: { groupId, userId },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this group',
      });
    }

    const message = await GroupChat.create({
      groupId,
      senderId: userId,
      content,
      type,
    });

    // Update group activity
    const group = await Group.findByPk(groupId);
    group.lastActivityAt = new Date();
    await group.save();

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('SendGroupMessage error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
    });
  }
};

/**
 * Get group chat history
 */
export const getGroupChatHistory = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50 } = req.query;
    const userId = req.user.id;

    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    // Verify user is member of group
    const member = await GroupMember.findOne({
      where: { groupId, userId },
    });

    if (!member && group.type === 'private') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view group messages',
      });
    }

    const messages = await GroupChat.findAll({
      where: { groupId },
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
    console.error('GetGroupChatHistory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history',
    });
  }
};

/**
 * Delete group message
 */
export const deleteGroupMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await GroupChat.findByPk(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    // Check authorization (sender or group moderator/owner)
    if (message.senderId !== userId) {
      const member = await GroupMember.findOne({
        where: { groupId: message.groupId, userId },
      });
      
      if (!member || (member.role !== 'owner' && member.role !== 'moderator')) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this message',
        });
      }
    }

    await message.destroy();

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('DeleteGroupMessage error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message',
    });
  }
};

/**
 * Edit group message
 */
export const editGroupMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const message = await GroupChat.findByPk(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Can only edit your own messages',
      });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('EditGroupMessage error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to edit message',
    });
  }
};

export default {
  sendGroupMessage,
  getGroupChatHistory,
  deleteGroupMessage,
  editGroupMessage,
};
