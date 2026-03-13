import express from 'express';
import {
  createOrUpdateUser,
  getUserByClerkId,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserProgress,
  setUserAge
} from '../controllers/userController.js';

const router = express.Router();

router.post('/', createOrUpdateUser);
router.get('/', getAllUsers); 
router.get('/clerk/:clerkId', getUserByClerkId); 
router.get('/progress/:clerkId', getUserProgress); 
router.patch('/:clerkId', updateUser);
router.put('/:clerkId/age', setUserAge);
router.delete('/:clerkId', deleteUser);

export default router;
