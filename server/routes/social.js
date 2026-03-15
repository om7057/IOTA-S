import express from 'express';
import {
  getSocialFeed,
  createPost,
  getUserPosts,
  likePost,
  addComment,
  getPostComments,
  likeComment,
  reportPost,
  getTrendingPosts,
} from '../controllers/social.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get social feed
router.get('/feed/:userId', getSocialFeed);

// Create a post
router.post('/', createPost);

// Get posts by user
router.get('/user/:userId', getUserPosts);

// Like a post
router.post('/:postId/like', likePost);

// Add comment to post
router.post('/:postId/comment', addComment);

// Get comments on a post
router.get('/:postId/comments', getPostComments);

// Like a comment
router.post('/comment/:commentId/like', likeComment);

// Report a post
router.post('/:postId/report', reportPost);

// Get trending posts
router.get('/trending/all', getTrendingPosts);

export default router;
