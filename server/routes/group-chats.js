import express from 'express';
import * as chatController from '../controllers/group-chats.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Send message in group chat
router.post('/:groupId/send', verifyToken, chatController.sendGroupMessage);

// Get group chat history
router.get('/:groupId/history', verifyToken, chatController.getGroupChatHistory);

// Delete message
router.delete('/:messageId', verifyToken, chatController.deleteGroupMessage);

// Edit message
router.put('/:messageId', verifyToken, chatController.editGroupMessage);

export default router;
