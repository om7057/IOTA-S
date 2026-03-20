import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import parentalController from '../controllers/parental.js';

const router = express.Router();

/**
 * All routes require authentication
 */

// Create parental link (parent adds child)
router.post('/link', verifyToken, parentalController.createParentalLink);

// Seed default dummy parental data for demonstration
router.post('/seed-defaults', verifyToken, parentalController.seedDefaultParentalData);

// Child approves parental link
router.post('/link/:parentalAccountId/approve', verifyToken, parentalController.approveParentalLink);

// Get my parents (from child's perspective)
router.get('/parents/:userId', verifyToken, parentalController.getMyParents);

// Get my children (from parent's perspective)
router.get('/children/:userId', verifyToken, parentalController.getMyChildren);

// Get child's activity summary
router.get('/activity/:childUserId', verifyToken, parentalController.getChildActivity);

// Update parental settings/permissions
router.put('/settings/:parentalAccountId', verifyToken, parentalController.updateParentalSettings);

// Block/unblock user for child
router.post('/block', verifyToken, parentalController.updateBlockList);

// Remove parental link
router.delete('/link/:parentalAccountId', verifyToken, parentalController.removeParentalLink);

export default router;
