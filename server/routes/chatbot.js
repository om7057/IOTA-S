import express from 'express';
import {
  getUserChatHistory,
  sendChatMessage,
  getChatStats,
  clearChatHistory,
} from '../controllers/chatbot.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get chat history for user
router.get('/:userId/history', getUserChatHistory);

// Send message to chatbot
router.post('/send', sendChatMessage);

// Get chat statistics
router.get('/:userId/stats', getChatStats);

// Clear chat history
router.delete('/:userId/history', clearChatHistory);

export default router;
