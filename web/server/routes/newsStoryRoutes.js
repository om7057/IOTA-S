import express from 'express';
import {
  getAllNewsStories,
  getNewsStoryById,
  createNewsStory,
  updateNewsStory,
  deleteNewsStory
} from '../controllers/newsStoryController.js';

const router = express.Router();

router.get('/', getAllNewsStories);
router.get('/:id', getNewsStoryById);
router.post('/', createNewsStory);
router.put('/:id', updateNewsStory);
router.delete('/:id', deleteNewsStory);

export default router;
