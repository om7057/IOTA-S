import express from 'express';
import { saveQuizProgress, getUserQuizProgress } from '../controllers/progressController.js';

const router = express.Router();

router.post('/', saveQuizProgress);
router.get('/user/:userId', getUserQuizProgress);

export default router;
