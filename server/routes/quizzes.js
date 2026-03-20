import express from 'express';
import * as quizController from '../controllers/quiz.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', quizController.getAllQuizzes);
router.get('/story/:storyId', quizController.getQuizForStory);
router.get('/:id', quizController.getQuizById);

// User routes
router.post('/:quizId/submit', verifyToken, quizController.submitQuizAttempt);
router.get('/:quizId/attempts', verifyToken, quizController.getUserQuizAttempts);
router.get('/stats/all', verifyToken, quizController.getUserQuizStats);

// Admin routes
router.post('/', verifyToken, quizController.createQuiz);
router.put('/:id', verifyToken, quizController.updateQuiz);
router.delete('/:id', verifyToken, quizController.deleteQuiz);

// Quiz generation routes (Admin)
router.post('/generate/for-story', verifyToken, quizController.generateQuizForStoryEndpoint);

router.post('/:id/questions', verifyToken, quizController.addQuestionToQuiz);
router.put('/:id/questions/:questionId', verifyToken, quizController.updateQuestion);
router.delete('/:id/questions/:questionId', verifyToken, quizController.deleteQuestion);

export default router;

