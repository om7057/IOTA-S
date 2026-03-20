import express from 'express';
import * as groupsController from '../controllers/groups.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', groupsController.getAllGroups);
router.get('/user/list', verifyToken, groupsController.getUserGroups);
router.get('/suggestions', verifyToken, groupsController.suggestGroups);
router.get('/:id', groupsController.getGroupById);

// User routes
router.post('/', verifyToken, groupsController.createGroup);
router.post('/:id/join', verifyToken, groupsController.joinGroup);
router.post('/:id/leave', verifyToken, groupsController.leaveGroup);

// Group owner/moderator routes
router.put('/:id', verifyToken, groupsController.updateGroup);
router.delete('/:id', verifyToken, groupsController.deleteGroup);
router.put('/:id/members/:memberId', verifyToken, groupsController.updateMemberRole);

export default router;
