import { Group, GroupMember, User } from '../models/index.js';

/**
 * Create a new group
 */
export const createGroup = async (req, res) => {
  try {
    const { name, description, type, category, icon, avatarUrl } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Group name is required',
      });
    }

    const group = await Group.create({
      name,
      description,
      creatorId: userId,
      type: type || 'public',
      category: category || null,
      icon,
      avatarUrl,
      memberCount: 1,
    });

    // Add creator as owner
    await GroupMember.create({
      groupId: group.id,
      userId,
      role: 'owner',
    });

    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error('CreateGroup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create group',
    });
  }
};

/**
 * Get all groups with filtering
 */
export const getAllGroups = async (req, res) => {
  try {
    const { type, category, search } = req.query;
    const where = { isActive: true };

    if (type) where.type = type;
    if (category) where.category = category;

    let { Op } = require('sequelize');

    const groups = await Group.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'avatar'],
        },
        {
          model: GroupMember,
          as: 'members',
          attributes: ['id', 'userId', 'role'],
        },
      ],
      order: [['lastActivityAt', 'DESC']],
      limit: 50,
    });

    res.json({
      success: true,
      data: groups,
      total: groups.length,
    });
  } catch (error) {
    console.error('GetAllGroups error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch groups',
    });
  }
};

/**
 * Get group by ID
 */
export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'avatar'],
        },
        {
          model: GroupMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar'],
            },
          ],
        },
      ],
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    res.json({ success: true, data: group });
  } catch (error) {
    console.error('GetGroupById error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch group',
    });
  }
};

/**
 * Update group
 */
export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, type, category, icon, avatarUrl, isActive } = req.body;

    const group = await Group.findByPk(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    // Check if user is owner
    if (group.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Only group creator can update group',
      });
    }

    if (name) group.name = name;
    if (description) group.description = description;
    if (type) group.type = type;
    if (category) group.category = category;
    if (icon) group.icon = icon;
    if (avatarUrl) group.avatarUrl = avatarUrl;
    if (typeof isActive !== 'undefined') group.isActive = isActive;

    await group.save();

    res.json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error('UpdateGroup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update group',
    });
  }
};

/**
 * Delete group
 */
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await Group.findByPk(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    if (group.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Only group creator can delete group',
      });
    }

    await group.destroy();

    res.json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error) {
    console.error('DeleteGroup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete group',
    });
  }
};

/**
 * Join group
 */
export const joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await Group.findByPk(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    // Check if already member
    const existing = await GroupMember.findOne({
      where: { groupId: id, userId },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Already a member of this group',
      });
    }

    const member = await GroupMember.create({
      groupId: id,
      userId,
      role: 'member',
    });

    group.memberCount = (group.memberCount || 0) + 1;
    group.lastActivityAt = new Date();
    await group.save();

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error('JoinGroup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join group',
    });
  }
};

/**
 * Leave group
 */
export const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const member = await GroupMember.findOne({
      where: { groupId: id, userId },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Not a member of this group',
      });
    }

    // Cannot leave if owner (must delete group instead)
    if (member.role === 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Group owner cannot leave group',
      });
    }

    await member.destroy();

    const group = await Group.findByPk(id);
    group.memberCount = Math.max(0, (group.memberCount || 1) - 1);
    await group.save();

    res.json({
      success: true,
      message: 'Left group successfully',
    });
  } catch (error) {
    console.error('LeaveGroup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave group',
    });
  }
};

/**
 * Update member role
 */
export const updateMemberRole = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user.id;

    const group = await Group.findByPk(id);

    if (!group || group.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to manage group',
      });
    }

    const member = await GroupMember.findByPk(memberId);

    if (!member || member.groupId !== id) {
      return res.status(404).json({
        success: false,
        error: 'Member not found',
      });
    }

    if (role === 'owner') {
      return res.status(400).json({
        success: false,
        error: 'Cannot change role to owner',
      });
    }

    member.role = role;
    await member.save();

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error('UpdateMemberRole error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update member role',
    });
  }
};

/**
 * Get user's groups
 */
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const memberships = await GroupMember.findAll({
      where: { userId },
      include: [
        {
          model: Group,
          as: 'group',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'username', 'avatar'],
            },
          ],
        },
      ],
    });

    const groups = memberships.map(m => ({ ...m.group.toJSON(), userRole: m.role }));

    res.json({
      success: true,
      data: groups,
      total: groups.length,
    });
  } catch (error) {
    console.error('GetUserGroups error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user groups',
    });
  }
};

export default {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  updateMemberRole,
  getUserGroups,
};
