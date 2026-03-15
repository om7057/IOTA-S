import express from 'express';
import {
  getGroupThreads,
  createThread,
  getThread,
  replyToThread,
  markReply,
  likeReply,
  updateThreadStatus,
} from '../controllers/forums.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all threads in a group
router.get('/group/:groupId', getGroupThreads);

// Create a new thread
router.post('/', createThread);

// Get single thread with replies
router.get('/:threadId', getThread);

// Reply to thread
router.post('/:threadId/reply', replyToThread);

// Mark reply as best answer or helpful
router.put('/reply/:replyId/mark', markReply);

// Like a reply
router.post('/reply/:replyId/like', likeReply);

// Update thread status (pin, close, resolve)
router.put('/:threadId/status', updateThreadStatus);

export default router;
