import express from 'express';
import * as messagesController from '../controllers/direct-messages.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get or create conversation with user
router.get('/user/:userId', verifyToken, messagesController.getOrCreateConversation);

// Get user's conversations
router.get('/', verifyToken, messagesController.getUserConversations);

// Get conversation messages
router.get('/:conversationId/messages', verifyToken, messagesController.getConversationMessages);

// Send message
router.post('/:conversationId/send', verifyToken, messagesController.sendMessage);

// Mark message as read
router.post('/:conversationId/messages/:messageId/read', verifyToken, messagesController.markMessageAsRead);

// Get unread count
router.get('/stats/unread', verifyToken, messagesController.getUnreadCount);

export default router;
