import express from 'express';
import * as psychiatristController from '../controllers/psychiatrist.js';
import * as chatController from '../controllers/psychiatrist-chat.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Psychiatrist Routes - Teen Support System
 * Provides access to psychologists/psychiatrists for one-on-one chat
 */

/**
 * GET /api/psychiatrists
 * Get all available psychiatrists
 * Returns: list of psychiatrists with specialization
 */
router.get('/', psychiatristController.getPsychiatrists);

/**
 * GET /api/psychiatrists/:psychiatristId
 * Get psychiatrist details
 */
router.get('/:psychiatristId', psychiatristController.getPsychiatristById);

/**
 * POST /api/psychiatrists/:userId/chat/start
 * Start a new conversation with a psychiatrist
 * Body: { psychiatristId, initialMessage }
 */
router.post('/:userId/chat/start', verifyToken, chatController.startConversation);

/**
 * POST /api/psychiatrists/:userId/chat/message
 * Send message in conversation
 * Body: { conversationId, psychiatristId, message, sender }
 */
router.post('/:userId/chat/message', verifyToken, chatController.sendMessage);

/**
 * GET /api/psychiatrists/:userId/chat/conversations
 * Get all conversations for user
 */
router.get('/:userId/chat/conversations', verifyToken, chatController.getUserConversations);

/**
 * GET /api/psychiatrists/:userId/chat/:conversationId/messages
 * Get messages in a conversation
 */
router.get('/:userId/chat/:conversationId/messages', verifyToken, chatController.getConversationMessages);

export default router;
