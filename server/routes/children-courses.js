import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import * as childrenController from '../controllers/children-courses.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.get('/dashboard', childrenController.getDashboardData);
router.get('/', childrenController.getAllCourses);
router.get('/category/:category', childrenController.getCoursesByCategory);
router.get('/:courseId', childrenController.getCourseById);
router.get('/lesson/:lessonId', childrenController.getLessonById);

// ==================== PROTECTED ROUTES ====================
router.post('/challenge/submit', verifyToken, childrenController.submitChallenge);
router.get('/progress/user', verifyToken, childrenController.getUserProgress);
router.get('/progress/lesson/:lessonId', verifyToken, childrenController.getLessonProgress);
router.post('/progress/set-course', verifyToken, childrenController.setActiveCourse);
router.put('/progress/hearts', verifyToken, childrenController.updateHearts);
router.put('/progress/points', verifyToken, childrenController.addPoints);

// ==================== ADMIN ROUTES ====================
router.post('/', verifyToken, childrenController.createCourse);

export default router;
