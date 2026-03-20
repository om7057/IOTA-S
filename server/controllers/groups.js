import { Group, GroupMember, User } from '../models/index.js';
import { Op } from 'sequelize';
import { getMongoDb, isMongoPrimaryEnabled } from '../config/mongo.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new group
 */

/**
 * Helper: Convert group to response format
 */
function toGroupPayload(group) {
  return {
    id: group._id || group.id,
    name: group.name,
    description: group.description || '',
    icon: group.icon,
    isPublic: group.isPublic !== false,
    memberCount: group.memberCount || 0,
    creatorId: group.creatorId,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}

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
    const { type, category } = req.query;
    const where = { isActive: true };

    if (type) where.type = type;
    if (category) where.category = category;

    const groups = await Group.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'email'],
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
      data: groups.map((group) => {
        const raw = group.toJSON();
        if (raw.creator) {
          raw.creator.username = `${raw.creator.firstName || ''} ${raw.creator.lastName || ''}`.trim() || raw.creator.email || 'Learner';
          raw.creator.avatar = raw.creator.avatarUrl || null;
        }
        return raw;
      }),
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

    const uuidV4Like = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidV4Like.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid group id format',
      });
    }

    const group = await Group.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'email'],
        },
        {
          model: GroupMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'email'],
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

    const raw = group.toJSON();
    if (raw.creator) {
      raw.creator.username = `${raw.creator.firstName || ''} ${raw.creator.lastName || ''}`.trim() || raw.creator.email || 'Learner';
      raw.creator.avatar = raw.creator.avatarUrl || null;
    }
    if (Array.isArray(raw.members)) {
      raw.members = raw.members.map((member) => {
        if (member.user) {
          member.user.username = `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim() || member.user.email || 'Learner';
          member.user.avatar = member.user.avatarUrl || null;
        }
        return member;
      });
    }

    res.json({ success: true, data: raw });
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
              attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'email'],
            },
          ],
        },
      ],
    });

    const groups = memberships.map((m) => {
      const raw = m.group.toJSON();
      if (raw.creator) {
        raw.creator.username = `${raw.creator.firstName || ''} ${raw.creator.lastName || ''}`.trim() || raw.creator.email || 'Learner';
        raw.creator.avatar = raw.creator.avatarUrl || null;
      }
      return { ...raw, userRole: m.role };
    });

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

/**
 * Suggest groups for current user (dummy profile-based response for now)
 */
export const suggestGroups = async (req, res) => {
  try {
    const userId = req.user?.id;

    let memberGroupIds = [];
    try {
      if (userId) {
        const memberships = await GroupMember.findAll({
          where: { userId },
          attributes: ['groupId'],
        });
        memberGroupIds = memberships.map((m) => m.groupId);
      }
    } catch (membershipError) {
      console.warn('SuggestGroups membership lookup fallback:', membershipError?.message || membershipError);
      memberGroupIds = [];
    }

    const where = {
      isActive: true,
      type: { [Op.ne]: 'private' },
    };

    if (memberGroupIds.length > 0) {
      where.id = { [Op.notIn]: memberGroupIds };
    }

    let candidateGroups = [];
    try {
      candidateGroups = await Group.findAll({
        where,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'email'],
          },
        ],
        order: [['memberCount', 'DESC']],
        limit: 3,
      });
    } catch (primaryQueryError) {
      console.warn('SuggestGroups primary query fallback:', primaryQueryError?.message || primaryQueryError);
      candidateGroups = await Group.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']],
        limit: 3,
      });
    }

    // Dummy ranking/explanation layer for now. Later this will use an AI model.
    const reasons = [
      'Matches your recent activity and interests.',
      'Popular among teens with a similar learning path.',
      'Good starter community based on your profile.',
    ];

    const suggestions = candidateGroups.map((group, index) => {
      const raw = group.toJSON();
      if (raw.creator) {
        raw.creator.username = `${raw.creator.firstName || ''} ${raw.creator.lastName || ''}`.trim() || raw.creator.email || 'Learner';
        raw.creator.avatar = raw.creator.avatarUrl || null;
      }

      return {
        ...raw,
        reason: reasons[index % reasons.length],
        confidence: Math.max(65, 92 - index * 9),
      };
    });

    res.json({
      success: true,
      analyzing: false,
      profileUsed: {
        age: req.user?.age || null,
        userType: req.user?.userType || null,
      },
      data: suggestions,
      total: suggestions.length,
    });
  } catch (error) {
    console.error('SuggestGroups error:', error);
    // Graceful fallback so UI still works even if recommendation logic fails.
    res.json({
      success: true,
      analyzing: false,
      profileUsed: {
        age: req.user?.age || null,
        userType: req.user?.userType || null,
      },
      data: [],
      total: 0,
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
  suggestGroups,
};
