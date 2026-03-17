import { Thread, ThreadReply, User, Group } from '../models/index.js';

// Get all threads in a group
export const getGroupThreads = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { category, sort } = req.query;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const where = { groupId };
    if (category) where.category = category;

    const order = sort === 'recent' ? [['lastActivityAt', 'DESC']] : [['isPinned', 'DESC'], ['createdAt', 'DESC']];

    const threads = await Thread.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] },
        { model: Group, as: 'group', attributes: ['id', 'name'] },
      ],
      limit,
      offset,
      order,
    });

    res.json({
      success: true,
      data: threads.rows,
      total: threads.count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('❌ Error fetching threads:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new thread
export const createThread = async (req, res) => {
  try {
    const { groupId, creatorId, title, content, category } = req.body;

    if (!groupId || !creatorId || !title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Group ID, creator ID, title, and content required',
      });
    }

    const thread = await Thread.create({
      groupId,
      creatorId,
      title,
      content,
      category: category || 'discussion',
    });

    const populated = await Thread.findByPk(thread.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] },
        { model: Group, as: 'group', attributes: ['id', 'name'] },
      ],
    });

    // Emit Socket.io event
    if (global.io) {
      global.io.emit(`group:${groupId}`, {
        type: 'new_thread',
        thread: populated,
      });
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('❌ Error creating thread:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single thread with replies
export const getThread = async (req, res) => {
  try {
    const { threadId } = req.params;

    const thread = await Thread.findByPk(threadId, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] },
        { model: Group, as: 'group', attributes: ['id', 'name'] },
        {
          model: ThreadReply,
          as: 'replies',
          include: [
            { model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] },
            {
              model: ThreadReply,
              as: 'nestedReplies',
              include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] }],
            },
          ],
          separate: true,
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!thread) {
      return res.status(404).json({ success: false, error: 'Thread not found' });
    }

    // Increment view count
    await thread.increment('viewCount');

    res.json({ success: true, data: thread });
  } catch (error) {
    console.error('❌ Error fetching thread:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Reply to thread
export const replyToThread = async (req, res) => {
  try {
    const { threadId, userId, content, isAnonymous, parentReplyId } = req.body;

    if (!threadId || !userId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Thread ID, user ID, and content required',
      });
    }

    // Generate anonymous name if needed
    const anonymousName = isAnonymous ? `Teen#${Math.floor(Math.random() * 10000)}` : null;

    const reply = await ThreadReply.create({
      threadId,
      userId,
      parentReplyId: parentReplyId || null,
      content,
      isAnonymous,
      anonymousName,
    });

    // Update thread with new reply and activity time
    const thread = await Thread.findByPk(threadId);
    await thread.increment('replyCount');
    await thread.update({ lastActivityAt: new Date() });

    const populated = await ThreadReply.findByPk(reply.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] }],
    });

    // Emit Socket.io event
    if (global.io) {
      global.io.emit(`thread:${threadId}`, {
        type: 'new_reply',
        reply: populated,
      });
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('❌ Error replying to thread:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark reply as best answer
export const markReply = async (req, res) => {
  try {
    const { replyId, markedAs } = req.body;

    if (!replyId || !markedAs) {
      return res.status(400).json({
        success: false,
        error: 'Reply ID and mark type required',
      });
    }

    const reply = await ThreadReply.findByPk(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, error: 'Reply not found' });
    }

    await reply.update({ isMarked: true, markedAs });

    res.json({ success: true, data: reply });
  } catch (error) {
    console.error('❌ Error marking reply:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Like a reply
export const likeReply = async (req, res) => {
  try {
    const { replyId } = req.params;

    const reply = await ThreadReply.findByPk(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, error: 'Reply not found' });
    }

    await reply.increment('likeCount');

    res.json({ success: true, data: reply });
  } catch (error) {
    console.error('❌ Error liking reply:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update thread status (pin, close, resolve)
export const updateThreadStatus = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { isPinned, status, isResolved } = req.body;

    const thread = await Thread.findByPk(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, error: 'Thread not found' });
    }

    const updates = {};
    if (isPinned !== undefined) updates.isPinned = isPinned;
    if (status) updates.status = status;
    if (isResolved !== undefined) updates.isResolved = isResolved;

    await thread.update(updates);

    res.json({ success: true, data: thread });
  } catch (error) {
    console.error('❌ Error updating thread:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
