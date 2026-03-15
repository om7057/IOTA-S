import { Post, Comment, User, Group } from '../models/index.js';
import { Op } from 'sequelize';

// Get social feed (posts from user's groups)
export const getSocialFeed = async (req, res) => {
  try {
    const { userId } = req.params;
    const { groupId, category } = req.query;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const where = { isApproved: true };
    if (groupId) where.groupId = groupId;
    if (category) where.category = category;

    const posts = await Post.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'avatar', 'email'],
        },
        { model: Group, as: 'group', attributes: ['id', 'name'] },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id', 'content', 'createdAt'],
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'name'],
            },
          ],
          limit: 3,
          separate: true,
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      subQuery: false,
    });

    // If anonymous, replace creator info with anonymous name
    const cleanPosts = posts.rows.map((post) => {
      const postData = post.toJSON();
      if (postData.isAnonymous) {
        postData.creator = {
          id: null,
          name: postData.anonymousName,
          avatar: '👤',
        };
      }
      return postData;
    });

    res.json({
      success: true,
      data: cleanPosts,
      total: posts.count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('❌ Error fetching social feed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a post
export const createPost = async (req, res) => {
  try {
    const { userId, groupId, title, content, category, isAnonymous } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        error: 'User ID and content required',
      });
    }

    const anonymousName = isAnonymous ? `Teen#${Math.floor(Math.random() * 10000)}` : null;

    const post = await Post.create({
      userId,
      groupId: groupId || null,
      title: title || null,
      content,
      category: category || 'other',
      isAnonymous,
      anonymousName,
    });

    const populated = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'avatar'],
        },
        { model: Group, as: 'group', attributes: ['id', 'name'] },
      ],
    });

    // If anonymous, mask creator info
    const response = populated.toJSON();
    if (response.isAnonymous) {
      response.creator = {
        id: null,
        name: response.anonymousName,
        avatar: '👤',
      };
    }

    // Emit Socket.io event
    if (global.io) {
      global.io.emit('social:new_post', {
        type: 'new_post',
        post: response,
      });
    }

    res.status(201).json({ success: true, data: response });
  } catch (error) {
    console.error('❌ Error creating post:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get posts by user
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const posts = await Post.findAndCountAll({
      where: { userId, isApproved: true },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'avatar'],
        },
        { model: Group, as: 'group', attributes: ['id', 'name'] },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: posts.rows,
      total: posts.count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('❌ Error fetching user posts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Like a post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    await post.increment('likeCount');

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('❌ Error liking post:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Comment on a post
export const addComment = async (req, res) => {
  try {
    const { postId, userId, content, isAnonymous, parentCommentId } = req.body;

    if (!postId || !userId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Post ID, user ID, and content required',
      });
    }

    const anonymousName = isAnonymous ? `Teen#${Math.floor(Math.random() * 10000)}` : null;

    const comment = await Comment.create({
      postId,
      userId,
      parentCommentId: parentCommentId || null,
      content,
      isAnonymous,
      anonymousName,
    });

    // Update post comment count
    const post = await Post.findByPk(postId);
    await post.increment('commentCount');

    const populated = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });

    // If anonymous, mask creator info
    const response = populated.toJSON();
    if (response.isAnonymous) {
      response.creator = {
        id: null,
        name: response.anonymousName,
        avatar: '👤',
      };
    }

    // Emit Socket.io event
    if (global.io) {
      global.io.emit(`post:${postId}`, {
        type: 'new_comment',
        comment: response,
      });
    }

    res.status(201).json({ success: true, data: response });
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get comments on a post
export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const comments = await Comment.findAndCountAll({
      where: { postId, isApproved: true },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'name', 'avatar'],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    // Mask anonymous creators
    const cleanComments = comments.rows.map((comment) => {
      const commentData = comment.toJSON();
      if (commentData.isAnonymous) {
        commentData.creator = {
          id: null,
          name: commentData.anonymousName,
          avatar: '👤',
        };
      }
      return commentData;
    });

    res.json({
      success: true,
      data: cleanComments,
      total: comments.count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Like a comment
export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    await comment.increment('likeCount');

    res.json({ success: true, data: comment });
  } catch (error) {
    console.error('❌ Error liking comment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Report a post
export const reportPost = async (req, res) => {
  try {
    const { postId, reason } = req.body;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const reasons = post.reportReasons || [];
    reasons.push({
      reason,
      reportedAt: new Date(),
    });

    await post.update({
      isReported: true,
      reportReasons: reasons,
    });

    res.json({
      success: true,
      data: post,
      message: 'Post reported successfully',
    });
  } catch (error) {
    console.error('❌ Error reporting post:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get trending posts (by engagement)
export const getTrendingPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.findAll({
      where: { isApproved: true },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
      order: [[sequelize.literal('likeCount + commentCount + shareCount'), 'DESC']],
      limit,
    });

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('❌ Error fetching trending posts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
