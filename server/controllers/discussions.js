import { Discussion, DiscussionReply, Group, User, Like, GroupMember } from '../models/index.js';

/**
 * Create discussion thread
 */
export const createDiscussion = async (req, res) => {
  try {
    const { groupId, title, content, tags } = req.body;
    const userId = req.user.id;

    if (!groupId || !title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Group ID, title, and content are required',
      });
    }

    // Verify user is member of group
    const isMember = await GroupMember.findOne({
      where: { groupId, userId },
    });

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'You must be a member of the group to create discussions',
      });
    }

    const discussion = await Discussion.create({
      groupId,
      creatorId: userId,
      title,
      content,
      tags: tags || [],
      lastActivityAt: new Date(),
    });

    // Update group activity
    const group = await Group.findByPk(groupId);
    group.lastActivityAt = new Date();
    await group.save();

    res.status(201).json({
      success: true,
      data: discussion,
    });
  } catch (error) {
    console.error('CreateDiscussion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create discussion',
    });
  }
};

/**
 * Get discussions for a group
 */
export const getGroupDiscussions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { sort = 'recent' } = req.query;

    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    const order = sort === 'pinned'
      ? [['isPinned', 'DESC'], ['createdAt', 'DESC']]
      : [['isPinned', 'DESC'], ['lastActivityAt', 'DESC']];

    const discussions = await Discussion.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'avatar'],
        },
      ],
      order,
    });

    res.json({
      success: true,
      data: discussions,
      total: discussions.length,
    });
  } catch (error) {
    console.error('GetGroupDiscussions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch discussions',
    });
  }
};

/**
 * Get discussion by ID
 */
export const getDiscussionById = async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await Discussion.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'avatar'],
        },
        {
          model: DiscussionReply,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'username', 'avatar'],
            },
          ],
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found',
      });
    }

    // Increment view count
    discussion.viewCount = (discussion.viewCount || 0) + 1;
    await discussion.save();

    res.json({ success: true, data: discussion });
  } catch (error) {
    console.error('GetDiscussionById error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch discussion',
    });
  }
};

/**
 * Like discussion
 */
export const likeDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const discussion = await Discussion.findByPk(id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found',
      });
    }

    // Check if already liked
    const existing = await Like.findOne({
      where: { userId, targetType: 'discussion', targetId: id },
    });

    if (existing) {
      await existing.destroy();
      discussion.likeCount = Math.max(0, (discussion.likeCount || 1) - 1);
      await discussion.save();
      
      return res.json({
        success: true,
        data: { liked: false, likeCount: discussion.likeCount },
      });
    }

    await Like.create({
      userId,
      targetType: 'discussion',
      targetId: id,
    });

    discussion.likeCount = (discussion.likeCount || 0) + 1;
    await discussion.save();

    res.json({
      success: true,
      data: { liked: true, likeCount: discussion.likeCount },
    });
  } catch (error) {
    console.error('LikeDiscussion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like discussion',
    });
  }
};

/**
 * Pin/unpin discussion (moderator/owner only)
 */
export const pinDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const discussion = await Discussion.findByPk(id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found',
      });
    }

    // Check authorization
    const group = await Group.findByPk(discussion.groupId);
    const member = await GroupMember.findOne({
      where: { groupId: discussion.groupId, userId },
    });

    if (!member || (member.role !== 'owner' && member.role !== 'moderator')) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to pin discussions',
      });
    }

    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    res.json({
      success: true,
      data: discussion,
    });
  } catch (error) {
    console.error('PinDiscussion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pin discussion',
    });
  }
};

/**
 * Close discussion
 */
export const closeDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const discussion = await Discussion.findByPk(id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found',
      });
    }

    // Check authorization (creator or moderator)
    if (discussion.creatorId !== userId) {
      const member = await GroupMember.findOne({
        where: { groupId: discussion.groupId, userId },
      });
      
      if (!member || (member.role !== 'owner' && member.role !== 'moderator')) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to close this discussion',
        });
      }
    }

    discussion.isClosed = !discussion.isClosed;
    await discussion.save();

    res.json({
      success: true,
      data: discussion,
    });
  } catch (error) {
    console.error('CloseDiscussion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to close discussion',
    });
  }
};

/**
 * Reply to discussion
 */
export const replyToDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentReplyId } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Reply content is required',
      });
    }

    const discussion = await Discussion.findByPk(id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found',
      });
    }

    if (discussion.isClosed) {
      return res.status(403).json({
        success: false,
        error: 'This discussion is closed',
      });
    }

    const reply = await DiscussionReply.create({
      discussionId: id,
      creatorId: userId,
      parentReplyId,
      content,
    });

    // Update discussion stats
    discussion.replyCount = (discussion.replyCount || 0) + 1;
    discussion.lastActivityAt = new Date();
    await discussion.save();

    // Update group activity
    const group = await Group.findByPk(discussion.groupId);
    group.lastActivityAt = new Date();
    await group.save();

    res.status(201).json({
      success: true,
      data: reply,
    });
  } catch (error) {
    console.error('ReplyToDiscussion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to post reply',
    });
  }
};

/**
 * Like reply
 */
export const likeReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const userId = req.user.id;

    const reply = await DiscussionReply.findByPk(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        error: 'Reply not found',
      });
    }

    const existing = await Like.findOne({
      where: { userId, targetType: 'reply', targetId: replyId },
    });

    if (existing) {
      await existing.destroy();
      reply.likeCount = Math.max(0, (reply.likeCount || 1) - 1);
      await reply.save();
      
      return res.json({
        success: true,
        data: { liked: false, likeCount: reply.likeCount },
      });
    }

    await Like.create({
      userId,
      targetType: 'reply',
      targetId: replyId,
    });

    reply.likeCount = (reply.likeCount || 0) + 1;
    await reply.save();

    res.json({
      success: true,
      data: { liked: true, likeCount: reply.likeCount },
    });
  } catch (error) {
    console.error('LikeReply error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like reply',
    });
  }
};

/**
 * Edit discussion
 */
export const editDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    const discussion = await Discussion.findByPk(id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found',
      });
    }

    if (discussion.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Can only edit your own discussions',
      });
    }

    if (title) discussion.title = title;
    if (content) discussion.content = content;
    
    await discussion.save();

    res.json({
      success: true,
      data: discussion,
    });
  } catch (error) {
    console.error('EditDiscussion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to edit discussion',
    });
  }
};

export default {
  createDiscussion,
  getGroupDiscussions,
  getDiscussionById,
  likeDiscussion,
  pinDiscussion,
  closeDiscussion,
  replyToDiscussion,
  likeReply,
  editDiscussion,
};
