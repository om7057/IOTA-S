import express from 'express';
import * as discussionsController from '../controllers/discussions.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get discussions for a group
router.get('/group/:groupId', discussionsController.getGroupDiscussions);

// Create discussion (requires auth)
router.post('/', verifyToken, discussionsController.createDiscussion);

// Get specific discussion
router.get('/:id', discussionsController.getDiscussionById);

// Like discussion
router.post('/:id/like', verifyToken, discussionsController.likeDiscussion);

// Pin discussion (moderator/owner only)
router.post('/:id/pin', verifyToken, discussionsController.pinDiscussion);

// Close discussion
router.post('/:id/close', verifyToken, discussionsController.closeDiscussion);

// Edit discussion
router.put('/:id', verifyToken, discussionsController.editDiscussion);

// Reply to discussion
router.post('/:id/replies', verifyToken, discussionsController.replyToDiscussion);

// Like reply
router.post('/replies/:replyId/like', verifyToken, discussionsController.likeReply);

export default router;
