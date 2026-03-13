import express from 'express';
import {
  createStory,
  getAllStories,
  getStoryById,
  updateStory,
  deleteStory
} from '../controllers/storyController.js';

const router = express.Router();

router.post('/', createStory);
router.get('/', getAllStories);
router.get('/:id', getStoryById);
router.put('/:id', updateStory);
router.delete('/:id', deleteStory);

export default router;
