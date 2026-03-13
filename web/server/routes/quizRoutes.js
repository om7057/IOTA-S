import express from 'express';
import {
  createQuiz,
  getQuizByStory,
  getQuizById,
  updateQuiz,
  deleteQuiz
} from '../controllers/quizController.js';

const router = express.Router();

router.post('/', createQuiz);
router.get('/story/:storyId', getQuizByStory);
router.get('/:id', getQuizById);
router.put('/:id', updateQuiz);
router.delete('/:id', deleteQuiz);

export default router;
