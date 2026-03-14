import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  TeenTopic,
  TeenDiscussion,
  TeenComment,
  User
} from '../models/index.js';

const router = express.Router();

// Get all teen topics
router.get('/topics', async (req, res) => {
  try {
    const topics = await TeenTopic.findAll({
      include: [
        {
          model: TeenDiscussion,
          attributes: ['id'],
          required: false
        }
      ],
      attributes: ['id', 'name', 'description', 'icon']
    });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get discussions for a specific topic
router.get('/topics/:topicId/discussions', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await TeenDiscussion.findAndCountAll({
      where: { topicId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar'],
          required: false
        },
        {
          model: TeenComment,
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
      discussions: rows.map(d => ({
        ...d.dataValues,
        commentCount: d.TeenComments ? d.TeenComments.length : 0
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single discussion with comments
router.get('/discussions/:discussionId', async (req, res) => {
  try {
    const { discussionId } = req.params;
    const discussion = await TeenDiscussion.findByPk(discussionId, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: TeenComment,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'avatar']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    res.json(discussion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new discussion
router.post('/discussions', verifyToken, async (req, res) => {
  try {
    const { topicId, title, content, isAnonymous } = req.body;
    const userId = req.user.id;

    const discussion = await TeenDiscussion.create({
      topicId,
      userId: isAnonymous ? null : userId,
      title,
      content,
      isAnonymous: isAnonymous || false
    });

    const discussionWithUser = await TeenDiscussion.findByPk(discussion.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        }
      ]
    });

    res.status(201).json(discussionWithUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update discussion (only owner can update)
router.put('/discussions/:discussionId', verifyToken, async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    const discussion = await TeenDiscussion.findByPk(discussionId);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    if (discussion.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await discussion.update({ title, content });
    const updated = await TeenDiscussion.findByPk(discussionId, {
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

// Delete discussion (only owner can delete)
router.delete('/discussions/:discussionId', verifyToken, async (req, res) => {
  try {
    const { discussionId } = req.params;
    const userId = req.user.id;

    const discussion = await TeenDiscussion.findByPk(discussionId);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    if (discussion.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete all comments first
    await TeenComment.destroy({ where: { discussionId } });
    await discussion.destroy();

    res.json({ message: 'Discussion deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create comment on discussion
router.post('/discussions/:discussionId/comments', verifyToken, async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content, isAnonymous } = req.body;
    const userId = req.user.id;

    const discussion = await TeenDiscussion.findByPk(discussionId);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const comment = await TeenComment.create({
      discussionId,
      userId: isAnonymous ? null : userId,
      content,
      isAnonymous: isAnonymous || false
    });

    const commentWithUser = await TeenComment.findByPk(comment.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        }
      ]
    });

    res.status(201).json(commentWithUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update comment (only owner can update)
router.put('/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await TeenComment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await comment.update({ content });
    const updated = await TeenComment.findByPk(commentId, {
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

// Delete comment (only owner can delete)
router.delete('/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await TeenComment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like/unlike discussion
router.post('/discussions/:discussionId/like', verifyToken, async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussion = await TeenDiscussion.findByPk(discussionId);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const currentLikes = discussion.likes || 0;
    const likedBy = discussion.likedBy ? JSON.parse(discussion.likedBy) : [];
    const userId = req.user.id;

    if (likedBy.includes(userId)) {
      // Unlike
      const index = likedBy.indexOf(userId);
      likedBy.splice(index, 1);
    } else {
      // Like
      likedBy.push(userId);
    }

    await discussion.update({
      likes: likedBy.length,
      likedBy: JSON.stringify(likedBy)
    });

    const updated = await TeenDiscussion.findByPk(discussionId, {
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

// Like/unlike comment
router.post('/comments/:commentId/like', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await TeenComment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const likedBy = comment.likedBy ? JSON.parse(comment.likedBy) : [];
    const userId = req.user.id;

    if (likedBy.includes(userId)) {
      // Unlike
      const index = likedBy.indexOf(userId);
      likedBy.splice(index, 1);
    } else {
      // Like
      likedBy.push(userId);
    }

    await comment.update({
      likes: likedBy.length,
      likedBy: JSON.stringify(likedBy)
    });

    const updated = await TeenComment.findByPk(commentId, {
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

export default router;
