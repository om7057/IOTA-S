import express from 'express';
import {
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserProgress,
  setUserAge
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:userId', getUserById);
router.get('/progress/:userId', getUserProgress);
router.patch('/:userId', verifyToken, updateUser);
router.put('/:userId/age', verifyToken, setUserAge);
router.delete('/:userId', verifyToken, deleteUser);

export default router;
