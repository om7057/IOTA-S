import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { TeenGroup, TeenGroupMember, TeenGroupMessage, User } from '../models/index.js';

const router = express.Router();

// Get all groups
router.get('/groups', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await TeenGroup.findAndCountAll({
      include: [
        {
          model: TeenGroupMember,
          attributes: ['id'],
          required: false
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
      groups: rows.map(g => ({
        ...g.dataValues,
        memberCount: g.TeenGroupMembers ? g.TeenGroupMembers.length : 0
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single group with members
router.get('/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await TeenGroup.findByPk(groupId, {
      include: [
        {
          model: TeenGroupMember,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'avatar']
            }
          ]
        }
      ]
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      ...group.dataValues,
      memberCount: group.TeenGroupMembers ? group.TeenGroupMembers.length : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new group
router.post('/groups', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, category, isPrivate } = req.body;

    const group = await TeenGroup.create({
      name,
      description,
      category: category || 'general',
      isPrivate: isPrivate || false,
      createdBy: userId
    });

    // Add creator as member
    await TeenGroupMember.create({
      groupId: group.id,
      userId,
      role: 'admin'
    });

    const createdGroup = await TeenGroup.findByPk(group.id, {
      include: [
        {
          model: TeenGroupMember,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'avatar']
            }
          ]
        }
      ]
    });

    res.status(201).json(createdGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update group (only creator can update)
router.put('/groups/:groupId', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { name, description, category } = req.body;

    const group = await TeenGroup.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.createdBy !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await group.update({ name, description, category });
    const updated = await TeenGroup.findByPk(groupId, {
      include: [
        {
          model: TeenGroupMember,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'avatar']
            }
          ]
        }
      ]
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete group (only creator can delete)
router.delete('/groups/:groupId', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await TeenGroup.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.createdBy !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete all members and messages first
    await TeenGroupMessage.destroy({ where: { groupId } });
    await TeenGroupMember.destroy({ where: { groupId } });
    await group.destroy();

    res.json({ message: 'Group deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join group
router.post('/groups/:groupId/join', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await TeenGroup.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if already member
    const existingMember = await TeenGroupMember.findOne({
      where: { groupId, userId }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Already a member' });
    }

    const member = await TeenGroupMember.create({
      groupId,
      userId,
      role: 'member'
    });

    const memberWithUser = await TeenGroupMember.findByPk(member.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        }
      ]
    });

    res.status(201).json(memberWithUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leave group
router.post('/groups/:groupId/leave', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const member = await TeenGroupMember.findOne({
      where: { groupId, userId }
    });

    if (!member) {
      return res.status(404).json({ error: 'Not a member of this group' });
    }

    // Don't allow admin to leave if they're the only one
    if (member.role === 'admin') {
      const adminCount = await TeenGroupMember.count({
        where: { groupId, role: 'admin' }
      });
      if (adminCount === 1) {
        return res.status(400).json({ error: 'At least one admin must remain' });
      }
    }

    await member.destroy();
    res.json({ message: 'Left group' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group messages
router.get('/groups/:groupId/messages', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await TeenGroupMessage.findAndCountAll({
      where: { groupId },
      include: [
        {
          model: User,
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

// Send group message
router.post('/groups/:groupId/messages', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    // Verify user is member of group
    const member = await TeenGroupMember.findOne({
      where: { groupId, userId }
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const message = await TeenGroupMessage.create({
      groupId,
      userId,
      content,
      isRead: false
    });

    const messageWithUser = await TeenGroupMessage.findByPk(message.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        }
      ]
    });

    res.status(201).json(messageWithUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete group message (only sender can delete)
router.delete('/messages/:messageId', verifyToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await TeenGroupMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.userId !== userId) {
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

    const message = await TeenGroupMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await message.update({ isRead: true });
    const updated = await TeenGroupMessage.findByPk(messageId, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        }
      ]
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group members
router.get('/groups/:groupId/members', async (req, res) => {
  try {
    const { groupId } = req.params;

    const members = await TeenGroupMember.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar', 'email']
        }
      ],
      order: [['role', 'DESC']]
    });

    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
